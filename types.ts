export enum Tab {
  EDIT = 'edit',
  GENERATE = 'generate',
  VIDEO = 'video',
}

declare global {
  // FIX: Defined the AIStudio interface to resolve the global type conflict.
  // The error message indicated that `window.aistudio` should be of type `AIStudio`.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}
