import {
  pgTable,
  uuid,
  text,
  pgEnum,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { timestamps } from "../utils/helpers";

import { users } from "./user";

// enum for Plan
export const planEnum = pgEnum("Plan", ["free", "pro", "enterprise"]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  source: text("source"),
  useCases: text("use_cases")
    .array()
    .default(sql`ARRAY[]::text[]`),
  useContext: text("use_context"),
  plan: planEnum("plan").notNull().default("free"),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const onboardingTutorialStepEnum = pgEnum("OnboardingStep", [
  "connectDataSource",
  "runQuery",
  "runPython",
  "createVisualization",
  "publishDashboard",
  "inviteTeamMembers",
]);

export const onboardingTutorial = pgTable(
  "onboarding_tutorials",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),

    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    currentStep:
      onboardingTutorialStepEnum("currentStep").default("connectDataSource"),
    isComplete: boolean("isComplete").default(false).notNull(),
    isDismissed: boolean("isDismissed").default(false).notNull(),
    ...timestamps,
  },
  table => [
    {
      userWorkspaceUnique: unique("user_workspace_unique").on(
        table.userId,
        table.workspaceId
      ),
    },
  ]
);
