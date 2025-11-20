export type JupyterConfig = {
  deployMode: 'compose';
  protocol: string;
  host: string;
  port: number | null;
  token: string;
};
