# QA Test Case Tracker

A lightweight, browser-based web app for writing manual QA test cases, recording their execution status (**Passed**, **Failed**, **Blocked**, **Not Run**) and seeing test health at a glance. It needs no account and no backend: all data is stored in your browser's `localStorage`.

- **Live application:** Deployment pending — will be updated after Phase 7.
- **Repository:** https://github.com/saurabhsinghtest/qa-test-case-tracker

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Folder Structure](#project-folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Run the Application Locally](#run-the-application-locally)
- [Testing](#testing)
- [Production Build](#production-build)
- [Available Scripts](#available-scripts)
- [GitHub Repository](#github-repository)
- [Live Application URL](#live-application-url)
- [Author and Project Purpose](#author-and-project-purpose)

---

## Overview

### The problem
Small QA teams, students and solo testers often track test cases in spreadsheets. Spreadsheets are hard to filter and give no quick view of test health. Full test-management tools cost money and take time to set up.

### The solution
QA Test Case Tracker is a simple, free, no-login web app for creating test cases, recording their results and seeing statistics on a dashboard. Data stays in the browser, and you can back it up or move it to another device with JSON export and import.

### Target users
- Manual QA testers and QA students
- Developers who test their own features
- Small teams or individuals who need a quick tracker without a backend or account

---

## Features

### 📊 Dashboard and execution statistics
- Stat cards for **Total**, **Passed**, **Failed**, **Blocked** and **Not Run**, each showing its count and percentage of the total.
- **Pass rate**, calculated as passed ÷ executed tests (tests that are "Not Run" are left out).
- **Execution status bar**: a stacked bar with a legend, built in plain CSS (no chart library).
- **Execution progress** (executed vs. total), with a note when tests need attention (failed or blocked).
- **By priority** breakdown: a status bar for each of Critical, High, Medium and Low.
- **Recently updated** list of the 5 latest changes, each linking to its test case.
- Clicking a status card opens the test case list already filtered to that status.

### 📝 Test case creation, editing and deletion
- One form for both creating and editing, with these fields: title, module (suggests existing modules), priority, execution status, description, preconditions, test steps (one per line), expected result and actual result.
- Each test case gets a readable ID (`TC-001`, `TC-002`, …) and created/updated timestamps.
- A **detail view** shows the full test case, with steps as a numbered list.
- **Deleting asks for confirmation** in an accessible dialog: Cancel, the Escape key and clicking outside the dialog all cancel.

### ✅ Test execution status management
- Four statuses: **Passed**, **Failed**, **Blocked** and **Not Run**.
- Change the status quickly from a **dropdown on each list row**, or with **one-click status buttons** on the detail view.
- A status change records a **"Last executed"** timestamp, which is cleared again when a case is reset to Not Run.

### 🔍 Search and filtering
- Text search across **ID, title, module and description** (not case-sensitive).
- Filter by **status**, **priority** and **module**; filters combine with each other and with the search.
- Sort by recently updated, ID, title (A–Z) or priority (highest first).
- A live "Showing X of Y test cases" counter, a **Clear filters** button and a "no matching test cases" message.
- Filters are kept when you move to other screens and come back.

### 🛡️ Form validation
- Required fields: **Title** (3–120 characters) and **Expected result**.
- Length limits: module up to 50 characters; long text fields up to 2,000 characters.
- An **error summary** at the top of the form, which receives keyboard focus and links to each invalid field, plus inline messages under each field.
- After the first attempt to save, errors update as you type.

### 💬 Success and error messages
- A notification (toast) confirms every action, for example *"TC-004 marked as Failed."* or *"Changes saved."*
- Import problems show clear error messages, and a warning banner appears if the browser can't save data.

### 💾 localStorage persistence
- Every change is saved to the browser automatically and is still there after a page refresh.
- On the first visit, **sample test cases** are loaded so the dashboard isn't empty. If you later delete everything, the list stays empty.
- Saved data is checked when it loads, so invalid entries are skipped instead of breaking the app.

### 📁 JSON import and export
- **Export** downloads all test cases as `qa-test-cases-YYYY-MM-DD.json`.
- **Import** accepts a file exported by this app or a plain JSON list of test cases, up to 5 MB.
  - The file is checked before anything changes. Errors are specific, e.g. *"Test case #2 has an invalid status "Done"."*
  - A preview shows how many test cases were found.
  - **Merge** adds new test cases and updates ones with the same ID.
  - **Replace** swaps out all current data, after you confirm.

### 📱 Responsive and accessible interface
- Layouts for mobile, tablet and desktop. Below 1024 px, the test case table switches to cards.
- Labelled form controls, keyboard support, visible focus outlines, a skip-to-content link, and screen-reader announcements for notifications.
- Respects the operating system's reduced-motion setting.

---

## Technology Stack

Versions below are the ones installed in this project.

| Area | Technology | Version |
|---|---|---|
| UI library | [React](https://react.dev/) + React DOM | 19.3.1 |
| Language | [TypeScript](https://www.typescriptlang.org/) | 7.0.2 |
| Build tool and dev server | [Vite](https://vite.dev/) with `@vitejs/plugin-react` | 8.3.8 / 6.3.0 |
| Styling | Plain CSS with CSS custom properties (no CSS framework) | — |
| State management | React `useReducer` + Context API | (built into React) |
| Data storage | Browser `localStorage` | — |
| Test runner | [Vitest](https://vitest.dev/) with `@vitest/coverage-v8` | 5.1.0 |
| Component testing | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), `user-event`, `jest-dom` | 16.3.3 / 14.6.12 / 7.0.1 |
| Test browser environment | [jsdom](https://github.com/jsdom/jsdom) | 31.0.1 |
| Linting | [Oxlint](https://oxc.rs/) | 1.93.0 |
| Version control | Git + GitHub | — |
| Hosting (planned) | Vercel | — |

The app has only two runtime dependencies (`react` and `react-dom`). Everything else is a development tool.

---

## Project Folder Structure

```
qa-test-case-tracker/
├── PLAN.md                  # Development plan (requirements, data model, steps)
├── README.md                # This file
├── index.html               # HTML entry point loaded by Vite
├── package.json             # Scripts and dependencies
├── vite.config.ts           # Vite + Vitest configuration
├── tsconfig*.json           # TypeScript configuration
├── .oxlintrc.json           # Linter rules
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx             # App entry: renders <App /> into the page
    ├── App.tsx              # App shell: screen switching, notifications, delete confirmation
    ├── types/               # Data model
    │   ├── testCase.ts      #   TestCase, TestStatus, Priority types
    │   └── navigation.ts    #   Screen (view) types
    ├── utils/               # Pure logic, no React (fully unit-tested)
    │   ├── testCaseUtils.ts #   IDs, keys (TC-001), validation, create/update rules
    │   ├── filters.ts       #   Search, filters and sorting
    │   ├── stats.ts         #   Dashboard statistics
    │   ├── importExport.ts  #   JSON export, import validation, merge
    │   ├── storage.ts       #   localStorage load/save
    │   ├── sampleData.ts    #   First-visit sample test cases
    │   ├── format.ts        #   Date and text formatting helpers
    │   └── fileIO.ts        #   File download and file reading
    ├── context/             # State management
    │   ├── testCaseReducer.ts   # All data changes (add, update, delete, status, import)
    │   ├── TestCaseProvider.tsx # Holds state and saves it to localStorage
    │   ├── TestCaseContext.ts   # Context definition
    │   └── useTestCases.ts      # Hook used by components
    ├── components/          # UI components (each screen has its own .css file)
    │   ├── Dashboard.tsx        # Statistics screen
    │   ├── TestCaseList.tsx     # List with FilterBar, row status dropdowns, actions
    │   ├── TestCaseForm.tsx     # Create/edit form with validation
    │   ├── TestCaseDetail.tsx   # Detail view with status buttons
    │   ├── ImportExport.tsx     # JSON import/export screen
    │   ├── Header.tsx, ConfirmDialog.tsx, Notification.tsx, ...
    ├── styles/
    │   └── global.css       # Design tokens, layout, shared styles, breakpoints
    └── tests/               # Automated tests (see Testing)
        ├── setup.ts, fixtures.ts
        ├── *.test.ts        # Unit tests for utils and the reducer
        ├── App.test.tsx     # Full user-flow tests
        └── components/      # Component tests
```

---

## Prerequisites

- **Node.js** version **22.22.2 or newer** in the 22.x line, **24.15 or newer** in the 24.x line, or **26 or newer**. Vitest 5 and jsdom 31 require these. The current LTS release is recommended. Check with `node -v`.
- **npm**, which comes with Node.js. Check with `npm -v`.
- **Git**, to clone the repository.
- A modern browser (Chrome, Edge, Firefox or Safari).

> This project was developed and tested with Node.js 26.13.0 and npm 11.20.0.

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/saurabhsinghtest/qa-test-case-tracker.git
   cd qa-test-case-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   No environment variables or API keys are needed.

---

## Run the Application Locally

```bash
npm run dev
```

Then open **http://localhost:5173** in your browser. Vite reloads the page automatically when you edit the code. Press `Ctrl + C` in the terminal to stop the server.

On the first visit the app loads sample test cases. To start again from scratch, clear the site data for `localStorage` in your browser's developer tools.

---

## Testing

The project uses **[Vitest](https://vitest.dev/)** as the test runner and **[React Testing Library](https://testing-library.com/)** for component tests. Tests run in **jsdom**, a simulated browser, so no real browser is needed.

```bash
npm test                # run all tests once
npm run test:watch      # re-run tests automatically when files change
npm run test:coverage   # run tests and print a coverage report
```

**Current result: 129 tests in 14 files, all passing.**

| Type | Location | What is covered |
|---|---|---|
| Unit tests | `src/tests/*.test.ts` | Validation rules, ID and key generation, search, filters and sorting, statistics (including empty data), JSON import validation and merge, localStorage (including corrupt data and save failures), file helpers, and every reducer action |
| Component tests | `src/tests/components/` | Form validation and focus handling, list filtering and row actions, dashboard numbers, confirmation dialog keyboard behaviour, import/export screen |
| Integration tests | `src/tests/App.test.tsx` | Full user flows through the real app and localStorage: create, edit, delete, status changes updating the dashboard, filtering, and loading saved data |

Tests find elements by their **accessible role and name** (e.g. "button named *Delete TC-001*"), the way a user or screen reader would, which also checks basic accessibility.

Code quality checks:

```bash
npm run lint            # Oxlint
npx tsc -b              # TypeScript type check (also runs as part of the build)
```

---

## Production Build

```bash
npm run build
```

This type-checks the project with `tsc -b` and builds an optimised static site into the **`dist/`** folder. To preview the production build locally:

```bash
npm run preview
```

The output is a static site, so it can be hosted on any static host (Vercel is planned for this project).

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with a coverage report |
| `npm run lint` | Lint the code with Oxlint |

---

## GitHub Repository

**https://github.com/saurabhsinghtest/qa-test-case-tracker**

---

## Live Application URL

Deployment pending — will be updated after Phase 7.

---

## Author and Project Purpose

**Author:** Saurabh K Singh, GitHub [saurabhsinghtest](https://github.com/saurabhsinghtest)

This application was developed as part of a **Generative AI assignment** to plan, build, test, version, and deploy a complete web application with an AI coding assistant. It was built using **Claude Code** inside **Visual Studio Code**, following these phases:

1. **Planning:** requirements, data model and development plan ([PLAN.md](PLAN.md))
2. **Project setup:** React + TypeScript + Vite with Vitest
3. **Application development:** features and automated tests
4. **Local verification:** automated tests plus browser checks at mobile, tablet and desktop sizes
5. **GitHub:** repository creation and push
6. **Documentation:** this README
7. **Deployment:** Vercel (pending)
