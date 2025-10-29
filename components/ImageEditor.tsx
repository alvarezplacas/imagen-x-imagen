
import React, { useState, useEffect, useCallback } from 'react';
import { editImage, urlToBase64, fileToBase64 } from '../services/geminiService';

interface ImageEditorProps {
    initialImageUrl: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const ImageEditor: React.FC<ImageEditorProps> = ({ initialImageUrl }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [originalImage, setOriginalImage] = useState<string>(initialImageUrl);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<{ base64: string, mimeType: string } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadInitialImage = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const { base64, mimeType } = await urlToBase64(initialImageUrl);
                setBase64Image({ base64, mimeType });
                setOriginalImage(initialImageUrl);
            } catch (err) {
                setError('Failed to load initial image. Please try uploading one.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialImage();
    }, [initialImageUrl]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setError(null);
                setIsLoading(true);
                setEditedImage(null);
                const base64 = await fileToBase64(file);
                setBase64Image({ base64, mimeType: file.type });
                setOriginalImage(URL.createObjectURL(file));
            } catch (err) {
                setError('Failed to process image file.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || !base64Image) {
            setError("Please enter a prompt and make sure an image is loaded.");
            return;
        }
        try {
            setError(null);
            setIsLoading(true);
            const result = await editImage(prompt, base64Image.base64, base64Image.mimeType);
            setEditedImage(result);
        } catch (err) {
            setError('Failed to edit image. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow mb-4">
                <div className="relative aspect-square bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                    <h2 className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-semibold">Original</h2>
                    {originalImage ? (
                        <img src={originalImage} alt="Original" className="object-contain h-full w-full" />
                    ) : (
                        <p className="text-gray-400">Upload an image</p>
                    )}
                     {(isLoading && !editedImage) && <LoadingSpinner />}
                </div>
                <div className="relative aspect-square bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                    <h2 className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-semibold">Edited</h2>
                    {editedImage ? (
                        <img src={editedImage} alt="Edited" className="object-contain h-full w-full" />
                    ) : (
                         <div className="text-center text-gray-400 p-4">
                            <p>Your edited image will appear here.</p>
                            <p className="text-xs mt-2">Try prompts like "make it black and white" or "add a birthday hat".</p>
                        </div>
                    )}
                    {isLoading && <LoadingSpinner />}
                </div>
            </div>

             {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-gray-800 py-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your edit, e.g., 'add a retro filter'"
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    disabled={isLoading}
                />
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                />
                 <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Upload Image
                </button>
                <button 
                    type="submit"
                    disabled={isLoading || !prompt || !base64Image}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Editing...' : 'Edit'}
                </button>
            </form>
        </div>
    );
};

export default ImageEditor;
