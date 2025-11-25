# ✅ PRP — PRODUCT REQUIREMENT PROMPT
**Project:** Rust-Based Mini Vector Database Backend

## 🟦 SECTION 1 — PRODUCT OVERVIEW

Build a Rust-based vector database backend with the following goals:

- High-performance vector ingestion
- In-memory vector storage
- Cosine similarity & L2 search
- Fast brute-force kNN (parallel with Rayon)
- Optional metadata filtering
- Disk persistence (bincode snapshot + WAL)
- Full REST API
- Compatible with the existing frontend
- Production-grade error handling
- Full test coverage
- Clean, documented code

The backend must be written in Rust, using:
- `axum` for HTTP server
- `tokio` async runtime
- `serde` + `serde_json`
- `rayon` for parallel CPU search
- `bincode` for persistence
- `uuid` for IDs (if needed)

The entire project must be modular, testable, and maintainable.

## 🟦 SECTION 2 — ARCHITECTURE

**High-level architecture components**

1.  **API Layer (Axum)**
    - Receives requests, validates input, triggers handlers.

2.  **Service Layer (VectorDB service)**
    - Implements insertion, search, metadata filtering, persistence, and stats.

3.  **Storage Layer (in-memory + optional persistence)**
    - Memory store: `HashMap<String, StoredVector>`
    - Metadata store
    - Index: linear scan + parallelization
    - Persistence via:
        - Snapshot (bincode)
        - WAL log (append-only)

**Index Engine**
- Cosine similarity
- Euclidean distance
- kNN brute-force
- Optional: pre-normalization for cosine
- Parallel scoring using `rayon::par_iter()`

**Persistence Engine**
- `snapshot.bin` (full DB dump)
- `wal.log` (append-only record of inserts)
- Load at startup: replay WAL, merge with snapshot

**Error Management**
- Custom error enum
- JSON error responses
- Clear HTTP codes

## 🟦 SECTION 3 — DATA STRUCTURES

**StoredVector**
```rust
pub struct StoredVector {
    pub id: String,
    pub vector: Vec<f32>,
    pub norm: f32,
    pub metadata: Option<serde_json::Value>,
}
```

**SearchResult**
```rust
pub struct SearchResult {
    pub id: String,
    pub score: f32,
    pub metadata: Option<serde_json::Value>,
}
```

**DatabaseState**
```rust
pub struct DatabaseState {
    pub dim: usize,
    pub vectors: HashMap<String, StoredVector>,
    pub metadata_index: HashMap<String, String>, // optional
    pub version: u64,
}
```

## 🟦 SECTION 4 — CODING STANDARDS

**General**
- Use idiomatic Rust
- Write fully async API layer
- Use immutable refs whenever possible
- Panics are never allowed
- All fallible operations return `Result<T, AppError>`
- Clippy must pass
- No unsafe code unless absolutely necessary

**Documentation**
- Every module must have a module-level docstring
- Every public struct / function must have `///` docs
- Complex functions must have inline comments

**Testing**
- Unit tests for: cosine, L2, kNN, insertion, search, persistence write/read
- Integration tests for all endpoints
- Load test or benchmark of search speed

**Performance**
- Use rayon for parallel kNN
- Reuse buffers; no unnecessary allocations
- Store precomputed norms for cosine
- Avoid clone-heavy patterns

## 🟦 SECTION 5 — CAVEATS & THINGS TO TAKE CARE OF

1.  **Dimensionality mismatch**: Return error if vector dimension != stored dimension.
2.  **Null metadata values**: Always validate JSON metadata types.
3.  **Metadata filtering**: Only allow simple equality filters for MVP.
4.  **Persistence**:
    - snapshot must overwrite atomically (write → fsync → rename)
    - WAL must append and flush
5.  **Thread safety**: `DatabaseState` must be wrapped in `Arc<RwLock<DatabaseState>>`
6.  **Query performance**: Parallel search must avoid mutating shared state.

