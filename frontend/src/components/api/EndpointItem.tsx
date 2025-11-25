import React from 'react';
import { theme } from '../../styles/theme';
import Badge from './Badge';

interface EndpointItemProps {
    method: string;
    path: string;
    summary: string;
    isActive: boolean;
    onClick: () => void;
}

const EndpointItem: React.FC<EndpointItemProps> = ({ method, path, summary, isActive, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                cursor: 'pointer',
                borderLeft: isActive ? `3px solid ${theme.colors.primary.base}` : '3px solid transparent',
                backgroundColor: isActive ? theme.colors.surfaceHover : 'transparent',
                transition: theme.transitions.fast,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
            }}
            onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = theme.colors.surface;
            }}
            onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <Badge type={method}>{method}</Badge>
            <div style={{ overflow: 'hidden' }}>
                <div style={{
                    fontSize: theme.typography.size.sm,
                    fontWeight: theme.typography.weight.medium,
                    color: theme.colors.text.primary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {path}
                </div>
                <div style={{
                    fontSize: theme.typography.size.xs,
                    color: theme.colors.text.secondary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {summary}
                </div>
            </div>
        </div>
    );
};

export default EndpointItem;
