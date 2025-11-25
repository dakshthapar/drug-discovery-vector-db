import React, { useState } from 'react';
import { Braces, Copy, Check } from 'lucide-react';

interface EmbeddingPreviewProps {
    vector: number[] | null;
    dimension: number;
}

export const EmbeddingPreview: React.FC<EmbeddingPreviewProps> = ({ vector, dimension }) => {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    if (!vector) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(vector));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayVector = expanded ? vector : vector.slice(0, 10);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Braces className="w-5 h-5 text-indigo-600" />
                    Vector Output
                </h3>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {dimension} dimensions
                    </span>
                    <button
                        onClick={handleCopy}
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                        title="Copy JSON"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-600 overflow-x-auto">
                <div className="flex flex-wrap gap-1">
                    <span>[</span>
                    {displayVector.map((val, i) => (
                        <span key={i} className="hover:bg-indigo-50 px-0.5 rounded cursor-default">
                            {val.toFixed(6)}
                            {i < vector.length - 1 ? ',' : ''}
                        </span>
                    ))}
                    {!expanded && vector.length > 10 && (
                        <button
                            onClick={() => setExpanded(true)}
                            className="text-indigo-600 hover:underline ml-1"
                        >
                            ... {vector.length - 10} more
                        </button>
                    )}
                    <span>]</span>
                </div>
                {expanded && (
                    <button
                        onClick={() => setExpanded(false)}
                        className="mt-2 text-indigo-600 hover:underline block w-full text-center"
                    >
                        Collapse
                    </button>
                )}
            </div>
        </div>
    );
};
