import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// YouTube検索 API (Google APIキー不要の簡易版)
app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ items: [] });

  try {
    const response = await axios.get(`https://www.youtube.com/results`, {
      params: { search_query: query },
    });

    const html = response.data;
    const videoIds = [...html.matchAll(/"videoId":"(.*?)"/g)].map(m => m[1]);
    const uniqueIds = [...new Set(videoIds)].slice(0, 12);

    res.json({ items: uniqueIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "検索に失敗しました" });
  }
});

// ストリーム再生URL
app.get("/api/video/:id", (req, res) => {
  const videoId = req.params.id;
  const nocookie = req.query.nocookie === "1";
  const embedUrl = nocookie
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1`
    : `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1`;
  res.json({ embedUrl });
});

// SPA対応
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`仙人Tube サーバー起動: http://localhost:${PORT}`);
});
