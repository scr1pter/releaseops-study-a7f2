import { catalog } from "../lib/catalog.mjs";
import { metadata, method, send } from "../lib/public-http.mjs";
export function catalogHandler({ env = process.env, version = process.versions.node, makeId } = {}) {
  return (req, res) => {
    const meta = metadata(env, version, makeId);
    if (method(req, res, "GET", meta)) send(res, 200, { ...catalog, ...meta });
  };
}
export default catalogHandler();
