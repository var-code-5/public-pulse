import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai";

config();

// Initialize LLM with OpenAI
export const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  temperature: 0,
});
