import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      apiVersion: 'v1alpha',
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check API status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Single-speaker & dialogue TTS endpoint
app.post('/api/tts/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      voice = 'Kore',
      style = 'Clear, natural, warm human voice with realistic breathing and emotional intonation',
      mode = 'single',
      dialogueParts = [],
      language = 'km',
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'API Key not configured. Please ensure GEMINI_API_KEY is available in Settings > Secrets.',
      });
      return;
    }

    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          apiVersion: 'v1alpha',
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    if (mode === 'dialogue' && Array.isArray(dialogueParts) && dialogueParts.length >= 2) {
      // Flagship model gemini-3.8-flash-tts for dual speaker dialogue
      const speaker1 = dialogueParts[0];
      const speaker2 = dialogueParts[1];

      const speaker1Name = speaker1.speakerName || 'Speaker1';
      const speaker2Name = speaker2.speakerName || 'Speaker2';

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${speaker1Name}: ${speaker1.text}`,
                speechMetadata: {
                  speaker: speaker1Name,
                  style: speaker1.style || 'Warm and natural human voice',
                },
              },
              {
                text: `${speaker2Name}: ${speaker2.text}`,
                speechMetadata: {
                  speaker: speaker2Name,
                  style: speaker2.style || 'Articulate and natural human voice',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker1.voice || 'Kore' },
                  },
                },
                {
                  speaker: speaker2Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker2.voice || 'Puck' },
                  },
                },
              ],
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error('No audio returned by speech generation model.');
      }

      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        modelUsed: 'gemini-3.8-flash-tts',
      });
      return;
    }

    // Single-speaker TTS using gemini-3.8-flash-lite-tts
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text content is required' });
      return;
    }

    // Enhance prompt style to ensure accurate, natural human pronunciation especially for Khmer
    const enhancedStyle = style
      ? `${style}. Speak naturally like a real human with natural pause, breath, and emotional cadence.`
      : 'Natural, expressive human voice with clear articulation, emotional depth, and realistic intonation.';

    const textWithPrompt = enhancedStyle
      ? `[Tone: ${enhancedStyle}]\n${text.trim()}`
      : text.trim();

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: textWithPrompt,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data generated by the model.');
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      modelUsed: 'gemini-3.8-flash-lite-tts',
    });
  } catch (err: any) {
    console.error('Error generating speech:', err);
    res.status(500).json({
      error: err?.message || 'Failed to generate speech. Please check your text or try again.',
    });
  }
});



// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');

  if (!isProduction && fs.existsSync(path.resolve(__dirname, 'vite.config.ts'))) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TTS Server is running on port ${PORT}`);
  });
}

startServer();
