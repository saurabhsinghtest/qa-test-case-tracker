// Sample test cases shown on the first visit so the app isn't empty.
import type { Priority, TestCase, TestStatus } from '../types/testCase'
import { formatKey } from './testCaseUtils'

interface SampleSeed {
  title: string
  module: string
  priority: Priority
  status: TestStatus
  description: string
  preconditions: string
  steps: string
  expectedResult: string
  actualResult: string
  /** How many hours ago the case was last updated. */
  hoursAgo: number
}

const SEEDS: SampleSeed[] = [
  {
    title: 'Login with valid credentials',
    module: 'Login',
    priority: 'Critical',
    status: 'Passed',
    description: 'Verify that a registered user can sign in with a correct email and password.',
    preconditions: 'A registered user account exists.',
    steps: 'Open the login page\nEnter a valid email\nEnter the correct password\nClick "Sign in"',
    expectedResult: 'The user is redirected to the home page and sees their name in the header.',
    actualResult: 'Redirected to the home page as expected.',
    hoursAgo: 2,
  },
  {
    title: 'Login with wrong password shows an error',
    module: 'Login',
    priority: 'High',
    status: 'Passed',
    description: 'Verify that an incorrect password is rejected with a clear message.',
    preconditions: 'A registered user account exists.',
    steps: 'Open the login page\nEnter a valid email\nEnter an incorrect password\nClick "Sign in"',
    expectedResult: 'An "Invalid email or password" message is shown and the user stays on the login page.',
    actualResult: 'Error message displayed correctly.',
    hoursAgo: 5,
  },
  {
    title: 'Password reset email is sent',
    module: 'Login',
    priority: 'Medium',
    status: 'Blocked',
    description: 'Verify that the "Forgot password" flow sends a reset email.',
    preconditions: 'Email service is configured in the test environment.',
    steps: 'Click "Forgot password"\nEnter a registered email\nSubmit the form\nCheck the inbox',
    expectedResult: 'A password reset email arrives within 2 minutes.',
    actualResult: 'Blocked: the email service is down in the staging environment.',
    hoursAgo: 26,
  },
  {
    title: 'Add product to cart',
    module: 'Checkout',
    priority: 'Critical',
    status: 'Passed',
    description: 'Verify a product can be added to the shopping cart.',
    preconditions: 'At least one product is in stock.',
    steps: 'Open a product page\nSelect quantity 1\nClick "Add to cart"\nOpen the cart',
    expectedResult: 'The product appears in the cart with quantity 1 and the correct price.',
    actualResult: 'Product added with correct price.',
    hoursAgo: 8,
  },
  {
    title: 'Apply an expired discount code',
    module: 'Checkout',
    priority: 'High',
    status: 'Failed',
    description: 'Verify that expired discount codes are rejected.',
    preconditions: 'An expired discount code "SUMMER20" exists.',
    steps: 'Add a product to the cart\nGo to checkout\nEnter code "SUMMER20"\nClick "Apply"',
    expectedResult: 'The message "This code has expired" is shown and no discount is applied.',
    actualResult: 'The 20% discount was applied to the order total.',
    hoursAgo: 1,
  },
  {
    title: 'Pay with a saved credit card',
    module: 'Checkout',
    priority: 'Critical',
    status: 'Not Run',
    description: 'Verify checkout completes using a saved payment method.',
    preconditions: 'The user is logged in and has a saved test card.',
    steps: 'Add a product to the cart\nGo to checkout\nSelect the saved card\nClick "Place order"',
    expectedResult: 'The order is confirmed and a confirmation number is shown.',
    actualResult: '',
    hoursAgo: 50,
  },
  {
    title: 'Search returns matching products',
    module: 'Search',
    priority: 'Medium',
    status: 'Passed',
    description: 'Verify keyword search returns relevant results.',
    preconditions: 'Products named "Blue T-Shirt" and "Blue Jeans" exist.',
    steps: 'Type "blue" in the search box\nPress Enter',
    expectedResult: 'Both blue products are listed in the results.',
    actualResult: 'Both products listed.',
    hoursAgo: 30,
  },
  {
    title: 'Search with no results shows a helpful message',
    module: 'Search',
    priority: 'Low',
    status: 'Not Run',
    description: 'Verify the empty state when a search finds nothing.',
    preconditions: '',
    steps: 'Type "zzzz" in the search box\nPress Enter',
    expectedResult: 'A "No products found" message with search tips is shown.',
    actualResult: '',
    hoursAgo: 72,
  },
  {
    title: 'Update profile name',
    module: 'Profile',
    priority: 'Low',
    status: 'Failed',
    description: 'Verify that users can change their display name.',
    preconditions: 'The user is logged in.',
    steps: 'Open "My profile"\nChange the display name\nClick "Save"\nReload the page',
    expectedResult: 'The new name is saved and shown after reload.',
    actualResult: 'The old name is shown again after reload.',
    hoursAgo: 4,
  },
]

const HOUR_MS = 60 * 60 * 1000

export function getSampleTestCases(now = new Date()): TestCase[] {
  return SEEDS.map(({ hoursAgo, ...seed }, index) => {
    const updatedAt = new Date(now.getTime() - hoursAgo * HOUR_MS).toISOString()
    const createdAt = new Date(now.getTime() - (hoursAgo + 96) * HOUR_MS).toISOString()
    const testCase: TestCase = {
      id: `sample-${index + 1}`,
      key: formatKey(index + 1),
      ...seed,
      createdAt,
      updatedAt,
    }
    if (seed.status !== 'Not Run') testCase.lastExecutedAt = updatedAt
    return testCase
  })
}
