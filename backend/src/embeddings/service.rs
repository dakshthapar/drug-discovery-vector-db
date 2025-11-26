use std::env;
use std::sync::Arc;
use reqwest::Client;
use serde_json::{json, Value};
use anyhow::{Result, anyhow, Context};
use crate::core::types::Metric;
use crate::store::memory::SharedVectorStore;
use crate::embeddings::models::{
    EmbeddingRequest, EmbeddingResponse, SemanticSearchResult,
};
use std::collections::HashMap;

#[derive(Clone)]
pub struct EmbeddingService {
    client: Client,
    api_key: String,
    store: SharedVectorStore,
}

impl EmbeddingService {
    pub fn new(store: SharedVectorStore) -> Result<Self> {
        let api_key = env::var("GEMINI_API_KEY")
            .context("GEMINI_API_KEY must be set")?;
        
        Ok(Self {
            client: Client::new(),
            api_key,
            store,
        })
    }

    pub async fn embed_text(&self, text: &str, model: &str) -> Result<Vec<f32>> {
        if text.trim().is_empty() {
            return Err(anyhow!("Text cannot be empty"));
        }

        // Gemini API endpoint for embeddings
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:embedContent?key={}",
            model, self.api_key
        );

        let request_body = json!({
            "content": {
                "parts": [{
                    "text": text
                }]
            }
        });

        let response = self.client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await
            .context("Failed to send request to Gemini API")?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow!("Gemini API error: {}", error_text));
        }

        let response_json: Value = response.json().await
            .context("Failed to parse Gemini response")?;

        // Extract embedding from Gemini response
        if let Some(embedding) = response_json["embedding"]["values"].as_array() {
            let vector: Vec<f32> = embedding
                .iter()
                .filter_map(|v| v.as_f64().map(|f| f as f32))
                .collect();
            
            if vector.is_empty() {
                return Err(anyhow!("Empty embedding returned from Gemini"));
            }
            
            Ok(vector)
        } else {
            Err(anyhow!("Invalid response format from Gemini API"))
        }
    }

    pub async fn embed_and_insert(
        &self,
        id: String,
        text: String,
        model: String,
        metadata: Option<Value>,
    ) -> Result<(usize, String)> {
        let vector = self.embed_text(&text, &model).await?;
        let dimension = vector.len();

        // Convert metadata from Option<Value> to HashMap<String, String>
        let metadata_map = if let Some(meta) = metadata {
            if let Some(obj) = meta.as_object() {
                obj.iter()
                    .filter_map(|(k, v)| {
                        v.as_str().map(|s| (k.clone(), s.to_string()))
                    })
                    .collect()
            } else {
                HashMap::new()
            }
        } else {
            HashMap::new()
        };

        let mut store = self.store.write();
        store.insert(id.clone(), vector, metadata_map)
            .map_err(|e| anyhow!("Failed to insert vector: {}", e))?;

        Ok((dimension, id))
    }

    pub async fn semantic_search(
        &self,
        query: String,
        k: usize,
    ) -> Result<Vec<SemanticSearchResult>> {
        // Use default Gemini embedding model
        let query_vector = self.embed_text(&query, "text-embedding-004").await?;

        let store = self.store.read();
        let results = store.search(&query_vector, k, Metric::Cosine);

        let mut search_results = Vec::new();
        for (id, score) in results {
            if let Some(doc) = store.get(&id) {
                let text = doc.metadata.get("text").cloned();
                let metadata_value = serde_json::to_value(&doc.metadata).ok();
                search_results.push(SemanticSearchResult {
                    id,
                    score,
                    text,
                    metadata: metadata_value,
                });
            }
        }

        Ok(search_results)
    }
}
