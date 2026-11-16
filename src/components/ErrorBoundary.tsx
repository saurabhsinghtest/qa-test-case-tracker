import { Component, type ErrorInfo, type ReactNode } from 'react'
import { downloadFile } from '../utils/fileIO'
import { exportFileName, serializeExport } from '../utils/importExport'
import { loadTestCases } from '../utils/storage'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches unexpected rendering errors so the user sees a recovery screen instead of a blank page.
 * The backup is read directly from localStorage, so it works even when the app state is broken.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unexpected application error:', error, info.componentStack)
  }

  handleDownloadBackup = () => {
    const now = new Date()
    downloadFile(exportFileName(now), serializeExport(loadTestCases() ?? [], now))
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="container app-main">
        <div className="empty-state" role="alert">
          <div className="empty-state__icon" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="empty-state__title">Something went wrong</h1>
          <p className="empty-state__message">
            The app ran into an unexpected error. Your saved test cases are still stored in this browser. Download a
            backup, then reload the page.
          </p>
          <div className="empty-state__actions">
            <button type="button" className="btn btn--secondary" onClick={this.handleDownloadBackup}>
              Download backup (JSON)
            </button>
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      </main>
    )
  }
}
