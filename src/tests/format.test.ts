import { formatDateTime, parseSteps, pluralize, prioritySlug, statusSlug } from '../utils/format'

describe('format helpers', () => {
  it('formatDateTime shows a dash for missing or invalid dates', () => {
    expect(formatDateTime(undefined)).toBe('—')
    expect(formatDateTime('')).toBe('—')
    expect(formatDateTime('not-a-date')).toBe('—')
    expect(formatDateTime('2026-01-15T12:00:00.000Z')).toMatch(/2026/)
  })

  it('creates CSS slugs', () => {
    expect(statusSlug('Not Run')).toBe('not-run')
    expect(statusSlug('Passed')).toBe('passed')
    expect(prioritySlug('Critical')).toBe('critical')
  })

  it('parseSteps splits lines and removes numbering and bullets', () => {
    expect(parseSteps('1. Open page\n2) Click login\n\n- Check result\n  * Done  \r\nPlain')).toEqual([
      'Open page',
      'Click login',
      'Check result',
      'Done',
      'Plain',
    ])
    expect(parseSteps('   ')).toEqual([])
  })

  it('pluralize', () => {
    expect(pluralize(1, 'test case')).toBe('1 test case')
    expect(pluralize(3, 'test case')).toBe('3 test cases')
    expect(pluralize(0, 'entry', 'entries')).toBe('0 entries')
  })
})
