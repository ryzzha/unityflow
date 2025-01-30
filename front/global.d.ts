export {};

declare global {
    interface Window {
      ethereum?: any; // 👈 Now TypeScript knows!
    }
  }