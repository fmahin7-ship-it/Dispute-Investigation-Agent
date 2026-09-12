type AuditEvent = Record<string, unknown> & { type: string };

const events: Array<AuditEvent & { at: string }> = [];

export function appendAudit(event: AuditEvent) {
  events.push({ ...event, at: new Date().toISOString() });
}

export function listAudit() {
  return [...events];
}
