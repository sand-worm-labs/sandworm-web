import { redirect } from "next/navigation";

import { teamStepPath } from "@/features/team/routes";

export default function NewClientRoute() {
  redirect(teamStepPath("details"));
}
