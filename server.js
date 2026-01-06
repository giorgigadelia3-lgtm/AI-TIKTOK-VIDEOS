const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;

const { validateInput } = require("./src/utils/validateInput");
const { downloadToFile } = require("./src/utils/downloadToFile");
const { safeTmpPath } = require("./src/utils/safeTmpPath");
const { generateVideo } = require("./src/ffmpeg/generateVideo");
const HttpError = require("./src/utils/httpError");

const app = express();

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader("x-request-id", req.id);
  console.log(`[${req.id}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/create-video", async (req, res, next) => {
  const tempFiles = [];

  try {
    const { imageUrl, audioUrl, duration, resolution, fps } = validateInput(req.body);

    const imagePath = safeTmpPath("image", ".img");
    const audioPath = safeTmpPath("audio", ".audio");
    const outputPath = safeTmpPath("video", ".mp4");

    tempFiles.push(imagePath, audioPath, outputPath);

    await downloadToFile({
      url: imageUrl,
      destPath: imagePath,
      timeoutMs: 30000,
      maxBytes: 25 * 1024 * 1024,
      requestId: req.id
    });

    await downloadToFile({
      url: audioUrl,
      destPath: audioPath,
      timeoutMs: 30000,
      maxBytes: 50 * 1024 * 1024,
      requestId: req.id
    });

    await generateVideo({
      imagePath,
      audioPath,
      outputPath,
      duration,
      resolution,
      fps,
      requestId: req.id
    });

    const videoUrl = await uploadToCloudinary(outputPath);

    res.json({
      ok: true,
      video_url: videoUrl,
      meta: {
        duration,
        resolution,
        fps
      }
    });
  } catch (err) {
    next(err);
  } finally {
    await Promise.all(
      tempFiles.map(async (filePath) => {
        if (!filePath) {
          return;
        }
        try {
          await fs.unlink(filePath);
        } catch (cleanupError) {
          return;
        }
      })
    );
  }
});

function uploadToCloudinary(filePath) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new HttpError(
      500,
      "INTERNAL_ERROR",
      "Cloudinary environment variables are not configured"
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });

  return cloudinary.uploader
    .upload(filePath, {
      resource_type: "video",
      folder: "ai-tiktok-videos"
    })
    .then((result) => {
      if (!result || !result.secure_url) {
        throw new HttpError(
          502,
          "UPLOAD_FAILED",
          "Cloudinary upload did not return a secure_url"
        );
      }
      return result.secure_url;
    })
    .catch((err) => {
      if (err instanceof HttpError) {
        throw err;
      }
      throw new HttpError(502, "UPLOAD_FAILED", "Cloudinary upload failed", {
        reason: err.message
      });
    });
}

app.use((err, req, res, next) => {
  const isJsonError = err instanceof SyntaxError && err.status === 400 && "body" in err;
  const normalizedError = isJsonError
    ? new HttpError(400, "BAD_REQUEST", "Invalid JSON payload")
    : err;

  const status = normalizedError.status || 500;
  const code = normalizedError.code || "INTERNAL_ERROR";
  const message = normalizedError.message || "Internal error";

  const payload = {
    ok: false,
    error: {
      code,
      message
    }
  };

  if (normalizedError.details) {
    payload.error.details = normalizedError.details;
  }

  if (status >= 500) {
    console.error(`[${req.id}]`, normalizedError);
  }

  res.status(status).json(payload);
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on ${port}`);
});
