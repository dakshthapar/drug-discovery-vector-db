use std::fs::File;
use std::io::{BufReader, BufWriter};
use std::path::Path;
use crate::store::memory::VectorStore;

pub fn save_snapshot(store: &VectorStore, path: impl AsRef<Path>) -> Result<(), String> {
    let file = File::create(path).map_err(|e| e.to_string())?;
    let writer = BufWriter::new(file);
    // We need a serializable version of VectorStore or manual serialization
    // For MVP, let's just serialize the critical parts: vectors, norms, docs, dim
    // But VectorStore itself isn't Serialize. Let's make a DTO or implement Serialize manually.
    // For simplicity, let's assume we can just dump the raw data.
    // Actually, let's just use bincode on a helper struct.
    
    let snapshot_data = SnapshotData {
        vectors: &store.vectors,
        norms: &store.norms,
        docs: &store.docs,
        dim: store.dim,
    };
    
    bincode::serialize_into(writer, &snapshot_data).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn load_snapshot(path: impl AsRef<Path>) -> Result<VectorStore, String> {
    let file = File::open(path).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);
    let snapshot_data: SnapshotDataOwned = bincode::deserialize_from(reader).map_err(|e| e.to_string())?;
    
    let mut id_to_index = std::collections::HashMap::new();
    for (i, doc) in snapshot_data.docs.iter().enumerate() {
        id_to_index.insert(doc.id.clone(), i);
    }

    Ok(VectorStore {
        vectors: snapshot_data.vectors,
        norms: snapshot_data.norms,
        docs: snapshot_data.docs,
        dim: snapshot_data.dim,
        id_to_index,
        wal: None,
    })
}

#[derive(serde::Serialize)]
struct SnapshotData<'a> {
    vectors: &'a Vec<f32>,
    norms: &'a Vec<f32>,
    docs: &'a Vec<crate::core::types::Document>,
    dim: usize,
}

#[derive(serde::Deserialize)]
struct SnapshotDataOwned {
    vectors: Vec<f32>,
    norms: Vec<f32>,
    docs: Vec<crate::core::types::Document>,
    dim: usize,
}
