export interface Query {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    queriesCount: string;
    dashboardsCount: string;
    bio: string;
  };
  title: string;
  createdAt: string;
  tags: string[];
  stars: number;
  forks: number;
  code: string;
  language: string;
}

export const queries: Query[] = [
  {
    id: "1",
    author: {
      name: "Simon Cyril",
      username: "@simon_cyril",
      avatar: "/user-avatar-yellow.jpg",
      queriesCount: "16.5K",
      dashboardsCount: "200",
      bio: "Deep dive into EVM chain data with a focus on trends, adoption, and the growth of the Base blockchain.",
    },
    title: "$1 and a Dream, where to actually start",
    createdAt: "5/30/25",
    tags: ["sui", "tx", "wagmi", "base"],
    stars: 12,
    forks: 12,
    code: `SELECT 
    block_number,
    transaction_hash,
    from_address,
    to_address,
    value / 1e18 AS eth_value,  -- Convert wei to ETH
    gas_used,
    gas_price / 1e9 AS gas_price_gwei  -- Convert to Gwei
FROM transactions
WHERE block_number >= 18000000
    AND value > 0
ORDER BY block_number DESC
LIMIT 100;`,
    language: "sql",
  },
  {
    id: "2",
    author: {
      name: "Alex Rivera",
      username: "@alex_rivera",
      avatar: "/user-avatar-blue.jpg",
      queriesCount: "8.2K",
      dashboardsCount: "145",
      bio: "SQL wizard specializing in analytics and data visualization. Building dashboards that tell stories.",
    },
    title: "Get top customers by order count with revenue",
    createdAt: "5/29/25",
    tags: ["sql", "analytics", "customers", "revenue"],
    stars: 24,
    forks: 8,
    code: `SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) AS total_orders,
    SUM(o.amount) AS total_revenue  -- Calculate total spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'  -- Only recent customers
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5  -- Minimum 5 orders
ORDER BY total_revenue DESC
LIMIT 100;`,
    language: "sql",
  },
  {
    id: "3",
    author: {
      name: "Maya Chen",
      username: "@maya_chen",
      avatar: "/user-avatar-purple.jpg",
      queriesCount: "12.3K",
      dashboardsCount: "89",
      bio: "Data analyst exploring DeFi protocols and on-chain metrics. Love finding patterns in blockchain data.",
    },
    title: "Daily active users with retention metrics",
    createdAt: "5/28/25",
    tags: ["sql", "metrics", "users", "retention"],
    stars: 18,
    forks: 15,
    code: `WITH daily_users AS (
    SELECT 
        DATE(created_at) AS activity_date,
        user_id,
        COUNT(*) AS actions
    FROM user_events
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at), user_id
),
retention AS (
    SELECT 
        d1.activity_date,
        COUNT(DISTINCT d1.user_id) AS active_users,
        COUNT(DISTINCT d2.user_id) AS retained_users
    FROM daily_users d1
    LEFT JOIN daily_users d2 
        ON d1.user_id = d2.user_id 
        AND d2.activity_date = d1.activity_date + INTERVAL '1 day'
    GROUP BY d1.activity_date
)
SELECT 
    activity_date,
    active_users,
    retained_users,
    ROUND(100.0 * retained_users / active_users, 2) AS retention_rate
FROM retention
ORDER BY activity_date DESC;`,
    language: "sql",
  },
  {
    id: "4",
    author: {
      name: "Jordan Lee",
      username: "@jordan_lee",
      avatar: "/user-avatar-green.jpg",
      queriesCount: "5.7K",
      dashboardsCount: "67",
      bio: "Database architect and performance optimization enthusiast. PostgreSQL expert.",
    },
    title: "Create transactions table with indexes and constraints",
    createdAt: "5/27/25",
    tags: ["sql", "database", "schema", "postgres"],
    stars: 31,
    forks: 12,
    code: `CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),  -- Must be positive
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);`,
    language: "sql",
  },
  {
    id: "5",
    author: {
      name: "Sarah Johnson",
      username: "@sarah_j",
      avatar: "/user-avatar-pink.jpg",
      queriesCount: "19.1K",
      dashboardsCount: "234",
      bio: "NFT market analyst tracking trends across multiple chains. Building tools for collectors.",
    },
    title: "NFT sales volume by collection with floor price",
    createdAt: "5/26/25",
    tags: ["sql", "nft", "analytics", "ethereum"],
    stars: 42,
    forks: 19,
    code: `SELECT 
    c.name AS collection_name,
    c.contract_address,
    COUNT(s.id) AS total_sales,
    SUM(s.price_eth) AS volume_eth,
    AVG(s.price_eth) AS avg_price_eth,
    MIN(s.price_eth) AS floor_price_eth,
    MAX(s.price_eth) AS ceiling_price_eth
FROM nft_collections c
INNER JOIN nft_sales s ON c.contract_address = s.contract_address
WHERE s.sale_date >= CURRENT_DATE - INTERVAL '7 days'
    AND s.price_eth > 0
GROUP BY c.name, c.contract_address
HAVING COUNT(s.id) >= 10  -- At least 10 sales
ORDER BY volume_eth DESC
LIMIT 50;`,
    language: "sql",
  },
  {
    id: "6",
    author: {
      name: "Marcus Brown",
      username: "@marcus_b",
      avatar: "/user-avatar-orange.jpg",
      queriesCount: "3.4K",
      dashboardsCount: "42",
      bio: "Smart contract data explorer. Tracking DeFi protocols and yield farming strategies.",
    },
    title: "Token transfers with USD value calculation",
    createdAt: "5/25/25",
    tags: ["sql", "tokens", "defi", "pricing"],
    stars: 15,
    forks: 6,
    code: `SELECT 
    t.transaction_hash,
    t.from_address,
    t.to_address,
    t.token_address,
    tk.symbol,
    t.amount / POWER(10, tk.decimals) AS token_amount,
    p.price_usd,
    (t.amount / POWER(10, tk.decimals)) * p.price_usd AS usd_value
FROM token_transfers t
INNER JOIN tokens tk ON t.token_address = tk.contract_address
LEFT JOIN token_prices p ON tk.contract_address = p.token_address
WHERE t.block_timestamp >= NOW() - INTERVAL '1 hour'
    AND p.price_usd IS NOT NULL
ORDER BY usd_value DESC
LIMIT 100;`,
    language: "sql",
  },
  {
    id: "7",
    author: {
      name: "Emma Wilson",
      username: "@emma_w",
      avatar: "/user-avatar-teal.jpg",
      queriesCount: "14.8K",
      dashboardsCount: "178",
      bio: "Cross-chain analytics specialist. Comparing metrics across Ethereum, Polygon, and Arbitrum.",
    },
    title: "Gas price trends with moving averages",
    createdAt: "5/24/25",
    tags: ["sql", "gas", "ethereum", "trends"],
    stars: 28,
    forks: 11,
    code: `WITH hourly_gas AS (
    SELECT 
        DATE_TRUNC('hour', block_timestamp) AS hour,
        AVG(gas_price / 1e9) AS avg_gas_gwei,
        MIN(gas_price / 1e9) AS min_gas_gwei,
        MAX(gas_price / 1e9) AS max_gas_gwei,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gas_price / 1e9) AS median_gas_gwei
    FROM transactions
    WHERE block_timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY DATE_TRUNC('hour', block_timestamp)
)
SELECT 
    hour,
    avg_gas_gwei,
    median_gas_gwei,
    AVG(avg_gas_gwei) OVER (
        ORDER BY hour 
        ROWS BETWEEN 23 PRECEDING AND CURRENT ROW
    ) AS moving_avg_24h
FROM hourly_gas
ORDER BY hour DESC;`,
    language: "sql",
  },
  {
    id: "8",
    author: {
      name: "David Kim",
      username: "@david_kim",
      avatar: "/user-avatar-red.jpg",
      queriesCount: "21.6K",
      dashboardsCount: "312",
      bio: "Blockchain data engineer building real-time analytics pipelines. SQL performance optimization guru.",
    },
    title: "Complex JOIN query with aggregations and subqueries",
    createdAt: "5/23/25",
    tags: ["sql", "joins", "analytics", "advanced"],
    stars: 37,
    forks: 14,
    code: `WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', created_at) AS month,
        user_id,
        SUM(amount) AS total_sales
    FROM orders
    WHERE status = 'completed'
    GROUP BY month, user_id
)
SELECT 
    u.name,
    u.email,
    ms.month,
    ms.total_sales,
    AVG(ms.total_sales) OVER (PARTITION BY u.id) AS avg_monthly_sales,  -- Window function
    RANK() OVER (PARTITION BY ms.month ORDER BY ms.total_sales DESC) AS monthly_rank
FROM users u
INNER JOIN monthly_sales ms ON u.id = ms.user_id
WHERE ms.total_sales > 1000  -- High-value customers only
ORDER BY ms.month DESC, ms.total_sales DESC;`,
    language: "sql",
  },
  {
    id: "9",
    author: {
      name: "Lisa Anderson",
      username: "@lisa_a",
      avatar: "/user-avatar-indigo.jpg",
      queriesCount: "9.5K",
      dashboardsCount: "123",
      bio: "DeFi researcher analyzing liquidity pools and trading volumes. Uniswap and Curve specialist.",
    },
    title: "Liquidity pool analysis with TVL calculations",
    createdAt: "5/22/25",
    tags: ["sql", "defi", "liquidity", "tvl"],
    stars: 21,
    forks: 9,
    code: `SELECT 
    lp.pool_address,
    lp.token0_symbol,
    lp.token1_symbol,
    lp.reserve0 / POWER(10, t0.decimals) AS reserve0_amount,
    lp.reserve1 / POWER(10, t1.decimals) AS reserve1_amount,
    (lp.reserve0 / POWER(10, t0.decimals)) * p0.price_usd AS tvl_token0_usd,
    (lp.reserve1 / POWER(10, t1.decimals)) * p1.price_usd AS tvl_token1_usd,
    ((lp.reserve0 / POWER(10, t0.decimals)) * p0.price_usd) + 
    ((lp.reserve1 / POWER(10, t1.decimals)) * p1.price_usd) AS total_tvl_usd
FROM liquidity_pools lp
INNER JOIN tokens t0 ON lp.token0_address = t0.contract_address
INNER JOIN tokens t1 ON lp.token1_address = t1.contract_address
LEFT JOIN token_prices p0 ON t0.contract_address = p0.token_address
LEFT JOIN token_prices p1 ON t1.contract_address = p1.token_address
WHERE lp.active = true
ORDER BY total_tvl_usd DESC
LIMIT 50;`,
    language: "sql",
  },
];
