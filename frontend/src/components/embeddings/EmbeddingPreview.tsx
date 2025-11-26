import React, { useState } from 'react';
import Card from '../layout/Card';
import { theme } from '../../styles/theme';
import { Braces, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface EmbeddingPreviewProps {
    vector: number[] | null;
    dimension: number;
}

export const EmbeddingPreview: React.FC<EmbeddingPreviewProps> = ({ vector, dimension }) => {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    if (!vector) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.text.secondary }}>
                    <Braces size={48} style={{ margin: '0 auto', marginBottom: theme.spacing.md, opacity: 0.3 }} />
                    <p>Generate an embedding to see the vector output</p>
                </div>
            </Card>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(vector));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayVector = expanded ? vector : vector.slice(0, 10);

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <h3 style={{
                    fontSize: theme.typography.size.lg,
                    fontWeight: theme.typography.weight.semibold,
                    color: theme.colors.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                }}>
                    <Braces size={20} style={{ color: theme.colors.primary.base }} />
                    Vector Output
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <span style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: theme.colors.primary.light,
                        color: theme.colors.primary.base,
                        borderRadius: theme.radii.full,
                        fontSize: theme.typography.size.xs,
                        fontWeight: theme.typography.weight.medium,
                    }}>
                        {dimension}D
                    </span>
                    <button
                        onClick={handleCopy}
                        style={{
                            padding: theme.spacing.xs,
                            background: 'transparent',
                            border: 'none',
                            color: copied ? theme.colors.success.base : theme.colors.text.secondary,
                            cursor: 'pointer',
                            borderRadius: theme.radii.md,
                            transition: 'all 0.2s ease',
                        }}
                        title="Copy JSON"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme.colors.surface;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            <div style={{
                background: theme.colors.surface,
                borderRadius: theme.radii.md,
                padding: theme.spacing.md,
                fontFamily: '"Fira Code", "Courier New", monospace',
                fontSize: theme.typography.size.xs,
                color: theme.colors.text.secondary,
                overflowX: 'auto',
                maxHeight: expanded ? 'none' : '200px',
                transition: 'max-height 0.3s ease',
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    <span>[</span>
                    {displayVector.map((val, i) => (
                        <span
                            key={i}
                            style={{
                                padding: '0 2px',
                                borderRadius: '2px',
                                cursor: 'default',
                                transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = theme.colors.primary.light;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {val.toFixed(6)}
                            {i < (expanded ? vector.length : displayVector.length) - 1 ? ',' : ''}
                        </span>
                    ))}
                    {!expanded && vector.length > 10 && (
                        <button
                            onClick={() => setExpanded(true)}
                            style={{
                                marginLeft: theme.spacing.xs,
                                color: theme.colors.primary.base,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: theme.typography.size.xs,
                            }}
                        >
                            ... {vector.length - 10} more
                        </button>
                    )}
                    <span>]</span>
                </div>
                {expanded && (
                    <button
                        onClick={() => setExpanded(false)}
                        style={{
                            marginTop: theme.spacing.sm,
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.spacing.xs,
                            color: theme.colors.primary.base,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: theme.typography.size.sm,
                            width: '100%',
                            justifyContent: 'center',
                        }}
                    >
                        <ChevronUp size={16} />
                        Collapse
                    </button>
                )}
            </div>
        </Card>
    );
};
