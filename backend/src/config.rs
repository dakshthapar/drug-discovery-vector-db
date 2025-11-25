use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub dimension: usize,
    pub max_vectors: usize,
    pub snapshot_path: String,
    pub wal_path: String,
    pub snapshot_interval_sec: u64,
    pub wal_flush_interval_sec: u64,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("PORT must be a number"),
            dimension: env::var("DIMENSION")
                .unwrap_or_else(|_| "768".to_string())
                .parse()
                .expect("DIMENSION must be a number"),
            max_vectors: env::var("MAX_VECTORS")
                .unwrap_or_else(|_| "100000".to_string())
                .parse()
                .expect("MAX_VECTORS must be a number"),
            snapshot_path: env::var("SNAPSHOT_PATH").unwrap_or_else(|_| "snapshot.bin".to_string()),
            wal_path: env::var("WAL_PATH").unwrap_or_else(|_| "wal.bin".to_string()),
            snapshot_interval_sec: env::var("SNAPSHOT_INTERVAL_SEC")
                .unwrap_or_else(|_| "3600".to_string())
                .parse()
                .expect("SNAPSHOT_INTERVAL_SEC must be a number"),
            wal_flush_interval_sec: env::var("WAL_FLUSH_INTERVAL_SEC")
                .unwrap_or_else(|_| "1".to_string())
                .parse()
                .expect("WAL_FLUSH_INTERVAL_SEC must be a number"),
        }
    }
}
