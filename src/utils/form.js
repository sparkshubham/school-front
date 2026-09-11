export function toDateInput(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function isBlank(value) {
  return value == null || String(value).trim() === '';
}

export function requiredErrors(form, fields, message) {
  const errors = {};
  for (const field of fields) {
    if (!field.required) continue;
    if (isBlank(form[field.name])) errors[field.name] = message;
  }
  return errors;
}

export function apiErrorMessage(err, fallback = 'Could not save') {
  const msg = err?.response?.data?.message;
  if (!msg) return fallback;
  return String(msg).replace(/\s+/g, ' ').trim().slice(0, 280);
}

export function inputClass(hasError) {
  return hasError ? 'input border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'input';
}
