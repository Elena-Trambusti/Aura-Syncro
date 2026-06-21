/** Data calendario YYYY-MM-DD nel fuso Europe/Rome. */
export function formatRomeDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(date)
}

/** Ora locale formattata per admin (es. 21/06/2026, 14:30). */
export function formatRomeDateTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
