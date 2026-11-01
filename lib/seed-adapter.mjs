import { metadata, method, readJson, send, errorBody } from "./public-http.mjs";

// Intentionally unfinished. Before ANY source edits, reproduce the already
// deployed baseline failure in the browser and preserve its evidence. Then
// implement BUILD_SPEC.md; no artificial failure is required after repair.
export function seedAdapter({ env = process.env, version = process.versions.node, makeId, diagnostic = value => console.error(JSON.stringify(value)) } = {}) {
  return async (req, res) => {
    const meta = metadata(env, version, makeId);
    if (!method(req, res, "POST", meta)) return;
    const input = await readJson(req);
    if (input.status) return send(res, input.status, errorBody(meta, input.code, input.message));
    const hosted = env.VERCEL === "1";
    const code = hosted ? "POLICY_ADAPTER_UNAVAILABLE" : "NOT_IMPLEMENTED";
    const status = hosted ? 500 : 501;
    diagnostic({ kind: "releaseops.synthetic-runtime", code, requestId: meta.requestId, deployedSha: meta.deployedSha, policyVersion: meta.policyVersion, status });
    return send(res, status, errorBody(meta, code, "Release validation is unavailable. Use the request ID to inspect this synthetic diagnostic."));
  };
}
