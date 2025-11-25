import React, { useState } from 'react';
import { EmbeddingInput } from '../components/embeddings/EmbeddingInput';
import { EmbeddingPreview } from '../components/embeddings/EmbeddingPreview';
import { SemanticSearch } from '../components/embeddings/SemanticSearch';
import { BrainCircuit } from 'lucide-react';

export const Embeddings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentVector, setCurrentVector] = useState<number[] | null>(null);
    const [currentDimension, setCurrentDimension] = useState(0);

    const handleGenerate = async (text: string, model: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/embed-and-insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: `doc_${Date.now()}`,
                    text,
                    model,
                    metadata: {
                        source: 'web-ui',
                        timestamp: new Date().toISOString(),
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate embedding');
            }

            const data = await response.json();
            // We need to fetch the vector to display it, as embed-and-insert only returns ID and dim
            // But for preview purposes, let's also call /embed just to get the vector
            // Or we can just fetch the vector by ID.
            // Let's call /embed separately for the preview to avoid complex logic, 
            // or just trust the user wants to see what they inserted.

            // Actually, let's just use /embed for the preview part if we want to show the vector immediately.
            // But the requirement says "Submit text -> convert ... Store ... View".
            // Let's do both: insert and then fetch or just use the vector from a separate call.
            // To keep it simple and fast, let's just use /embed first to get the vector, then insert.
            // But the API I designed has /embed-and-insert.
            // Let's use /embed-and-insert and then fetch the vector by ID? 
            // Or just call /embed to show it.

            // Let's change the flow:
            // 1. Call /embed to get vector and show preview.
            // 2. Call /embed-and-insert to save it.
            // This is double cost.

            // Let's just use /embed-and-insert. The response has ID.
            // Then we can fetch the vector using GET /vectors/:id.

            const vectorResponse = await fetch(`http://localhost:3000/vectors/${data.id}`);
            const vectorData = await vectorResponse.json();

            setCurrentVector(vectorData.vector);
            setCurrentDimension(data.dimension);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate embedding');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query: string, k: number) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/semantic-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    k,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to search');
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to perform search');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-indigo-600" />
                    Embeddings & Semantic Search
                </h1>
                <p className="text-gray-600 mt-2">
                    Generate embeddings from text using OpenAI models and perform semantic similarity searches.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <EmbeddingInput onGenerate={handleGenerate} isLoading={isLoading} />
                    <EmbeddingPreview vector={currentVector} dimension={currentDimension} />
                </div>

                <div className="h-full">
                    <SemanticSearch onSearch={handleSearch} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
};
