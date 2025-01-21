/// <reference types="vite/client" />
interface Window {
  Android?: {
    finishApp: () => void;
    openBrowser: (url: string) => void;
  };
} 