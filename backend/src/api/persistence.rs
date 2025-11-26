use axum::{
    extract::State,
    response::IntoResponse,
    http::StatusCode,
    Json,
};
use crate::store::collection::SharedCollectionManager;
use crate::store::snapshot::{save_snapshot, load_snapshot};
use std::fs;
use std::path::Path;

pub async fn save_collections(
    State(manager): State<SharedCollectionManager>,
) -> impl IntoResponse {
    let manager = manager.read();
    let collections_dir = "collections";
    
    // Create collections directory if it doesn't exist
    if let Err(e) = fs::create_dir_all(collections_dir) {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
            "error": format!("Failed to create collections directory: {}", e)
        }))).into_response();
    }
    
    let mut saved_count = 0;
    let mut errors = Vec::new();
    
    for collection in manager.list_collections() {
        let path = format!("{}/{}.bin", collections_dir, collection.name);
        match save_snapshot(&collection.store, &path) {
            Ok(_) => saved_count += 1,
            Err(e) => errors.push(format!("{}: {}", collection.name, e)),
        }
    }
    
    if errors.is_empty() {
        (StatusCode::OK, Json(serde_json::json!({
            "status": "saved",
            "collections_saved": saved_count
        }))).into_response()
    } else {
        (StatusCode::PARTIAL_CONTENT, Json(serde_json::json!({
            "status": "partial",
            "collections_saved": saved_count,
            "errors": errors
        }))).into_response()
    }
}

pub async fn load_collections(
    State(manager): State<SharedCollectionManager>,
) -> impl IntoResponse {
    let mut manager = manager.write();
    let collections_dir = "collections";
    
    if !Path::new(collections_dir).exists() {
        return (StatusCode::NOT_FOUND, Json(serde_json::json!({
            "error": "No saved collections found"
        }))).into_response();
    }
    
    let mut loaded_count = 0;
    let mut errors = Vec::new();
    
    // Read all .bin files from collections directory
    match fs::read_dir(collections_dir) {
        Ok(entries) => {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("bin") {
                    if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                        let path_str = path.to_string_lossy().to_string();
                        match load_snapshot(&path_str) {
                            Ok(store) => {
                                let dimension = store.dim;
                                // Create or replace collection
                                let _ = manager.delete_collection(name);
                                match manager.create_collection(name.to_string(), dimension) {
                                    Ok(_) => {
                                        if let Some(collection) = manager.get_collection_mut(name) {
                                            collection.store = store;
                                            loaded_count += 1;
                                        }
                                    }
                                    Err(e) => errors.push(format!("{}: {}", name, e)),
                                }
                            }
                            Err(e) => errors.push(format!("{}: {}", name, e)),
                        }
                    }
                }
            }
        }
        Err(e) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                "error": format!("Failed to read collections directory: {}", e)
            }))).into_response();
        }
    }
    
    if errors.is_empty() {
        (StatusCode::OK, Json(serde_json::json!({
            "status": "loaded",
            "collections_loaded": loaded_count
        }))).into_response()
    } else {
        (StatusCode::PARTIAL_CONTENT, Json(serde_json::json!({
            "status": "partial",
            "collections_loaded": loaded_count,
            "errors": errors
        }))).into_response()
    }
}
