import { Step, StepType } from './types';

/*
 * Parse input XML and convert it into steps.
 * Eg: Input - 
 * <boltArtifact id=\"project-import\" title=\"Project Files\">
 *  <boltAction type=\"file\" filePath=\"eslint.config.js\">
 *      import js from '@eslint/js';\nimport globals from 'globals';\n
 *  </boltAction>
 * <boltAction type="shell">
 *      node index.js
 * </boltAction>
 * </boltArtifact>
 * 
 * Output - 
 * [{
 *      title: "Project Files",
 *      status: "Pending"
 * }, {
 *      title: "Create eslint.config.js",
 *      type: StepType.CreateFile,
 *      code: "import js from '@eslint/js';\nimport globals from 'globals';\n"
 * }, {
 *      title: "Run command",
 *      code: "node index.js",
 *      type: StepType.RunScript
 * }]
 * 
 * The input can have strings in the middle they need to be ignored
 */
export function parseXml(response: any): Step[] {
  // Extract the text content from the response JSON
  console.log("Full LLM Response:", response);
  const textContent = response?.parts?.[0]?.text || "";
  console.log("Raw textContent from response:", textContent);
  const extractedXml = textContent.match(/```html\n([\s\S]*?)\n```/);

  if (!extractedXml) return [];

  const xmlData = extractedXml[1]; // Extracted <boltArtifact> content
  const steps: Step[] = [];
  let stepId = 1;

  // Extract artifact title correctly
  const titleMatch = xmlData.match(/title="([^"]*)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : "Project Files";

  steps.push({
    id: stepId++,
    title: artifactTitle,
    description: "",
    type: StepType.CreateFolder,
    status: "pending",
  });

  // Extract actions inside <boltArtifact>
  const actionRegex = /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;
  let match;
  while ((match = actionRegex.exec(xmlData)) !== null) {
    const [, type, filePath, content] = match;
    steps.push({
      id: stepId++,
      title: type === "file" ? `Create ${filePath || "file"}` : "Run command",
      description: "",
      type: type === "file" ? StepType.CreateFile : StepType.RunScript,
      status: "pending",
      code: content.trim(),
      path: filePath,
    });
    console.log("🛠 Extracted Action:", { type, filePath, content });
  }
  
  // Log to console if steps were found and parsed successfully
  if (steps.length > 0) {
    console.log(`Steps parsed successfully: ${steps.length} steps found.`);
  } else {
    console.log("No steps found in the provided XML.");
  }
  
  return steps;
}
