# AI TikTok FFmpeg Service

This is a Render-deployed Docker web service that generates vertical TikTok-style videos using FFmpeg.
It accepts an image URL and audio URL, produces an MP4, uploads it to Cloudinary, and returns a public video URL.

## API Endpoints

- GET /health
  - Response: { "ok": true }
- POST /create-video
  - Request JSON:
    {
      "image_url": "https://.../image.png",
      "audio_url": "https://.../audio.mp3",
      "duration": 8,
      "resolution": "1080x1920",
      "fps": 30
    }
  - Response JSON:
    {
      "ok": true,
      "video_url": "https://res.cloudinary.com/<cloud>/video/upload/.../final.mp4",
      "meta": {
        "duration": 8,
        "resolution": "1080x1920",
        "fps": 30
      }
    }

## Environment Variables

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Local Run

1. Install dependencies:
   npm install
2. Start the server:
   npm run start
3. Test health:
   curl http://localhost:3000/health

## Example curl

Health check:

```
curl https://<your-service>.onrender.com/health
```

Create video:

```
curl -X POST https://<your-service>.onrender.com/create-video \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/image.png",
    "audio_url": "https://example.com/audio.mp3",
    "duration": 8,
    "resolution": "1080x1920",
    "fps": 30
  }'
```

## Render Deployment (Docker)

1. Create a new Render Web Service from this GitHub repo.
2. Runtime: Docker.
3. Root Directory: repository root.
4. Add environment variables on Render:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
5. Deploy. Your base URL will be:
   https://<your-service>.onrender.com

## n8n Usage

Use the HTTP Request node:
- Method: POST
- URL: https://<your-service>.onrender.com/create-video
- Body: JSON (image_url, audio_url, duration, resolution, fps)

## Checklist

- Local test: npm install && npm run start, then call /health and /create-video
- Docker test: docker build -t ai-tiktok-ffmpeg-service . && docker run -p 3000:3000 -e CLOUDINARY_CLOUD_NAME=... -e CLOUDINARY_API_KEY=... -e CLOUDINARY_API_SECRET=... ai-tiktok-ffmpeg-service
- Render test: deploy and call https://<your-service>.onrender.com/health
