
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

export const urlToBase64 = async (url: string): Promise<{ base64: string, mimeType: string }> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve({ base64: base64data, mimeType });
        };
        reader.onerror = reject;
    });
};


export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image found in response");
};

export const generateImage = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation failed");
};

export const generateVideo = async (prompt: string, imageBase64: string, mimeType: string, onProgress: (message: string) => void): Promise<string> => {
    // A new instance must be created before each call to use the latest key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    onProgress("Starting video generation... This can take a few minutes.");
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: {
            imageBytes: imageBase64,
            mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    onProgress("Your request is being processed. Hang tight!");
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
            onProgress("Still working on it... Great things take time!");
        } catch (error) {
            console.error("Polling error:", error);
            // Handle cases where the operation might not be found immediately
            onProgress("Checking status... Please wait.");
        }
    }
    
    onProgress("Finalizing video... Almost there!");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error("Failed to download the generated video.");
    }
    
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
