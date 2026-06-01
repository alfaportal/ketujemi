import Bull from "bull";
import type { DeliverEmailOptions } from "../lib/send-transactional-email.js";
import { logger } from "../lib/logger.js";

const defaultJobOptions: Bull.JobOptions = {
  removeOnComplete: 100,
  removeOnFail: 500,
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
};

function redisUrl(): string {
  const url = process.env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL is required for email and SMS queues");
  return url;
}

export let emailQueue!: Bull.Queue<DeliverEmailOptions>;
export let smsQueue!: Bull.Queue;

function getQueues(): { email: Bull.Queue<DeliverEmailOptions>; sms: Bull.Queue } {
  if (!emailQueue || !smsQueue) {
    const url = redisUrl();
    emailQueue = new Bull<DeliverEmailOptions>("email", url);
    smsQueue = new Bull("sms", url);
  }
  return { email: emailQueue, sms: smsQueue };
}

export type SmsSendPayload = { phoneDigits: string; text: string };

let workersStarted = false;

export function startJobQueueWorkers(): void {
  if (workersStarted) return;
  if (!process.env.REDIS_URL?.trim()) {
    logger.warn("REDIS_URL not set — job queue workers not started");
    return;
  }
  workersStarted = true;

  const { email, sms } = getQueues();

  email.process(async (job) => {
    const { deliverEmailNow } = await import("../lib/send-transactional-email.js");
    await deliverEmailNow(job.data);
  });

  sms.process("vonage-send", async (job) => {
    const { runVonageSendSms } = await import("../lib/vonage-sms.js");
    return runVonageSendSms(job.data.phoneDigits, job.data.text);
  });

  sms.process("twilio-send", async (job) => {
    const { runTwilioSendSms } = await import("../lib/twilio-sms.js");
    return runTwilioSendSms(job.data.phoneDigits, job.data.text);
  });

  sms.process("verify-request", async (job) => {
    const { runVonageVerifyRequestOnly } = await import("../lib/vonage-verify.js");
    return runVonageVerifyRequestOnly(job.data.phoneDigits);
  });

  sms.process("verify-check", async (job) => {
    const { runVonageVerifyCheckOnly } = await import("../lib/vonage-verify.js");
    await runVonageVerifyCheckOnly(job.data.requestId, job.data.code);
  });

  email.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id }, "email queue job failed");
  });

  sms.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, name: job?.name }, "sms queue job failed");
  });

  logger.info(
    { redis: redisUrl().replace(/:[^:@/]+@/, ":***@") },
    "email and sms queue workers started",
  );
}

export async function enqueueEmail(mail: DeliverEmailOptions): Promise<void> {
  await getQueues().email.add(mail, defaultJobOptions);
}

export async function enqueueSms(
  name: "vonage-send" | "twilio-send",
  data: SmsSendPayload,
): Promise<void> {
  await getQueues().sms.add(name, data, defaultJobOptions);
}

export async function enqueueSmsVerifyRequest(phoneDigits: string): Promise<string> {
  const job = await getQueues().sms.add("verify-request", { phoneDigits }, defaultJobOptions);
  return job.finished() as Promise<string>;
}

export async function enqueueSmsVerifyCheck(requestId: string, code: string): Promise<void> {
  const job = await getQueues().sms.add("verify-check", { requestId, code }, defaultJobOptions);
  await job.finished();
}
