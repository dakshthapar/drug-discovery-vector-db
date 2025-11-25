import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface EmbeddingInputProps {
    onGenerate: (text: string, model: string) => Promise<void>;
    isLoading: boolean;
}

export const EmbeddingInput: React.FC<EmbeddingInputProps> = ({ onGenerate, isLoading }) => {
    const [text, setText] = useState('');
    const [model, setModel] = useState('text-embedding-3-small');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onGenerate(text, model);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Generate Embedding
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Input Text
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-32 px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                        placeholder="Enter text to convert to vector embedding..."
                        required
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model
                        </label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
                        >
                            <option value="text-embedding-3-small">text-embedding-3-small (1536d)</option>
                            <option value="text-embedding-3-large">text-embedding-3-large (3072d)</option>
                        </select>
                    </div>

                    <div className="flex-none pt-6">
                        <button
                            type="submit"
                            disabled={isLoading || !text.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
