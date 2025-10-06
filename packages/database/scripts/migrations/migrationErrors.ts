export const PGVECTOR_HINT = `⚠️ Database migration failed: \`pgvector\` extension not found.  
Please install the \`pgvector\` extension on your Postgres instance.

1) If you are using the Docker Postgres image:  
   You can use the \`pgvector/pgvector:pg16\` image instead of \`postgres\`, for example:

\`\`\`bash
docker run -p 5432:5432 -d --name pg \
  -e POSTGRES_PASSWORD=mysecretpassword \
  pgvector/pgvector:pg16
\`\`\`

2) If you are using a cloud Postgres instance:  
   Check your provider’s documentation to enable the extension.  
   (e.g., Supabase supports it by default, AWS RDS does not, Neon requires enabling manually.)

If you still have an issue, please open one here:  
https://github.com/sand-worm-labs/sandworm-web
`;

export const DB_FAIL_INIT_HINT = `------------------------------------------------------------------------------------------
⚠️ Database migration failed: database instance not found.

1) You might not be running in server DB mode.  
   Set the following environment variable and try again:

\`\`\`bash
NEXT_PUBLIC_SERVICE_MODE=server
\`\`\`

2) If you are using the Docker Postgres image, you may need to set the driver:

\`\`\`bash
DATABASE_DRIVER=node
\`\`\`

If you still have an issue, please open one here:  
https://github.com/sand-worm-labs/sandworm-web
`;
