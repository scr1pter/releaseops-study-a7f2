import { randomUUID } from "node:crypto";
import { POLICY_VERSION } from "./catalog.mjs";

export const MAX_BODY_BYTES = 262144;
export function metadata(env, version = process.versions.node, makeId = randomUUID) {
  const candidate = env.VERCEL_GIT_COMMIT_SHA;
  const deployedSha = typeof candidate === "string" && /^[a-f0-9]{40}$/.test(candidate) ? candidate : "local-unpublished";
  return { deployedSha, policyVersion: POLICY_VERSION, nodeMajor: Number(version.split(".")[0]), requestId: makeId() };
}
export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}
export function errorBody(meta, code, message) {
  return { ...meta, error: { code, message, requestId: meta.requestId } };
}
export function method(req, res, allowed, meta) {
  if (req.method === allowed) return true;
  res.setHeader("Allow", allowed);
  send(res, 405, errorBody(meta, "METHOD_NOT_ALLOWED", "This method is not supported."));
  return false;
}
export async function readJson(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(String(req.headers?.["content-type"] || "")))
    return { status: 415, code: "UNSUPPORTED_MEDIA_TYPE", message: "Use application/json." };
  if (Number(req.headers?.["content-length"] || 0) > MAX_BODY_BYTES)
    return { status: 413, code: "PAYLOAD_TOO_LARGE", message: "The request is too large." };
  let value = req.body;
  if (value === undefined) {
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      const bytes = Buffer.from(chunk); size += bytes.length;
      if (size > MAX_BODY_BYTES) return { status: 413, code: "PAYLOAD_TOO_LARGE", message: "The request is too large." };
      chunks.push(bytes);
    }
    value = Buffer.concat(chunks);
  }
  const serialized = typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value);
  if (Buffer.byteLength(serialized ?? "") > MAX_BODY_BYTES)
    return { status: 413, code: "PAYLOAD_TOO_LARGE", message: "The request is too large." };
  try {
    const body = typeof value === "string" || Buffer.isBuffer(value) ? JSON.parse(value.toString()) : value;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("object required");
    return { body };
  } catch {
    return { status: 400, code: "INVALID_INPUT", message: "A JSON object is required." };
  }
}
