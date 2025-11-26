import React, { useState } from 'react';
import Card from '../layout/Card';
import SectionHeader from '../layout/SectionHeader';
import { theme } from '../../styles/theme';
import { Search, Loader2, Database, Sparkles } from 'lucide-react';

interface SearchResult {
    id: string;
    score: number;
    text?: string;
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
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <SectionHeader
                title="Semantic Search"
                subtitle="Search by meaning, not just keywords"
                icon={Search}
            />

            <form onSubmit={handleSubmit} style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={{
                        display: 'block',
                        marginBottom: theme.spacing.xs,
                        fontSize: theme.typography.size.sm,
                        fontWeight: theme.typography.weight.medium,
                        color: theme.colors.text.secondary,
                    }}>
                        Search Query
                    </label>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        required
                        placeholder="Search by meaning..."
                        style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            border: `2px solid ${theme.colors.border}`,
                            background: theme.colors.surface,
                            color: theme.colors.text.primary,
                            fontSize: theme.typography.size.base,
                            transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = theme.colors.primary.base;
                            e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary.light}`;
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = theme.colors.border;
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'flex-end' }}>
                    <div style={{ width: '100px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: theme.spacing.xs,
                            fontSize: theme.typography.size.sm,
                            fontWeight: theme.typography.weight.medium,
                            color: theme.colors.text.secondary,
                        }}>
                            Top K
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={k}
                            onChange={(e) => setK(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.radii.md,
                                border: `2px solid ${theme.colors.border}`,
                                background: theme.colors.surface,
                                color: theme.colors.text.primary,
                                fontSize: theme.typography.size.base,
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: theme.spacing.sm,
                            padding: theme.spacing.sm,
                            background: isLoading || !query.trim() ? theme.colors.text.secondary : theme.colors.primary.base,
                            color: '#fff',
                            border: 'none',
                            borderRadius: theme.radii.md,
                            fontSize: theme.typography.size.base,
                            fontWeight: theme.typography.weight.medium,
                            cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: isLoading || !query.trim() ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading && query.trim()) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary.light}`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search size={16} />
                                Search
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: '200px' }}>
                {results.length > 0 ? (
                    <div style={{ display: 'grid', gap: theme.spacing.md }}>
                        {results.map((result, idx) => (
                            <div
                                key={result.id}
                                style={{
                                    padding: theme.spacing.md,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${theme.colors.border}`,
                                    background: theme.colors.surface,
                                    transition: 'all 0.2s ease',
                                    animation: `slideIn 0.3s ease ${idx * 0.05}s both`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.border}`;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing.xs }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                                        <Database size={14} style={{ color: theme.colors.text.secondary }} />
                                        <span style={{ fontWeight: theme.typography.weight.medium, color: theme.colors.text.primary }}>
                                            {result.id}
                                        </span>
                                    </div>
                                    <span style={{
                                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                                        background: theme.colors.success.light,
                                        color: theme.colors.success.base,
                                        borderRadius: theme.radii.full,
                                        fontSize: theme.typography.size.xs,
                                        fontWeight: theme.typography.weight.medium,
                                    }}>
                                        {(result.score * 100).toFixed(1)}%
                                    </span>
                                </div>
                                {result.text && (
                                    <p style={{
                                        fontSize: theme.typography.size.sm,
                                        color: theme.colors.text.secondary,
                                        fontStyle: 'italic',
                                        marginBottom: theme.spacing.xs,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}>
                                        "{result.text}"
                                    </p>
                                )}
                                {result.metadata && Object.keys(result.metadata).length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                                        {Object.entries(result.metadata)
                                            .filter(([key]) => key !== 'text')
                                            .map(([key, value]) => (
                                                <span
                                                    key={key}
                                                    style={{
                                                        fontSize: theme.typography.size.xs,
                                                        padding: `2px ${theme.spacing.xs}`,
                                                        background: theme.colors.background,
                                                        color: theme.colors.text.secondary,
                                                        borderRadius: theme.radii.sm,
                                                    }}
                                                >
                                                    {key}: {String(value)}
                                                </span>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : hasSearched && !isLoading ? (
                    <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.text.secondary }}>
                        <Search size={48} style={{ margin: '0 auto', marginBottom: theme.spacing.md, opacity: 0.3 }} />
                        <p>No results found</p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.text.secondary }}>
                        <Sparkles size={48} style={{ margin: '0 auto', marginBottom: theme.spacing.md, opacity: 0.3 }} />
                        <p>Enter a query to search semantically</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </Card>
    );
};
