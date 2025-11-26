import React, { useState } from 'react';
import Card from '../layout/Card';
import SectionHeader from '../layout/SectionHeader';
import { theme } from '../../styles/theme';

const API_URL = 'http://localhost:8080';

interface LoadCollectionFormProps {
    collection: string;
}

const LoadCollectionForm: React.FC<LoadCollectionFormProps> = ({ collection }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleAction = async (action: 'save' | 'load') => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}/${action}`, { method: 'POST' });
            if (!res.ok) throw new Error(`Failed to ${action} database`);
            setMessage(`${action === 'save' ? 'Saved' : 'Loaded'} successfully!`);
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <SectionHeader title="Persistence" subtitle="Save or load database state" />
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <button
                    onClick={() => handleAction('save')}
                    disabled={loading}
                    style={{
                        flex: 1,
                        padding: theme.spacing.md,
                        background: theme.colors.surfaceHover,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radii.md,
                        cursor: 'pointer',
                        fontWeight: theme.typography.weight.medium,
                        color: theme.colors.text.primary,
                        transition: theme.transitions.fast,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.border}
                    onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.surfaceHover}
                >
                    Save Snapshot
                </button>
                <button
                    onClick={() => handleAction('load')}
                    disabled={loading}
                    style={{
                        flex: 1,
                        padding: theme.spacing.md,
                        background: theme.colors.surfaceHover,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radii.md,
                        cursor: 'pointer',
                        fontWeight: theme.typography.weight.medium,
                        color: theme.colors.text.primary,
                        transition: theme.transitions.fast,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.border}
                    onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.surfaceHover}
                >
                    Load Snapshot
                </button>
            </div>
            {message && (
                <div style={{
                    marginTop: theme.spacing.md,
                    textAlign: 'center',
                    fontSize: theme.typography.size.sm,
                    color: message.includes('Error') ? theme.colors.error.text : theme.colors.success.text,
                }}>
                    {message}
                </div>
            )}
        </Card>
    );
};

export default LoadCollectionForm;
