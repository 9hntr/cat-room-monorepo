const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// ! todo: busca la manera de actualizar el historial
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "I am a person in a virtual chat room." }],
    },
    {
      role: "model",
      parts: [
        {
          text: "You are a friend, keep your interactions short. Your name is Isabella",
        },
      ],
    },
  ],
});

export const getResponse = async (prompt: string): Promise<string> => {
  const result = await chat.sendMessageStream(prompt);
  const response = await result.response;

  return response.text();
};
