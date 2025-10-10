import { ObjectType, Field } from "@nestjs/graphql";
import { InferSelectModel } from "drizzle-orm";
import { users } from "@sandworm/database/schemas";

@ObjectType()
export class User implements InferSelectModel<typeof users> {
  accessedAt: Date;
  id: string;

  @Field({ nullable: true })
  username: string | null;

  @Field({ nullable: true })
  email: string | null;

  @Field({ nullable: true })
  firstName: string | null;

  @Field({ nullable: true })
  lastName: string | null;

  @Field({ nullable: true })
  fullName: string | null;

  @Field({ nullable: true })
  avater: string | null;

  emailVerifiedAt: Date | null;
  emailVerified: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}