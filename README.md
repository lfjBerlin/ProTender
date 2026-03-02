# ProTender Click-Dummy

Interactive click-dummy for the ProTender tender management UI (Vite + React).

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output is written to `dist/`.

Preview production build locally:

```bash
npm run preview
```

## Deploy on Vercel

- Connect this repo to Vercel; the build command is `npm run build` and the output directory is `dist`.
- SPA routing is handled via `vercel.json` so routes like `/radar`, `/dashboard`, `/application/:id` work on refresh.
