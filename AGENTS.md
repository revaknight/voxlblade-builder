# AGENTS.md

This is the Agent Context file for the voxlblade-builder project. It contains information about the project, its structure, and how to interact with it as an AI agent.

## Project Overview
- **Project Name:** voxlblade-builder
- **Description:** A web-based damage calculator and build optimizer for the Roblox game "Voxel Blade". It simulates weapon stats, enchantments, perks, and other game mechanics to calculate damage output and compare different builds.
- **Tech Stack:**
    - **Frontend Framework:** Svelte 5 (using runes for reactivity)
    - **Build Tool:** Vite
    - **Language:** TypeScript
    - **Styling:** Tailwind CSS (v4)
    - **Testing:** Vitest (for unit tests)
    - **Linting/Formatting:** ESLint, Prettier
    - **Package Manager:** pnpm

## Project Structure
```
voxlblade-builder/
├── .agents/              # Configuration for AI agents (AGENTS.md is here)
├── src/                  # Source code
│   ├── lib/              # Reusable library code
│   │   ├── engine/       # Core damage calculation engine
│   │   ├── data/         # Game data definitions (weapons, perks, enchantments)
│   │   └── ui/           # Svelte UI components
│   └── routes/           # SvelteKit routes (pages)
├── tests/                # Unit tests
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Project dependencies and scripts
```

## Development Workflow
1.  **Install Dependencies:** `pnpm install`
2.  **Start Development Server:** `pnpm dev`
3.  **Run Tests:** `pnpm test`
4.  **Build for Production:** `pnpm build`
5.  **Lint Code:** `pnpm lint`
6.  **Format Code:** `pnpm format`

## AI Agent Interaction Guidelines
- **Goal:** Understand the codebase, identify issues, and perform tasks as requested by the user.
- **Tools:** Use the provided tools to read files, search the codebase, and execute commands.
- **Communication:** Be concise and clear in your responses. Provide evidence for your findings (e.g., file paths, line numbers).
- **Context:** Use the context provided in this file and the `.agents/` directory to understand the project structure and conventions.

## File Operations
- **Read:** Use `read_file` to examine source code, configuration files, and documentation.
- **Edit:** Use `replace_in_file` to modify existing code. Ensure you understand the context before making changes.
- **Search:** Use `search_files` to find specific patterns or functions within the codebase.

## Testing
- Tests are located in the `tests/` directory.
- Run tests using `pnpm test`.
- Ensure your changes do not break existing tests and add new tests for significant functionality.

## Security
- Do not expose sensitive information (e.g., API keys, private configurations).
- Be cautious when executing commands that could modify the system state.
