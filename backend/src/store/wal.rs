use std::fs::{File, OpenOptions};
use std::io::{BufWriter, Write};
use std::path::Path;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use crate::core::types::Embedding;
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub enum WalEntry {
    Insert { id: String, vector: Embedding, metadata: HashMap<String, String> },
}

pub struct Wal {
    writer: Mutex<BufWriter<File>>,
}

impl Wal {
    pub fn new(path: impl AsRef<Path>) -> Self {
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
            .expect("Failed to open WAL file");
        
        Self {
            writer: Mutex::new(BufWriter::new(file)),
        }
    }

    pub fn append(&self, entry: &WalEntry) {
        let mut writer = self.writer.lock().unwrap();
        let bytes = bincode::serialize(entry).unwrap();
        // Write length prefix
        writer.write_all(&(bytes.len() as u64).to_le_bytes()).unwrap();
        writer.write_all(&bytes).unwrap();
        writer.flush().unwrap();
    }

    pub fn read_all(path: impl AsRef<Path>) -> Vec<WalEntry> {
        if !path.as_ref().exists() {
            return Vec::new();
        }
        let file = File::open(path).unwrap();
        let mut reader = std::io::BufReader::new(file);
        let mut entries = Vec::new();
        
        loop {
            let mut len_bytes = [0u8; 8];
            if std::io::Read::read_exact(&mut reader, &mut len_bytes).is_err() {
                break;
            }
            let len = u64::from_le_bytes(len_bytes) as usize;
            let mut bytes = vec![0u8; len];
            std::io::Read::read_exact(&mut reader, &mut bytes).unwrap();
            let entry: WalEntry = bincode::deserialize(&bytes).unwrap();
            entries.push(entry);
        }
        entries
    }
}
