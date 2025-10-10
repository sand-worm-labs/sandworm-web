import { InputType, Field } from "@nestjs/graphql";
import { InferInsertModel } from "drizzle-orm";
import { users } from "@sandworm/database/schemas";

@InputType()
export class CreateUserInput implements InferInsertModel<typeof users> {
  @Field({ description: "Username of the user", nullable: true })
  username?: string;

  @Field({ description: "Email of the user", nullable: true })
  email?: string;

  @Field({ description: "First name of the user", nullable: true })
  firstName?: string;

  @Field({ description: "Last name of the user", nullable: true })
  lastName?: string;

  @Field({ description: "Full name of the user", nullable: true })
  fullName?: string;

  @Field({ description: "User avatar URL", nullable: true })
  avater?: string;
}