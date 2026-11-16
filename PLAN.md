# QA Test Case Tracker — Development Plan

## 1. Application Name
**QA Test Case Tracker**: a lightweight, browser-based tool for managing manual test cases and recording their execution results.

## 2. Problem Statement
Small QA teams, students and solo testers often track test cases in spreadsheets. Spreadsheets are hard to filter and give no quick view of test health. Full test-management tools (TestRail, Zephyr) cost money and take time to set up. QA Test Case Tracker gives a simple, free, no-login web app to write test cases, record their status and see results at a glance. All data stays in the user's browser.

## 3. Target Users
- Manual QA testers and QA students
- Developers who test their own features
- Small teams or individuals who need a quick tracker without a backend or account

## 4. Features (Scope)
### Must have (MVP)
1. **Dashboard**: total test cases; counts and percentages for Passed / Failed / Blocked / Not Run; pass rate; breakdown by priority; list of recently updated cases.
2. **CRUD**: create, view, edit and delete test cases. Delete asks for confirmation first.
3. **Execution status**: Passed, Failed, Blocked, Not Run. Status can be changed quickly from the list and the detail view. `lastExecutedAt` is updated whenever the status changes.
4. **Search and filter**: text search on title, ID, module and description; filters for status, priority and module; clear-filters button.
5. **Persistence**: all data saved to `localStorage` automatically. Sample data is loaded on first visit.
6. **Export / Import JSON**: download all test cases as a `.json` file. Import validates the file and lets the user choose **Replace** or **Merge**. Invalid files show an error.
7. **Responsive, modern UI**: works on mobile, tablet and desktop. Clean card layout, colored status badges, accessible forms.

### Out of scope (kept small on purpose)
Authentication, a backend or database, multiple projects, test runs/history, file attachments, charting libraries.

## 5. Screens
| Screen | View key | Purpose |
|---|---|---|
| Dashboard | `dashboard` | Stat cards, status distribution bar (pure CSS), priority breakdown, recent activity |
| Test Cases list | `list` | Search bar, filters, table on desktop / cards on mobile, quick status change, View/Edit/Delete actions |
| Test Case form | `new`, `edit/:id` | Shared form for create and edit, with validation |
| Test Case detail | `view/:id` | Full read-only view, status buttons, Edit/Delete |
| Import/Export | toolbar/modal | Export button; import file picker with Replace/Merge choice |

Navigation: a top header with nav links (Dashboard, Test Cases, + New Test Case, Import/Export). Simple view-switching is handled by React state (no router dependency), which keeps the app small and avoids SPA routing setup on Vercel.

## 6. Technology Stack
| Layer | Choice | Reason |
|---|---|---|
| UI | React 18 + TypeScript | Component model, type safety |
| Build | Vite (`react-ts` template) | Fast dev server and build; works with Vercel out of the box |
| Styling | Plain CSS with CSS variables (one global file + per-component CSS) | No extra dependencies; meets the "CSS" requirement |
| State | React `useReducer` + Context, synced to localStorage | Small and predictable; easy to test |
| Testing | Vitest + React Testing Library + jsdom + `@testing-library/user-event` | Native to Vite |
| IDs | `crypto.randomUUID()` + readable key `TC-001` | No dependency needed |
| Version control | Git + GitHub | Assignment requirement |
| Hosting | Vercel (static build) | Free; auto-deploys on push |

## 7. Folder Structure
```
qa-test-case-tracker/            (project root)
├── PLAN.md
├── README.md
├── index.html
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts               (includes Vitest config)
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx                  (layout + view switching)
    ├── types/
    │   └── testCase.ts          (TestCase, Status, Priority types)
    ├── context/
    │   └── TestCaseContext.tsx  (provider, reducer, actions)
    ├── utils/
    │   ├── storage.ts           (load/save localStorage)
    │   ├── filters.ts           (search + filter logic)
    │   ├── stats.ts             (dashboard calculations)
    │   ├── importExport.ts      (JSON export, validation, merge)
    │   └── sampleData.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── Dashboard.tsx
    │   ├── StatCard.tsx
    │   ├── TestCaseList.tsx
    │   ├── TestCaseForm.tsx
    │   ├── TestCaseDetail.tsx
    │   ├── FilterBar.tsx
    │   ├── StatusBadge.tsx
    │   ├── ConfirmDialog.tsx
    │   └── ImportExport.tsx
    ├── styles/
    │   └── global.css           (variables, layout, responsive breakpoints)
    └── tests/
        ├── setup.ts
        ├── storage.test.ts
        ├── filters.test.ts
        ├── stats.test.ts
        ├── importExport.test.ts
        ├── reducer.test.ts
        └── components/*.test.tsx (Form, List, Dashboard, App flow)
```

