import {
  Content,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { chatbotName } from "../config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0,
  topK: 1,
  topP: 1,
  maxOutputTokens: 15,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  safetySettings,
  generationConfig,
});

let chat = null;

const startChat = () => {
  const chatHistory = [
    {
      role: "user",
      parts: [{ text: "I am a person in a virtual chat room." }],
    },
    {
      role: "model",
      parts: [
        {
          text: `You are a friend and good at math, keep your interactions shorter than 60 characters. Your name is ${chatbotName}`,
        },
      ],
    },
  ];

  chat = model.startChat({
    history: chatHistory as Content[],
  });
};

startChat();

export const getResponse = async (prompt: string): Promise<string> => {
  try {
    const result = await chat.sendMessageStream(prompt);
    const response = await result.response;

    return response?.text();
  } catch (err) {
    console.error(err);

    startChat();

    return "Uhm?";
  }
};
