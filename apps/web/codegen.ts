import type { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const graphqlCodegenConfig: CodegenConfig = {
  schema: "http://localhost:8003/api/graphql",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        apolloClientVersion: 4,
      },
    },
  },
};

export default graphqlCodegenConfig;
