import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GraphQLModule } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { join } from "path";
import { AuthModule } from "./src/auth/auth.module";
import { WorkspaceModule } from "./src/workspace/workspace.module";
import { UsersModule } from "./src/users/users.module";
import { DatabaseModule } from './src/database/database.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      resolvers: { JSON: GraphQLJSON },
      // formatError: (error: GraphQLFormattedError) => {
      //   const logger = new Logger();
      //   logger.error(error);
      //   const graphQLFormattedError: GraphQLFormattedError = {
      //     message: error?.message,
      //   };
      //   return graphQLFormattedError;
      // },
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    WorkspaceModule,
    AuthModule,
    DatabaseModule,
  ],
  providers: [],
})
export class AppModule { }
