export type RedisConfig = {
  mode: 'standalone' | 'cluster'; 
  host: string;
  port: number | null;
  username: string | null;
  password: string | null;
  db: number | null;
  url: string | null;              
};
