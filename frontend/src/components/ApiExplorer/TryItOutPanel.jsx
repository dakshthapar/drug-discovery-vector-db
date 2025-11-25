import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080';

function TryItOutPanel({ endpoint }) {
    const [params, setParams] = useState({});
    const [body, setBody] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Reset state when endpoint changes
        setParams({});
        setBody(endpoint.example_request ? JSON.stringify(endpoint.example_request, null, 2) : '');
        setResponse(null);
    }, [endpoint]);

    const handleSend = async () => {
        setLoading(true);
        setResponse(null);

        try {
            let url = `${API_URL}${endpoint.path}`;

            // Replace path params
            endpoint.path_params.forEach(param => {
                url = url.replace(`:${param.name}`, params[param.name] || '');
            });

            const options = {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (endpoint.method !== 'GET' && body) {
                try {
                    JSON.parse(body); // Validate JSON
                    options.body = body;
                } catch (e) {
                    alert('Invalid JSON body');
                    setLoading(false);
                    return;
                }
            }

            const start = performance.now();
            const res = await fetch(url, options);
            const end = performance.now();

            const data = await res.json();

            setResponse({
                status: res.status,
                statusText: res.statusText,
                time: (end - start).toFixed(2),
                data: data
            });
        } catch (err) {
            setResponse({
                error: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="try-it-out">
            <h3>⚡ Try It Out</h3>

            {endpoint.path_params.length > 0 && (
                <div className="params-section">
                    <h4>Path Parameters</h4>
                    {endpoint.path_params.map(param => (
                        <div key={param.name} className="form-group">
                            <label>{param.name} {param.required && '*'}</label>
                            <input
                                type="text"
                                value={params[param.name] || ''}
                                onChange={e => setParams({ ...params, [param.name]: e.target.value })}
                                placeholder={param.description}
                            />
                        </div>
                    ))}
                </div>
            )}

            {endpoint.method !== 'GET' && (
                <div className="body-section">
                    <h4>Request Body</h4>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        rows={10}
                        className="code-editor"
                    />
                </div>
            )}

            <button
                className="send-btn"
                onClick={handleSend}
                disabled={loading}
            >
                {loading ? 'Sending...' : 'Send Request'}
            </button>

            {response && (
                <div className="response-section">
                    <h4>Response</h4>
                    <div className="response-meta">
                        <span className={`status ${response.status < 400 ? 'success' : 'error'}`}>
                            {response.status} {response.statusText}
                        </span>
                        {response.time && <span className="time">{response.time}ms</span>}
                    </div>
                    <pre className="response-body">
                        {JSON.stringify(response.data || response.error, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default TryItOutPanel;
