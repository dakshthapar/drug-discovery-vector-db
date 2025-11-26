mod config;
mod core;
mod store;
mod api;
mod api_spec;
mod embeddings;

use axum::{
    routing::{get, post, delete},
    Router,
    extract::Extension,
};
use std::net::SocketAddr;
use std::sync::Arc;
use parking_lot::RwLock;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::config::Config;
use crate::store::collection::CollectionManager;
use crate::api::collection_handlers::{
    health_check, insert_vector, search_vectors, bulk_insert, get_vector, get_stats, get_api_spec,
    create_collection, list_collections, delete_collection,
};
use crate::api::embeddings::{generate_embedding, embed_and_insert, semantic_search};
use crate::embeddings::service::EmbeddingService;

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

    // Initialize CollectionManager
    let mut manager = CollectionManager::new();
    
    // Create default collection with dimension from config
    manager.create_collection("default".to_string(), config.dimension)
        .expect("Failed to create default collection");
    
    tracing::info!("Created default collection with dimension {}", config.dimension);

    let manager = Arc::new(RwLock::new(manager));
    
    // For embedding service, we'll use the default collection's store
    // This is a bit of a hack - ideally embedding service should be collection-aware too
    let default_store = {
        let mgr = manager.read();
        let collection = mgr.get_collection("default").unwrap();
        Arc::new(RwLock::new(collection.store.clone()))
    };
    
    let embedding_service = Arc::new(
        EmbeddingService::new(default_store.clone())
            .expect("Failed to initialize embedding service")
    );

    let app = Router::new()
        // Health and API spec
        .route("/health", get(health_check))
        .route("/api/spec", get(get_api_spec))
        
        // Collection management
        .route("/collections", post(create_collection))
        .route("/collections", get(list_collections))
        .route("/collections/:name", delete(delete_collection))
        
        // Vector operations (with optional collection query param)
        .route("/vectors", post(insert_vector))
        .route("/vectors/bulk", post(bulk_insert))
        .route("/vectors/:id", get(get_vector))
        .route("/search", post(search_vectors))
        .route("/stats", get(get_stats))
        
        // Embedding operations
        .route("/embed", post(generate_embedding))
        .route("/embed-and-insert", post(embed_and_insert))
        .route("/semantic-search", post(semantic_search))
        
        // Persistence operations
        .route("/save", post(crate::api::persistence::save_collections))
        .route("/load", post(crate::api::persistence::load_collections))
        
        .with_state(manager.clone())
        .layer(Extension(embedding_service))
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_methods(tower_http::cors::Any)
                .allow_headers(tower_http::cors::Any),
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    tracing::info!("Server listening on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
