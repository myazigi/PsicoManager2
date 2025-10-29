
import { GoogleGenAI } from "@google/genai";
import { Note } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the key should be set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeNotes = async (patientName: string, notes: Note[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return Promise.resolve("Error: La clave API de Gemini no está configurada. Por favor, configura la variable de entorno API_KEY.");
  }

  const notesText = notes
    .map(note => `Fecha: ${note.date}\nNota: ${note.content}`)
    .join('\n\n---\n\n');

  if (notesText.trim() === '') {
    return "No hay notas para resumir.";
  }

  const prompt = `
    Eres un asistente experto para psicólogos. Tu tarea es analizar las notas de sesión de un paciente y proporcionar un resumen clínico conciso y profesional.
    
    Paciente: ${patientName}

    A continuación se presentan las notas de la sesión. Analízalas y genera un resumen que destaque:
    1.  **Temas Clave y Motivo de Consulta:** ¿Cuáles son los problemas centrales que se están abordando?
    2.  **Progreso y Cambios:** ¿Ha habido alguna mejora, retroceso o cambio significativo a lo largo de las sesiones?
    3.  **Patrones Recurrentes:** ¿Observas algún patrón de pensamiento, comportamiento o emoción que se repita?
    4.  **Áreas de Enfoque Futuro:** ¿Qué temas o técnicas podrían ser importantes para las próximas sesiones?

    Presenta el resumen en un formato claro y estructurado, utilizando viñetas para cada punto. Utiliza un lenguaje clínico y objetivo.

    **Notas de Sesión:**
    ${notesText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Hubo un error al generar el resumen. Por favor, revisa la consola para más detalles.";
  }
};
