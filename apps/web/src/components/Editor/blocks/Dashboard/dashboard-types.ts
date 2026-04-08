export type DashboardMode =
  | {
      _tag: "live";
    }
  | {
      _tag: "editing";
      position: "dashboard" | "sidebar" | "expanded";
    };

export function dashboardModeHasControls(mode: DashboardMode): boolean {
  switch (mode._tag) {
    case "live":
      return false;
    case "editing":
      switch (mode.position) {
        case "sidebar":
        case "dashboard":
          return false;
        case "expanded":
          return true;
        default:
          return false;
      }
    default:
      return false;
  }
}
