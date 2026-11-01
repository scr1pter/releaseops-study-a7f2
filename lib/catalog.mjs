// Synthetic public fixture data, not a product implementation.
export const POLICY_VERSION = "releaseops-v1";
export const catalog = {
  workspaces: [{ id: "ws-alpha", name: "Northstar Lab" }, { id: "ws-beta", name: "Cedar Studio" }],
  services: [
    { id: "srv-api", workspaceId: "ws-alpha", name: "Core API", owner: "Alex Morgan", runbookMarkdown: "# API readiness\nVerify the release checklist.", archived: false, revision: 1 },
    { id: "srv-web", workspaceId: "ws-alpha", name: "Web app", owner: "Alex Morgan", runbookMarkdown: "# Web readiness\nCheck the hosted interface.", archived: false, revision: 1 }
  ],
  releases: [
    { id: "rel-api", workspaceId: "ws-alpha", title: "API launch", version: "1.0.0", serviceIds: ["srv-api"], dependsOn: [], effortMinutes: 30, checklist: [{ id: "check-api", label: "Smoke check", done: true }], status: "draft", notesMarkdown: "Synthetic launch.", revision: 1 },
    { id: "rel-web", workspaceId: "ws-alpha", title: "Web launch", version: "1.0.0", serviceIds: ["srv-web"], dependsOn: ["rel-api"], effortMinutes: 45, checklist: [{ id: "check-web", label: "Browser check", done: false }], status: "draft", notesMarkdown: "Synthetic launch.", revision: 1 }
  ],
  incidents: [{ id: "inc-api", workspaceId: "ws-alpha", title: "Synthetic API incident", serviceIds: ["srv-api"], severity: "high", status: "open", summary: "Synthetic fixture only.", timeline: [], revision: 1 }],
  limits: { maxEntitiesPerType: 200, maxBodyBytes: 262144 }
};
