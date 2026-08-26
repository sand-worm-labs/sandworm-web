export type TrinoConfig = {
  host: string;
  port: number;
  catalog: string;
  user: string;
  password: string | null;
};
