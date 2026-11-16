import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { EMPTY_INPUT, PRIORITIES, TEST_STATUSES, type TestCaseInput } from '../types/testCase'
import {
  hasErrors,
  normalizeInput,
  TITLE_MAX,
  validateTestCaseInput,
  type ValidationErrors,
} from '../utils/testCaseUtils'
import './TestCaseForm.css'

interface TestCaseFormProps {
  mode: 'create' | 'edit'
  /** Existing values when editing. */
  initialValues?: TestCaseInput
  /** Key of the test case being edited, shown in the heading. */
  testCaseKey?: string
  /** Existing module names, offered as suggestions. */
  modules: string[]
  onSubmit: (input: TestCaseInput) => void
  onCancel: () => void
}

const FIELD_LABELS: Record<keyof TestCaseInput, string> = {
  title: 'Title',
  description: 'Description',
  module: 'Module',
  priority: 'Priority',
  preconditions: 'Preconditions',
  steps: 'Test steps',
  expectedResult: 'Expected result',
  actualResult: 'Actual result',
  status: 'Execution status',
}

const FIELD_ORDER = Object.keys(FIELD_LABELS) as (keyof TestCaseInput)[]

interface FieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: ReactNode
  className?: string
  children: ReactNode
}

function Field({ id, label, required, error, hint, className = '', children }: FieldProps) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}

export function TestCaseForm({ mode, initialValues, testCaseKey, modules, onSubmit, onCancel }: TestCaseFormProps) {
  const [values, setValues] = useState<TestCaseInput>(initialValues ?? EMPTY_INPUT)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [submitted, setSubmitted] = useState(false)
  // Incremented on every failed submit so the error summary is focused each time
  const [failedSubmits, setFailedSubmits] = useState(0)
  const summaryRef = useRef<HTMLDivElement>(null)

  // Runs after React has rendered the error summary, so the element is guaranteed to exist
  useEffect(() => {
    if (failedSubmits > 0) summaryRef.current?.focus()
  }, [failedSubmits])
  const idPrefix = useId()
  const fieldId = (field: keyof TestCaseInput) => `${idPrefix}-${field}`

  function update<K extends keyof TestCaseInput>(field: K, value: TestCaseInput[K]) {
    const next = { ...values, [field]: value }
    setValues(next)
    // After the first submit attempt, re-validate as the user fixes errors
    if (submitted) setErrors(validateTestCaseInput(next))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validateTestCaseInput(values)
    setErrors(validationErrors)
    setSubmitted(true)
    if (hasErrors(validationErrors)) {
      // Focus moves to the error summary (see effect above) so keyboard and screen-reader users notice it
      setFailedSubmits((n) => n + 1)
      return
    }
    onSubmit(normalizeInput(values))
  }

  /** Accessibility attributes linking a control to its hint or error. */
  function describe(field: keyof TestCaseInput, hasHint = false) {
    const id = fieldId(field)
    const error = errors[field]
    return {
      id,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
    }
  }

  const errorFields = FIELD_ORDER.filter((field) => errors[field])
  const title = mode === 'create' ? 'New test case' : `Edit ${testCaseKey ?? 'test case'}`

  return (
    <section aria-labelledby="form-title">
      <div className="page-header">
        <div>
          <h1 id="form-title" className="page-title">
            {title}
          </h1>
          <p className="page-subtitle">
            Fields marked with <span className="field__required">*</span> are required.
          </p>
        </div>
      </div>

      <form className="card tc-form" onSubmit={handleSubmit} noValidate>
        {errorFields.length > 0 && (
          <div ref={summaryRef} className="alert alert--error" role="alert" tabIndex={-1}>
            <p className="alert__title">
              Please fix {errorFields.length === 1 ? '1 error' : `${errorFields.length} errors`} before saving:
            </p>
            <ul>
              {errorFields.map((field) => (
                <li key={field}>
                  <a
                    href={`#${fieldId(field)}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(fieldId(field))?.focus()
                    }}
                  >
                    {FIELD_LABELS[field]}: {errors[field]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="tc-form__grid">
          <Field
            id={fieldId('title')}
            label={FIELD_LABELS.title}
            required
            error={errors.title}
            hint={`${values.title.trim().length}/${TITLE_MAX} characters`}
            className="tc-form__full"
          >
            <input
              {...describe('title', true)}
              className="input"
              value={values.title}
              maxLength={TITLE_MAX + 20}
              placeholder="e.g. Login with valid credentials"
              onChange={(e) => update('title', e.target.value)}
              aria-required="true"
            />
          </Field>

          <Field id={fieldId('module')} label={FIELD_LABELS.module} error={errors.module} hint="Feature or area under test.">
            <input
              {...describe('module', true)}
              className="input"
              value={values.module}
              list={`${idPrefix}-modules`}
              placeholder="e.g. Login"
              onChange={(e) => update('module', e.target.value)}
            />
            <datalist id={`${idPrefix}-modules`}>
              {modules.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>

          <Field id={fieldId('priority')} label={FIELD_LABELS.priority} error={errors.priority}>
            <select
              {...describe('priority')}
              className="select"
              value={values.priority}
              onChange={(e) => update('priority', e.target.value as TestCaseInput['priority'])}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field id={fieldId('status')} label={FIELD_LABELS.status} error={errors.status}>
            <select
              {...describe('status')}
              className="select"
              value={values.status}
              onChange={(e) => update('status', e.target.value as TestCaseInput['status'])}
            >
              {TEST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id={fieldId('description')}
            label={FIELD_LABELS.description}
            error={errors.description}
            className="tc-form__full"
          >
            <textarea
              {...describe('description')}
              className="textarea"
              rows={2}
              value={values.description}
              placeholder="What does this test verify?"
              onChange={(e) => update('description', e.target.value)}
            />
          </Field>

          <Field
            id={fieldId('preconditions')}
            label={FIELD_LABELS.preconditions}
            error={errors.preconditions}
            className="tc-form__full"
          >
            <textarea
              {...describe('preconditions')}
              className="textarea"
              rows={2}
              value={values.preconditions}
              placeholder="e.g. A registered user account exists."
              onChange={(e) => update('preconditions', e.target.value)}
            />
          </Field>

          <Field
            id={fieldId('steps')}
            label={FIELD_LABELS.steps}
            error={errors.steps}
            hint="Enter one step per line."
            className="tc-form__full"
          >
            <textarea
              {...describe('steps', true)}
              className="textarea"
              rows={5}
              value={values.steps}
              placeholder={'Open the login page\nEnter a valid email\nClick "Sign in"'}
              onChange={(e) => update('steps', e.target.value)}
            />
          </Field>

          <Field
            id={fieldId('expectedResult')}
            label={FIELD_LABELS.expectedResult}
            required
            error={errors.expectedResult}
            className="tc-form__half"
          >
            <textarea
              {...describe('expectedResult')}
              className="textarea"
              rows={3}
              value={values.expectedResult}
              onChange={(e) => update('expectedResult', e.target.value)}
              aria-required="true"
            />
          </Field>

          <Field
            id={fieldId('actualResult')}
            label={FIELD_LABELS.actualResult}
            error={errors.actualResult}
            className="tc-form__half"
          >
            <textarea
              {...describe('actualResult')}
              className="textarea"
              rows={3}
              value={values.actualResult}
              placeholder="Fill in after running the test."
              onChange={(e) => update('actualResult', e.target.value)}
            />
          </Field>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            {mode === 'create' ? 'Create test case' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}
