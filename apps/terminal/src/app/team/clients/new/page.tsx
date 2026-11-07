import { redirect } from "next/navigation";

import { teamStepPath } from "@/lib/team/routes";

export default function NewClientRoute() {
  redirect(teamStepPath("details"));
}
