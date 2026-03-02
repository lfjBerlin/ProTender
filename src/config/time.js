export const DEMO_NOW_ISO = '2026-03-02T10:00:00.000Z'
export const demoNow = () => new Date(DEMO_NOW_ISO)

export function daysUntil(deadlineISO) {
  const d = new Date(deadlineISO)
  const now = demoNow()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24))
}
