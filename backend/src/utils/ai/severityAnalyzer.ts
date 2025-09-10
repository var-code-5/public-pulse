import { llm } from "./config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

/**
 * Analyzes issue content and assigns a severity score from 1-10
 * where 1 is least severe and 10 is most severe
 */
export const analyzeSeverity = async (
  title: string,
  description: string
): Promise<number> => {
  // Create a prompt template for severity analysis
  const severityPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert at analyzing community issues and assigning appropriate severity scores.
     
Scale:
1-2: Minor inconvenience, low impact, affects very few people
3-4: Moderate issue, localized impact, affects a small group
5-6: Significant issue, notable impact, affects a neighborhood
7-8: Serious issue, substantial impact, affects many people or poses health/safety risks
9-10: Critical emergency, severe impact, immediate danger to public, infrastructure failure

Analyze the issue title and description, then return ONLY a single number between 1 and 10 representing the severity.`,
    ],
    [
      "human",
      "Title: {title}\nDescription: {description}\n\nSeverity score (1-10):",
    ],
  ]);

  // Create a chain for severity analysis
  const severityChain = RunnableSequence.from([
    severityPrompt,
    llm,
    // Extract the numeric score from the response
    (response) => {
      const content = response.content.toString();
      const match = content.match(/\d+/);
      if (match) {
        const score = parseInt(match[0], 10);
        return Math.min(Math.max(score, 1), 10); // Ensure score is between 1-10
      }
      return 5; // Default score if parsing fails
    },
  ]);

  // Run the severity analysis chain
  const severityScore = await severityChain.invoke({
    title,
    description,
  });

  return severityScore;
};
