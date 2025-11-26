import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { EmbeddingInput } from '../components/embeddings/EmbeddingInput';
import { EmbeddingPreview } from '../components/embeddings/EmbeddingPreview';
import { SemanticSearch } from '../components/embeddings/SemanticSearch';
import { theme } from '../styles/theme';
import { BrainCircuit } from 'lucide-react';

const API_URL = 'http://localhost:8080';

export const Embeddings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentVector, setCurrentVector] = useState<number[] | null>(null);
    const [currentDimension, setCurrentDimension] = useState(0);

    const handleGenerate = async (text: string, model: string) => {
        setIsLoading(true);
        try {
            // Call /embed to get the vector
            const embedResponse = await fetch(`${API_URL}/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    model,
                }),
            });

            if (!embedResponse.ok) {
                const errorData = await embedResponse.json().catch(() => ({ error: 'Failed to generate embedding' }));
                throw new Error(errorData.error || 'Failed to generate embedding');
            }

            const embedData = await embedResponse.json();
            setCurrentVector(embedData.vector);
            setCurrentDimension(embedData.dimension);

            // Also insert it into the database
            await fetch(`${API_URL}/embed-and-insert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: `embed_${Date.now()}`,
                    text,
                    model,
                    metadata: {
                        source: 'web-ui',
                        timestamp: new Date().toISOString(),
                        text: text.substring(0, 200), // Store first 200 chars for preview
                    },
                }),
            });

        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Failed to generate embedding');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query: string, k: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/semantic-search`, {
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
                const errorData = await response.json().catch(() => ({ error: 'Failed to search' }));
                throw new Error(errorData.error || 'Failed to search');
            }

            const data = await response.json();
            return data.results || [];
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Failed to perform search');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <div style={{ marginBottom: theme.spacing.xl }}>
                <h1 style={{
                    fontSize: theme.typography.size.xxl,
                    fontWeight: theme.typography.weight.bold,
                    color: theme.colors.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    marginBottom: theme.spacing.xs,
                }}>
                    <BrainCircuit size={32} style={{ color: theme.colors.primary.base }} />
                    Embeddings & Semantic Search
                </h1>
                <p style={{
                    fontSize: theme.typography.size.base,
                    color: theme.colors.text.secondary,
                }}>
                    Generate embeddings from text using OpenAI models and perform semantic similarity searches
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: theme.spacing.xl,
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
                    <EmbeddingInput onGenerate={handleGenerate} isLoading={isLoading} />
                    <EmbeddingPreview vector={currentVector} dimension={currentDimension} />
                </div>

                <div style={{ minHeight: '500px' }}>
                    <SemanticSearch onSearch={handleSearch} isLoading={isLoading} />
                </div>
            </div>
        </PageContainer>
    );
};
