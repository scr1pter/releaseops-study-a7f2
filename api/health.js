import { metadata, method, send, errorBody } from "../lib/public-http.mjs";
export function health({ env = process.env, version = process.versions.node, makeId } = {}) {
  return (req, res) => {
    const meta = metadata(env, version, makeId);
    if (!method(req, res, "GET", meta)) return;
    if (env.VERCEL === "1" && meta.deployedSha === "local-unpublished")
      return send(res, 503, errorBody(meta, "DEPLOYMENT_METADATA_UNAVAILABLE", "Deployment identity is not available."));
    return send(res, 200, { ...meta, status: "ok" });
  };
}
export default health();
