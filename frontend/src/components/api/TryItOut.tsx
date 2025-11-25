import React, { useState, useEffect } from 'react';
import { theme } from '../../styles/theme';
import ResponseViewer from './ResponseViewer';

const API_URL = 'http://localhost:8080';

interface TryItOutProps {
    endpoint: any;
}

const TryItOut: React.FC<TryItOutProps> = ({ endpoint }) => {
    const [params, setParams] = useState<Record<string, string>>({});
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

    useEffect(() => {
        setParams({});
        setBody(endpoint.example_request ? JSON.stringify(endpoint.example_request, null, 2) : '');
        setResponse(null);
    }, [endpoint]);

    const handleSend = async () => {
        setLoading(true);
        setResponse(null);

        try {
            let url = `${API_URL}${endpoint.path}`;
            endpoint.path_params.forEach((p: any) => {
                url = url.replace(`:${p.name}`, params[p.name] || '');
            });

            const options: any = {
                method: endpoint.method,
                headers: { 'Content-Type': 'application/json' },
            };

            if (endpoint.method !== 'GET' && body) {
                options.body = body;
            }

            const start = performance.now();
            const res = await fetch(url, options);
            const end = performance.now();
            const data = await res.json();

            setResponse({
                status: res.status,
                statusText: res.statusText,
                time: (end - start).toFixed(2),
                data,
            });
        } catch (err: any) {
            setResponse({
                status: 0,
                statusText: 'Error',
                time: '0',
                data: { error: err.message },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: theme.spacing.xl, padding: theme.spacing.lg, background: theme.colors.surface, borderRadius: theme.radii.lg }}>
            <h3 style={{ fontSize: theme.typography.size.lg, marginBottom: theme.spacing.md }}>Try It Out</h3>

            {endpoint.path_params.length > 0 && (
                <div style={{ marginBottom: theme.spacing.md }}>
                    <h4 style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>Path Parameters</h4>
                    {endpoint.path_params.map((p: any) => (
                        <div key={p.name} style={{ marginBottom: theme.spacing.sm }}>
                            <label style={{ display: 'block', fontSize: theme.typography.size.xs, marginBottom: '4px' }}>{p.name} {p.required && '*'}</label>
                            <input
                                type="text"
                                value={params[p.name] || ''}
                                onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${theme.colors.border}`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {endpoint.method !== 'GET' && (
                <div style={{ marginBottom: theme.spacing.md }}>
                    <h4 style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>Request Body</h4>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={8}
                        style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${theme.colors.border}`,
                            fontFamily: 'monospace',
                        }}
                    />
                </div>
            )}

            <button
                onClick={handleSend}
                disabled={loading}
                style={{
                    background: theme.colors.primary.base,
                    color: '#fff',
                    padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
                    borderRadius: theme.radii.md,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: theme.typography.weight.medium,
                }}
            >
                {loading ? 'Sending...' : 'Send Request'}
            </button>

            {response && <ResponseViewer {...response} />}
        </div>
    );
};

export default TryItOut;
