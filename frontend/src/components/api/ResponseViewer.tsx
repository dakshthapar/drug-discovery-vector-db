import React, { useState } from 'react';
import { theme } from '../../styles/theme';
import CodeBlock from './CodeBlock';
import Badge from './Badge';

interface ResponseViewerProps {
    status: number;
    statusText: string;
    time: string;
    data: any;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ status, statusText, time, data }) => {
    const [mode, setMode] = useState<'pretty' | 'raw'>('pretty');

    return (
        <div style={{
            marginTop: theme.spacing.lg,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii.md,
            overflow: 'hidden',
        }}>
            <div style={{
                padding: theme.spacing.sm,
                background: theme.colors.surface,
                borderBottom: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
                    <Badge type={status < 400 ? 'success' : 'error'}>{status} {statusText}</Badge>
                    <span style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>{time}ms</span>
                </div>
                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                    <button
                        onClick={() => setMode('pretty')}
                        style={{
                            padding: '4px 8px',
                            borderRadius: theme.radii.sm,
                            border: 'none',
                            background: mode === 'pretty' ? theme.colors.surfaceHover : 'transparent',
                            cursor: 'pointer',
                            fontSize: theme.typography.size.xs,
                        }}
                    >
                        Pretty
                    </button>
                    <button
                        onClick={() => setMode('raw')}
                        style={{
                            padding: '4px 8px',
                            borderRadius: theme.radii.sm,
                            border: 'none',
                            background: mode === 'raw' ? theme.colors.surfaceHover : 'transparent',
                            cursor: 'pointer',
                            fontSize: theme.typography.size.xs,
                        }}
                    >
                        Raw
                    </button>
                </div>
            </div>
            <div style={{ padding: 0 }}>
                <CodeBlock code={mode === 'pretty' ? JSON.stringify(data, null, 2) : JSON.stringify(data)} />
            </div>
        </div>
    );
};

export default ResponseViewer;
