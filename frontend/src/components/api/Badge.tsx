import React from 'react';
import { theme } from '../../styles/theme';

interface BadgeProps {
    type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'status' | string;
    children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ type, children }) => {
    let bg = theme.colors.surface;
    let color = theme.colors.text.primary;

    const method = type.toString().toLowerCase();

    if (method === 'get') {
        bg = '#e0f2fe'; // sky-100
        color = '#0369a1'; // sky-700
    } else if (method === 'post') {
        bg = '#dcfce7'; // green-100
        color = '#15803d'; // green-700
    } else if (method === 'put') {
        bg = '#fef3c7'; // amber-100
        color = '#b45309'; // amber-700
    } else if (method === 'delete') {
        bg = '#fee2e2'; // red-100
        color = '#b91c1c'; // red-700
    } else if (type === 'status') {
        bg = theme.colors.surfaceHover;
        color = theme.colors.text.secondary;
    }

    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: theme.radii.md,
            fontSize: theme.typography.size.xs,
            fontWeight: theme.typography.weight.bold,
            backgroundColor: bg,
            color: color,
            textTransform: 'uppercase',
            minWidth: '50px',
            textAlign: 'center',
        }}>
            {children}
        </span>
    );
};

export default Badge;
