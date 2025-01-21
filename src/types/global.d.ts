interface CUDashyAPI {
  version: string;
  refreshWidgets: () => void;
  clearCache: () => void;
}

declare global {
  interface Window {
    CU_Dashy: CUDashyAPI;
  }
}

export {};
