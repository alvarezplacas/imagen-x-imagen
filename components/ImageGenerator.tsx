
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-xl">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-white mt-4">Generating your masterpiece...</p>
    </div>
);

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) {
            setError("Please enter a prompt to generate an image.");
            return;
        }
        try {
            setError(null);
            setIsLoading(true);
            setGeneratedImage(null);
            const result = await generateImage(prompt);
            setGeneratedImage(result);
        } catch (err) {
            setError('Failed to generate image. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A futuristic city skyline at sunset, cyberpunk style"
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    disabled={isLoading}
                />
                <button 
                    type="submit"
                    disabled={isLoading || !prompt}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </form>

            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}

            <div className="relative flex-grow w-full aspect-square bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                {generatedImage ? (
                    <img src={generatedImage} alt="Generated" className="object-contain h-full w-full" />
                ) : (
                    <div className="text-center text-gray-400 p-4">
                        <p>Your generated image will appear here.</p>
                        <p className="text-xs mt-2">Let your imagination run wild!</p>
                    </div>
                )}
                {isLoading && <LoadingSpinner />}
            </div>
        </div>
    );
};

export default ImageGenerator;
