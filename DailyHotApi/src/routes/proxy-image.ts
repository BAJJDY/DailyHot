import { Hono } from "hono";
import axios from "axios";

const app = new Hono();

app.get("/", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.text("Missing url", 400);
  
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.bilibili.com",
      },
      proxy: false,
    });
    
    const contentType = String(response.headers["content-type"] || "image/jpeg");
    return c.body(response.data, 200, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    });
  } catch (e) {
    return c.text("Failed to fetch image", 500);
  }
});

export default app;
