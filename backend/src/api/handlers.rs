use axum::{
    extract::{State, Path, Json},
    response::IntoResponse,
    http::StatusCode,
};
use crate::store::memory::SharedVectorStore;
use crate::api::models::*;
// use std::collections::HashMap;
use std::time::Instant;

pub async fn health_check() -> impl IntoResponse {
    "OK"
}

pub async fn insert_vector(
    State(store): State<SharedVectorStore>,
    Json(payload): Json<InsertRequest>,
) -> impl IntoResponse {
    let mut store = store.write();
    match store.insert(payload.id.clone(), payload.vector, payload.metadata.unwrap_or_default()) {
        Ok(_) => (StatusCode::OK, Json(InsertResponse { status: "ok".to_string(), id: payload.id })).into_response(),
        Err(e) => (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

pub async fn search_vectors(
    State(store): State<SharedVectorStore>,
    Json(payload): Json<SearchRequest>,
) -> impl IntoResponse {
    let start = Instant::now();
    let store = store.read();
    
    let results = store.search(&payload.vector, payload.top_k, payload.metric);
    
    let search_results: Vec<SearchResult> = results.into_iter().map(|(id, score)| {
        let doc = store.get(&id).unwrap();
        SearchResult {
            id,
            score,
            metadata: doc.metadata.clone(),
        }
    }).collect();

    let elapsed = start.elapsed().as_secs_f64() * 1000.0;

    (StatusCode::OK, Json(SearchResponse {
        results: search_results,
        stats: SearchStats { elapsed_ms: elapsed },
    })).into_response()
}

pub async fn bulk_insert(
    State(store): State<SharedVectorStore>,
    Json(payload): Json<BulkInsertRequest>,
) -> impl IntoResponse {
    let mut store = store.write();
    let mut inserted = 0;
    let mut errors = Vec::new();

    for item in payload.items {
        match store.insert(item.id.clone(), item.vector, item.metadata.unwrap_or_default()) {
            Ok(_) => inserted += 1,
            Err(e) => errors.push(BulkInsertError { id: item.id, error: e }),
        }
    }

    (StatusCode::OK, Json(BulkInsertResponse {
        status: "ok".to_string(),
        inserted,
        errors,
    })).into_response()
}

pub async fn get_vector(
    State(store): State<SharedVectorStore>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let store = store.read();
    if let Some(doc) = store.get(&id) {
        (StatusCode::OK, Json(DocumentResponse {
            id: doc.id.clone(),
            metadata: doc.metadata.clone(),
        })).into_response()
    } else {
        (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Vector not found" }))).into_response()
    }
}

pub async fn get_stats(
    State(store): State<SharedVectorStore>,
) -> impl IntoResponse {
    let store = store.read();
    let num_vectors = store.docs.len();
    let dim = store.dim;
    let mem_bytes_approx = num_vectors * dim * 4; // f32 = 4 bytes

    (StatusCode::OK, Json(StatsResponse {
        num_vectors,
        dim,
        mem_bytes_approx,
    })).into_response()
}

pub async fn save_db(
    State(store): State<SharedVectorStore>,
) -> impl IntoResponse {
    let store = store.read();
    // We need config to know where to save. 
    // For now, let's assume a default path or pass it via config state if we had it.
    // But we only have SharedVectorStore in State.
    // Let's use a hardcoded path or env var for now, or better, update State to include Config.
    // For MVP, let's just use "snapshot.bin" or read env.
    let path = std::env::var("SNAPSHOT_PATH").unwrap_or_else(|_| "snapshot.bin".to_string());
    
    match crate::store::snapshot::save_snapshot(&store, &path) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "status": "saved" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

// Load is tricky because it replaces the store. 
// But we have Arc<RwLock<VectorStore>>. We can write to it.
// But load_snapshot returns a NEW VectorStore.
// We can overwrite the fields of the existing one.
pub async fn load_db(
    State(store): State<SharedVectorStore>,
) -> impl IntoResponse {
    let path = std::env::var("SNAPSHOT_PATH").unwrap_or_else(|_| "snapshot.bin".to_string());
    match crate::store::snapshot::load_snapshot(&path) {
        Ok(new_store) => {
            let mut store = store.write();
            store.vectors = new_store.vectors;
            store.norms = new_store.norms;
            store.docs = new_store.docs;
            store.id_to_index = new_store.id_to_index;
            // Keep the existing WAL or replace it? 
            // Usually load implies state reset.
            // But we should probably keep the WAL writer if we want to continue writing.
            // However, the loaded store has wal: None.
            // We should preserve the old wal or re-initialize it.
            // Let's preserve the old wal.
            // store.wal is already there.
            
            (StatusCode::OK, Json(serde_json::json!({ "status": "loaded" }))).into_response()
        },
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

pub async fn get_api_spec() -> impl IntoResponse {
    let spec = crate::api_spec::builder::SpecBuilder::build();
    (StatusCode::OK, Json(spec)).into_response()
}
