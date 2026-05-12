import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

// Minimal request/response interfaces used by the handler.
// Avoids importing from both @types/express and firebase-functions/v2/https,
// which ship different versions of @types/express-serve-static-core and
// cause TypeScript to refuse the assignment.
interface MinRequest {
  method: string;
  body: unknown;
}

interface MinResponse {
  status(code: number): this;
  json(data: unknown): this;
}

/**
 * T148 — Step 1: no-op scaffold function.
 *
 * Accepts a POST request with a JSON body, logs the payload to Cloud Logging,
 * and returns 200. No business logic — goal is to verify that the deploy
 * pipeline, secret management, and CORS are all working before Step 2 (email).
 *
 * Expected payload shape (for documentation purposes only at this stage):
 * {
 *   configId: string,    // agency config ID
 *   agentEmail: string,  // recipient
 *   name?: string,
 *   email: string,
 *   phone: string,
 *   address: string,
 *   estimate: { low: number, mid: number, high: number, currency: string }
 * }
 */

/**
 * Pure handler — extracted for unit testability without Firebase runtime.
 */
export function handleLeadNotification(req: MinRequest, res: MinResponse): void {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const payload = req.body as unknown;
  logger.info("[sendLeadNotification] received payload", { payload });

  // Step 1: no-op — just acknowledge receipt
  res.status(200).json({ ok: true, message: "Lead received (scaffold — no email sent yet)" });
}

export const sendLeadNotification = onRequest(
  {
    region: "europe-west1",
    cors: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleLeadNotification as any
);
