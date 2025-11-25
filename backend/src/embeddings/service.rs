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
        let api_key = env::var("OPENAI_API_KEY")
            .context("OPENAI_API_KEY must be set")?;
        
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

        let request = EmbeddingRequest {
            input: text.to_string(),
            model: model.to_string(),
        };

        let response = self.client
            .post("https://api.openai.com/v1/embeddings")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .context("Failed to send request to OpenAI")?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow!("OpenAI API error: {}", error_text));
        }

        let embedding_response: EmbeddingResponse = response.json().await
            .context("Failed to parse OpenAI response")?;

        if let Some(data) = embedding_response.data.first() {
            Ok(data.embedding.clone())
        } else {
            Err(anyhow!("No embedding data returned"))
        }
    }

    pub async fn embed_and_insert(
        &self,
        id: String,
        text: String,
        model: String,
        metadata: Option<Value>,
    ) -> Result<(usize, String)> {
        // 1. Generate embedding
        let vector = self.embed_text(&text, &model).await?;
        let dimension = vector.len();

        // 2. Prepare metadata
        let mut meta_map = HashMap::new();
        if let Some(meta) = metadata {
            if let Value::Object(map) = meta {
                for (k, v) in map {
                    if let Value::String(s) = v {
                        meta_map.insert(k, s);
                    } else {
                        meta_map.insert(k, v.to_string());
                    }
                }
            }
        }
        // Always store the original text in metadata for reference
        meta_map.insert("text".to_string(), text);
        meta_map.insert("model".to_string(), model);

        // 3. Insert into store
        let mut store = self.store.write();
        store.insert(id.clone(), vector, meta_map)
            .map_err(|e| anyhow!("Failed to insert into vector store: {}", e))?;

        Ok((dimension, id))
    }

    pub async fn semantic_search(
        &self,
        query: String,
        k: usize,
    ) -> Result<Vec<SemanticSearchResult>> {
        // 1. Generate embedding for query
        // Use default model or infer from store? For now use default small model
        // Ideally we should know which model was used for the DB.
        // Assuming "text-embedding-3-small" for now as per requirements default.
        let model = "text-embedding-3-small"; 
        let vector = self.embed_text(&query, model).await?;

        // 2. Search in store
        let store = self.store.read();
        let results = store.search(&vector, k, Metric::Cosine);

        // 3. Format results
        let mut search_results = Vec::new();
        for (id, score) in results {
            let doc = store.get(&id);
            let metadata = doc.map(|d| {
                let mut map = serde_json::Map::new();
                for (k, v) in &d.metadata {
                    map.insert(k.clone(), Value::String(v.clone()));
                }
                Value::Object(map)
            });

            search_results.push(SemanticSearchResult {
                id,
                score,
                metadata,
            });
        }

        Ok(search_results)
    }
}
