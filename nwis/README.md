# NWIS demo app

The Next.js frontend for the NWIS demo. See the [main README](../README.md) for the project overview.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

- All data is synthetic and lives in `src/data/`. There is no backend.
- Screenshots for review: `node scripts/shot.mjs <path> <name> [--dark]` (needs the dev server running on :3100).
- Design decisions and the build history are in [ITERATION_LOG.md](ITERATION_LOG.md).
