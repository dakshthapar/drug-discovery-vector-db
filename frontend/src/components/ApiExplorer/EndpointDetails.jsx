import React from 'react';
import TryItOutPanel from './TryItOutPanel';

function EndpointDetails({ endpoint }) {
    if (!endpoint) return <div className="endpoint-details empty">Select an endpoint to view details</div>;

    return (
        <div className="endpoint-details">
            <header className="details-header">
                <span className={`method-badge large ${endpoint.method.toLowerCase()}`}>
                    {endpoint.method}
                </span>
                <h2>{endpoint.path}</h2>
            </header>

            <p className="description">{endpoint.description}</p>

            <div className="schema-section">
                <h3>Request Schema</h3>
                {endpoint.request_body ? (
                    <pre>{JSON.stringify(endpoint.request_body, null, 2)}</pre>
                ) : (
                    <p className="no-data">No request body</p>
                )}
            </div>

            <div className="schema-section">
                <h3>Response Schema</h3>
                {endpoint.response_body ? (
                    <pre>{JSON.stringify(endpoint.response_body, null, 2)}</pre>
                ) : (
                    <p className="no-data">No response body</p>
                )}
            </div>

            <TryItOutPanel endpoint={endpoint} />
        </div>
    );
}

export default EndpointDetails;
