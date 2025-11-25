import React from 'react';
import { theme } from '../../styles/theme';
import Badge from './Badge';
import ParamsTable from './ParamsTable';
import CodeBlock from './CodeBlock';
import TryItOut from './TryItOut';

interface EndpointDetailsProps {
    endpoint: any;
}

const EndpointDetails: React.FC<EndpointDetailsProps> = ({ endpoint }) => {
    if (!endpoint) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.colors.text.muted,
                fontSize: theme.typography.size.lg,
            }}>
                Select an endpoint to view details
            </div>
        );
    }

    return (
        <div style={{ padding: theme.spacing.xl, animation: `fadeIn ${theme.transitions.default}` }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

            <div style={{ marginBottom: theme.spacing.lg, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: theme.spacing.lg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                    <Badge type={endpoint.method}>{endpoint.method}</Badge>
                    <h2 style={{ margin: 0, fontSize: theme.typography.size.xl, color: theme.colors.text.primary }}>{endpoint.path}</h2>
                </div>
                <p style={{ margin: 0, color: theme.colors.text.secondary }}>{endpoint.description}</p>
            </div>

            {(endpoint.path_params.length > 0 || endpoint.query_params.length > 0) && (
                <div style={{ marginBottom: theme.spacing.xl }}>
                    <h3 style={{ fontSize: theme.typography.size.lg, marginBottom: theme.spacing.md }}>Parameters</h3>
                    <ParamsTable params={[...endpoint.path_params, ...endpoint.query_params]} />
                </div>
            )}

            {endpoint.request_body && (
                <div style={{ marginBottom: theme.spacing.xl }}>
                    <h3 style={{ fontSize: theme.typography.size.lg, marginBottom: theme.spacing.md }}>Request Body</h3>
                    <CodeBlock code={JSON.stringify(endpoint.request_body, null, 2)} />
                </div>
            )}

            {endpoint.response_body && (
                <div style={{ marginBottom: theme.spacing.xl }}>
                    <h3 style={{ fontSize: theme.typography.size.lg, marginBottom: theme.spacing.md }}>Response Body</h3>
                    <CodeBlock code={JSON.stringify(endpoint.response_body, null, 2)} />
                </div>
            )}

            <TryItOut endpoint={endpoint} />
        </div>
    );
};

export default EndpointDetails;
