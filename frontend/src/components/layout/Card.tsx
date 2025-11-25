import React from 'react';
import { theme } from '../../styles/theme';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div
            className={className}
            style={{
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.lg,
                padding: theme.spacing.xl,
                boxShadow: theme.shadows.sm,
                marginBottom: theme.spacing.xl,
                transition: `transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast}`,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = theme.shadows.md;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = theme.shadows.sm;
            }}
        >
            {children}
        </div>
    );
};

export default Card;
