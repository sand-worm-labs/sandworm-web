# Roadmap

This document outlines the necessary features for Sandworm IDE and workspace. The primary goal of this IDE is to allow users to query data from Sui, Base, EVM Chains and other blockchains and visualize results efficiently.

## Core Features

### 1. Query Execution

- Users can write and execute SQL-like queries.
- Display query results in a structured table format.
- Show query execution time and any errors encountered.
- Execute queries using a custom SQL-like language written in Rust/WASM.
- Connect the frontend IDE to the Rust/WASM backend for executing queries and fetching results.

### 2. Query Management

- **Public Queries**: Users can browse and open public queries in a read-only mode.
- **Forking Queries**: Users must fork a public query to modify it.
- **Private Queries**: Users can create and manage their own queries.
- **Autosaving Drafts**: Queries should be saved temporarily in local storage to prevent loss.
- **Query Execution Status**: Indicate whether a query is running, completed, or failed.

### 3. Tab Management

- Multiple queries can be opened in different tabs.
- Tabs should persist across sessions using local storage.
- Ability to close, rename, and reorder tabs.
- Warn users before closing tabs with unsaved changes.

### 4. Version History

- Maintain a history of edits without saving every version to the database.
- Users can revert to previous versions within a session.
- Local history resets when users click "Clear History."
- Option to manually save versions for future reference.

### 5. User Experience Enhancements

- Syntax highlighting for the editor.
- Autocomplete for table names, columns, and functions.
- Dark and light mode support.
- Keyboard shortcuts for running queries, switching tabs, and saving.
- Display execution logs for debugging queries.
- User-friendly error messages when queries fail.

### 6. Navigation & Search

- Search bar to find saved or public queries.
- Quick access to recent queries.
- Left panel for database schema and dataset exploration.
- Bookmark favorite queries for quick access.

### 7. Data Visualization

- Support for basic charting (bar, line, pie) for numerical query results.
- Export query results as CSV or JSON.
- Option to copy results to clipboard.

### 8. Permissions & Collaboration

- Query sharing with view or edit permissions.
- Comments and notes on queries.
- Real-time collaboration (optional, future enhancement).
- Role-based access for managing queries (Admin, Editor, Viewer).

## Backend & Integration

- **Execution Engine**: The SQL-like language written in Rust/WASM will be responsible for query execution.
- **API Integration**: The frontend must send queries to the Rust/WASM backend and handle responses.
- **Error Handling**: Display meaningful messages if execution fails.
- **Performance Optimization**: Ensure queries execute efficiently and return results quickly.

## Folder Structure

- `/queries`: Publicly available queries.
- `/workspace`: The main editor where users can write and run queries.
- `/queries/{queryId}`: Read-only mode for public queries.
- `/workspace/{queryId}`: Editable workspace for saved queries.

## Next Steps

1. Implement tab persistence.
2. Add local storage for unsaved queries.
3. Connect the frontend to the Rust/WASM query execution engine.
4. Build query execution logic and display results.
5. Develop UI for managing queries.
6. Optimize performance and error handling.

---

This document will serve as a reference for development.
