import { redirect } from "next/navigation";

import { TeamStepId, teamStepPath } from "@/lib/team/routes";

export default function NewClientRoute() {
  redirect(teamStepPath(TeamStepId.DETAILS));
}
