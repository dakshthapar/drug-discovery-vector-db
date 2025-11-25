use super::models::{ApiSpec, EndpointSpec, ParamSpec};
use serde_json::json;

pub struct SpecBuilder;

impl SpecBuilder {
    pub fn build() -> ApiSpec {
        ApiSpec {
            service: "VectorDB".to_string(),
            version: "1.0".to_string(),
            endpoints: vec![
                // POST /vectors
                EndpointSpec {
                    name: "Insert Vector".to_string(),
                    method: "POST".to_string(),
                    path: "/vectors".to_string(),
                    description: "Insert a new vector into the database.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: Some(json!({
                        "id": "string",
                        "vector": "float[]",
                        "metadata": "object?"
                    })),
                    response_body: Some(json!({
                        "status": "string",
                        "id": "string"
                    })),
                    example_request: Some(json!({
                        "id": "vec1",
                        "vector": [0.1, 0.2, 0.3],
                        "metadata": { "category": "test" }
                    })),
                    example_response: Some(json!({
                        "status": "ok",
                        "id": "vec1"
                    })),
                },
                // POST /vectors/bulk
                EndpointSpec {
                    name: "Bulk Insert Vectors".to_string(),
                    method: "POST".to_string(),
                    path: "/vectors/bulk".to_string(),
                    description: "Insert multiple vectors in a single request.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: Some(json!({
                        "items": [{
                            "id": "string",
                            "vector": "float[]",
                            "metadata": "object?"
                        }]
                    })),
                    response_body: Some(json!({
                        "status": "string",
                        "inserted": "integer",
                        "errors": [{ "id": "string", "error": "string" }]
                    })),
                    example_request: Some(json!({
                        "items": [
                            { "id": "v1", "vector": [0.1, 0.2], "metadata": {"a": "b"} },
                            { "id": "v2", "vector": [0.3, 0.4], "metadata": {} }
                        ]
                    })),
                    example_response: Some(json!({
                        "status": "ok",
                        "inserted": 2,
                        "errors": []
                    })),
                },
                // POST /search
                EndpointSpec {
                    name: "Search Vectors".to_string(),
                    method: "POST".to_string(),
                    path: "/search".to_string(),
                    description: "Search for k-nearest neighbors.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: Some(json!({
                        "vector": "float[]",
                        "top_k": "integer",
                        "metric": "cosine | euclidean | dot",
                        "filter": "object?"
                    })),
                    response_body: Some(json!({
                        "results": [{
                            "id": "string",
                            "score": "float",
                            "metadata": "object"
                        }],
                        "stats": { "elapsed_ms": "float" }
                    })),
                    example_request: Some(json!({
                        "vector": [0.1, 0.2, 0.3],
                        "top_k": 5,
                        "metric": "cosine"
                    })),
                    example_response: Some(json!({
                        "results": [
                            { "id": "vec1", "score": 0.99, "metadata": {} }
                        ],
                        "stats": { "elapsed_ms": 1.2 }
                    })),
                },
                // GET /vectors/:id
                EndpointSpec {
                    name: "Get Vector".to_string(),
                    method: "GET".to_string(),
                    path: "/vectors/:id".to_string(),
                    description: "Retrieve vector metadata by ID.".to_string(),
                    path_params: vec![ParamSpec {
                        name: "id".to_string(),
                        r#type: "string".to_string(),
                        required: true,
                        description: Some("The ID of the vector to retrieve".to_string()),
                    }],
                    query_params: vec![],
                    request_body: None,
                    response_body: Some(json!({
                        "id": "string",
                        "metadata": "object"
                    })),
                    example_request: None,
                    example_response: Some(json!({
                        "id": "vec1",
                        "metadata": { "type": "test" }
                    })),
                },
                // GET /stats
                EndpointSpec {
                    name: "Get Stats".to_string(),
                    method: "GET".to_string(),
                    path: "/stats".to_string(),
                    description: "Get database statistics.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: None,
                    response_body: Some(json!({
                        "num_vectors": "integer",
                        "dim": "integer",
                        "mem_bytes_approx": "integer"
                    })),
                    example_request: None,
                    example_response: Some(json!({
                        "num_vectors": 100,
                        "dim": 768,
                        "mem_bytes_approx": 307200
                    })),
                },
                // POST /save
                EndpointSpec {
                    name: "Save Snapshot".to_string(),
                    method: "POST".to_string(),
                    path: "/save".to_string(),
                    description: "Trigger a manual snapshot save.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: None,
                    response_body: Some(json!({ "status": "saved" })),
                    example_request: None,
                    example_response: Some(json!({ "status": "saved" })),
                },
                // POST /load
                EndpointSpec {
                    name: "Load Snapshot".to_string(),
                    method: "POST".to_string(),
                    path: "/load".to_string(),
                    description: "Trigger a manual snapshot load.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: None,
                    response_body: Some(json!({ "status": "loaded" })),
                    example_request: None,
                    example_response: Some(json!({ "status": "loaded" })),
                },
            ],
        }
    }
}
