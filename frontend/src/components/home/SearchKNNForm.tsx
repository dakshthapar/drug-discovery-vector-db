import React, { useState } from 'react';
import Card from '../layout/Card';
import SectionHeader from '../layout/SectionHeader';
import { theme } from '../../styles/theme';

const API_URL = 'http://localhost:8080';

interface SearchKNNFormProps {
    collection: string;
}

const SearchKNNForm: React.FC<SearchKNNFormProps> = ({ collection }) => {
    const [queryVector, setQueryVector] = useState('');
    const [k, setK] = useState(5);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const vectorData = JSON.parse(queryVector);

            const res = await fetch(`${API_URL}/search?collection=${encodeURIComponent(collection)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vector: vectorData,
                    top_k: k,
                    metric: "cosine",
                }),
            });

            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            setResults(data.results || []);
        } catch (err: any) {
            setError(err.message || 'Invalid JSON format');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <SectionHeader title="Search k-NN" subtitle="Find nearest neighbors" />
            <form onSubmit={handleSearch}>
                <div style={{ marginBottom: theme.spacing.lg }}>
                    <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary }}>Query Vector (JSON Array)</label>
                    <textarea
                        value={queryVector}
                        onChange={(e) => setQueryVector(e.target.value)}
                        required
                        placeholder="[0.1, 0.2, 0.3]"
                        style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${theme.colors.border}`,
                            background: theme.colors.surface,
                            minHeight: '80px',
                            fontFamily: 'monospace',
                            color: theme.colors.text.primary,
                        }}
                    />
                </div>

                <div style={{ marginBottom: theme.spacing.lg }}>
                    <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary }}>K (Number of neighbors)</label>
                    <input
                        type="number"
                        value={k}
                        onChange={(e) => setK(parseInt(e.target.value))}
                        min="1"
                        max="100"
                        style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${theme.colors.border}`,
                            background: theme.colors.surface,
                            color: theme.colors.text.primary,
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: theme.colors.primary.base,
                        color: '#fff',
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        borderRadius: theme.radii.md,
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        fontWeight: theme.typography.weight.medium,
                    }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>

                {error && (
                    <div style={{
                        marginTop: theme.spacing.md,
                        padding: theme.spacing.sm,
                        borderRadius: theme.radii.md,
                        background: theme.colors.error.light,
                        color: theme.colors.error.text,
                    }}>
                        {error}
                    </div>
                )}
            </form>

            {results.length > 0 && (
                <div style={{ marginTop: theme.spacing.xl }}>
                    <h3 style={{ fontSize: theme.typography.size.lg, marginBottom: theme.spacing.md }}>Results</h3>
                    <div style={{ display: 'grid', gap: theme.spacing.md }}>
                        {results.map((result, idx) => (
                            <div key={idx} style={{
                                padding: theme.spacing.md,
                                background: theme.colors.surface,
                                borderRadius: theme.radii.md,
                                border: `1px solid ${theme.colors.border}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                                    <span style={{ fontWeight: 'bold', color: theme.colors.text.primary }}>ID: {result.id}</span>
                                    <span style={{ color: theme.colors.primary.base }}>Score: {result.score.toFixed(4)}</span>
                                </div>
                                {result.vector && (
                                    <div style={{ marginTop: theme.spacing.xs }}>
                                        <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                            Vector ({result.vector.length}D): [{result.vector.slice(0, 5).map((v: number) => v.toFixed(3)).join(', ')}
                                            {result.vector.length > 5 ? `, ... ${result.vector.length - 5} more` : ''}]
                                        </div>
                                    </div>
                                )}
                                {result.metadata && Object.keys(result.metadata).length > 0 && (
                                    <pre style={{
                                        margin: `${theme.spacing.xs} 0 0 0`,
                                        fontSize: theme.typography.size.xs,
                                        color: theme.colors.text.secondary,
                                    }}>
                                        {JSON.stringify(result.metadata, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default SearchKNNForm;
