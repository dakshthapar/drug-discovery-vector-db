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

interface StructuralAnalysis {
    total_molecules: number;
    avg_molecular_weight: number;
    avg_ring_count: number;
    avg_aromatic_rings: number;
    molecules_with_aromatic_rings: number;
    molecules_with_multiple_rings: number;
}

interface CentroidInfo {
    dimension: number;
    num_source_drugs: number;
    source_drug_names: string[];
    closest_drug?: {
        name: string;
        smiles: string;
        similarity: number;
        indication?: string;
    };
    note: string;
}

interface ScaffoldSuggestion {
    name: string;
    smiles: string;
    similarity_to_centroid: number;
    indication?: string;
}

interface ScaffoldResponse {
    suggestions: ScaffoldSuggestion[];
    description: string;
    centroid_info?: CentroidInfo;
}

type SearchMode = 'text' | 'structure';

export default function DrugDiscovery() {
    const [searchMode, setSearchMode] = useState<SearchMode>('text');
    const [textQuery, setTextQuery] = useState('');
    const [querySmiles, setQuerySmiles] = useState('');
    const [topK, setTopK] = useState(10);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const [structuralAnalysis, setStructuralAnalysis] = useState<StructuralAnalysis | null>(null);
    const [scaffoldData, setScaffoldData] = useState<ScaffoldResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const exampleDrugs = [
        { name: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
        { name: 'Ibuprofen', smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O' },
        { name: 'Metformin', smiles: 'CN(C)C(=N)NC(=N)N' },
        { name: 'Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
    ];

    const exampleTextQueries = [
        'pain relief',
        'diabetes',
        'high blood pressure',
        'inflammation',
    ];

    const runComplete3StepAnalysis = async () => {
        const query = searchMode === 'text' ? textQuery : querySmiles;
        
        if (!query.trim()) {
            setError(`Please enter a ${searchMode === 'text' ? 'description' : 'SMILES string'}`);
            return;
        }

        setLoading(true);
        setError(null);
        setSearchResults(null);
        setStructuralAnalysis(null);
        setScaffoldData(null);

        try {
            // STEP 1: Search (text or structure-based)
            const searchEndpoint = searchMode === 'text' ? '/search/text' : '/search/structure';
            const searchPayload = searchMode === 'text' 
                ? { query: textQuery, top_k: topK }
                : { smiles: querySmiles, top_k: topK };

            const searchResponse = await fetch(`http://localhost:8000${searchEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchPayload)
            });

            if (!searchResponse.ok) {
                throw new Error(`Step 1 failed: ${searchResponse.statusText}`);
            }

            const searchData = await searchResponse.json();
            setSearchResults(searchData);

            if (searchData.results.length === 0) {
                setError('No matching drugs found. Try a different query.');
                setLoading(false);
                return;
            }

            // STEP 2: Structural analysis
            const smilesList = searchData.results.slice(0, 5).map((r: DrugResult) => r.smiles);
            
            const analysisResponse = await fetch('http://localhost:8000/analyze/structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(smilesList)
            });

            if (analysisResponse.ok) {
                const analysisData = await analysisResponse.json();
                setStructuralAnalysis(analysisData);
            }

            // STEP 3: Scaffold suggestions
            const queryDrugs = searchData.results.slice(0, 3).map((r: DrugResult) => ({
                name: r.name,
                smiles: r.smiles
            }));

            const scaffoldResponse = await fetch('http://localhost:8000/suggest/scaffolds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query_drugs: queryDrugs, top_k: 5 })
            });

            if (scaffoldResponse.ok) {
                const scaffoldResponseData = await scaffoldResponse.json();
                setScaffoldData(scaffoldResponseData);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    const loadExample = (example: string) => {
        if (searchMode === 'text') {
            setTextQuery(example);
        } else {
            setQuerySmiles(example);
        }
        setError(null);
    };

    return (
        <div style={{ padding: theme.spacing.xl, maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ 
                fontSize: theme.typography.size['2xl'], 
                fontWeight: theme.typography.weight.bold,
                marginBottom: theme.spacing.md 
            }}>
                🧬 Drug Discovery Assistant - 3-Step System
            </h1>
            
            <p style={{ 
                color: theme.colors.text.secondary, 
                marginBottom: theme.spacing.xl 
            }}>
                <strong>Step 1:</strong> Find similar drugs → <strong>Step 2:</strong> Analyze common features → <strong>Step 3:</strong> Suggest "hybrid" drug candidates
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
                    Query Molecule
                </h2>

                {/* Search Mode Tabs */}
                <div style={{ 
                    display: 'flex', 
                    gap: theme.spacing.sm, 
                    marginBottom: theme.spacing.lg,
                    borderBottom: `2px solid ${theme.colors.border}`
                }}>
                    <button
                        onClick={() => setSearchMode('text')}
                        style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            border: 'none',
                            background: 'transparent',
                            borderBottom: searchMode === 'text' ? `3px solid ${theme.colors.primary.base}` : 'none',
                            color: searchMode === 'text' ? theme.colors.primary.base : theme.colors.text.secondary,
                            fontWeight: searchMode === 'text' ? theme.typography.weight.bold : theme.typography.weight.medium,
                            cursor: 'pointer',
                            fontSize: theme.typography.size.base,
                            marginBottom: '-2px'
                        }}
                    >
                        📝 Search by Description
                    </button>
                    <button
                        onClick={() => setSearchMode('structure')}
                        style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            border: 'none',
                            background: 'transparent',
                            borderBottom: searchMode === 'structure' ? `3px solid ${theme.colors.primary.base}` : 'none',
                            color: searchMode === 'structure' ? theme.colors.primary.base : theme.colors.text.secondary,
                            fontWeight: searchMode === 'structure' ? theme.typography.weight.bold : theme.typography.weight.medium,
                            cursor: 'pointer',
                            fontSize: theme.typography.size.base,
                            marginBottom: '-2px'
                        }}
                    >
                        🧪 Search by Structure
                    </button>
                </div>

                {/* Text Search Mode */}
                {searchMode === 'text' && (
                    <>
                        <div style={{ marginBottom: theme.spacing.md }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: theme.spacing.sm,
                                fontWeight: theme.typography.weight.medium 
                            }}>
                                What are you looking for?
                            </label>
                            <input
                                type="text"
                                value={textQuery}
                                onChange={(e) => setTextQuery(e.target.value)}
                                placeholder="e.g., pain relief, diabetes treatment, anti-inflammatory"
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.md,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${theme.colors.border}`,
                                    fontSize: theme.typography.size.base
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: theme.spacing.md }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: theme.spacing.sm,
                                fontWeight: theme.typography.weight.medium 
                            }}>
                                Example searches:
                            </label>
                            <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                                {exampleTextQueries.map((example) => (
                                    <button
                                        key={example}
                                        onClick={() => loadExample(example)}
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
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Structure Search Mode */}
                {searchMode === 'structure' && (
                    <>
                        <div style={{ marginBottom: theme.spacing.md }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: theme.spacing.sm,
                                fontWeight: theme.typography.weight.medium 
                            }}>
                                SMILES String
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
                                Example molecules:
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
                                    >
                                        {drug.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <div style={{ marginBottom: theme.spacing.lg }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: theme.spacing.sm,
                        fontWeight: theme.typography.weight.medium 
                    }}>
                        Results per step: {topK}
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="15"
                        value={topK}
                        onChange={(e) => setTopK(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>

                <button
                    onClick={runComplete3StepAnalysis}
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
                    {loading ? '🔬 Running 3-Step Analysis...' : '🚀 Run Complete Analysis'}
                </button>
            </div>

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

            {/* STEP 1: Search Results */}
            {searchResults && (
                <div style={{ marginBottom: theme.spacing.xl }}>
                    <div style={{
                        background: '#e8f4fd',
                        padding: theme.spacing.lg,
                        borderRadius: theme.radii.lg,
                        marginBottom: theme.spacing.md,
                        borderLeft: `4px solid ${theme.colors.primary.base}`
                    }}>
                        <h2 style={{ 
                            fontSize: theme.typography.size.xl, 
                            fontWeight: theme.typography.weight.bold,
                            marginBottom: theme.spacing.sm,
                            color: theme.colors.primary.base
                        }}>
                            📊 Step 1: {searchMode === 'text' ? 'Matching Drugs' : 'Similar Drugs'} Found
                        </h2>
                        <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                            {searchMode === 'text' 
                                ? `Drugs matching "${searchResults.query}" based on indication/use case.`
                                : `Structurally similar drugs found.`
                            } Found {searchResults.total_found} drugs in {searchResults.search_time_ms?.toFixed(1)}ms.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                        {searchResults.results.slice(0, 5).map((drug, index) => (
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
                                    <h3 style={{ fontSize: theme.typography.size.lg, fontWeight: theme.typography.weight.semibold }}>
                                        #{index + 1} {drug.name}
                                    </h3>
                                    {searchMode === 'structure' && (
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
                                    )}
                                </div>
                                <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                    <strong>SMILES:</strong> <code>{drug.smiles}</code>
                                </div>
                                {drug.indication && (
                                    <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary, marginTop: theme.spacing.xs }}>
                                        <strong>Use:</strong> {drug.indication}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2 & 3 remain the same... */}
            {/* (keeping the structural analysis and scaffold sections exactly as before) */}
            
            {/* STEP 2: Structural Analysis */}
            {structuralAnalysis && (
                <div style={{ marginBottom: theme.spacing.xl }}>
                    <div style={{
                        background: '#fff4e6',
                        padding: theme.spacing.lg,
                        borderRadius: theme.radii.lg,
                        marginBottom: theme.spacing.md,
                        borderLeft: `4px solid #ff9800`
                    }}>
                        <h2 style={{ 
                            fontSize: theme.typography.size.xl, 
                            fontWeight: theme.typography.weight.bold,
                            marginBottom: theme.spacing.sm,
                            color: '#e65100'
                        }}>
                            🔬 Step 2: Structural Analysis
                        </h2>
                        <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                            Common chemical features across {structuralAnalysis.total_molecules} similar molecules.
                        </p>
                    </div>

                    <div style={{
                        background: theme.colors.background,
                        padding: theme.spacing.lg,
                        borderRadius: theme.radii.lg,
                        border: `1px solid ${theme.colors.border}`,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: theme.spacing.md
                    }}>
                        <div>
                            <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                Avg Molecular Weight
                            </div>
                            <div style={{ fontSize: theme.typography.size.xl, fontWeight: theme.typography.weight.bold }}>
                                {structuralAnalysis.avg_molecular_weight.toFixed(1)} Da
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                Avg Ring Count
                            </div>
                            <div style={{ fontSize: theme.typography.size.xl, fontWeight: theme.typography.weight.bold }}>
                                {structuralAnalysis.avg_ring_count.toFixed(1)}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                Molecules with Aromatic Rings
                            </div>
                            <div style={{ fontSize: theme.typography.size.xl, fontWeight: theme.typography.weight.bold }}>
                                {structuralAnalysis.molecules_with_aromatic_rings} / {structuralAnalysis.total_molecules}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                Multiple Ring Systems
                            </div>
                            <div style={{ fontSize: theme.typography.size.xl, fontWeight: theme.typography.weight.bold }}>
                                {structuralAnalysis.molecules_with_multiple_rings} / {structuralAnalysis.total_molecules}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: Scaffold Suggestions */}
            {scaffoldData && scaffoldData.suggestions.length > 0 && (
                <div>
                    <div style={{
                        background: '#f3e5f5',
                        padding: theme.spacing.lg,
                        borderRadius: theme.radii.lg,
                        marginBottom: theme.spacing.md,
                        borderLeft: `4px solid #9c27b0`
                    }}>
                        <h2 style={{ 
                            fontSize: theme.typography.size.xl, 
                            fontWeight: theme.typography.weight.bold,
                            marginBottom: theme.spacing.sm,
                            color: '#6a1b9a'
                        }}>
                            💡 Step 3: Novel Scaffold Suggestions
                        </h2>
                        <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
                            Mathematical average (centroid) of top similar drugs. 
                            {scaffoldData.centroid_info && (
                                <span> Based on: {scaffoldData.centroid_info.source_drug_names.join(', ')}</span>
                            )}
                        </p>
                        
                        {scaffoldData.centroid_info?.closest_drug && (
                            <div style={{
                                background: 'white',
                                padding: theme.spacing.md,
                                borderRadius: theme.radii.md,
                                marginTop: theme.spacing.sm,
                                border: '2px dashed #9c27b0'
                            }}>
                                <div style={{ fontWeight: theme.typography.weight.bold, marginBottom: theme.spacing.xs }}>
                                    🎯 Centroid Representative: {scaffoldData.centroid_info.closest_drug.name}
                                </div>
                                <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
                                    <strong>SMILES:</strong> <code>{scaffoldData.centroid_info.closest_drug.smiles}</code>
                                </div>
                                <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                    {(scaffoldData.centroid_info.closest_drug.similarity * 100).toFixed(1)}% similar to the "average profile"
                                </div>
                                <div style={{ fontSize: theme.typography.size.xs, color: theme.colors.text.secondary, marginTop: theme.spacing.sm, fontStyle: 'italic' }}>
                                    {scaffoldData.centroid_info.note}
                                </div>
                            </div>
                        )}

                        <p style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.sm, margin: 0 }}>
                            Below are OTHER drugs close to this average - potential <strong>hybrid candidates</strong>!
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                        {scaffoldData.suggestions.map((scaffold, index) => (
                            <div
                                key={index}
                                style={{
                                    background: theme.colors.background,
                                    padding: theme.spacing.lg,
                                    borderRadius: theme.radii.lg,
                                    border: `2px solid ${theme.colors.primary.light}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                                    <h3 style={{ fontSize: theme.typography.size.lg, fontWeight: theme.typography.weight.semibold }}>
                                        💊 {scaffold.name}
                                    </h3>
                                    <div style={{
                                        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                                        background: '#e7f3ff',
                                        color: '#0066cc',
                                        borderRadius: theme.radii.md,
                                        fontSize: theme.typography.size.sm,
                                        fontWeight: theme.typography.weight.semibold
                                    }}>
                                        {(scaffold.similarity_to_centroid * 100).toFixed(1)}% to centroid
                                    </div>
                                </div>
                                <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                    <strong>SMILES:</strong> <code>{scaffold.smiles}</code>
                                </div>
                                {scaffold.indication && (
                                    <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary, marginTop: theme.spacing.xs }}>
                                        <strong>Use:</strong> {scaffold.indication}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
