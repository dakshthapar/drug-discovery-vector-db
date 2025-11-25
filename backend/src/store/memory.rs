use crate::core::distance::{dot_product, euclidean_distance};
use crate::core::types::{Document, Embedding, Metric};
use rayon::prelude::*;
use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::RwLock;

use crate::store::wal::{Wal, WalEntry};

#[derive(Clone)]
pub struct VectorStore {
    pub vectors: Vec<f32>,
    pub norms: Vec<f32>,
    pub id_to_index: HashMap<String, usize>,
    pub docs: Vec<Document>,
    pub dim: usize,
    pub wal: Option<Arc<Wal>>,
}

impl VectorStore {
    pub fn new(dim: usize, wal: Option<Arc<Wal>>) -> Self {
        Self {
            vectors: Vec::new(),
            norms: Vec::new(),
            id_to_index: HashMap::new(),
            docs: Vec::new(),
            dim,
            wal,
        }
    }

    pub fn insert(&mut self, id: String, vector: Embedding, metadata: HashMap<String, String>) -> Result<(), String> {
        if vector.len() != self.dim {
            return Err(format!("Vector dimension mismatch: expected {}, got {}", self.dim, vector.len()));
        }

        let norm = vector.iter().map(|x| x * x).sum::<f32>().sqrt();
        let doc = Document {
            id: id.clone(),
            metadata: metadata.clone(),
        };

        // Write to WAL if enabled
        if let Some(wal) = &self.wal {
            wal.append(&WalEntry::Insert {
                id: id.clone(),
                vector: vector.clone(),
                metadata: metadata.clone(),
            });
        }

        if let Some(&index) = self.id_to_index.get(&id) {
            // Update existing
            let start = index * self.dim;
            let end = start + self.dim;
            self.vectors.splice(start..end, vector);
            self.norms[index] = norm;
            self.docs[index] = doc;
        } else {
            // Insert new
            let index = self.docs.len();
            self.vectors.extend(vector);
            self.norms.push(norm);
            self.docs.push(doc);
            self.id_to_index.insert(id, index);
        }

        Ok(())
    }

    pub fn get(&self, id: &str) -> Option<&Document> {
        self.id_to_index.get(id).map(|&idx| &self.docs[idx])
    }

    pub fn search(&self, query: &[f32], k: usize, metric: Metric) -> Vec<(String, f32)> {
        if query.len() != self.dim {
            return Vec::new();
        }

        let query_norm = query.iter().map(|x| x * x).sum::<f32>().sqrt();

        let mut scores: Vec<(usize, f32)> = self
            .vectors
            .par_chunks(self.dim)
            .enumerate()
            .map(|(i, vec_slice)| {
                let score = match metric {
                    Metric::Cosine => {
                        let dot = dot_product(query, vec_slice);
                        if query_norm == 0.0 || self.norms[i] == 0.0 {
                            0.0
                        } else {
                            dot / (query_norm * self.norms[i])
                        }
                    }
                    Metric::Euclidean => euclidean_distance(query, vec_slice),
                    Metric::Dot => dot_product(query, vec_slice),
                };
                (i, score)
            })
            .collect();

        // Sort based on metric
        match metric {
            Metric::Euclidean => scores.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal)),
            _ => scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal)),
        }

        scores
            .into_iter()
            .take(k)
            .map(|(idx, score)| (self.docs[idx].id.clone(), score))
            .collect()
    }
}

pub type SharedVectorStore = Arc<RwLock<VectorStore>>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_insert_and_search() {
        let mut store = VectorStore::new(2, None);
        let mut metadata = HashMap::new();
        metadata.insert("title".to_string(), "test".to_string());

        store.insert("1".to_string(), vec![1.0, 0.0], metadata.clone()).unwrap();
        store.insert("2".to_string(), vec![0.0, 1.0], metadata.clone()).unwrap();

        // Search for [1.0, 0.0]
        let results = store.search(&[1.0, 0.0], 1, Metric::Cosine);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].0, "1");
        assert!((results[0].1 - 1.0).abs() < 1e-6);

        // Search for [0.0, 1.0]
        let results = store.search(&[0.0, 1.0], 1, Metric::Cosine);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].0, "2");
        assert!((results[0].1 - 1.0).abs() < 1e-6);
    }
}
