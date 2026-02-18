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
