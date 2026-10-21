export enum ExecutionScheduleType {
    HOURLY = 'hourly',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    CRON = 'cron',
}

export enum ConnStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    CHECKING = 'checking',
}

export enum Plan {
    FREE = 'free',
    TRIAL = 'trial',
    ENTERPRISE = 'enterprise',
    PRO = 'professional',
}

export enum UserWorkspaceStatus {
    ACTIVE = 'active',
    REMOVED = 'removed',
    PENDING = 'pending',
}

export enum UserWorkspaceRole {
    EDITOR = 'editor',
    VIEWER = 'viewer',
    ADMIN = 'admin',
}

export enum EnvironmentStatus {
    RUNNING = 'Running',
    STOPPED = 'Stopped',
    FAILING = 'Failing',
    STARTING = 'Starting',
    STOPPING = 'Stopping',
}

export enum ReusableComponentType {
    SQL = 'sql',
    PYTHON = 'python',
}

export enum OnboardingTutorialStep {
    CONNECT_DATA_SOURCE = 'connectDataSource',
    RUN_QUERY = 'runQuery',
    RUN_PYTHON = 'runPython',
    CREATE_VISUALIZATION = 'createVisualization',
    PUBLISH_DASHBOARD = 'publishDashboard',
    INVITE_TEAM_MEMBERS = 'inviteTeamMembers',
}


export enum TutorialType {
    ONBOARDING = 'onboarding',
}

// Where a notebook runs, chosen when it is created. CLOUD uses the
// workspace's cloud kernel (heavy research, SQL warehouses). The two browser
// kinds run in Pyodide in the user's own browser and never touch the cloud:
// BROWSER_ANALYSIS is local analysis; BROWSER_DASHBOARD is a live dashboard
// that re-runs in each viewer's browser when they open it.
export enum DocumentRuntime {
  CLOUD = "CLOUD",
  BROWSER_ANALYSIS = "BROWSER_ANALYSIS",
  BROWSER_DASHBOARD = "BROWSER_DASHBOARD",
}

export function runsInBrowser(runtime: DocumentRuntime | null | undefined): boolean {
  return (
    runtime === DocumentRuntime.BROWSER_ANALYSIS ||
    runtime === DocumentRuntime.BROWSER_DASHBOARD
  );
}

export enum DocumentVisibility {
  WORKSPACE = "WORKSPACE",
  // Signed-in Sandworm users who have the in-app link, read-only.
  LINK = "LINK",
  // Anyone with the link, no sign-in, at /notebooks/<title>-<random token>. Never listed, searched or forked.
  UNLISTED = "UNLISTED",
  PUBLIC = "PUBLIC",
}
