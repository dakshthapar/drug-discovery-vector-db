import React, { useEffect, useState } from 'react';
import { useApiSpecStore } from '../../store/apiSpecStore';
import EndpointGroup from '../../components/api/EndpointGroup';
import EndpointItem from '../../components/api/EndpointItem';
import EndpointDetails from '../../components/api/EndpointDetails';
import { theme } from '../../styles/theme';

const ApiDocs: React.FC = () => {
    const { spec, loading, error, fetchSpec } = useApiSpecStore();
    const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);

    useEffect(() => {
        fetchSpec();
    }, [fetchSpec]);

    if (loading) return <div style={{ padding: theme.spacing.xl }}>Loading API Spec...</div>;
    if (error) return <div style={{ padding: theme.spacing.xl, color: theme.colors.error.base }}>Error: {error}</div>;
    if (!spec) return null;

    // Group endpoints by prefix
    const groupedEndpoints = spec.endpoints.reduce((acc: any, endpoint: any) => {
        const prefix = endpoint.path.split('/')[1] || 'root';
        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push(endpoint);
        return acc;
    }, {});

    return (
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 60px)', // Account for navbar height
            overflow: 'hidden',
            background: theme.colors.background
        }}>
            {/* Sidebar */}
            <div style={{
                width: '320px',
                borderRight: `1px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{ padding: theme.spacing.lg, borderBottom: `1px solid ${theme.colors.border}` }}>
                    <h1 style={{ margin: 0, fontSize: theme.typography.size.lg }}>{spec.service}</h1>
                    <span style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>v{spec.version}</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: theme.spacing.sm }}>
                    {Object.entries(groupedEndpoints).map(([group, endpoints]: [string, any]) => (
                        <EndpointGroup key={group} name={group}>
                            {endpoints.map((endpoint: any) => (
                                <EndpointItem
                                    key={`${endpoint.method}-${endpoint.path}`}
                                    method={endpoint.method}
                                    path={endpoint.path}
                                    summary={endpoint.description}
                                    isActive={selectedEndpoint === endpoint}
                                    onClick={() => setSelectedEndpoint(endpoint)}
                                />
                            ))}
                        </EndpointGroup>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowY: 'auto', background: theme.colors.background }}>
                <EndpointDetails endpoint={selectedEndpoint} />
            </div>
        </div>
    );
};

export default ApiDocs;
