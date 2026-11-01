import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Public deterministic browser-witness tool client. The scoped token is a local
// per-case capability, not a model/provider or cloud-account credential.
const commands = new Set(['baseline', 'witness-begin', 'witness-end', 'status']);
export function parseCommand(args) {
  const command = args.length === 1 ? args[0] : args.length === 2 && args[0] === '--command' ? args[1] : undefined;
  if (!commands.has(command)) throw Object.assign(new Error('Use baseline, witness-begin, witness-end or status only'), { code: 'COMMAND_NOT_ALLOWED', kind: 'protocol' });
  return command;
}
export function validateEndpoint(value) {
  let url; try { url = new URL(value); } catch { throw Object.assign(new Error('Local witness endpoint unavailable'), { code: 'LOCAL_ENDPOINT_INVALID', kind: 'infrastructure' }); }
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw Object.assign(new Error('Local witness endpoint unavailable'), { code: 'LOCAL_ENDPOINT_INVALID', kind: 'infrastructure' });
  return url.origin;
}
export async function invoke(command, { env = process.env, fetchImpl = fetch } = {}) {
  if (!commands.has(command)) throw Object.assign(new Error('Command not allowed'), { code: 'COMMAND_NOT_ALLOWED', kind: 'protocol' });
  const endpoint = validateEndpoint(env.CLOUDCTL_URL), token = env.CLOUDCTL_TOKEN;
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{32,256}$/.test(token)) throw Object.assign(new Error('Scoped local witness token unavailable'), { code: 'LOCAL_TOKEN_UNAVAILABLE', kind: 'infrastructure' });
  let response;
  try { response = await fetchImpl(`${endpoint}/${command}`, { method: command === 'status' ? 'GET' : 'POST', headers: { authorization: `Bearer ${token}`, accept: 'application/json', ...(command === 'status' ? {} : { 'content-type': 'application/json' }) }, ...(command === 'status' ? {} : { body: '{}' }), redirect: 'error', signal: AbortSignal.timeout(command === 'status' ? 10000 : 120000) }); }
  catch { throw Object.assign(new Error('Witness service unavailable; inspect status before retrying an uncertain operation'), { code: 'LOCAL_SERVICE_UNAVAILABLE', kind: 'infrastructure' }); }
  const text = await response.text();
  if (Buffer.byteLength(text) > 1024 * 1024) throw Object.assign(new Error('Witness response too large'), { code: 'LOCAL_RESPONSE_LIMIT', kind: 'infrastructure' });
  let value; try { value = JSON.parse(text); } catch { throw Object.assign(new Error('Invalid witness response'), { code: 'LOCAL_RESPONSE_INVALID', kind: 'infrastructure' }); }
  if (!response.ok || value.ok !== true) throw Object.assign(new Error('Witness command did not complete'), { code: value.error?.code || 'LOCAL_COMMAND_FAILED', kind: value.error?.kind || 'infrastructure', requestId: value.requestId });
  return value;
}
export function publicSummary(value) {
  const result = value.result || {};
  if (result.kind === 'releaseops.cloudctl.state') return { ok: true, requestId: value.requestId, result: { producer: result.producer, busy: result.busy, baselineRecorded: !!result.baselineEvidence, firstSourceEditMs: result.firstSourceEditMs, activeWitnessId: result.activeWitnessId, witnesses: (result.witnesses || []).map(item => ({ id: item.id, status: item.status, beginSha: item.beginSha, finalSha: item.finalSha })), infrastructureFailures: result.infrastructureFailures, workflowEvidenceReady: !!result.workflowEvidence?.sameOriginPersistence } };
  if (result.observation) return { ok: true, command: value.command, requestId: value.requestId, result: { producer: result.producer, beforeSourceEdits: result.sourceAuditNoEarlierEdits, observationFinishedMs: result.observationFinishedMs, sourceSha: result.observation.sourceSha, deployedSha: result.observation.deployedSha, errorCode: result.observation.errorCode, runtimeRequestId: result.observation.requestId, screenshot: result.observation.screenshot, responseArtifact: result.observation.responseArtifact } };
  return { ok: true, command: value.command, requestId: value.requestId, result: { id: result.id, status: result.status, beginSha: result.beginSha, finalSha: result.finalSha, releaseId: result.releaseId, title: result.title, normalizedBeforeSha256: result.normalizedBeforeSha256, normalizedAfterSha256: result.normalizedAfterSha256, beforeBackup: result.beforeBackup, afterBackup: result.afterBackup, fixedActionArtifact: result.fixedActionArtifact } };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { const value = await invoke(parseCommand(process.argv.slice(2))); process.stdout.write(JSON.stringify(publicSummary(value)) + '\n'); }
  catch (error) { process.stderr.write(JSON.stringify({ ok: false, error: { code: error.code || 'LOCAL_COMMAND_FAILED', kind: error.kind || 'infrastructure' }, ...(error.requestId ? { requestId: error.requestId } : {}) }) + '\n'); process.exitCode = 1; }
}
