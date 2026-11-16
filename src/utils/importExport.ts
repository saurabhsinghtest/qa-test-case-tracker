// JSON export/import: building the export file, validating imported data, and merging.
import { isPriority, isTestStatus, type TestCase } from '../types/testCase'
import { formatKey, generateId, keyNumber, TITLE_MAX } from './testCaseUtils'

export const EXPORT_APP_ID = 'qa-test-case-tracker'
export const EXPORT_VERSION = 1
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024 // 5 MB

export interface ExportFile {
  app: typeof EXPORT_APP_ID
  version: number
  exportedAt: string
  testCases: TestCase[]
}

export type ParseResult = { ok: true; testCases: TestCase[] } | { ok: false; error: string }

type SanitizeResult = { ok: true; testCase: TestCase } | { ok: false; error: string }

const TEXT_FIELDS = [
  'description',
  'module',
  'preconditions',
  'steps',
  'expectedResult',
  'actualResult',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && value !== '' && !Number.isNaN(new Date(value).getTime())
}

export function buildExport(testCases: readonly TestCase[], now = new Date()): ExportFile {
  return {
    app: EXPORT_APP_ID,
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    testCases: [...testCases],
  }
}

export function serializeExport(testCases: readonly TestCase[], now = new Date()): string {
  return JSON.stringify(buildExport(testCases, now), null, 2)
}

export function exportFileName(now = new Date()): string {
  return `qa-test-cases-${now.toISOString().slice(0, 10)}.json`
}

/**
 * Validates one raw item and converts it to a clean TestCase.
 * Required: title, valid status, valid priority. Unknown fields are dropped;
 * missing optional values get safe defaults.
 */
export function sanitizeTestCase(raw: unknown, now = new Date()): SanitizeResult {
  if (!isRecord(raw)) return { ok: false, error: 'is not an object' }

  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  if (!title) return { ok: false, error: 'is missing a title' }
  if (title.length > TITLE_MAX) {
    return { ok: false, error: `has a title longer than ${TITLE_MAX} characters` }
  }
  if (!isTestStatus(raw.status)) {
    return { ok: false, error: `has an invalid status "${String(raw.status)}"` }
  }
  if (!isPriority(raw.priority)) {
    return { ok: false, error: `has an invalid priority "${String(raw.priority)}"` }
  }

  const nowIso = now.toISOString()
  const testCase: TestCase = {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : generateId(),
    key: typeof raw.key === 'string' ? raw.key.trim() : '',
    title,
    description: '',
    module: '',
    priority: raw.priority,
    preconditions: '',
    steps: '',
    expectedResult: '',
    actualResult: '',
    status: raw.status,
    createdAt: isValidDate(raw.createdAt) ? raw.createdAt : nowIso,
    updatedAt: isValidDate(raw.updatedAt) ? raw.updatedAt : nowIso,
  }
  for (const field of TEXT_FIELDS) {
    const value = raw[field]
    if (typeof value === 'string') testCase[field] = value
  }
  if (isValidDate(raw.lastExecutedAt)) testCase.lastExecutedAt = raw.lastExecutedAt

  return { ok: true, testCase }
}

/**
 * Makes "TC-###" keys unique. Items keep their key unless it is empty or already
 * used (by `reserved` or an earlier item); those get a new key.
 */
export function ensureUniqueKeys(
  testCases: readonly TestCase[],
  reserved: readonly TestCase[] = [],
): TestCase[] {
  const used = new Set(reserved.map((tc) => tc.key))
  let counter = [...reserved, ...testCases].reduce((max, tc) => Math.max(max, keyNumber(tc.key)), 0)

  return testCases.map((tc) => {
    if (tc.key && !used.has(tc.key)) {
      used.add(tc.key)
      return tc
    }
    let key: string
    do {
      counter += 1
      key = formatKey(counter)
    } while (used.has(key))
    used.add(key)
    return { ...tc, key }
  })
}

/** Removes duplicate IDs, keeping the last occurrence (in the first occurrence's position). */
function dedupeById(testCases: readonly TestCase[]): TestCase[] {
  const byId = new Map<string, TestCase>()
  for (const tc of testCases) byId.set(tc.id, tc)
  return [...byId.values()]
}

/** Parses the text of an imported JSON file. Accepts an export file or a bare array. */
export function parseImport(text: string, now = new Date()): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' }
  }

  let items: unknown[]
  if (Array.isArray(data)) {
    items = data
  } else if (isRecord(data) && Array.isArray(data.testCases)) {
    if (typeof data.version === 'number' && data.version > EXPORT_VERSION) {
      return {
        ok: false,
        error: `This file was created by a newer version of the app (version ${data.version}).`,
      }
    }
    items = data.testCases
  } else {
    return {
      ok: false,
      error: 'Unrecognized format: expected a list of test cases or an exported tracker file.',
    }
  }

  if (items.length === 0) return { ok: false, error: 'The file contains no test cases.' }

  const testCases: TestCase[] = []
  for (const [index, item] of items.entries()) {
    const result = sanitizeTestCase(item, now)
    if (!result.ok) return { ok: false, error: `Test case #${index + 1} ${result.error}.` }
    testCases.push(result.testCase)
  }

  return { ok: true, testCases: ensureUniqueKeys(dedupeById(testCases)) }
}

/**
 * Merge import: imported items replace existing ones with the same ID (in place);
 * new items are added to the end. Keys stay unique.
 */
export function mergeTestCases(
  existing: readonly TestCase[],
  incoming: readonly TestCase[],
): TestCase[] {
  const incomingById = new Map(incoming.map((tc) => [tc.id, tc]))
  const existingIds = new Set(existing.map((tc) => tc.id))
  const updated = existing.map((tc) => incomingById.get(tc.id) ?? tc)
  const added = incoming.filter((tc) => !existingIds.has(tc.id))
  return ensureUniqueKeys([...updated, ...added])
}

/** Lenient version used for localStorage: skips invalid items instead of failing. */
export function sanitizeStoredList(data: readonly unknown[], now = new Date()): TestCase[] {
  const valid: TestCase[] = []
  for (const item of data) {
    const result = sanitizeTestCase(item, now)
    if (result.ok) valid.push(result.testCase)
  }
  return ensureUniqueKeys(dedupeById(valid))
}
