import React from 'react';
import { theme } from '../../styles/theme';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
    return (
        <div style={{ marginBottom: theme.spacing.md }}>
            <h2 style={{
                fontSize: theme.typography.size.xxl,
                fontWeight: theme.typography.weight.semibold,
                color: theme.colors.text.primary,
                margin: 0,
            }}>
                {title}
            </h2>
            {subtitle && (
                <p style={{
                    fontSize: theme.typography.size.sm,
                    color: theme.colors.text.secondary,
                    margin: '4px 0 0 0',
                }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default SectionHeader;
