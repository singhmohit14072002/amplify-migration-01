# Workspace Notes

- This is a static Vite + React frontend. Run `npm run dev`, `npm run lint`, and `npm run build` from the project root.
- The sample movie schema lives in `src/data/catalog.json`; public S3 catalogues should use the same JSON array shape.
- Keep AWS credentials out of browser code. S3 catalogue access uses a public HTTPS object URL configured with `VITE_S3_CATALOG_URL`.
- AWS Amplify Hosting builds with `amplify.yml` and publishes `dist/`.