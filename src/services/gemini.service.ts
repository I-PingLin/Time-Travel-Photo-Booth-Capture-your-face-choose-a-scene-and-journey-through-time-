import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async describeFace(base64Image: string): Promise<string> {
    try {
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      };
      const textPart = {
        text: "Describe this person's face in extreme detail for an AI image generator. Include details about hair color and style, eye color, face shape, skin tone, expression, and any notable features like glasses or facial hair. Be concise and descriptive, focusing only on the facial features."
      };

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });

      return response.text;
    } catch (error) {
      console.error('Error describing face:', error);
      throw new Error('Could not analyze the photo. Please try again.');
    }
  }

  async generateHistoricalImage(
    description: string,
    scenePrompt: string
  ): Promise<string> {
    try {
      const fullPrompt = scenePrompt.replace('{description}', description);
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
      } else {
        throw new Error('No image was generated.');
      }
    } catch (error) {
      console.error('Error generating historical image:', error);
      throw new Error('Failed to create the time-travel image. The temporal matrix might be unstable.');
    }
  }
}
