const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const { InferenceClient } = require("@huggingface/inference");

const DEFAULT_MODEL =
  process.env.HF_CLIP_MODEL || "sentence-transformers/clip-ViT-B-32-multilingual-v1";

// Image score uses a blended similarity to prevent “different images = 100%”.
const PIXEL_GRID = Number(process.env.HF_PIXEL_GRID || 96); // 64–128 recommended
const WEIGHT_CLIP = Number(process.env.HF_MATCH_CLIP_WEIGHT || 0.45);
const WEIGHT_PIXEL = Number(process.env.HF_MATCH_PIXEL_WEIGHT || 0.55);

// Cache embeddings by image content hash to avoid repeated HF calls.
const embeddingCache = new Map();

function normalizeStoredImage(stored) {
  const s = String(stored ?? "").trim();
  if (!s || s === "null" || s === "undefined") return null;
  return s;
}

function getUploadsPath(filename) {
  const safeName = path.basename(String(filename || ""));
  return path.join(__dirname, "..", "uploads", safeName);
}

function mimeFromFilename(filename) {
  const ext = path.extname(String(filename || "")).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".bmp") return "image/bmp";
  return "image/jpeg";
}

async function loadImageBuffer(storedPath) {
  const raw = normalizeStoredImage(storedPath);
  if (!raw) throw new Error("Missing image");
  const basenameOnly = path.basename(raw.replace(/^\/+/, ""));
  return fs.readFile(getUploadsPath(basenameOnly));
}

function normalizeEmbedding(payload) {
  if (Array.isArray(payload) && typeof payload[0] === "number") return payload;
  if (Array.isArray(payload) && Array.isArray(payload[0])) return payload[0];
  throw new Error("Unexpected embedding response");
}

function l2Normalize(vec) {
  let s = 0;
  for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i];
  s = Math.sqrt(s);
  if (s === 0) return Float64Array.from(vec);
  const out = new Float64Array(vec.length);
  for (let i = 0; i < vec.length; i++) out[i] = vec[i] / s;
  return out;
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
    throw new Error("Invalid vectors for cosine similarity");
  }
  const na = l2Normalize(a);
  const nb = l2Normalize(b);
  let dot = 0;
  for (let i = 0; i < na.length; i++) dot += na[i] * nb[i];
  // Clamp for floating point stability
  return Math.max(-1, Math.min(1, dot));
}

async function getEmbeddingFromBuffer(buffer, filenameHint, model = DEFAULT_MODEL) {
  const token = process.env.HF_API_TOKEN;
  if (!token) throw new Error("HF_API_TOKEN missing");
  const client = new InferenceClient(token);
  const mime = mimeFromFilename(filenameHint);
  const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
  const payload = await client.featureExtraction({
    provider: "hf-inference",
    model,
    inputs: dataUrl,
  });
  return normalizeEmbedding(payload);
}

function sha256Hex(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function getEmbeddingCached(buffer, filenameHint, model = DEFAULT_MODEL) {
  const hash = sha256Hex(buffer);
  const key = `${model}|${hash}`;
  if (embeddingCache.has(key)) return embeddingCache.get(key);
  const emb = await getEmbeddingFromBuffer(buffer, filenameHint, model);
  embeddingCache.set(key, emb);
  return emb;
}

// Pixel-layout similarity: downscale+grayscale and cosine compare pixels (0..1).
async function pixelLayoutSimilarity(bufA, bufB) {
  const resizeOpts = {
    width: PIXEL_GRID,
    height: PIXEL_GRID,
    fit: "cover",
    position: "centre",
  };
  const [rawA, rawB] = await Promise.all([
    sharp(bufA).rotate().resize(resizeOpts).grayscale().raw().toBuffer(),
    sharp(bufB).rotate().resize(resizeOpts).grayscale().raw().toBuffer(),
  ]);

  if (rawA.length !== rawB.length || rawA.length === 0) return 0;

  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < rawA.length; i++) {
    const x = rawA[i] / 255;
    const y = rawB[i] / 255;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 0;
  return Math.max(0, Math.min(1, dot / denom));
}

async function compareLostFoundImages(lostImage, foundImage) {
  const lostBuf = await loadImageBuffer(lostImage);
  const foundBuf = await loadImageBuffer(foundImage);

  // Exact file content = perfect similarity.
  if (Buffer.compare(lostBuf, foundBuf) === 0) {
    return { imageSimilarity: 1 };
  }

  // CLIP similarity can be overconfident. Blend with pixel-layout similarity.
  const [lostEmb, foundEmb, pixSim] = await Promise.all([
    getEmbeddingCached(lostBuf, lostImage),
    getEmbeddingCached(foundBuf, foundImage),
    pixelLayoutSimilarity(lostBuf, foundBuf).catch(() => null),
  ]);

  const clipSim = cosineSimilarity(lostEmb, foundEmb);
  const clip01 = Math.max(0, Math.min(1, clipSim));

  if (typeof pixSim !== "number") {
    // Fallback: if sharp fails, use CLIP only (still clamped).
    return { imageSimilarity: clip01 };
  }

  const pixel01 = Math.max(0, Math.min(1, pixSim));
  const sumW = WEIGHT_CLIP + WEIGHT_PIXEL;
  const combined = (WEIGHT_CLIP * clip01 + WEIGHT_PIXEL * pixel01) / (sumW || 1);
  return { imageSimilarity: Math.max(0, Math.min(1, combined)) };
}

module.exports = {
  compareLostFoundImages,
  normalizeStoredImage,
};