## 8. Data Model
```ts
type TestStatus = 'Passed' | 'Failed' | 'Blocked' | 'Not Run';
type Priority  = 'Low' | 'Medium' | 'High' | 'Critical';

interface TestCase {
  id: string;              // UUID (internal)
  key: string;             // Human-readable, e.g. "TC-001"
  title: string;           // required, 3–120 chars
  description: string;
  module: string;          // feature/area, e.g. "Login"
  priority: Priority;
  preconditions: string;
  steps: string;           // multi-line text, one step per line
  expectedResult: string;  // required
  actualResult: string;
  status: TestStatus;      // default 'Not Run'
  createdAt: string;       // ISO date
  updatedAt: string;       // ISO date
  lastExecutedAt?: string; // set when status changes
}
```
- **localStorage key:** `qa-tracker:testCases:v1`. The value is a JSON array of `TestCase`. The version suffix allows future migrations.
- **Export format:** `{ "app": "qa-test-case-tracker", "version": 1, "exportedAt": "...", "testCases": [ ... ] }`. Import also accepts a bare array.
- **Import validation:** every item must have a valid title, status and priority. Unknown fields are dropped. During **Merge**, an imported item with an existing ID overwrites the stored one.

## 9. Development Steps (one Git commit per step)
1. **Setup**: scaffold with `npm create vite@latest` (react-ts), add Vitest/RTL/jsdom, configure the `test` block in `vite.config.ts`, `.gitignore`, `git init`, first commit.
2. **Types and utilities**: `types/testCase.ts`, `storage.ts`, `filters.ts`, `stats.ts`, `importExport.ts`, `sampleData.ts`, plus their unit tests (written alongside the code).
3. **State layer**: reducer + Context (`ADD`, `UPDATE`, `DELETE`, `SET_STATUS`, `IMPORT_REPLACE`, `IMPORT_MERGE`) that syncs to localStorage; reducer tests.
4. **Layout and styling**: `global.css` (CSS variables, light theme, responsive breakpoints at 640px / 1024px), Header, view switching in `App.tsx`.
5. **Test case list**: list, StatusBadge, FilterBar (search/status/priority/module), quick status dropdown, delete with ConfirmDialog.
6. **Form and detail**: create/edit form with validation, detail view.
7. **Dashboard**: StatCards, CSS status bar, priority breakdown, recent items.
8. **Import/Export**: file download (Blob), file upload, validation, Replace/Merge, success/error messages.
9. **Component tests and polish**: RTL tests for main flows, accessibility pass (labels, focus, contrast), empty states, mobile check.
10. **Docs and release**: README (features, setup, scripts, live URL, screenshots), push to GitHub, deploy to Vercel.

## 10. Testing Strategy
- **Tools:** Vitest (jsdom environment) + React Testing Library. Run with `npm test`; coverage with `npm run test:coverage` (target ≥ 80% on `utils/` and the reducer).
- **Unit tests (pure logic):**
  - `filters`: search is case-insensitive; filters combine correctly; empty filters return all items.
  - `stats`: counts, pass rate (including divide-by-zero when there are no cases), priority breakdown.
  - `importExport`: valid file, bare-array file, invalid JSON, missing fields, bad status value, Merge vs Replace.
  - `storage`: save/load round trip, corrupt data falls back safely, first visit loads sample data.
  - Reducer: every action type.
- **Component tests:** form validation errors appear; creating a case adds it to the list; editing updates it; confirming delete removes it; changing status updates dashboard counts; search narrows the list.
- **Manual checks before release:** Chrome + mobile viewport via DevTools; data survives a page refresh; export → clear storage → import restores the same data; `npm run build` passes with no TypeScript errors.

## 11. Deployment Approach
1. Create a public GitHub repo `qa-test-case-tracker` and push the `main` branch with the step-by-step commit history.
2. In Vercel: **Add New Project → Import from GitHub**. Framework preset **Vite**, build command `npm run build`, output directory `dist`. No environment variables are needed.
3. Every push to `main` deploys to production automatically; pull requests get preview URLs.
4. Optional: set the Vercel build command to `npm test && npm run build` so a failing test blocks a bad deploy.
5. Check the live URL (CRUD, persistence, import/export, mobile layout) and add it to the README.

## 12. Definition of Done
- All MVP features work in the deployed app
- `npm test` passes and `npm run build` succeeds with no TypeScript errors
- Code is on GitHub with a clear commit history and README
- Live Vercel URL is in the README
