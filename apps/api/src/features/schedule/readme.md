# Complete Schedule GraphQL Examples

## Mutations

### 1. Create HOURLY Schedule
Runs every hour at the specified minute.

```graphql
mutation CreateHourlySchedule {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: HOURLY
      minute: 30  # Runs at :30 of every hour (e.g., 1:30, 2:30, 3:30)
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    minute
    timezone
    isActive
    nextExecutionAt
    lastExecutedAt
  }
}
```

---

### 2. Create DAILY Schedule
Runs once per day at the specified time.

```graphql
mutation CreateDailySchedule {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: DAILY
      hour: 9       # 9 AM
      minute: 0     # At 9:00 AM every day
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    hour
    minute
    timezone
    isActive
    nextExecutionAt
  }
}
```

---

### 3. Create WEEKLY Schedule
Runs on specific days of the week.

**Single Day (Tuesday only):**
```graphql
mutation CreateWeeklyScheduleSingleDay {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: WEEKLY
      hour: 10
      minute: 0
      weekdays: "2"  # Tuesday only (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    hour
    minute
    weekdays
    timezone
    isActive
    nextExecutionAt
  }
}
```

**Multiple Days (Weekdays - Mon-Fri):**
```graphql
mutation CreateWeeklyScheduleWeekdays {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: WEEKLY
      hour: 8
      minute: 30
      weekdays: "1,2,3,4,5"  # Monday through Friday
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    hour
    minute
    weekdays
    timezone
    isActive
  }
}
```

**Weekends (Sat-Sun):**
```graphql
mutation CreateWeeklyScheduleWeekends {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: WEEKLY
      hour: 11
      minute: 0
      weekdays: "0,6"  # Sunday and Saturday
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    weekdays
  }
}
```

---

### 4. Create MONTHLY Schedule
Runs on specific days of the month.

**Single Day (1st of month):**
```graphql
mutation CreateMonthlyScheduleSingleDay {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: MONTHLY
      hour: 9
      minute: 0
      days: "0"  # 1st day of month (0-indexed, so 0 = 1st, 1 = 2nd, etc.)
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    hour
    minute
    days
    timezone
    isActive
    nextExecutionAt
  }
}
```

**Multiple Days (1st and 15th):**
```graphql
mutation CreateMonthlyScheduleMultipleDays {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: MONTHLY
      hour: 8
      minute: 0
      days: "0,14"  # 1st and 15th (0-indexed)
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    days
    nextExecutionAt
  }
}
```

**End of Month:**
```graphql
mutation CreateMonthlyScheduleEndOfMonth {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: MONTHLY
      hour: 23
      minute: 59
      days: "30"  # Last day (31st, 0-indexed = 30)
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    days
  }
}
```

---

### 5. Create CRON Schedule
Custom cron expression (6 parts: second minute hour day month weekday).

**Every weekday at 9:30 AM:**
```graphql
mutation CreateCronScheduleWeekdays {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: CRON
      cron: "0 30 9 * * 1-5"  # 9:30 AM Monday-Friday
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    type
    cron
    timezone
    isActive
    nextExecutionAt
  }
}
```

**Every 15 minutes:**
```graphql
mutation CreateCronScheduleEvery15Min {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: CRON
      cron: "0 */15 * * * *"  # Every 15 minutes
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    cron
  }
}
```

**First Monday of every month:**
```graphql
mutation CreateCronScheduleFirstMonday {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: CRON
      cron: "0 0 10 1-7 * 1"  # 10 AM on first Monday (days 1-7, weekday 1)
      timezone: "Africa/Lagos"
      isActive: true
    }
  ) {
    id
    cron
  }
}
```

---

## Update Schedule Mutations

### Update Schedule Time
```graphql
mutation UpdateScheduleTime {
  updateSchedule(
    scheduleId: "schedule-uuid-here"
    input: {
      hour: 14
      minute: 30
    }
  ) {
    id
    hour
    minute
    nextExecutionAt
  }
}
```

### Update Schedule Type (HOURLY to DAILY)
```graphql
mutation UpdateScheduleType {
  updateSchedule(
    scheduleId: "schedule-uuid-here"
    input: {
      type: DAILY
      hour: 9
      minute: 0
    }
  ) {
    id
    type
    hour
    minute
  }
}
```

### Pause/Resume Schedule
```graphql
mutation PauseSchedule {
  updateSchedule(
    scheduleId: "schedule-uuid-here"
    input: {
      isActive: false  # Set to true to resume
    }
  ) {
    id
    isActive
  }
}
```

### Update Timezone
```graphql
mutation UpdateScheduleTimezone {
  updateSchedule(
    scheduleId: "schedule-uuid-here"
    input: {
      timezone: "America/New_York"
    }
  ) {
    id
    timezone
    nextExecutionAt
  }
}
```

