use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::core::types::Metric;

#[derive(Deserialize)]
pub struct InsertRequest {
    pub id: String,
    pub vector: Vec<f32>,
    pub metadata: Option<HashMap<String, String>>,
}

#[derive(Serialize)]
pub struct InsertResponse {
    pub status: String,
    pub id: String,
}

#[derive(Deserialize)]
pub struct SearchRequest {
    pub vector: Vec<f32>,
    pub top_k: usize,
    pub metric: Metric,
    pub filter: Option<HashMap<String, String>>,
}

#[derive(Serialize)]
pub struct SearchResult {
    pub id: String,
    pub score: f32,
    pub metadata: HashMap<String, String>,
}

#[derive(Serialize)]
pub struct SearchResponse {
    pub results: Vec<SearchResult>,
    pub stats: SearchStats,
}

#[derive(Serialize)]
pub struct SearchStats {
    pub elapsed_ms: f64,
}

#[derive(Deserialize)]
pub struct BulkInsertRequest {
    pub items: Vec<InsertRequest>,
}

#[derive(Serialize)]
pub struct BulkInsertResponse {
    pub status: String,
    pub inserted: usize,
    pub errors: Vec<BulkInsertError>,
}

#[derive(Serialize)]
pub struct BulkInsertError {
    pub id: String,
    pub error: String,
}

#[derive(Serialize)]
pub struct StatsResponse {
    pub num_vectors: usize,
    pub dim: usize,
    pub mem_bytes_approx: usize,
}

#[derive(Serialize)]
pub struct DocumentResponse {
    pub id: String,
    pub metadata: HashMap<String, String>,
    // Vector is optional, maybe hidden by default
}
