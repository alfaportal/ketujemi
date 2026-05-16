/** Vonage Verify (Nexmo) — https://developer.vonage.com/en/verify/overview */

function getCreds(): { apiKey: string; apiSecret: string } {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("VONAGE_API_KEY and VONAGE_API_SECRET must be set");
  }
  return { apiKey, apiSecret };
}

export async function vonageVerifyRequest(phoneDigits: string): Promise<string> {
  const { apiKey, apiSecret } = getCreds();
  const body = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    number: phoneDigits,
    brand: "KetuJemi",
  });

  const res = await fetch("https://api.nexmo.com/verify/json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as {
    request_id?: string;
    status?: string;
    error_text?: string;
  };

  if (String(data.status) !== "0" || !data.request_id) {
    throw new Error(data.error_text ?? `Vonage verify start failed (status ${data.status})`);
  }

  return data.request_id;
}

export async function vonageVerifyCheck(
  requestId: string,
  code: string,
): Promise<void> {
  const { apiKey, apiSecret } = getCreds();
  const body = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    request_id: requestId,
    code: code.trim(),
  });

  const res = await fetch("https://api.nexmo.com/verify/check/json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as { status?: string; error_text?: string };

  if (String(data.status) !== "0") {
    throw new Error(data.error_text ?? `Invalid or expired code (status ${data.status})`);
  }
}
