import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://49c3d2422fa3029f970ef7fece39ef16@o4511490601844736.ingest.de.sentry.io/4511490627862608",
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
});
