use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub type Embedding = Vec<f32>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Metric {
    Cosine,
    Euclidean,
    Dot,
}
