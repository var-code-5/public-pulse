import { llm } from "./config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import prisma from "../prisma";

/**
 * Analyzes issue content and determines the most appropriate department
 * Returns the department ID if found, or null if no suitable department exists
 */
export const assignDepartment = async (
  title: string,
  description: string
): Promise<string | null> => {
  // Fetch all available departments from the database
  const departments = await prisma.department.findMany();

  if (departments.length === 0) {
    console.log("No departments found in the database");
    return null;
  }

  // Create a department list for the prompt
  const departmentList = departments.map((dept) => dept.name).join(", ");

  // Create a prompt template for department assignment
  const departmentPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert at analyzing community issues and assigning them to the most appropriate government department.
    
Available departments: ${departmentList}

Your task is to analyze the issue title and description, then determine which department would be most responsible for handling this issue.
Return ONLY the exact name of the most appropriate department from the list above.`,
    ],
    [
      "human",
      "Title: {title}\nDescription: {description}\n\nMost appropriate department:",
    ],
  ]);

  // Create a chain for department assignment
  const departmentChain = RunnableSequence.from([
    departmentPrompt,
    llm,
    // Extract department name and find matching ID
    async (response) => {
      const content = response.content.toString().trim();

      // Find the department that best matches the suggested name
      const matchingDepartment = departments.find(
        (dept) =>
          content.toLowerCase().includes(dept.name.toLowerCase()) ||
          dept.name.toLowerCase().includes(content.toLowerCase())
      );

      return matchingDepartment?.id || null;
    },
  ]);

  // Run the department assignment chain
  const departmentId = await departmentChain.invoke({
    title,
    description,
  });

  return departmentId;
};
