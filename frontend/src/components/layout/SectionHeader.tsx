import React from 'react';
import { theme } from '../../styles/theme';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon: Icon }) => {
    return (
        <div style={{ marginBottom: theme.spacing.md }}>
            <h2 style={{
                fontSize: theme.typography.size.xxl,
                fontWeight: theme.typography.weight.semibold,
                color: theme.colors.text.primary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
            }}>
                {Icon && <Icon size={20} style={{ color: theme.colors.primary.base }} />}
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
