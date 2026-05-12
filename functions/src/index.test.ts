import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock firebase-functions/v2 to avoid Firebase runtime initialisation outside GCP
vi.mock("firebase-functions/v2", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("firebase-functions/v2/https", () => ({
  onRequest: vi.fn((_opts: unknown, handler: unknown) => handler),
}));

import { handleLeadNotification } from "./index";

/**
 * Minimal mock for Express Request / Response.
 * We only need the subset used by handleLeadNotification.
 */
function makeMockRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(data: unknown) {
      res.body = data;
      return res;
    },
  };
  return res;
}

function makeMockReq(method: string, body: unknown = {}) {
  return { method, body };
}

describe("handleLeadNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 405 for GET requests", () => {
    const req = makeMockReq("GET");
    const res = makeMockRes();
    handleLeadNotification(req, res);
    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ error: "Method Not Allowed" });
  });

  it("returns 405 for PUT requests", () => {
    const req = makeMockReq("PUT");
    const res = makeMockRes();
    handleLeadNotification(req, res);
    expect(res.statusCode).toBe(405);
  });

  it("returns 200 with ok:true for a valid POST", () => {
    const req = makeMockReq("POST", {
      configId: "gabetti-busto-arsizio",
      agentEmail: "agent@gabetti.it",
      name: "Mario Rossi",
      email: "mario@example.com",
      phone: "+39 333 1234567",
      address: "Via Roma 1",
      estimate: { low: 90000, mid: 100000, high: 110000, currency: "EUR" },
    });
    const res = makeMockRes();
    handleLeadNotification(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it("returns 200 even for POST with empty body (scaffold does not validate payload)", () => {
    const req = makeMockReq("POST", {});
    const res = makeMockRes();
    handleLeadNotification(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it("calls logger.info with the received payload on POST", async () => {
    const { logger } = await import("firebase-functions/v2");
    const payload = { configId: "test-agency", agentEmail: "a@b.com" };
    const req = makeMockReq("POST", payload);
    const res = makeMockRes();
    handleLeadNotification(req, res);
    expect(logger.info).toHaveBeenCalledWith(
      "[sendLeadNotification] received payload",
      { payload }
    );
  });
});
