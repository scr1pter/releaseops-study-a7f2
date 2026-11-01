import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [health, setHealth] = useState("Not checked");
  const [diagnostic, setDiagnostic] = useState<{ message: string; code: string; requestId: string; deployedSha: string; policyVersion: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function checkHealth() {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const value = await response.json();
      setHealth(`${response.status}: ${value.deployedSha ?? "identity unavailable"}`);
    } catch { setHealth("Health request failed"); }
  }
  async function probe() {
    setBusy(true); setDiagnostic(null);
    try {
      const catalogResponse = await fetch("/api/catalog", { cache: "no-store" });
      const catalog = await catalogResponse.json();
      const response = await fetch("/api/validate-release", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId: "ws-alpha", services: catalog.services, releases: catalog.releases, incidents: catalog.incidents, releaseId: "rel-api" }) });
      const value = await response.json();
      const event = { kind: "releaseops.browser-runtime", status: response.status, code: value.error?.code ?? "OK", requestId: value.requestId ?? value.error?.requestId ?? "unavailable", deployedSha: value.deployedSha };
      if (!response.ok) console.error(JSON.stringify(event));
      setDiagnostic({ message: `${response.status}: ${value.error?.message ?? "Diagnostic completed."}`, code: event.code, requestId: event.requestId, deployedSha: value.deployedSha ?? "unavailable", policyVersion: value.policyVersion ?? "unavailable" });
    } catch { setDiagnostic({ message: "Diagnostic request failed before a response was received.", code: "NETWORK_ERROR", requestId: "unavailable", deployedSha: "unavailable", policyVersion: "unavailable" }); }
    finally { setBusy(false); }
  }
  return <div className="shell"><aside><strong>ReleaseOps</strong><p>Build workspace</p><nav aria-label="Primary">{["Overview", "Services", "Releases", "Incidents", "Rollouts", "Activity"].map(name => <button key={name} disabled>{name}</button>)}</nav></aside><main><p className="eyebrow">Synthetic cloud workbench</p><h1>ReleaseOps starter</h1><p>The product modules are not implemented. Read BUILD_SPEC.md and build the complete workbench.</p><section aria-label="Deployment diagnostic"><h2>Deployment diagnostic</h2><p>Before any source edits, reproduce this already deployed starter's failure in the browser. Then build and repair the complete product.</p><div className="actions"><button onClick={checkHealth}>Check deployment health</button><button onClick={probe} disabled={busy}>{busy ? "Checking…" : "Run cloud diagnostic"}</button></div><output aria-label="Deployment health">{health}</output>{diagnostic && <section aria-label="Request diagnostics"><p role="alert">{diagnostic.message}</p><label>Error code<input readOnly value={diagnostic.code}/></label><label>Request ID<input readOnly value={diagnostic.requestId}/></label><label>Deployed SHA<input readOnly value={diagnostic.deployedSha}/></label><label>Policy version<input readOnly value={diagnostic.policyVersion}/></label></section>}</section></main></div>;
}
createRoot(document.getElementById("root")!).render(<App />);
