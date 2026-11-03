const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("J.A.R.V.I.S. voice server is online.");
});

app.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required." });
    }

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FISH_API_KEY}`,
        "Content-Type": "application/json",
        "model": "s2.1"
      },
      body: JSON.stringify({
        text,
        reference_id: process.env.FISH_VOICE_ID,
        format: "mp3"
      })
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Fish Audio could not generate speech."
      });
    }

    const audio = await response.arrayBuffer();

    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audio));
  } catch (error) {
    res.status(500).json({ error: "Speech generation failed." });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`J.A.R.V.I.S. online on port ${port}`);
});
