export type TrinoConfig = {
  host: string;
  port: number;
  catalog: string;
  schema: string | null;
  user: string;
  password: string | null;
};
