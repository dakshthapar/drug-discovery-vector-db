use axum::{
    extract::{State, Path, Query, Json},
    response::IntoResponse,
    http::StatusCode,
};
use crate::store::collection::SharedCollectionManager;
use crate::api::models::*;
use std::time::Instant;

// Collection Management Handlers

pub async fn create_collection(
    State(manager): State<SharedCollectionManager>,
    Json(payload): Json<CreateCollectionRequest>,
) -> impl IntoResponse {
    let mut manager = manager.write();
    match manager.create_collection(payload.name.clone(), payload.dimension) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!({
            "status": "created",
            "name": payload.name,
            "dimension": payload.dimension
        }))).into_response(),
        Err(e) => (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

pub async fn list_collections(
    State(manager): State<SharedCollectionManager>,
) -> impl IntoResponse {
    let manager = manager.read();
    let collections: Vec<CollectionInfo> = manager.list_collections()
        .iter()
        .map(|c| CollectionInfo {
            name: c.name.clone(),
            dimension: c.dimension,
            num_vectors: c.store.docs.len(),
            created_at: c.created_at,
        })
        .collect();
    
    (StatusCode::OK, Json(ListCollectionsResponse { collections })).into_response()
}

pub async fn delete_collection(
    State(manager): State<SharedCollectionManager>,
    Path(name): Path<String>,
) -> impl IntoResponse {
    let mut manager = manager.write();
    match manager.delete_collection(&name) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "status": "deleted" }))).into_response(),
        Err(e) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

// Updated Vector Handlers with Collection Support

pub async fn insert_vector(
    State(manager): State<SharedCollectionManager>,
    Query(params): Query<CollectionQuery>,
    Json(payload): Json<InsertRequest>,
) -> impl IntoResponse {
    let collection_name = params.collection.unwrap_or_else(|| "default".to_string());
    let mut manager = manager.write();
    
    if let Some(collection) = manager.get_collection_mut(&collection_name) {
        match collection.store.insert(payload.id.clone(), payload.vector, payload.metadata.unwrap_or_default()) {
            Ok(_) => (StatusCode::OK, Json(InsertResponse { 
                status: "ok".to_string(), 
                id: payload.id 
            })).into_response(),
            Err(e) => (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e }))).into_response(),
        }
    } else {
        (StatusCode::NOT_FOUND, Json(serde_json::json!({ 
            "error": format!("Collection '{}' not found", collection_name) 
        }))).into_response()
    }
}

pub async fn search_vectors(
    State(manager): State<SharedCollectionManager>,
    Query(params): Query<CollectionQuery>,
    Json(payload): Json<SearchRequest>,
) -> impl IntoResponse {
    let collection_name = params.collection.unwrap_or_else(|| "default".to_string());
    let start = Instant::now();
    let manager = manager.read();
    
    if let Some(collection) = manager.get_collection(&collection_name) {
        let results = collection.store.search(&payload.vector, payload.top_k, payload.metric);
        
        let search_results: Vec<SearchResult> = results.into_iter().map(|(id, score)| {
            let doc = collection.store.get(&id).unwrap();
            let vector = collection.store.get_vector(&id).unwrap_or_default();
            SearchResult {
                id,
                score,
                vector,
                metadata: doc.metadata.clone(),
            }
        }).collect();

        let elapsed = start.elapsed().as_secs_f64() * 1000.0;

        (StatusCode::OK, Json(SearchResponse {
            results: search_results,
            stats: SearchStats { elapsed_ms: elapsed },
        })).into_response()
    } else {
        (StatusCode::NOT_FOUND, Json(serde_json::json!({ 
            "error": format!("Collection '{}' not found", collection_name) 
        }))).into_response()
    }
}

pub async fn get_stats(
    State(manager): State<SharedCollectionManager>,
    Query(params): Query<CollectionQuery>,
) -> impl IntoResponse {
    let collection_name = params.collection.unwrap_or_else(|| "default".to_string());
    let manager = manager.read();
    
    if let Some(collection) = manager.get_collection(&collection_name) {
        let num_vectors = collection.store.docs.len();
        let dim = collection.store.dim;
        let mem_bytes_approx = num_vectors * dim * 4;

        (StatusCode::OK, Json(StatsResponse {
            num_vectors,
            dim,
            mem_bytes_approx,
        })).into_response()
    } else {
        (StatusCode::NOT_FOUND, Json(serde_json::json!({ 
            "error": format!("Collection '{}' not found", collection_name) 
        }))).into_response()
    }
}

pub async fn bulk_insert(
    State(manager): State<SharedCollectionManager>,
    Query(params): Query<CollectionQuery>,
    Json(payload): Json<BulkInsertRequest>,
) -> impl IntoResponse {
    let collection_name = params.collection.unwrap_or_else(|| "default".to_string());
    let mut manager = manager.write();
    
    if let Some(collection) = manager.get_collection_mut(&collection_name) {
        let mut inserted = 0;
        let mut errors = Vec::new();

        for item in payload.items {
            match collection.store.insert(item.id.clone(), item.vector, item.metadata.unwrap_or_default()) {
                Ok(_) => inserted += 1,
                Err(e) => errors.push(BulkInsertError { id: item.id, error: e }),
            }
        }

        (StatusCode::OK, Json(BulkInsertResponse {
            status: "ok".to_string(),
            inserted,
            errors,
        })).into_response()
    } else {
        (StatusCode::NOT_FOUND, Json(serde_json::json!({ 
            "error": format!("Collection '{}' not found", collection_name) 
        }))).into_response()
    }
}

pub async fn get_vector(
    State(manager): State<SharedCollectionManager>,
    Query(params): Query<CollectionQuery>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let collection_name = params.collection.unwrap_or_else(|| "default".to_string());
    let manager = manager.read();
    
    if let Some(collection) = manager.get_collection(&collection_name) {
        if let Some(doc) = collection.store.get(&id) {
            (StatusCode::OK, Json(DocumentResponse {
                id: doc.id.clone(),
                metadata: doc.metadata.clone(),
            })).into_response()
        } else {
            (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Vector not found" }))).into_response()
        }
    } else {
        (StatusCode::NOT_FOUND, Json(serde_json::json!({ 
            "error": format!("Collection '{}' not found", collection_name) 
        }))).into_response()
    }
}

pub async fn health_check() -> impl IntoResponse {
    "OK"
}

pub async fn get_api_spec() -> impl IntoResponse {
    let spec = crate::api_spec::builder::SpecBuilder::build();
    (StatusCode::OK, Json(spec)).into_response()
}
