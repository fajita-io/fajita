export const SIDEBAR_COLLAPSE_KEY = "fajita-sidebar-collapsed";

/**
 * Inline script injected before paint on app routes. Restores the collapsed
 * sidebar grid width immediately so the rail does not flash expanded on load.
 */
export const sidebarInitScript = `(function(){try{if(localStorage.getItem("${SIDEBAR_COLLAPSE_KEY}")==="1"){document.documentElement.dataset.sidebarCollapsed="1";}}catch(e){}})();`;

export function setSidebarCollapsedDataset(collapsed: boolean) {
  if (typeof document === "undefined") return;
  if (collapsed) {
    document.documentElement.dataset.sidebarCollapsed = "1";
  } else {
    delete document.documentElement.dataset.sidebarCollapsed;
  }
}
