# 🛠️ Sandworm Workspace Roadmap

This document outlines the necessary features for the **Sandworm IDE and Workspace**. The primary goal is to allow users to query data from **Sui, Base, EVM Chains**, and other blockchains, and **visualize results efficiently**.

---

## 🧪 Emoji Legend

| Status                        | Emoji | Description                              |
| ----------------------------- | ----- | ---------------------------------------- |
| Done                          | ✅    | Completed features                       |
| In Progress                   | 🚧    | Currently being worked on                |
| Not Done / Pending            | ⏳    | Yet to be started or waiting             |
| Done but Needs Improvement    | ⚠️    | Implemented but requires fixes or polish |
| Blocked / Waiting on External | 🛑    | Cannot proceed due to dependencies       |
| Planned / Future              | 🔮    | Planned for future implementation        |

---

## 🎯 Core Features

### 1. Query Execution

- Users can write and execute SQL-like queries. ✅
- Display query results in a structured table format. ✅
- Show query execution time and any errors encountered. 🚧
- Execute queries using a custom SQL-like language written in Rust/WASM. ✅
- Connect frontend IDE to the Rust/WASM backend for executing queries. ✅
- Support custom RPC per chain for query execution. 🔮
- Enable query execution as **live RPC** or **indexer** (power mode). 🔮

---

### 2. Query Management

- **Public Queries**: Users can browse and open public queries (read-only). ✅
- **Forking Queries**: Users must fork a public query to modify it. ⚠️
- **Private Queries**: Users can create/manage their own queries. ✅
- **Autosaving Drafts** (local storage). ✅
- **Query Execution Status**: Indicate running/completed/failed states. ✅
- **Templates**: Provide ready-to-use query templates (per chain or use case). 🔮
- **Experimental Mode Toggle**: Allow users to try beta features on query engine. 🔮

---

### 3. Tab Management

- Multiple queries openable in tabs. ✅
- Tab state persists across sessions (local storage). ✅
- Rename, reorder, and close tabs. ✅
- Warn before closing unsaved tabs. 🔮

---

### 4. Version History

- Keep local history of query edits. ✅
- Allow reverting within session. 🔮
- Clear history manually. ⏳
- Optionally save versions manually. ✅

---

### 5. User Experience Enhancements

- Syntax highlighting. ✅
- Autocomplete for tables/columns/functions. ⏳
- Dark and light theme toggle. ⏳
- Workspace settings (themes, default chain, custom RPC). 🔮
- Keyboard shortcuts (run query, switch tab, save). ⏳
- Execution logs for debugging. ⚠️
- Friendly error messages. ✅
- Set default chain in settings. 🔮
- Toggle experimental features. 🔮
- Enable/disable advanced mode (e.g., indexer mode). 🔮

---

### 6. Navigation & Search

- Search bar for saved/public queries. ✅
- Quick access to recent queries. ✅
- Left panel for schema/dataset exploration. ✅
- Bookmark favorite queries. ✅
- Search across all templates and starred queries. 🔮

---

### 7. Data Visualization

- Support bar, line, and pie charts. ✅
- Export results as CSV or JSON. ✅
- Copy results to clipboard. ✅
- Add visualizations directly to dashboard (for power users). 🔮
- Advanced visualisation features (custom config, filters, drill-down). 🔮

---

### 8. Permissions & Collaboration

- Share queries with view/edit roles. ✅
- Commenting and notes on queries. 🔮
- Real-time collab (Google Docs style). 🔮
- Role-based access (Admin, Editor, Viewer). 🔮

---

### 9. AI Assistant (Future Enhancements)

- AI chat for help and query generation. 🔮
- Prompt-based query generation from natural language. 🔮
- Auto-run generated queries and visualize results. 🔮
- Debug broken queries with AI assistance. 🔮

---

## 📁 Folder Structure

- `/queries`: Public query templates.
- `/workspace`: Main editor interface.
- `/queries/{queryId}`: Read-only mode for public queries.
- `/workspace/{queryId}`: Editable saved queries.

---

This document will serve as a reference for development.
