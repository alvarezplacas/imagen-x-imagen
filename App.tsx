
import React, { useState, useCallback } from 'react';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import { Tab } from './types';

const INITIAL_IMAGE_URL = 'https://storage.googleapis.com/generative-ai-pro-isv-tools/e6a575a5-481b-4107-883a-493bb35081df.jpeg';

// SVG Icon Components
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M12 21v-1m0-16a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.EDIT);

    const renderContent = useCallback(() => {
        switch (activeTab) {
            case Tab.EDIT:
                return <ImageEditor initialImageUrl={INITIAL_IMAGE_URL} />;
            case Tab.GENERATE:
                return <ImageGenerator />;
            case Tab.VIDEO:
                return <VideoGenerator initialImageUrl={INITIAL_IMAGE_URL} />;
            default:
                return null;
        }
    }, [activeTab]);

    const TabButton = ({ tab, label, icon }: { tab: Tab; label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center px-4 py-3 font-medium text-sm rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                activeTab === tab 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <header className="w-full max-w-6xl text-center mb-6">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                    Gemini Multimodal Studio
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
                    Your creative suite for AI-powered image & video magic.
                </p>
            </header>
            
            <nav className="w-full max-w-lg mb-8 p-1.5 bg-gray-800 rounded-xl shadow-md">
                <div className="grid grid-cols-3 gap-2">
                    <TabButton tab={Tab.EDIT} label="Edit Image" icon={<EditIcon />} />
                    <TabButton tab={Tab.GENERATE} label="Generate Image" icon={<GenerateIcon />} />
                    <TabButton tab={Tab.VIDEO} label="Generate Video" icon={<VideoIcon />} />
                </div>
            </nav>

            <main className="w-full max-w-6xl flex-grow">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
