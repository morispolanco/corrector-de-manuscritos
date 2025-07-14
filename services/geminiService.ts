
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CORRECTION_PROMPT = `
Eres un editor profesional y corrector de estilo. Tu tarea es realizar una corrección técnica del siguiente texto.
- Corrige únicamente errores gramaticales, de ortografía y de puntuación.
- Para los diálogos, utiliza siempre la raya o guion largo (—) en lugar del guion corto (-).
- NO alteres el estilo, la estructura de las frases ni la elección de palabras a menos que sea gramaticalmente incorrecto.
- Mantén la voz y el tono originales del autor sin cambios.
Devuelve únicamente el texto corregido, sin ningún comentario, explicación o preámbulo.
`;

const CORRECTION_AND_STYLE_PROMPT = `
Eres un editor literario experto y un coach de escritura. Tu tarea es corregir y mejorar el estilo del siguiente texto.
1. **Corrección Técnica:** Corrige todos los errores de gramática, ortografía y puntuación. Para los diálogos, utiliza siempre la raya o guion largo (—) en lugar del guion corto (-).
2. **Mejora de Estilo:** Refina la estructura de las frases para mejorar la fluidez y el impacto. Sustituye palabras repetitivas o débiles por alternativas más potentes y evocadoras. Asegúrate de que el ritmo sea adecuado para el contenido.
3. **Preservación de la Voz:** Realiza estas mejoras manteniendo siempre el tono, la voz y la intención originales del autor. No agregues ideas nuevas ni elimines pasajes importantes.
El objetivo es pulir el texto para que sea más claro, conciso, atractivo y profesional.
Devuelve únicamente el texto final mejorado, sin ningún comentario, explicación o preámbulo.
`;


export const correctText = async (text: string, improveStyle: boolean): Promise<string> => {
    try {
        const prompt = improveStyle ? CORRECTION_AND_STYLE_PROMPT : CORRECTION_PROMPT;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${prompt}\n\n---INICIO DEL TEXTO---\n\n${text}\n\n---FIN DEL TEXTO---`,
            config: {
                temperature: improveStyle ? 0.5 : 0.2, // Higher temp for creative style, lower for direct correction
                topP: 0.95,
            }
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error in Gemini API call:", error);
        throw new Error("Failed to get correction from Gemini API.");
    }
};
