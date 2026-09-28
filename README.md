# Sora - Anime Film Club

A static React catalogue for discovering anime films, filtering by genre, viewing film details, and keeping a browser-local watchlist.

## Run locally

```sh
npm install
npm run dev
```

## Catalogue and S3

The sample catalogue is bundled in `src/data/catalog.json`, so the app works without an AWS account or backend. To load a catalogue directly from S3, upload a JSON array with the same fields to a public-read object and set `VITE_S3_CATALOG_URL` to its HTTPS object URL. The bucket must allow browser `GET` requests from the deployed site's origin with CORS. No AWS keys belong in this frontend.

Set the environment variable in Amplify's app build settings. `.env.example` shows the expected format. When the remote catalogue cannot be loaded, the bundled sample data remains available.

The film detail dialog includes a download button. For it to work, each `poster` (or optional `downloadUrl`) must point to an image object that is readable without AWS credentials. Configure the S3 bucket CORS policy with your Amplify domain:

```json
[
	{
		"AllowedOrigins": ["https://main.xxxxxxxxxxxxx.amplifyapp.com"],
		"AllowedMethods": ["GET", "HEAD"],
		"AllowedHeaders": ["*"],
		"ExposeHeaders": ["Content-Length", "Content-Type"],
		"MaxAgeSeconds": 3600
	}
]
```

In Amplify, open **Hosting > Build settings > Environment variables**, add `VITE_S3_CATALOG_URL` with the catalogue object's HTTPS URL, and trigger a new deployment. Vite embeds `VITE_` variables during the build. Never put AWS access keys in this frontend.

## Uploading images to S3

The upload form uses `VITE_S3_UPLOAD_URL`. This must be a small authenticated or rate-limited service that accepts a `POST` body such as `{ "fileName": "poster.jpg", "contentType": "image/jpeg", "title": "Film title" }` and returns `{ "uploadUrl": "https://...presigned-s3-url..." }`. The browser then uploads the image with `PUT` to that presigned URL. Configure CORS on both the upload service and S3 for the Amplify domain. Do not add AWS access keys to the React app or make the S3 bucket publicly writable.

## Deploy with AWS Amplify Hosting

Connect this repository in Amplify. The included `amplify.yml` runs `npm ci` and `npm run build`, then publishes `dist/`. No server-side rendering or backend resources are required.

Film artwork is loaded from TMDB's image CDN; replace these sample URLs with artwork you have rights to use for a production catalogue.
