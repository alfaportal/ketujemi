import serverless from "serverless-http";
import app from "./app";

/** Vercel serverless entry — all /api/* traffic (see vercel.json rewrites). */
export default serverless(app, {
  binary: ["image/*", "application/octet-stream", "application/pdf"],
});
