import '@testing-library/jest-dom';

// Mock import.meta for Vite environment variables
if (!globalThis.import) {
  globalThis.import = {};
}
if (!globalThis.import.meta) {
  globalThis.import.meta = {
    env: {
      DEV: true,
      PROD: false,
      MODE: 'test',
      VITE_API_URL: 'http://localhost:5000',
      BASE_URL: '/'
    },
    hot: {
      accept: () => {},
      dispose: () => {},
      decline: () => {},
      invalidate: () => {},
      on: () => {}
    }
  };
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage with jest.fn
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Reset mocks before each test
beforeEach(() => {
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
  localStorage.clear.mockClear();
});

// Mock window.location
delete window.location;
window.location = { href: '', reload: jest.fn() };
