
import { GoogleGenAI } from "@google/genai";
import { adminDb } from "./firebase-admin";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// URL do app
const APP_URL = "http://localhost:3000";

async function simulateClientFlow() {
  const steps = [
    { action: "Abrir página inicial", url: `${APP_URL}/` },
    { action: "Testar login", url: `${APP_URL}/login` },
    { action: "Testar dashboard", url: `${APP_URL}/dashboard` },
  ];

  let results: any[] = [];

  for (const step of steps) {
    try {
      const response = await fetch(step.url);
      const text = await response.text();

      results.push({
        step: step.action,
        url: step.url,
        status: response.status,
        content: text.slice(0, 2000), // evita payload gigante
      });
    } catch (err: any) {
      results.push({
        step: step.action,
        url: step.url,
        error: err.message,
      });
    }
  }

  return results;
}

export async function runAITest() {
  const rawResults = await simulateClientFlow();

  const prompt = `
Você é uma IA especialista em testes de SaaS.
Analise os resultados abaixo como se fosse um cliente real usando o SISTENFOX.
Encontre erros, falhas, problemas de UX, problemas de fluxo, problemas de API,
problemas de segurança, problemas de performance, e sugira melhorias completas.

Resultados:
${JSON.stringify(rawResults, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  const analysis = response.text || "No analysis generated.";

  await adminDb.collection("system_tests").add({
    createdAt: new Date().toISOString(),
    analysis,
    rawResults,
  });

  return {
    status: "OK",
    message: "Teste automático concluído!",
    analysis,
  };
}
