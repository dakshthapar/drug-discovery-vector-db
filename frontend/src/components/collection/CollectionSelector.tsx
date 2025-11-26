import React, { useEffect, useState } from 'react';
import { theme } from '../../styles/theme';

const API_URL = 'http://localhost:8080';

interface Collection {
    name: string;
    dimension: number;
    num_vectors: number;
    created_at: number;
}

interface CollectionSelectorProps {
    selectedCollection: string;
    onCollectionChange: (collection: string) => void;
}

const CollectionSelector: React.FC<CollectionSelectorProps> = ({ selectedCollection, onCollectionChange }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionDim, setNewCollectionDim] = useState('768');
    const [error, setError] = useState<string | null>(null);

    const fetchCollections = async () => {
        try {
            const res = await fetch(`${API_URL}/collections`);
            const data = await res.json();
            setCollections(data.collections || []);

            // If no collection is selected and we have collections, select the first one
            if (!selectedCollection && data.collections.length > 0) {
                onCollectionChange(data.collections[0].name);
            }
        } catch (err) {
            console.error('Failed to fetch collections', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
        const interval = setInterval(fetchCollections, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch(`${API_URL}/collections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCollectionName,
                    dimension: parseInt(newCollectionDim),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Failed to create collection' }));
                throw new Error(errorData.error || 'Failed to create collection');
            }

            setNewCollectionName('');
            setNewCollectionDim('768');
            setShowCreateForm(false);
            fetchCollections();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading collections...</div>;

    const selectedColl = collections.find(c => c.name === selectedCollection);

    return (
        <div style={{
            marginBottom: theme.spacing.xl,
            padding: theme.spacing.lg,
            background: theme.colors.surface,
            borderRadius: theme.radii.lg,
            border: `1px solid ${theme.colors.border}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                <label style={{ fontWeight: theme.typography.weight.semibold, color: theme.colors.text.primary, minWidth: '90px' }}>
                    Collection:
                </label>
                <select
                    value={selectedCollection}
                    onChange={(e) => onCollectionChange(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: '300px',
                        padding: theme.spacing.sm,
                        borderRadius: theme.radii.md,
                        border: `1px solid ${theme.colors.border}`,
                        background: theme.colors.background,
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.size.base,
                    }}
                >
                    {collections.map(c => (
                        <option key={c.name} value={c.name}>
                            {c.name} ({c.dimension}D, {c.num_vectors} vectors)
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{
                        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                        background: theme.colors.primary.base,
                        color: '#fff',
                        border: 'none',
                        borderRadius: theme.radii.md,
                        cursor: 'pointer',
                        fontWeight: theme.typography.weight.medium,
                    }}
                >
                    {showCreateForm ? 'Cancel' : '+ New'}
                </button>
            </div>

            {selectedColl && (
                <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                    Dimension: {selectedColl.dimension} | Vectors: {selectedColl.num_vectors}
                </div>
            )}

            {showCreateForm && (
                <form onSubmit={handleCreateCollection} style={{ marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                Collection Name
                            </label>
                            <input
                                type="text"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                required
                                placeholder="e.g., images, text, embeddings"
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${theme.colors.border}`,
                                    background: theme.colors.background,
                                    color: theme.colors.text.primary,
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                Dimension
                            </label>
                            <input
                                type="number"
                                value={newCollectionDim}
                                onChange={(e) => setNewCollectionDim(e.target.value)}
                                required
                                min="1"
                                placeholder="768"
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${theme.colors.border}`,
                                    background: theme.colors.background,
                                    color: theme.colors.text.primary,
                                }}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        style={{
                            marginTop: theme.spacing.md,
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            background: theme.colors.success.base,
                            color: '#fff',
                            border: 'none',
                            borderRadius: theme.radii.md,
                            cursor: 'pointer',
                            fontWeight: theme.typography.weight.medium,
                        }}
                    >
                        Create Collection
                    </button>
                    {error && (
                        <div style={{
                            marginTop: theme.spacing.sm,
                            padding: theme.spacing.sm,
                            background: theme.colors.error.light,
                            color: theme.colors.error.text,
                            borderRadius: theme.radii.md,
                            fontSize: theme.typography.size.sm,
                        }}>
                            {error}
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};

export default CollectionSelector;
