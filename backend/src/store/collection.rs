use crate::store::memory::VectorStore;
use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize)]
pub struct Collection {
    pub name: String,
    pub dimension: usize,
    pub created_at: u64,
    #[serde(skip)]
    pub store: VectorStore,
}

impl Collection {
    pub fn new(name: String, dimension: usize) -> Self {
        Self {
            name: name.clone(),
            dimension,
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            store: VectorStore::new(dimension, None),
        }
    }
}

pub struct CollectionManager {
    collections: HashMap<String, Collection>,
}

impl CollectionManager {
    pub fn new() -> Self {
        Self {
            collections: HashMap::new(),
        }
    }

    pub fn create_collection(&mut self, name: String, dimension: usize) -> Result<(), String> {
        if self.collections.contains_key(&name) {
            return Err(format!("Collection '{}' already exists", name));
        }
        
        let collection = Collection::new(name.clone(), dimension);
        self.collections.insert(name, collection);
        Ok(())
    }

    pub fn get_collection(&self, name: &str) -> Option<&Collection> {
        self.collections.get(name)
    }

    pub fn get_collection_mut(&mut self, name: &str) -> Option<&mut Collection> {
        self.collections.get_mut(name)
    }

    pub fn list_collections(&self) -> Vec<&Collection> {
        self.collections.values().collect()
    }

    pub fn delete_collection(&mut self, name: &str) -> Result<(), String> {
        if !self.collections.contains_key(name) {
            return Err(format!("Collection '{}' not found", name));
        }
        self.collections.remove(name);
        Ok(())
    }

    pub fn collection_exists(&self, name: &str) -> bool {
        self.collections.contains_key(name)
    }
}

pub type SharedCollectionManager = Arc<RwLock<CollectionManager>>;
