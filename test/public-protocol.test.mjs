import test from "node:test";
import assert from "node:assert/strict";
import { metadata, errorBody, MAX_BODY_BYTES } from "../lib/public-http.mjs";
test("public diagnostic metadata contains only explicit safe fields", () => {
  const value = metadata({ VERCEL_GIT_COMMIT_SHA: "a".repeat(40), SYNTHETIC_SECRET: "must-not-appear" }, "24.22.0", () => "synthetic-request-id");
  assert.deepEqual(Object.keys(value).sort(), ["deployedSha", "nodeMajor", "policyVersion", "requestId"]);
  assert.equal(value.deployedSha, "a".repeat(40)); assert.equal(value.nodeMajor, 24);
  assert.ok(!JSON.stringify(errorBody(value, "EXAMPLE", "Safe message")).includes("must-not-appear"));
  assert.equal(MAX_BODY_BYTES, 262144);
});
