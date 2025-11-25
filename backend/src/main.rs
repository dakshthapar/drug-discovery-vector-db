mod config;
mod core;
mod store;
mod api;
mod api_spec;
mod embeddings;

use axum::{
    routing::{get, post},
    Router,
    extract::Extension,
};
use std::net::SocketAddr;
use std::sync::Arc;
use parking_lot::RwLock;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::config::Config;
use crate::store::memory::VectorStore;
use crate::api::handlers::{health_check, insert_vector, search_vectors, bulk_insert, get_vector, get_stats, save_db, load_db, get_api_spec};
use crate::api::embeddings::{generate_embedding, embed_and_insert, semantic_search};
use crate::embeddings::service::EmbeddingService;
use crate::store::wal::{Wal, WalEntry};
use crate::store::snapshot::{load_snapshot, save_snapshot};
use std::path::Path;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    tracing::info!("Starting Vector DB on {}:{}", config.host, config.port);

    // Recovery Logic
    let mut store = if Path::new(&config.snapshot_path).exists() {
        tracing::info!("Loading snapshot from {}", config.snapshot_path);
        load_snapshot(&config.snapshot_path).unwrap_or_else(|e| {
            tracing::error!("Failed to load snapshot: {}", e);
            VectorStore::new(config.dimension, None)
        })
    } else {
        VectorStore::new(config.dimension, None)
    };

    // Replay WAL
    if Path::new(&config.wal_path).exists() {
        tracing::info!("Replaying WAL from {}", config.wal_path);
        let entries = Wal::read_all(&config.wal_path);
        for entry in entries {
            match entry {
                WalEntry::Insert { id, vector, metadata } => {
                    store.insert(id, vector, metadata).unwrap();
                }
            }
        }
    }

    // Initialize WAL for new writes
    let wal = Arc::new(Wal::new(&config.wal_path));
    store.wal = Some(wal);

    let store = Arc::new(RwLock::new(store));
    let embedding_service = Arc::new(EmbeddingService::new(store.clone()).expect("Failed to initialize embedding service"));

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/vectors", post(insert_vector))
        .route("/vectors/bulk", post(bulk_insert))
        .route("/vectors/:id", get(get_vector))
        .route("/search", post(search_vectors))
        .route("/stats", get(get_stats))
        .route("/save", post(save_db))
        .route("/load", post(load_db))
        .route("/api/spec", get(get_api_spec))
        .route("/embed", post(generate_embedding))
        .route("/embed-and-insert", post(embed_and_insert))
        .route("/semantic-search", post(semantic_search))
        .with_state(store.clone())
        .layer(Extension(embedding_service))
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_methods(tower_http::cors::Any)
                .allow_headers(tower_http::cors::Any),
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    // Background Snapshot Task
    let background_store = store.clone();
    let snapshot_path = config.snapshot_path.clone();
    let interval = config.snapshot_interval_sec;
    
    tokio::spawn(async move {
        let mut interval_timer = tokio::time::interval(std::time::Duration::from_secs(interval));
        loop {
            interval_timer.tick().await;
            tracing::info!("Starting background snapshot to {}", snapshot_path);
            let store = background_store.read();
            if let Err(e) = crate::store::snapshot::save_snapshot(&store, &snapshot_path) {
                tracing::error!("Background snapshot failed: {}", e);
            } else {
                tracing::info!("Background snapshot saved successfully");
            }
        }
    });

    axum::serve(listener, app).await.unwrap();
}
