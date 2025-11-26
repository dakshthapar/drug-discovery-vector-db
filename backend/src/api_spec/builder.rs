use super::models::{ApiSpec, EndpointSpec, ParamSpec};
use serde_json::json;

pub struct SpecBuilder;

impl SpecBuilder {
    pub fn build() -> ApiSpec {
        ApiSpec {
            service: "VectorDB".to_string(),
            version: "2.0".to_string(),
            endpoints: vec![
                // Collection Management
                EndpointSpec {
                    name: "Create Collection".to_string(),
                    method: "POST".to_string(),
                    path: "/collections".to_string(),
                    description: "Create a new collection with specified dimension.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: Some(json!({
                        "name": "string",
                        "dimension": "integer"
                    })),
                    response_body: Some(json!({
                        "status": "created",
                        "name": "string",
                        "dimension": "integer"
                    })),
                    example_request: Some(json!({
                        "name": "text_embeddings",
                        "dimension": 768
                    })),
                    example_response: Some(json!({
                        "status": "created",
                        "name": "text_embeddings",
                        "dimension": 768
                    })),
                },
                EndpointSpec {
                    name: "List Collections".to_string(),
                    method: "GET".to_string(),
                    path: "/collections".to_string(),
                    description: "List all collections with their metadata.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: None,
                    response_body: Some(json!({
                        "collections": [{
                            "name": "string",
                            "dimension": "integer",
                            "num_vectors": "integer",
                            "created_at": "integer"
                        }]
                    })),
                    example_request: None,
                    example_response: Some(json!({
                        "collections": [
                            {
                                "name": "default",
                                "dimension": 3,
                                "num_vectors": 10,
                                "created_at": 1700000000
                            }
                        ]
                    })),
                },
                EndpointSpec {
                    name: "Delete Collection".to_string(),
                    method: "DELETE".to_string(),
                    path: "/collections/:name".to_string(),
                    description: "Delete a collection by name.".to_string(),
                    path_params: vec![ParamSpec {
                        name: "name".to_string(),
                        r#type: "string".to_string(),
                        required: true,
                        description: Some("The name of the collection to delete".to_string()),
                    }],
                    query_params: vec![],
                    request_body: None,
                    response_body: Some(json!({ "status": "deleted" })),
                    example_request: None,
                    example_response: Some(json!({ "status": "deleted" })),
                },
                
                // Vector Operations
                EndpointSpec {
                    name: "Insert Vector".to_string(),
                    method: "POST".to_string(),
                    path: "/vectors".to_string(),
                    description: "Insert a new vector into a collection.".to_string(),
                    path_params: vec![],
                    query_params: vec![ParamSpec {
                        name: "collection".to_string(),
                        r#type: "string".to_string(),
                        required: false,
                        description: Some("Collection name (defaults to 'default')".to_string()),
                    }],
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
                EndpointSpec {
                    name: "Bulk Insert Vectors".to_string(),
                    method: "POST".to_string(),
                    path: "/vectors/bulk".to_string(),
                    description: "Insert multiple vectors in a single request.".to_string(),
                    path_params: vec![],
                    query_params: vec![ParamSpec {
                        name: "collection".to_string(),
                        r#type: "string".to_string(),
                        required: false,
                        description: Some("Collection name (defaults to 'default')".to_string()),
                    }],
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
                EndpointSpec {
                    name: "Search Vectors".to_string(),
                    method: "POST".to_string(),
                    path: "/search".to_string(),
                    description: "Search for k-nearest neighbors in a collection.".to_string(),
                    path_params: vec![],
                    query_params: vec![ParamSpec {
                        name: "collection".to_string(),
                        r#type: "string".to_string(),
                        required: false,
                        description: Some("Collection name (defaults to 'default')".to_string()),
                    }],
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
                            "vector": "float[]",
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
                            { 
                                "id": "vec1", 
                                "score": 0.99, 
                                "vector": [0.1, 0.2, 0.3],
                                "metadata": {} 
                            }
                        ],
                        "stats": { "elapsed_ms": 1.2 }
                    })),
                },
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
                    query_params: vec![ParamSpec {
                        name: "collection".to_string(),
                        r#type: "string".to_string(),
                        required: false,
                        description: Some("Collection name (defaults to 'default')".to_string()),
                    }],
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
                EndpointSpec {
                    name: "Get Stats".to_string(),
                    method: "GET".to_string(),
                    path: "/stats".to_string(),
                    description: "Get collection statistics.".to_string(),
                    path_params: vec![],
                    query_params: vec![ParamSpec {
                        name: "collection".to_string(),
                        r#type: "string".to_string(),
                        required: false,
                        description: Some("Collection name (defaults to 'default')".to_string()),
                    }],
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
                
                // Persistence
                EndpointSpec {
                    name: "Save Collections".to_string(),
                    method: "POST".to_string(),
                    path: "/save".to_string(),
                    description: "Save all collections to disk.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: None,
                    response_body: Some(json!({ 
                        "status": "saved",
                        "collections_saved": "integer"
                    })),
                    example_request: None,
                    example_response: Some(json!({ 
                        "status": "saved",
                        "collections_saved": 2
                    })),
                },
                EndpointSpec {
                    name: "Load Collections".to_string(),
                    method: "POST".to_string(),
                    path: "/load".to_string(),
                    description: "Load all collections from disk.".to_string(),
                    path_params: vec![],
                    query_params: vec![],
                    request_body: None,
                    response_body: Some(json!({ 
                        "status": "loaded",
                        "collections_loaded": "integer"
                    })),
                    example_request: None,
                    example_response: Some(json!({ 
                        "status": "loaded",
                        "collections_loaded": 2
                    })),
                },
            ],
        }
    }
}
