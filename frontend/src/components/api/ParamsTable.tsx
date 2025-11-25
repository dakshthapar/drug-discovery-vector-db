import React from 'react';
import { theme } from '../../styles/theme';

interface Param {
    name: string;
    type: string;
    required: boolean;
    description?: string;
}

interface ParamsTableProps {
    params: Param[];
}

const ParamsTable: React.FC<ParamsTableProps> = ({ params }) => {
    if (!params || params.length === 0) return null;

    return (
        <div style={{ overflowX: 'auto', marginBottom: theme.spacing.lg }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                        <th style={{ padding: theme.spacing.sm, fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>Name</th>
                        <th style={{ padding: theme.spacing.sm, fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>Type</th>
                        <th style={{ padding: theme.spacing.sm, fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {params.map((param) => (
                        <tr key={param.name} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                            <td style={{ padding: theme.spacing.sm, fontWeight: theme.typography.weight.medium }}>
                                {param.name}
                                {param.required && <span style={{ color: theme.colors.error.base, marginLeft: '4px' }}>*</span>}
                            </td>
                            <td style={{ padding: theme.spacing.sm, fontFamily: 'monospace', fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                {param.type}
                            </td>
                            <td style={{ padding: theme.spacing.sm, fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
                                {param.description || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ParamsTable;
