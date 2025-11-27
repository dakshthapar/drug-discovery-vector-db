import { useState } from 'react';
import { theme } from '../../styles/theme';

interface DrugResult {
    id: string;
    name: string;
    smiles: string;
    similarity: number;
    distance: number;
    indication?: string;
}

interface SearchResponse {
    query: string;
    results: DrugResult[];
    total_found: number;
    search_time_ms?: number;
}

export default function DrugDiscovery() {
    const [querySmiles, setQuerySmiles] = useState('');
    const [topK, setTopK] = useState(10);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Example SMILES for quick testing
    const exampleDrugs = [
        { name: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
        { name: 'Ibuprofen', smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O' },
        { name: 'Metformin', smiles: 'CN(C)C(=N)NC(=N)N' },
        { name: 'Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
    ];

    const searchDrugs = async () => {
        if (!querySmiles.trim()) {
            setError('Please enter a SMILES string');
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await fetch('http://localhost:8000/search/structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    smiles: querySmiles,
                    top_k: topK
                })
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const loadExample = (smiles: string) => {
        setQuerySmiles(smiles);
        setError(null);
    };

    return (
        <div style={{ padding: theme.spacing.xl, maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ 
                fontSize: theme.typography.size['2xl'], 
                fontWeight: theme.typography.weight.bold,
                marginBottom: theme.spacing.md 
            }}>
                🧬 Drug Discovery Assistant
            </h1>
            
            <p style={{ 
                color: theme.colors.text.secondary, 
                marginBottom: theme.spacing.xl 
            }}>
                Search for drugs similar to a query molecule for drug repurposing and lead optimization
            </p>

            {/* Search Form */}
            <div style={{
                background: theme.colors.background,
                padding: theme.spacing.xl,
                borderRadius: theme.radii.lg,
                border: `1px solid ${theme.colors.border}`,
                marginBottom: theme.spacing.xl
            }}>
                <h2 style={{ 
                    fontSize: theme.typography.size.lg, 
                    fontWeight: theme.typography.weight.semibold,
                    marginBottom: theme.spacing.md 
                }}>
                    Structure-Based Search
                </h2>

                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: theme.spacing.sm,
                        fontWeight: theme.typography.weight.medium 
                    }}>
                        Query Molecule (SMILES)
                    </label>
                    <input
                        type="text"
                        value={querySmiles}
                        onChange={(e) => setQuerySmiles(e.target.value)}
                        placeholder="e.g., CC(=O)Oc1ccccc1C(=O)O"
                        style={{
                            width: '100%',
                            padding: theme.spacing.md,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${theme.colors.border}`,
                            fontSize: theme.typography.size.base,
                            fontFamily: 'monospace'
                        }}
                    />
                </div>

                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: theme.spacing.sm,
                        fontWeight: theme.typography.weight.medium 
                    }}>
                        Examples:
                    </label>
                    <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                        {exampleDrugs.map((drug) => (
                            <button
                                key={drug.name}
                                onClick={() => loadExample(drug.smiles)}
                                style={{
                                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${theme.colors.border}`,
                                    background: theme.colors.surface,
                                    color: theme.colors.text.primary,
                                    cursor: 'pointer',
                                    fontSize: theme.typography.size.sm,
                                    fontWeight: theme.typography.weight.medium
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = theme.colors.primary.light;
                                    e.currentTarget.style.borderColor = theme.colors.primary.base;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = theme.colors.surface;
                                    e.currentTarget.style.borderColor = theme.colors.border;
                                }}
                            >
                                {drug.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: theme.spacing.lg }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: theme.spacing.sm,
                        fontWeight: theme.typography.weight.medium 
                    }}>
                        Top K Results: {topK}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={topK}
                        onChange={(e) => setTopK(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>

                <button
                    onClick={searchDrugs}
                    disabled={loading}
                    style={{
                        padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                        borderRadius: theme.radii.md,
                        border: 'none',
                        background: theme.colors.primary.base,
                        color: 'white',
                        fontSize: theme.typography.size.base,
                        fontWeight: theme.typography.weight.semibold,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? '🔍 Searching...' : '🔍 Search Similar Drugs'}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    padding: theme.spacing.md,
                    background: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: theme.radii.md,
                    marginBottom: theme.spacing.lg,
                    color: '#c00'
                }}>
                    ❌ {error}
                </div>
            )}

            {/* Results Display */}
            {results && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: theme.spacing.lg
                    }}>
                        <h2 style={{ 
                            fontSize: theme.typography.size.xl, 
                            fontWeight: theme.typography.weight.semibold 
                        }}>
                            📊 Results
                        </h2>
                        <div style={{ 
                            color: theme.colors.text.secondary,
                            fontSize: theme.typography.size.sm 
                        }}>
                            Found {results.total_found} drugs in {results.search_time_ms?.toFixed(1)}ms
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                        {results.results.map((drug, index) => (
                            <div
                                key={drug.id}
                                style={{
                                    background: theme.colors.background,
                                    padding: theme.spacing.lg,
                                    borderRadius: theme.radii.lg,
                                    border: `1px solid ${theme.colors.border}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                                    <h3 style={{ 
                                        fontSize: theme.typography.size.lg,
                                        fontWeight: theme.typography.weight.semibold 
                                    }}>
                                        #{index + 1} {drug.name}
                                    </h3>
                                    <div style={{
                                        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                                        background: drug.similarity > 0.7 ? '#d4edda' : drug.similarity > 0.5 ? '#fff3cd' : '#f8d7da',
                                        color: drug.similarity > 0.7 ? '#155724' : drug.similarity > 0.5 ? '#856404' : '#721c24',
                                        borderRadius: theme.radii.md,
                                        fontSize: theme.typography.size.sm,
                                        fontWeight: theme.typography.weight.semibold
                                    }}>
                                        {(drug.similarity * 100).toFixed(1)}% similar
                                    </div>
                                </div>

                                <div style={{ 
                                    fontSize: theme.typography.size.sm,
                                    color: theme.colors.text.secondary,
                                    marginBottom: theme.spacing.sm 
                                }}>
                                    <strong>SMILES:</strong> <code style={{ 
                                        background: theme.colors.surface,
                                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                                        borderRadius: theme.radii.sm,
                                        fontFamily: 'monospace'
                                    }}>{drug.smiles}</code>
                                </div>

                                {drug.indication && (
                                    <div style={{ 
                                        fontSize: theme.typography.size.sm,
                                        color: theme.colors.text.secondary 
                                    }}>
                                        <strong>Use:</strong> {drug.indication}
                                    </div>
                                )}

                                <div style={{ 
                                    fontSize: theme.typography.size.sm,
                                    color: theme.colors.text.secondary,
                                    marginTop: theme.spacing.sm 
                                }}>
                                    <strong>Distance:</strong> {drug.distance.toFixed(4)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
