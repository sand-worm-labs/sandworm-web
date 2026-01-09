
export interface TransactionOrigin {
    conn: import('ws').WebSocket;
    user: {
      id: string;
      email: string;
      username?: string;
    };
    role: 'admin' | 'editor' | 'viewer';
  }
  