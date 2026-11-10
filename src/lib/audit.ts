
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";
import { adminDb } from "../lib/firebase-admin";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Function to read project files
function readProjectFiles(dirPath: string): { path: string; content: string }[] {
  let files: { path: string; content: string }[] = [];
  
  if (!fs.existsSync(dirPath)) return [];

  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Avoid node_modules, dist, .git
      if (item !== "node_modules" && item !== "dist" && item !== ".git") {
        files = files.concat(readProjectFiles(fullPath));
      }
    } else {
      if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx") || fullPath.endsWith(".js")) {
        files.push({
          path: fullPath,
          content: fs.readFileSync(fullPath, "utf8"),
        });
      }
    }
  }

  return files;
}

export async function auditApp() {
  const projectFiles = readProjectFiles(process.cwd());

  const prompt = `
Você é uma IA especialista em auditoria de SaaS.
Analise todo o código abaixo, encontre erros, falhas, vulnerabilidades, problemas de lógica,
melhorias de performance, melhorias de segurança, melhorias de UX, melhorias de arquitetura,
e gere correções completas.

Arquivos do projeto:
${projectFiles.map(f => `\n\nArquivo: ${f.path}\n${f.content}`).join("")}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });
  
  const analysis = response.text || "No analysis generated.";

  // Salvar relatório no Firestore
  await adminDb.collection("system_audit").add({
    createdAt: new Date().toISOString(),
    analysis,
  });

  return {
    status: "OK",
    message: "Auditoria concluída com sucesso!",
    analysis,
  };
}
