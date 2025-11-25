import React, { useState } from 'react';
import Card from '../layout/Card';
import SectionHeader from '../layout/SectionHeader';
import { theme } from '../../styles/theme';

const API_URL = 'http://localhost:8080';

const InsertVectorForm: React.FC = () => {
    const [id, setId] = useState('');
    const [vector, setVector] = useState('');
    const [metadata, setMetadata] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const vectorData = JSON.parse(vector);
            const metadataData = metadata ? JSON.parse(metadata) : null;

            const res = await fetch(`${API_URL}/vectors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    vector: vectorData,
                    metadata: metadataData,
                }),
            });

            if (!res.ok) throw new Error('Failed to insert vector');

            setStatus({ type: 'success', msg: 'Vector inserted successfully!' });
            setId('');
            setVector('');
            setMetadata('');
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'Invalid JSON format' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <SectionHeader title="Insert Vector" subtitle="Add a new vector to the collection" />
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: theme.spacing.lg }}>
                    <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary }}>Vector ID</label>
                    <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${theme.colors.border}`,
                            background: theme.colors.surface,
                        }}
                    />
                </div>

                <div style={{ marginBottom: theme.spacing.lg }}>
                    <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary }}>Vector (JSON Array)</label>
                    <textarea
                        value={vector}
                        onChange={(e) => setVector(e.target.value)}
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
                        }}
                    />
                </div>

                <div style={{ marginBottom: theme.spacing.lg }}>
                    <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary }}>Metadata (Optional JSON)</label>
                    <textarea
                        value={metadata}
                        onChange={(e) => setMetadata(e.target.value)}
                        placeholder='{"category": "test"}'
                        style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${theme.colors.border}`,
                            background: theme.colors.surface,
                            minHeight: '80px',
                            fontFamily: 'monospace',
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
                    {loading ? 'Inserting...' : 'Insert Vector'}
                </button>

                {status && (
                    <div style={{
                        marginTop: theme.spacing.md,
                        padding: theme.spacing.sm,
                        borderRadius: theme.radii.md,
                        background: status.type === 'success' ? theme.colors.success.light : theme.colors.error.light,
                        color: status.type === 'success' ? theme.colors.success.text : theme.colors.error.text,
                    }}>
                        {status.msg}
                    </div>
                )}
            </form>
        </Card>
    );
};

export default InsertVectorForm;
