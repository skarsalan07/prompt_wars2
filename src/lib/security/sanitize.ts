export function toPlainText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function redactSecrets(value: string) {
  return value.replace(/\b[A-Za-z0-9_\-]{24,}\b/g, "[redacted]");
}