### Update Weekdays (for WEEKLY schedule)
```graphql
mutation UpdateWeeklyScheduleDays {
  updateSchedule(
    scheduleId: "schedule-uuid-here"
    input: {
      weekdays: "1,3,5"  # Monday, Wednesday, Friday
    }
  ) {
    id
    weekdays
    nextExecutionAt
  }
}
```

---

## Query Examples

### Get Single Schedule
```graphql
query GetSchedule {
  schedule(scheduleId: "schedule-uuid-here") {
    id
    type
    hour
    minute
    cron
    weekdays
    days
    timezone
    isActive
    lastExecutedAt
    nextExecutionAt
    documentId
  }
}
```

### List All Schedules for a Document
```graphql
query ListDocumentSchedules {
  schedules(input: { documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469" }) {
    id
    type
    hour
    minute
    cron
    weekdays
    days
    timezone
    isActive
    lastExecutedAt
    nextExecutionAt
  }
}
```

### List Only Active Schedules
```graphql
query ListActiveSchedules {
  schedules(input: { documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469" }) {
    id
    type
    isActive
    nextExecutionAt
  }
}
```

---

## Delete Schedule Mutation

```graphql
mutation DeleteSchedule {
  deleteSchedule(
    input: {
      workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      scheduleId: "schedule-uuid-here"
    }
  )
}
```

---

## Common Timezone Examples

### Africa
- `"Africa/Lagos"` - Nigeria (WAT, UTC+1)
- `"Africa/Cairo"` - Egypt (EET, UTC+2)
- `"Africa/Johannesburg"` - South Africa (SAST, UTC+2)
- `"Africa/Nairobi"` - Kenya (EAT, UTC+3)
- `"Africa/Accra"` - Ghana (GMT, UTC+0)

### Americas
- `"America/New_York"` - US Eastern
- `"America/Los_Angeles"` - US Pacific
- `"America/Chicago"` - US Central
- `"America/Denver"` - US Mountain
- `"America/Sao_Paulo"` - Brazil

### Europe
- `"Europe/London"` - UK
- `"Europe/Paris"` - France
- `"Europe/Berlin"` - Germany
- `"Europe/Moscow"` - Russia

### Asia
- `"Asia/Tokyo"` - Japan
- `"Asia/Shanghai"` - China
- `"Asia/Dubai"` - UAE
- `"Asia/Kolkata"` - India
- `"Asia/Singapore"` - Singapore

---

## Cron Expression Format

Format: `second minute hour day month weekday`

### Examples:
- `"0 0 9 * * *"` - 9:00 AM every day
- `"0 30 */2 * * *"` - Every 2 hours at :30
- `"0 0 0 1 * *"` - Midnight on 1st of every month
- `"0 0 12 * * 1-5"` - Noon on weekdays
- `"0 */30 * * * *"` - Every 30 minutes
- `"0 0 6,12,18 * * *"` - 6 AM, 12 PM, 6 PM daily

### Wildcards:
- `*` - Any value
- `*/n` - Every n (e.g., `*/5` = every 5)
- `n-m` - Range (e.g., `1-5` = 1 through 5)
- `n,m,o` - List (e.g., `1,3,5`)

---

## Error Examples

### Missing Required Field (HOURLY)
```graphql
# ❌ This will fail - missing minute
mutation FailHourly {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: HOURLY
      timezone: "Africa/Lagos"
    }
  ) {
    id
  }
}
# Error: "Minute is required for HOURLY schedule"
```

### Invalid Weekday Range
```graphql
# ❌ This will fail - weekday 7 doesn't exist (0-6 only)
mutation FailWeekly {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: WEEKLY
      hour: 10
      minute: 0
      weekdays: "7"  # Invalid! (0-6 only)
      timezone: "Africa/Lagos"
    }
  ) {
    id
  }
}
# Error: "Weekdays must be comma-separated numbers between 0-6"
```

### Invalid Cron Format
```graphql
# ❌ This will fail - only 5 parts instead of 6
mutation FailCron {
  createSchedule(
    workspaceId: "96a1478a-7f16-4a44-b560-ddbc2eb85ec7"
    input: {
      documentId: "2f7f86b1-127c-4f78-810b-8dbe7d815469"
      type: CRON
      cron: "0 9 * * *"  # Missing second field!
      timezone: "Africa/Lagos"
    }
  ) {
    id
  }
}
# Error: "Cron expression must have 6 parts"
```

---

## Best Practices

1. **Always include timezone** - Schedules are timezone-aware
2. **Use IANA timezone identifiers** - e.g., `"Africa/Lagos"` not `"WAT"` or `"west africa"`
3. **For complex schedules, use CRON type** - More flexibility
4. **Test with isActive: false** - Create disabled, test, then enable
5. **Monitor nextExecutionAt** - Verify schedule is calculated correctly
6. **Weekdays are 0-indexed** - 0=Sunday, 6=Saturday
7. **Monthly days are 0-indexed** - 0=1st, 30=31st
