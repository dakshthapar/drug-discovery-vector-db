import React from 'react';

function EndpointList({ endpoints, selectedEndpoint, onSelect }) {
    // Group endpoints by path prefix
    const grouped = endpoints.reduce((acc, endpoint) => {
        const prefix = endpoint.path.split('/')[1] || 'root';
        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push(endpoint);
        return acc;
    }, {});

    return (
        <div className="endpoint-list">
            {Object.entries(grouped).map(([prefix, items]) => (
                <div key={prefix} className="endpoint-group">
                    <h3>/{prefix}</h3>
                    <ul>
                        {items.map((endpoint) => (
                            <li
                                key={`${endpoint.method}-${endpoint.path}`}
                                className={selectedEndpoint === endpoint ? 'active' : ''}
                                onClick={() => onSelect(endpoint)}
                            >
                                <span className={`method-badge ${endpoint.method.toLowerCase()}`}>
                                    {endpoint.method}
                                </span>
                                <span className="path">{endpoint.path}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default EndpointList;
