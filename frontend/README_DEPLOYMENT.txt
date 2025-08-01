# ERP Frontend Deployment Notes

- This React app is ready for deployment on Netlify or Vercel.
- Main build command: `npm run build`
- Production static files: `build/` directory
- Environment: Uses `/api` endpoints for backend, expects backend on port 2025 in development.
- Remove any secrets from `.env` before deploying.
- For Netlify: see `netlify.toml` for config.
- For Vercel: use default React build settings.
- To deploy: push to your repo, connect to Netlify/Vercel, or use CLI.
