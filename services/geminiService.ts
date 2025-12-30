import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage, UploadedFile } from "../types";

const API_KEY = process.env.API_KEY || '';

// System instructions for the persona
const SYSTEM_INSTRUCTION = `
ROLE
You are "EquityEye AI," a Senior Venture Capital Attorney (20+ years experience). Your goal is to protect startup founders using the advanced reasoning of Gemini 3 Pro.

OPERATIONAL PROTOCOL
INTERNAL REASONING: You must use "Thinking Mode" to map the hierarchy of the document and identify how different sections interact before answering.
BENCHMARKING: Compare all terms against the 2025 Market Standards (post-AI boom venture climate).
TONE: Elite, protective, tactical, and concise.

PHASE 1 OUTPUT STRUCTURE (Strict Markdown)
1. EXECUTIVE SUMMARY
   - Document Type: [Detected Type]
   - Founder Friendliness Score: [X/100%]
   - Verdict: [1-sentence high-level risk assessment]
2. THE "RED FLAG" AUDIT
   (Create a Markdown Table)
   | Clause | Risk (🔴/🟡) | The "Gotcha" | Founder’s Counter-Proposal |
   | :--- | :--- | :--- | :--- |
   | [Name] | [High/Med] | [Clear explanation] | [Specific legal wording] |
3. NEGOTIATION SCRIPT
   "When you speak to them, say exactly this: '[Professional, firm script]'"
4. MISSING PROTECTIONS
   - [Clause 1]
   - [Clause 2]
5. PLAIN ENGLISH SUMMARY
   [3-sentence 'TL;DR' for the founder]

PHASE 2: INTERACTIVE CHAT COUNSELING LIVE
- Use Section/Page citations from the original document.
- If asked to "Draft", provide professionally redrafted clauses.
- Ensure the tone remains protective and empowering.
`;

export const analyzeDocument = async (file: UploadedFile): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Use gemini-3-pro-preview for complex reasoning tasks
  const model = "gemini-3-pro-preview";

  const contents = {
    parts: [
      {
        text: "Perform the Phase 1 Strategic Audit on this document."
      },
      {
        inlineData: {
          mimeType: file.type,
          data: file.data
        }
      }
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 16384 }, // Maximize reasoning for legal audit
        temperature: 0.2, // Low temperature for precision
      }
    });

    return response.text || "Analysis failed to generate text.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

let chatSession: Chat | null = null;

export const initializeChat = async (file: UploadedFile, initialAnalysis: string) => {
  if (!API_KEY) return;
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Using Gemini 3 Pro for chat as well to maintain high quality legal reasoning
  chatSession = ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + "\n\nCONTEXT: You have just analyzed the following document. Use this context for all future answers.\n\n" + initialAnalysis,
      temperature: 0.4,
    },
    history: [
      {
        role: "user",
        parts: [{ 
            text: "I am uploading the document for your reference in this chat." 
        }, {
            inlineData: {
                mimeType: file.type,
                data: file.data
            }
        }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I have reviewed the document and I am ready to function as your Live Counsel. What questions do you have?" }],
      }
    ]
  });
};

export const sendMessageToChat = async (message: string): Promise<string> => {
  if (!chatSession) throw new Error("Chat session not initialized");

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};
