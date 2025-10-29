
import { GoogleGenAI } from "@google/genai";
import { Note } from '../types';

if (!process.env.API_KEY) {
  // Esta es una verificación de marcador de posición. En un entorno real, la clave debe estar configurada.
  console.warn("La variable de entorno API_KEY no está configurada. Las llamadas a la API de Gemini fallarán.");
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
    console.error("Error al llamar a la API de Gemini:", error);
    return "Hubo un error al generar el resumen. Por favor, revisa la consola para más detalles.";
  }
};
