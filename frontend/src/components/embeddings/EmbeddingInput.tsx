import React, { useState } from 'react';
import Card from '../layout/Card';
import SectionHeader from '../layout/SectionHeader';
import { theme } from '../../styles/theme';
import { Sparkles, Loader2 } from 'lucide-react';

interface EmbeddingInputProps {
    onGenerate: (text: string, model: string) => Promise<void>;
    isLoading: boolean;
}

export const EmbeddingInput: React.FC<EmbeddingInputProps> = ({ onGenerate, isLoading }) => {
    const [text, setText] = useState('');
    const [model, setModel] = useState('text-embedding-004');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onGenerate(text, model);
        }
    };

    return (
        <Card>
            <SectionHeader
                title="Generate Embedding"
                subtitle="Convert text to vector embeddings using Google Gemini models"
                icon={Sparkles}
            />
            <form onSubmit={handleSubmit} style={{ marginTop: theme.spacing.lg }}>
                <div style={{ marginBottom: theme.spacing.lg }}>
                    <label style={{
                        display: 'block',
                        marginBottom: theme.spacing.xs,
                        fontSize: theme.typography.size.sm,
                        fontWeight: theme.typography.weight.medium,
                        color: theme.colors.text.secondary,
                    }}>
                        Input Text
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        placeholder="Enter text to convert to vector embedding..."
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: theme.spacing.md,
                            borderRadius: theme.radii.md,
                            border: `2px solid ${theme.colors.border}`,
                            background: theme.colors.surface,
                            color: theme.colors.text.primary,
                            fontSize: theme.typography.size.base,
                            fontFamily: 'inherit',
                            resize: 'vertical',
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
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: theme.spacing.xs,
                            fontSize: theme.typography.size.sm,
                            fontWeight: theme.typography.weight.medium,
                            color: theme.colors.text.secondary,
                        }}>
                            Model
                        </label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.radii.md,
                                border: `2px solid ${theme.colors.border}`,
                                background: theme.colors.surface,
                                color: theme.colors.text.primary,
                                fontSize: theme.typography.size.base,
                                cursor: 'pointer',
                            }}
                        >
                            <option value="text-embedding-004">text-embedding-004 (768D)</option>
                            <option value="embedding-001">embedding-001 (768D)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !text.trim()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            background: isLoading || !text.trim() ? theme.colors.text.secondary : theme.colors.primary.base,
                            color: '#fff',
                            border: 'none',
                            borderRadius: theme.radii.md,
                            fontSize: theme.typography.size.base,
                            fontWeight: theme.typography.weight.medium,
                            cursor: isLoading || !text.trim() ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: isLoading || !text.trim() ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading && text.trim()) {
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
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Generate
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Card>
    );
};
