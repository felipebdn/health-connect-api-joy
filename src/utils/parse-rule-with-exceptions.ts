import RRuleLib from 'rrule'

const { RRuleSet, rrulestr } = RRuleLib

type RecurrenceOptions = {
  dtStart: Date | string
  recurrenceRule: string
  recurrenceException?: string // vírgulas separando as datas no formato UTC: '20250412T100000Z,20250419T100000Z'
}

function formatDateToRRule(date: Date | string): string {
  const d = new Date(date)
  return `${d
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, '')
    .slice(0, -1)}Z`
}

export function parseRecurrenceWithExceptions({
  dtStart,
  recurrenceRule,
  recurrenceException,
}: RecurrenceOptions): ReturnType<typeof rrulestr> {
  const dtStartString = `DTSTART:${formatDateToRRule(dtStart)}`

  // Corrigir o UNTIL dentro do RRULE, se houver
  const fixedRecurrenceRule = recurrenceRule.replace(
    /UNTIL=([\d\-T:\.Z]+)/,
    (_, date) => `UNTIL=${formatDateToRRule(date)}`
  )

  const exdate = recurrenceException
    ? `EXDATE:${recurrenceException
        .split(',')
        .map(formatDateToRRule)
        .join(',')}`
    : null

  const ruleParts = [dtStartString, `RRULE:${fixedRecurrenceRule}`, exdate]
    .filter(Boolean)
    .join('\n')

  return rrulestr(ruleParts)
}
