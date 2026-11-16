import { useCallback, useMemo, useRef, useState } from 'react'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Dashboard } from './components/Dashboard'
import { EmptyState } from './components/EmptyState'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Header } from './components/Header'
import { ImportExport } from './components/ImportExport'
import { Notification, type NotificationData, type NotificationType } from './components/Notification'
import { TestCaseDetail } from './components/TestCaseDetail'
import { TestCaseForm } from './components/TestCaseForm'
import { TestCaseList } from './components/TestCaseList'
import { TestCaseProvider } from './context/TestCaseProvider'
import { useTestCases } from './context/useTestCases'
import type { View } from './types/navigation'
import type { TestCase, TestCaseInput, TestStatus } from './types/testCase'
import { DEFAULT_FILTERS, getModules, type TestCaseFilters } from './utils/filters'
import { toInput } from './utils/testCaseUtils'

function AppContent() {
  const { testCases, storageError, addTestCase, updateTestCase, deleteTestCase, setStatus } = useTestCases()

  const [view, setView] = useState<View>({ name: 'dashboard' })
  // Filters live here so they are kept when moving between screens
  const [filters, setFilters] = useState<TestCaseFilters>(DEFAULT_FILTERS)
  const [notification, setNotification] = useState<NotificationData | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TestCase | null>(null)
  const notificationId = useRef(0)

  const modules = useMemo(() => getModules(testCases), [testCases])

  const notify = useCallback((message: string, type: NotificationType = 'success') => {
    notificationId.current += 1
    setNotification({ id: notificationId.current, message, type })
  }, [])

  const dismissNotification = useCallback(() => setNotification(null), [])

  const navigate = useCallback((next: View) => {
    setView(next)
    window.scrollTo({ top: 0 })
  }, [])

  function findTestCase(id: string) {
    return testCases.find((tc) => tc.id === id)
  }

  function handleCreate(input: TestCaseInput) {
    const id = addTestCase(input)
    notify(`Test case "${input.title}" created.`)
    navigate({ name: 'view', id })
  }

  function handleUpdate(id: string, input: TestCaseInput) {
    updateTestCase(id, input)
    notify('Changes saved.')
    navigate({ name: 'view', id })
  }

  function handleStatusChange(tc: TestCase, status: TestStatus) {
    if (tc.status === status) return
    setStatus(tc.id, status)
    notify(`${tc.key} marked as ${status}.`)
  }

  function confirmDelete() {
    if (!pendingDelete) return
    const { id, key } = pendingDelete
    deleteTestCase(id)
    setPendingDelete(null)
    notify(`${key} deleted.`)
    // Leave the detail/edit screen of a deleted test case
    if ((view.name === 'view' || view.name === 'edit') && view.id === id) navigate({ name: 'list' })
  }

  function showStatus(status: TestStatus) {
    setFilters({ ...DEFAULT_FILTERS, status })
    navigate({ name: 'list' })
  }

  function renderNotFound() {
    return (
      <EmptyState icon="❓" title="Test case not found" message="It may have been deleted or replaced by an import.">
        <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'list' })}>
          Back to test cases
        </button>
      </EmptyState>
    )
  }

  function renderView() {
    switch (view.name) {
      case 'dashboard':
        return <Dashboard testCases={testCases} onNavigate={navigate} onShowStatus={showStatus} />

      case 'list':
        return (
          <TestCaseList
            testCases={testCases}
            filters={filters}
            onFiltersChange={setFilters}
            onCreate={() => navigate({ name: 'new' })}
            onView={(id) => navigate({ name: 'view', id })}
            onEdit={(id) => navigate({ name: 'edit', id })}
            onDelete={setPendingDelete}
            onStatusChange={handleStatusChange}
          />
        )

      case 'new':
        return (
          <TestCaseForm
            key="new"
            mode="create"
            modules={modules}
            onSubmit={handleCreate}
            onCancel={() => navigate({ name: 'list' })}
          />
        )

      case 'edit': {
        const tc = findTestCase(view.id)
        if (!tc) return renderNotFound()
        return (
          <TestCaseForm
            key={tc.id}
            mode="edit"
            testCaseKey={tc.key}
            initialValues={toInput(tc)}
            modules={modules}
            onSubmit={(input) => handleUpdate(tc.id, input)}
            onCancel={() => navigate({ name: 'view', id: tc.id })}
          />
        )
      }

      case 'view': {
        const tc = findTestCase(view.id)
        if (!tc) return renderNotFound()
        return (
          <TestCaseDetail
            testCase={tc}
            onBack={() => navigate({ name: 'list' })}
            onEdit={() => navigate({ name: 'edit', id: tc.id })}
            onDelete={() => setPendingDelete(tc)}
            onStatusChange={(status) => handleStatusChange(tc, status)}
          />
        )
      }

      case 'data':
        return <ImportExport onNotify={notify} />
    }
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header view={view} onNavigate={navigate} />

      {storageError && (
        <div className="storage-warning" role="alert">
          ⚠ Your changes could not be saved to browser storage. They will be lost when you close this page. Export
          your data to keep a copy.
        </div>
      )}

      <main id="main" className="container app-main" tabIndex={-1}>
        {renderView()}
      </main>

      <footer className="app-footer">
        <div className="container">QA Test Case Tracker · Data is stored locally in your browser.</div>
      </footer>

      <Notification notification={notification} onDismiss={dismissNotification} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete test case?"
        message={
          pendingDelete
            ? `"${pendingDelete.key}: ${pendingDelete.title}" will be permanently deleted. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <TestCaseProvider>
        <AppContent />
      </TestCaseProvider>
    </ErrorBoundary>
  )
}

export default App
