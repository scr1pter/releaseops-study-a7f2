import { spawnSync } from "node:child_process";
const sha = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "local-unpublished";
if (sha !== "local-unpublished" && !/^[a-f0-9]{40}$/.test(sha)) throw new Error("Invalid commit identity");
console.log(JSON.stringify({ kind: "releaseops.public-ci", commitSha: sha, nodeMajor: Number(process.versions.node.split(".")[0]) }));
if (Number(process.versions.node.split(".")[0]) !== 24) throw new Error("Node24 is required");
for (const script of ["typecheck", "test", "build"]) {
  console.log(JSON.stringify({ kind: "releaseops.ci-step", script, commitSha: sha }));
  const npmCli = process.env.NPM_CLI || process.env.npm_execpath;
  if (process.platform === "win32" && !npmCli) throw new Error("Supply NPM_CLI pointing to npm-cli.js when invoking CI directly on Windows");
  const command = npmCli ? process.execPath : "npm";
  const args = npmCli ? [npmCli, "run", script] : ["run", script];
  const result = spawnSync(command, args, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 131072, shell: false, timeout: 180000 });
  const scrub = value => String(value || "").replace(/\b(?:sk-[\w-]+|gh[pousr]_[\w]+|github_pat_[\w]+|Bearer\s+\S+|local-run-[\w-]+)/gi, "<redacted>").replace(/((?:token|secret|password|authorization)\s*[:=]\s*)[^\s,}]+/gi, "$1<redacted>").slice(-32768);
  console.log(scrub(result.stdout));
  if (result.stderr) console.error(scrub(result.stderr));
  if (result.error) console.error(JSON.stringify({ kind: "releaseops.ci-step-failure", script, code: result.error.code || "ERROR" }));
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
