import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Create Gemini API client if key exists
const KOBIS_API_KEY = process.env.KOBIS_API_KEY || "bd4881fed5de2fab14985589b159ddb1";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Daily Box Office
  app.get("/api/boxoffice", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date || !/^\d{8}$/.test(date)) {
        res.status(400).json({ error: "Invalid date format. Expected YYYYMMDD." });
        return;
      }

      const url = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${date}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`KOBIS API responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching daily box office:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route for Movie Detailed Info
  app.get("/api/movieinfo", async (req, res) => {
    try {
      const movieCd = req.query.movieCd as string;
      if (!movieCd) {
        res.status(400).json({ error: "movieCd parameter is required" });
        return;
      }

      const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${movieCd}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`KOBIS API responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching movie info:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route for generating reviews with Gemini
  app.post("/api/review", async (req, res) => {
    try {
      const { movieNm, directors, genres, openDt, shortReview } = req.body;

      if (!movieNm || !shortReview) {
        res.status(400).json({ error: "movieNm and shortReview are required fields" });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(400).json({ 
          error: "Gemini API key가 설정되지 않았습니다. AI Studio의 Settings > Secrets 패널을 통해 GEMINI_API_KEY를 등록해주세요." 
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemPrompt = `당신은 깊이 있고 품격 넘치는 영화 평론가입니다. 대중성과 예술성을 모두 냉철하면서도 따뜻한 시선으로 분석하여, 영화인들의 마음을 움직이는 평평한 리뷰를 작성합니다.`;
      
      const prompt = `영화를 깊이 분석하여, 사용자가 올린 한 줄 평을 토대로 아주 화려하고 밀도 높은 전문 영화 평론가 스타일의 상세 감상평(300자~600자 정도)을 작성해주세요. 한글 존댓말로 문단은 2~3개로 적절히 나누어 주세요.

[영화 정보]
- 영화 제목: ${movieNm}
- 감독: ${directors || "알 수 없음"}
- 장르: ${genres || "알 수 없음"}
- 개봉일: ${openDt || "알 수 없음"}

[사용자의 간단 한 줄 평 / 느낌]
"${shortReview}"

[요청 사항]
1. 사용자가 준 짧은 감상 및 핵심 정서를 그대로 계승하고, 영화의 주제의식과 연계하여 지적이고 설득력 있게 확장해 주세요.
2. '이동진 평론가 스타일' 또는 '씨네21 포커스'처럼 전문적이며 정갈하고 울림 있는 감성적인 필체로 작성해 주세요.
3. 스포일러는 지양하되, 영화의 잠재적 장점과 예술적 해석을 가미해 주세요.`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.8,
        }
      });

      const detailedReview = geminiResponse.text;
      res.json({ detailedReview });
    } catch (error: any) {
      console.error("Error generating detailed review:", error);
      res.status(500).json({ error: error.message || "Internal server error when generating review" });
    }
  });

  // Serve static assets in development / production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
