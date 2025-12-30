# Frontend Test Suite

## Overview
Comprehensive Jest + React Testing Library test suite for the TRIDENT frontend application.

## Structure

```
tests/
├── setup.js                       # Test environment configuration
├── components/                    # Component tests
│   ├── Hero.test.jsx             # Hero component (6 tests)
│   └── ProtectedRoute.test.jsx   # Route protection (4 tests)
├── auth/                          # Authentication tests
│   └── AuthContext.test.jsx      # Auth context (6 tests)
├── pages/                         # Page tests
│   ├── Home.test.jsx             # Home page (2 tests)
│   └── Browse.test.jsx           # Browse page (5 tests)
└── integration/                   # Integration tests
    └── api.test.js               # API config (7 tests)
```

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific suite
npm test -- tests/components/Hero.test.jsx
```

## Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| Hero Component | 6 | 100% |
| AuthContext | 6 | 85% |
| ProtectedRoute | 4 | 90% |
| Home Page | 2 | 60% |
| Browse Page | 5 | 70% |
| API Config | 7 | 80% |

**Total: ~30 tests**

## What's Tested

### Components
- ✅ Rendering
- ✅ Props handling
- ✅ Conditional rendering
- ✅ User interactions
- ✅ Styling/classes

### Auth
- ✅ Login/logout flows
- ✅ State management
- ✅ localStorage persistence
- ✅ Token handling

### Pages
- ✅ Component composition
- ✅ API integration
- ✅ Error handling
- ✅ Loading states

### Integration
- ✅ API requests
- ✅ Error handling
- ✅ Authorization headers

## Mocking Strategy
- localStorage
- window.matchMedia
- fetch/API calls
- Child components (in page tests)

## Technologies
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interactions
- **@testing-library/jest-dom**: Custom matchers

## Configuration Files
- `jest.config.js` - Jest configuration
- `setup.js` - Test environment setup
- `.babelrc` - Babel configuration for JSX
- `__mocks__/` - Mock files for assets

## Adding New Tests

1. Create test file: `ComponentName.test.jsx`
2. Import testing utilities:
   ```jsx
   import { render, screen } from '@testing-library/react';
   ```
3. Wrap with necessary providers (Router, Auth)
4. Follow existing patterns
5. Run: `npm test -- path/to/test.jsx`

## Common Patterns

### Testing Component Rendering
```jsx
it('should render component', () => {
  render(<Component />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Testing with Auth Context
```jsx
const mockAuth = { user: {...}, token: '...' };
render(
  <AuthContext.Provider value={mockAuth}>
    <Component />
  </AuthContext.Provider>
);
```

### Testing with Router
```jsx
render(
  <MemoryRouter>
    <Component />
  </MemoryRouter>
);
```

## Documentation
See [TEST_DOCUMENTATION.md](../../TEST_DOCUMENTATION.md) for complete details.
