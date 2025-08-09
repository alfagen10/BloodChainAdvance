// Browser polyfills for Node.js globals
declare global {
  interface Window {
    process: any;
  }
}

// Create a minimal process polyfill
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {},
    browser: true,
    version: '',
    versions: {},
    nextTick: (fn: () => void) => setTimeout(fn, 0),
    platform: 'browser',
    cwd: () => '/',
    argv: [],
    pid: 1,
  };
}

// Polyfill global if needed
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

export {};