# 🛣️ Sandworm App Roadmap

This document outlines the roadmap for the **main Sandworm web application**, including user flows, landing experiences, auth, social features, and backend integration.  
For IDE-specific functionality, see [`workspace/ROADMAP.md`](./workspace/ROADMAP.md).

## 🖼️ UI Pages & Layout

| Feature                              | Status | Notes                                    |
| ------------------------------------ | ------ | ---------------------------------------- |
| Landing page UI                      | ✅     | Welcome hero, features, CTA, etc.        |
| Home page UI                         | ✅     | Query feed, stats, entrypoint to Explore |
| Contact page UI                      | ✅     | Basic form for questions                 |
| Contact form functionality           | ✅     | Sends to email or webhook                |
| Terms of Service (ToS) / Privacy     | ⚠️     | Needed for legal compliance              |
| Explore page                         | ✅     | Public queries + filtering               |
| Pagination on query results          | ✅     | Both explore and profiles                |
| Footer with links (docs/contact/etc) | ✅     | Branding + site nav                      |

---

## 🔐 Authentication & User Accounts

| Feature                               | Status | Notes                             |
| ------------------------------------- | ------ | --------------------------------- |
| Firebase auth integration             | ✅     | Using Google/GitHub               |
| Login with Google                     | ✅     | Firebase                          |
| Login with GitHub                     | ✅     | Firebase                          |
| User session persistence              | ✅     | Auth token handling               |
| Sign out                              | ✅     | Top nav dropdown                  |
| Header profile menu                   | ✅     | Shows auth user, links to profile |
| Account page UI                       | ✅     | Edit profile, settings, etc.      |
| Edit public profile                   | 🚧     | Name, bio, avatar, etc.           |
| Account settings                      | ✅     | Theme, auth, etc.                 |
| Delete account flow                   | 🛑     | Confirmation + backend cleanup    |
| Link wallet (e.g. Reown)              | ✅     | Needed for future ZK login        |
| Extend Decentralized login via wallet | 🔮     | Wallet login + signature flow     |
| zkLogin / Verifiable Auth             | 🔮     | Optional future add-on            |

---

## 🌐 Core Query UX (non-IDE)

| Feature                               | Status | Notes                         |
| ------------------------------------- | ------ | ----------------------------- |
| Fetch public queries from Firebase    | ✅     | Used across app               |
| Display public queries in card layout | ✅     | Explore + Creators            |
| Fork a query from explore             | ✅     | Opens in workspace            |
| Star a query from explore             | ✅     | Persisted in Creators profile |
| Open query in workspace               | ✅     | Loads full editor             |

---

## 👤 Creator Profiles

| Feature                            | Status | Notes                 |
| ---------------------------------- | ------ | --------------------- |
| Creator profile page               | ✅     | Public view of a user |
| Display starred queries            | ✅     | Publicly visible      |
| Display forked queries             | ✅     | Tracked from original |
| Recent queries by user             | 🔮     | For social discovery  |
| Follow/like creator (social layer) | 🔮     | Possible addition     |
| View own profile from header       | ✅     | Via avatar in nav     |

---

## 📦 Infrastructure / Integration

| Feature                                | Status | Notes                               |
| -------------------------------------- | ------ | ----------------------------------- |
| Firebase backend integration           | ✅     | Queries, user data, auth            |
| Firestore or RTDB setup                | ✅     | Based on project config             |
| Web3 wallet support                    | 🚧     | Wallet connection                   |
| Decentralized storage w/ Walrus or alt | 🔮     | Likely for query + profile metadata |
| Analytics / usage tracking             | ⚠️     | Might be Google or external         |
| Sentry or error logging                | 🚧     | Optional for DX                     |
| SEO meta tags for public pages         | ⚠️     | Better visibility on Explore        |
| Sitemap & robots.txt                   | ⚠️     | Optional for launch                 |
| Open Graph / Twitter Card previews     | ✅     | When sharing links                  |

---

## 📚 Docs, Blog & External

| Feature                         | Status | Notes                                                   |
| ------------------------------- | ------ | ------------------------------------------------------- |
| In-app documentation            | ❌     | Getting started, writing queries (moving to typosaurus) |
| Link to full docs site          | ✅     | External MDX or Notion export                           |
| Blog section                    | ❌     | We're moving to [Typosaurus](https://typosaurus.dev)    |
| Contribute / GitHub link        | ✅     | Open source ftw                                         |
| Feedback / bug report mechanism | ⚠️     | Might be link to form or Discord                        |

---

## 🧠 Future Ideas / Nice-to-Haves

| Feature                            | Status | Notes                       |
| ---------------------------------- | ------ | --------------------------- |
| Real-time collaboration in IDE     | 🔮     | Live editing with peers     |
| Commenting / annotation on queries | 🔮     | Social + team usage         |
| Saved filters or views in Explore  | 🔮     | Power user features         |
| Query reactions / like button      | 🔮     | LFG 🤝                      |
| Profile badges / reputation        | 🔮     | Based on forks, stars, etc. |

| Feature                                    | Status | Notes                                    |
| ------------------------------------------ | ------ | ---------------------------------------- |
| Dashboard page (charts, usage analytics)   | 🔮     | For query insights and visual fun        |
| Leaderboard for top creators               | 🔮     | Based on forks, stars, engagement        |
| Rewards system (badges, points, mintables) | 🔮     | Encourage usage, can be off-chain or NFT |
| Rate limiting (API abuse protection)       | ⚠️     | Protect infra, prevent spam queries      |
| Security review checklist                  | 🚧     | OAuth scopes, XSS, DB rules etc          |
| Design/UX revamp                           | 🔮     | Will revisit once we get a designer      |

---

## Decentralization

| Area                       | Phase 1 (Now)                    | Phase 2 (Planned)                                    |
| -------------------------- | -------------------------------- | ---------------------------------------------------- |
| Authentication             | NextAuth (OAuth: GitHub, Google) | Wallet login + signature, zkLogin                    |
| User metadata storage      | Firestore                        | IPFS / Walrus decentralized user profiles            |
| Query metadata & history   | Firestore                        | Off-chain JSON stored on Arweave / Filecoin/ Walrus? |
| Blogs + content publishing | Typosaurus                       | Hosted on Walrus                                     |
| Reputation / achievements  | Future                           | NFT-based identity & badges (onchain or L2)          |

## 🧪 Emoji Legend

| Status             | Emoji | Description                           |
| ------------------ | ----- | ------------------------------------- |
| Done               | ✅    | Completed features                    |
| In Progress        | 🚧    | Currently being worked on             |
| Not Done / Pending | ⏳    | Yet to be started or waiting          |
| Needs Improvement  | ⚠️    | Implemented but requires polish/fixes |
| Blocked / Waiting  | 🛑    | Depends on other work                 |
| Future Plan        | 🔮    | Planned for later                     |
