# SeekersStop frontend

React/Vite frontend for SeekersStop. Set `VITE_API_BASE_URL` to the backend API base URL (including `/` only if that matches the API deployment).

For local development, create `.env.local` with `VITE_API_BASE_URL=http://localhost:8081`.
For production, set `VITE_API_BASE_URL` in the static host's build environment to the HTTPS backend URL, then run `npm ci`, `npm run lint`, and `npm run build`. Deploy the generated `dist/` directory. The API URL is embedded at build time.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
