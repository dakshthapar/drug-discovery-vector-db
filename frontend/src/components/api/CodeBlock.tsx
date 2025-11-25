import React, { useState } from 'react';
import { theme } from '../../styles/theme';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: 'relative', marginTop: theme.spacing.sm }}>
            <pre style={{
                backgroundColor: theme.colors.surfaceHover,
                padding: theme.spacing.md,
                borderRadius: theme.radii.md,
                overflowX: 'auto',
                fontFamily: 'monospace',
                fontSize: theme.typography.size.sm,
                color: theme.colors.text.primary,
                margin: 0,
            }}>
                <code>{code}</code>
            </pre>
            <button
                onClick={handleCopy}
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radii.sm,
                    cursor: 'pointer',
                    padding: '4px',
                    color: theme.colors.text.secondary,
                    transition: theme.transitions.fast,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    opacity: 0.7,
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                title="Copy code"
            >
                {copied ? <Check size={14} color={theme.colors.success.base} /> : <Copy size={14} />}
            </button>
        </div>
    );
};

export default CodeBlock;
