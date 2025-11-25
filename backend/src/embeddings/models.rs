use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmbeddingRequest {
    pub input: String,
    pub model: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmbeddingResponse {
    pub object: String,
    pub data: Vec<EmbeddingData>,
    pub model: String,
    pub usage: Usage,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmbeddingData {
    pub object: String,
    pub index: usize,
    pub embedding: Vec<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Usage {
    pub prompt_tokens: usize,
    pub total_tokens: usize,
}

// API Request/Response models

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GenerateEmbeddingRequest {
    pub text: String,
    #[serde(default = "default_model")]
    pub model: String,
}

fn default_model() -> String {
    "text-embedding-3-small".to_string()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GenerateEmbeddingResponse {
    pub vector: Vec<f32>,
    pub dimension: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmbedAndInsertRequest {
    pub id: String,
    pub text: String,
    #[serde(default = "default_model")]
    pub model: String,
    pub metadata: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmbedAndInsertResponse {
    pub status: String,
    pub id: String,
    pub dimension: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SemanticSearchRequest {
    pub query: String,
    pub k: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SemanticSearchResult {
    pub id: String,
    pub score: f32,
    pub metadata: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SemanticSearchResponse {
    pub results: Vec<SemanticSearchResult>,
}
