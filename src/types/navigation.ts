// The screens of the app. Navigation is handled with React state (no router).
export type View =
  | { name: 'dashboard' }
  | { name: 'list' }
  | { name: 'new' }
  | { name: 'data' }
  | { name: 'view'; id: string }
  | { name: 'edit'; id: string }
