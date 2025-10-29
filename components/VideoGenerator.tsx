
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateVideo, urlToBase64, fileToBase64 } from '../services/geminiService';

interface VideoGeneratorProps {
    initialImageUrl: string;
}

const LoadingSpinner: React.FC<{ progressMessage: string }> = ({ progressMessage }) => (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-xl p-4 text-center">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-white mt-4 font-semibold">{progressMessage}</p>
    </div>
);

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ initialImageUrl }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [sourceImage, setSourceImage] = useState<string>(initialImageUrl);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<{ base64: string, mimeType: string } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const [isKeySelected, setIsKeySelected] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            } catch (err) {
                console.error("Error checking for API key:", err);
                setIsKeySelected(false);
            }
        }
    }, []);

    useEffect(() => {
        checkApiKey();
        const loadInitialImage = async () => {
            try {
                const { base64, mimeType } = await urlToBase64(initialImageUrl);
                setBase64Image({ base64, mimeType });
                setSourceImage(initialImageUrl);
            } catch (err) {
                setError('Failed to load initial image.');
                console.error(err);
            }
        };
        loadInitialImage();
    }, [initialImageUrl, checkApiKey]);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            try {
                await window.aistudio.openSelectKey();
                // Assume success to avoid race condition and allow user to proceed.
                setIsKeySelected(true); 
            } catch (err) {
                console.error("Error opening API key selection:", err);
                setError("Could not open the API key selection dialog.");
            }
        } else {
            setError("API key selection is not available in this environment.");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsLoading(true);
            const base64 = await fileToBase64(file);
            setBase64Image({ base64, mimeType: file.type });
            setSourceImage(URL.createObjectURL(file));
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await checkApiKey();
        if (!isKeySelected) {
            setError("Please select an API key to generate videos.");
            return;
        }
        if (!prompt || !base64Image) {
            setError("Please enter a prompt and select an image.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideo(null);
        try {
            const videoUrl = await generateVideo(prompt, base64Image.base64, base64Image.mimeType, setProgressMessage);
            setGeneratedVideo(videoUrl);
        } catch (err: any) {
            let errorMessage = 'Failed to generate video. Please try again.';
            if (err.message && err.message.includes("Requested entity was not found")) {
                errorMessage = "Your API Key is invalid. Please select a valid key and try again.";
                setIsKeySelected(false);
            }
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }
    };

    if (!isKeySelected) {
        return (
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
                <h2 className="text-2xl font-bold mb-4">API Key Required for Video Generation</h2>
                <p className="text-gray-400 mb-6">
                    The Veo model requires an API key with billing enabled. Please select your key to continue.
                </p>
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
                <button
                    onClick={handleSelectKey}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                    Select API Key
                </button>
                <p className="text-xs text-gray-500 mt-4">
                    For more information, see the{' '}
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">
                        billing documentation
                    </a>.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow mb-4">
                <div className="relative aspect-video bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                    <h2 className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-semibold">Source Image</h2>
                    {sourceImage && <img src={sourceImage} alt="Source" className="object-contain h-full w-full" />}
                </div>
                <div className="relative aspect-video bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                    <h2 className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-semibold">Generated Video</h2>
                    {generatedVideo ? (
                        <video src={generatedVideo} controls autoPlay loop className="object-contain h-full w-full" />
                    ) : (
                         <div className="text-center text-gray-400 p-4">
                            <p>Your generated video will appear here.</p>
                            <p className="text-xs mt-2">Prompts can animate the image, e.g., "make the person wave".</p>
                        </div>
                    )}
                    {isLoading && <LoadingSpinner progressMessage={progressMessage} />}
                </div>
            </div>

            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-gray-800 py-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the motion, e.g., 'a gentle breeze moves her hair'"
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    disabled={isLoading}
                />
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                >
                    Change Image
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !prompt || !base64Image}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate Video'}
                </button>
            </form>
        </div>
    );
};

export default VideoGenerator;
