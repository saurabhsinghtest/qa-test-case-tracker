import {
  buildExport,
  ensureUniqueKeys,
  EXPORT_APP_ID,
  exportFileName,
  mergeTestCases,
  parseImport,
  sanitizeStoredList,
  sanitizeTestCase,
  serializeExport,
} from '../utils/importExport'
import { FIXED_NOW, FIXTURE_CASES, makeTestCase } from './fixtures'

function expectError(result: ReturnType<typeof parseImport>, pattern: RegExp) {
  expect(result.ok).toBe(false)
  if (!result.ok) expect(result.error).toMatch(pattern)
}

describe('export', () => {
  it('builds an export file with metadata', () => {
    const file = buildExport(FIXTURE_CASES, FIXED_NOW)
    expect(file).toEqual({
      app: EXPORT_APP_ID,
      version: 1,
      exportedAt: FIXED_NOW.toISOString(),
      testCases: FIXTURE_CASES,
    })
  })

  it('serializes to JSON that imports back to the same data', () => {
    const json = serializeExport(FIXTURE_CASES, FIXED_NOW)
    const result = parseImport(json, FIXED_NOW)
    expect(result).toEqual({ ok: true, testCases: FIXTURE_CASES })
  })

  it('creates a dated file name', () => {
    expect(exportFileName(FIXED_NOW)).toBe('qa-test-cases-2026-01-15.json')
  })
})

describe('sanitizeTestCase', () => {
  it('drops unknown fields and fills defaults', () => {
    const result = sanitizeTestCase(
      { title: ' Imported ', status: 'Passed', priority: 'Low', hacker: '<script>', module: 'API' },
      FIXED_NOW,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.testCase).not.toHaveProperty('hacker')
    expect(result.testCase).toMatchObject({
      title: 'Imported',
      module: 'API',
      description: '',
      key: '',
      createdAt: FIXED_NOW.toISOString(),
    })
    expect(result.testCase.id).toBeTruthy()
  })

  it('ignores invalid dates and non-string fields', () => {
    const result = sanitizeTestCase(
      { title: 'T', status: 'Failed', priority: 'High', updatedAt: 'not a date', steps: 42, lastExecutedAt: 'x' },
      FIXED_NOW,
    )
    expect(result.ok && result.testCase.updatedAt).toBe(FIXED_NOW.toISOString())
    expect(result.ok && result.testCase.steps).toBe('')
    expect(result.ok && 'lastExecutedAt' in result.testCase).toBe(false)
  })

  it.each([
    [null, /not an object/],
    [[], /not an object/],
    [{ status: 'Passed', priority: 'Low' }, /missing a title/],
    [{ title: 'x'.repeat(121), status: 'Passed', priority: 'Low' }, /longer than 120/],
    [{ title: 'T', status: 'Done', priority: 'Low' }, /invalid status "Done"/],
    [{ title: 'T', status: 'Passed', priority: 'Urgent' }, /invalid priority "Urgent"/],
  ])('rejects %j', (raw, pattern) => {
    const result = sanitizeTestCase(raw)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(pattern)
  })
})

describe('parseImport', () => {
  it('accepts a bare array', () => {
    const result = parseImport(JSON.stringify([{ title: 'One', status: 'Passed', priority: 'Low' }]))
    expect(result.ok && result.testCases).toHaveLength(1)
    expect(result.ok && result.testCases[0].key).toBe('TC-001')
  })

  it('rejects invalid JSON', () => {
    expectError(parseImport('{not json'), /not valid JSON/)
  })

  it('rejects unrecognized shapes', () => {
    expectError(parseImport('{"foo": 1}'), /Unrecognized format/)
    expectError(parseImport('"text"'), /Unrecognized format/)
  })

  it('rejects an empty list', () => {
    expectError(parseImport('[]'), /no test cases/)
    expectError(parseImport('{"testCases": []}'), /no test cases/)
  })

  it('rejects files from a newer version', () => {
    expectError(parseImport(JSON.stringify({ version: 99, testCases: [{}] })), /newer version/)
  })

  it('names the invalid item', () => {
    const json = JSON.stringify([
      { title: 'Ok', status: 'Passed', priority: 'Low' },
      { title: 'Bad', status: 'Unknown', priority: 'Low' },
    ])
    expectError(parseImport(json), /Test case #2 has an invalid status/)
  })

  it('removes duplicate IDs, keeping the last version', () => {
    const json = JSON.stringify([
      { id: 'same', key: 'TC-001', title: 'First', status: 'Passed', priority: 'Low' },
      { id: 'same', key: 'TC-001', title: 'Second', status: 'Failed', priority: 'Low' },
    ])
    const result = parseImport(json)
    expect(result.ok && result.testCases.map((tc) => tc.title)).toEqual(['Second'])
  })
})

describe('ensureUniqueKeys', () => {
  it('keeps unique keys and reassigns missing or duplicate ones', () => {
    const result = ensureUniqueKeys([
      makeTestCase({ id: '1', key: 'TC-003' }),
      makeTestCase({ id: '2', key: 'TC-003' }),
      makeTestCase({ id: '3', key: '' }),
    ])
    expect(result.map((tc) => tc.key)).toEqual(['TC-003', 'TC-004', 'TC-005'])
  })

  it('avoids keys already reserved', () => {
    const result = ensureUniqueKeys([makeTestCase({ id: 'n', key: 'TC-001' })], [makeTestCase({ key: 'TC-001' })])
    expect(result[0].key).toBe('TC-002')
  })
})

describe('mergeTestCases', () => {
  it('updates matching IDs in place and appends new ones', () => {
    const incoming = [
      makeTestCase({ id: 'b', key: 'TC-002', title: 'Updated title', status: 'Passed' }),
      makeTestCase({ id: 'new', key: 'TC-001', title: 'Brand new' }),
    ]
    const result = mergeTestCases(FIXTURE_CASES, incoming)

    expect(result).toHaveLength(FIXTURE_CASES.length + 1)
    expect(result[1]).toMatchObject({ id: 'b', title: 'Updated title', status: 'Passed' })
    // New item's key clashed with TC-001, so it gets a fresh key
    expect(result[result.length - 1]).toMatchObject({ id: 'new', key: 'TC-011' })
    expect(new Set(result.map((tc) => tc.key)).size).toBe(result.length)
  })
})

describe('sanitizeStoredList', () => {
  it('skips invalid items instead of failing', () => {
    const result = sanitizeStoredList([FIXTURE_CASES[0], { title: '' }, 'junk', FIXTURE_CASES[1]])
    expect(result.map((tc) => tc.id)).toEqual(['a', 'b'])
  })
})