## 🟦 SECTION 6 — COMPLETE SWAGGER / OPENAPI DOCUMENT

Below is the full OpenAPI 3.0 YAML representation of your entire API.

### 🔵 OPENAPI 3.0 DOCUMENT (FULL)

```yaml
openapi: 3.0.0
info:
  title: Rust Vector Database API
  version: 1.0.0
  description: REST API for a Rust-based vector database with search, metadata, and persistence.

servers:
  - url: http://localhost:8080

paths:

  /vectors:
    post:
      summary: Insert or upsert a vector
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/InsertVectorRequest"
      responses:
        "200":
          description: Vector inserted successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/InsertVectorResponse"
        "400":
          description: Bad request
        "500":
          description: Server error

  /vectors/bulk:
    post:
      summary: Bulk insert vectors
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/BulkInsertRequest"
      responses:
        "200":
          description: Bulk insert complete
        "400":
          description: Invalid vector dimensions
        "500":
          description: Server error

  /vectors/{id}:
    get:
      summary: Get a stored vector by ID
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Vector found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StoredVector"
        "404":
          description: Vector not found

  /search:
    post:
      summary: Perform kNN vector search
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SearchRequest"
      responses:
        "200":
          description: Search results
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SearchResponse"
        "400":
          description: Invalid query
    
  /stats:
    get:
      summary: Get database statistics
      responses:
        "200":
          description: Statistics returned
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StatsResponse"

  /save:
    post:
      summary: Create a snapshot of database on disk
      responses:
        "200": { description: Snapshot saved }

  /load:
    post:
      summary: Load database from snapshot and WAL
      responses:
        "200": { description: Database loaded }

  /clear:
    delete:
      summary: Clear all data from database
      responses:
        "200": { description: Database cleared }

components:
  schemas:

    InsertVectorRequest:
      type: object
      required: [id, vector]
      properties:
        id:
          type: string
        vector:
          type: array
          items:
            type: number
            format: float
        metadata:
          type: object
          nullable: true

    InsertVectorResponse:
      type: object
      properties:
        status:
          type: string
        count:
          type: integer

    BulkInsertRequest:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/InsertVectorRequest"

    SearchRequest:
      type: object
      required: [vector]
      properties:
        vector:
          type: array
          items:
            type: number
        k:
          type: integer
          default: 5
        metric:
          type: string
          enum: [cosine, euclidean]
        filter:
          type: object
          nullable: true

    SearchResponse:
      type: object
      properties:
        results:
          type: array
          items:
            $ref: "#/components/schemas/SearchResult"

    SearchResult:
      type: object
      properties:
        id:
          type: string
        score:
          type: number
        metadata:
          type: object
          nullable: true

    StoredVector:
      type: object
      properties:
        id:
          type: string
        vector:
          type: array
          items:
            type: number
        norm:
          type: number
        metadata:
          type: object
          nullable: true

    StatsResponse:
      type: object
      properties:
        count:
          type: integer
        dim:
          type: integer
        memory_bytes:
          type: integer
```

## 🟦 SECTION 7 — TEST CASES

**API Tests**
- Insert vector → 200
- Insert dimension mismatch → 400
- Search with wrong dim → 400
- Bulk insert → 200
- Search top-k returns correct ordering
- Metadata filtering works
- Save + Load → preserved state
- Clear → vector count = 0

**Unit Tests**
- Cosine correctness
- Euclidean correctness
- Parallel search results match single-thread search
- Norm computed correctly
- WAL replay after restart

## 🟦 SECTION 8 — FINAL INSTRUCTIONS TO ANTIGRAVITY

- Implement the entire backend exactly as specified above.
- Follow the OpenAPI schema, coding standards, module layout, and caveats.
- Ensure idiomatic Rust, full documentation, and tests.
- Ensure the service runs using `cargo run` and exposes all endpoints.
