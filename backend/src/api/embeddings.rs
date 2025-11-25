use axum::{
    extract::Extension,
    Json,
    response::IntoResponse,
    http::StatusCode,
};
use std::sync::Arc;
use serde_json::json;
use crate::embeddings::{
    service::EmbeddingService,
    models::{
        GenerateEmbeddingRequest, GenerateEmbeddingResponse,
        EmbedAndInsertRequest, EmbedAndInsertResponse,
        SemanticSearchRequest, SemanticSearchResponse,
    },
};

pub async fn generate_embedding(
    Extension(service): Extension<Arc<EmbeddingService>>,
    Json(payload): Json<GenerateEmbeddingRequest>,
) -> impl IntoResponse {
    match service.embed_text(&payload.text, &payload.model).await {
        Ok(vector) => {
            let response = GenerateEmbeddingResponse {
                dimension: vector.len(),
                vector,
            };
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        }
    }
}

pub async fn embed_and_insert(
    Extension(service): Extension<Arc<EmbeddingService>>,
    Json(payload): Json<EmbedAndInsertRequest>,
) -> impl IntoResponse {
    match service.embed_and_insert(
        payload.id,
        payload.text,
        payload.model,
        payload.metadata,
    ).await {
        Ok((dimension, id)) => {
            let response = EmbedAndInsertResponse {
                status: "ok".to_string(),
                id,
                dimension,
            };
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        }
    }
}

pub async fn semantic_search(
    Extension(service): Extension<Arc<EmbeddingService>>,
    Json(payload): Json<SemanticSearchRequest>,
) -> impl IntoResponse {
    match service.semantic_search(payload.query, payload.k).await {
        Ok(results) => {
            let response = SemanticSearchResponse {
                results,
            };
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        }
    }
}
