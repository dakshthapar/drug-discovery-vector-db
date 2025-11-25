import React, { useState } from 'react';
import { Search, Loader2, Database } from 'lucide-react';

interface SearchResult {
    id: string;
    score: number;
    metadata?: any;
}

interface SemanticSearchProps {
    onSearch: (query: string, k: number) => Promise<SearchResult[]>;
    isLoading: boolean;
}

export const SemanticSearch: React.FC<SemanticSearchProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [k, setK] = useState(5);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const data = await onSearch(query, k);
            setResults(data);
            setHasSearched(true);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                Semantic Search
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Query
                    </label>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        placeholder="Search by meaning..."
                        required
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Top K
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={k}
                            onChange={(e) => setK(parseInt(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>

                    <div className="flex-1 pt-6">
                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Search
                        </button>
                    </div>
                </div>
            </form>

            <div className="flex-1 overflow-y-auto min-h-[200px]">
                {results.length > 0 ? (
                    <div className="space-y-3">
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">{result.id}</span>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                        {(result.score * 100).toFixed(1)}% match
                                    </span>
                                </div>
                                {result.metadata && (
                                    <div className="text-sm text-gray-600">
                                        {result.metadata.text && (
                                            <p className="line-clamp-2 mb-2 italic">"{result.metadata.text}"</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(result.metadata)
                                                .filter(([key]) => key !== 'text')
                                                .map(([key, value]) => (
                                                    <span key={key} className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                                                        {key}: {String(value)}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : hasSearched && !isLoading ? (
                    <div className="text-center text-gray-500 py-8">
                        No results found
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-8 text-sm">
                        Enter a query to search semantically
                    </div>
                )}
            </div>
        </div>
    );
};
