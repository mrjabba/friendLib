<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:pnpm-requirement -->

# Package Manager: Use pnpm

This project uses **pnpm** as the package manager. Always use `pnpm` instead of `npm` for:

- Installing dependencies (`pnpm install`)
- Running scripts (`pnpm dev`, `pnpm build`, `pnpm test`)
- Adding packages (`pnpm add <package>`)

Do NOT use `npm` or `bun` commands.

<!-- END:pnpm-requirement -->
