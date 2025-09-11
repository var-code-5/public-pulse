import { analyzeSeverity } from "./severityAnalyzer";
import { assignDepartment } from "./departmentAssigner";

/**
 * Simpler sequential workflow to analyze an issue and assign
 * severity score and department
 */
export const analyzeIssue = async (title: string, description: string) => {
  try {
    // Step 1: Analyze severity
    console.log(`Analyzing severity for issue: ${title}`);
    const severity = await analyzeSeverity(title, description);

    // Step 2: Assign department
    console.log(
      `Assigning department for issue: ${title} with severity ${severity}`
    );
    const departmentId = await assignDepartment(title, description);

    // Return the analysis results
    return {
      severity,
      departmentId,
    };
  } catch (error) {
    console.error("Error in issue analysis workflow:", error);
    // Return default values if analysis fails
    return {
      severity: 5, // Default medium severity
      departmentId: null,
    };
  }
};
