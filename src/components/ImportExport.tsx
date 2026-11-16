import { useRef, useState, type ChangeEvent } from 'react'
import type { ImportMode } from '../context/TestCaseContext'
import { useTestCases } from '../context/useTestCases'
import type { TestCase } from '../types/testCase'
import { downloadFile, readFileAsText } from '../utils/fileIO'
import { pluralize } from '../utils/format'
import { exportFileName, MAX_IMPORT_BYTES, parseImport, serializeExport } from '../utils/importExport'
import { ConfirmDialog } from './ConfirmDialog'
import type { NotificationType } from './Notification'
import './ImportExport.css'

interface ImportExportProps {
  onNotify: (message: string, type?: NotificationType) => void
}

interface ImportPreview {
  fileName: string
  testCases: TestCase[]
}

export function ImportExport({ onNotify }: ImportExportProps) {
  const { testCases, importTestCases } = useTestCases()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<ImportMode>('merge')
  const [reading, setReading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleExport() {
    if (testCases.length === 0) return
    const now = new Date()
    downloadFile(exportFileName(now), serializeExport(testCases, now))
    onNotify(`Exported ${pluralize(testCases.length, 'test case')} to JSON.`)
  }

  function resetImport() {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setPreview(null)
    setError(null)
    const file = event.target.files?.[0]
    // Clear the input so choosing the same file again (e.g. after fixing it) triggers a new change event
    event.target.value = ''
    if (!file) return

    if (file.size > MAX_IMPORT_BYTES) {
      setError('The file is too large. The maximum size is 5 MB.')
      return
    }

    setReading(true)
    try {
      const result = parseImport(await readFileAsText(file))
      if (result.ok) setPreview({ fileName: file.name, testCases: result.testCases })
      else setError(result.error)
    } catch {
      setError('The file could not be read.')
    } finally {
      setReading(false)
    }
  }

  function performImport() {
    if (!preview) return
    const imported = preview.testCases
    const existingIds = new Set(testCases.map((tc) => tc.id))
    const updatedCount = imported.filter((tc) => existingIds.has(tc.id)).length

    importTestCases(imported, mode)
    setConfirmOpen(false)
    resetImport()

    onNotify(
      mode === 'replace'
        ? `Replaced all data with ${pluralize(imported.length, 'imported test case')}.`
        : `Imported ${pluralize(imported.length, 'test case')}: ${imported.length - updatedCount} added, ${updatedCount} updated.`,
    )
  }

  function handleImportClick() {
    if (mode === 'replace' && testCases.length > 0) setConfirmOpen(true)
    else performImport()
  }

  return (
    <section aria-labelledby="data-title">
      <div className="page-header">
        <div>
          <h1 id="data-title" className="page-title">
            Import / Export
          </h1>
          <p className="page-subtitle">
            Your test cases are stored only in this browser. Export them to back up or share, and import them on
            another device.
          </p>
        </div>
      </div>

      <div className="data-grid">
        <article className="card" aria-labelledby="export-title">
          <h2 id="export-title" className="card__title">
            Export
          </h2>
          <p className="muted">
            Download all {pluralize(testCases.length, 'test case')} as a JSON file.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleExport}
            disabled={testCases.length === 0}
          >
            ⬇ Export JSON
          </button>
        </article>

        <article className="card" aria-labelledby="import-title">
          <h2 id="import-title" className="card__title">
            Import
          </h2>
          <p className="muted">
            Choose a JSON file exported from this app, or a JSON list of test cases.
          </p>

          <div className="field">
            <label htmlFor="import-file" className="field__label">
              JSON file
            </label>
            <input
              ref={fileInputRef}
              id="import-file"
              type="file"
              accept="application/json,.json"
              className="file-input"
              onChange={handleFileChange}
            />
          </div>

          {reading && <p className="muted">Reading file…</p>}

          {error && (
            <div className="alert alert--error" role="alert">
              <p className="alert__title">Import failed</p>
              <p>{error}</p>
            </div>
          )}

          {preview && (
            <div className="import-preview">
              <p className="alert alert--info">
                Found <strong>{pluralize(preview.testCases.length, 'test case')}</strong> in{' '}
                <strong>{preview.fileName}</strong>.
              </p>

              <fieldset className="radio-group">
                <legend className="field__label">Import mode</legend>
                <label className="radio">
                  <input
                    type="radio"
                    name="import-mode"
                    value="merge"
                    checked={mode === 'merge'}
                    onChange={() => setMode('merge')}
                  />
                  <span>
                    <strong>Merge</strong> — add new test cases and update ones with the same ID.
                  </span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="import-mode"
                    value="replace"
                    checked={mode === 'replace'}
                    onChange={() => setMode('replace')}
                  />
                  <span>
                    <strong>Replace</strong> — delete all current test cases and use the imported ones.
                  </span>
                </label>
              </fieldset>

              <div className="form-actions form-actions--start">
                <button type="button" className="btn btn--primary" onClick={handleImportClick}>
                  Import {pluralize(preview.testCases.length, 'test case')}
                </button>
                <button type="button" className="btn btn--secondary" onClick={resetImport}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </article>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Replace all test cases?"
        message={`This will permanently delete your ${pluralize(testCases.length, 'current test case')} and replace them with ${preview ? pluralize(preview.testCases.length, 'imported test case') : 'the imported data'}. Consider exporting a backup first.`}
        confirmLabel="Replace all"
        onConfirm={performImport}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  )
}
