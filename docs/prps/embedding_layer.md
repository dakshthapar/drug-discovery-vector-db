# 📘 PRP — Embedding Layer for Rust Vector Database

## 1. Overview

Add a new Embedding Layer to the existing Rust Vector Database that enables users to:

- Submit text → convert to an embedding vector using OpenAI embedding models
- Store embeddings directly in the vector DB
- Perform semantic search using text queries
- View, test, and interact with embedding features in the frontend UI
- Maintain extremely high performance, responsiveness, and clean architecture

This feature must integrate seamlessly with the existing backend, frontend, persistence, and vector search modules.

## 🔥 2. Core Objectives

### 2.1 Functional Goals

- Convert user-provided text into vectors using OpenAI embeddings.
- Insert and store generated embeddings in the vector DB.
- Search using a text query → auto-embed → run kNN search → return results.
- Allow users to preview embeddings and metadata.
- Add a new UI section for embedding creation and embedding-based search.
- All embedding operations must be reflected in persistence (auto-save on shutdown, auto-load on startup).

### 2.2 Non-Functional Goals

- Extremely fast (95% responses < 50ms except external API calls)
- Minimal memory footprint
- Zero data leaks (frontend must NEVER expose OpenAI key)
- Fully responsive UI across mobile + web
- High architectural clarity and modularity
- Component-driven frontend with reusable blocks
- Fully typed Rust backend with strict lint rules

## 🧱 3. System Architecture Requirements

### 3.1 Backend Architecture

Add a new module:

```
src/
 ├─ embeddings/
 │    ├─ mod.rs
 │    ├─ service.rs
 │    └─ models.rs
```

Responsibilities:

- Manage OpenAI text → vector conversion
- Provide model selection capabilities (default: `text-embedding-3-small`)
- Validate text input
- Handle caching (optional)
- Throttle excessive requests
- Expose public functions for insertion + search operations

### 3.2 Frontend Architecture

Frontend should have:

```
frontend/
 ├─ components/
 │     ├─ EmbeddingInput.tsx
 │     ├─ EmbeddingPreview.tsx
 │     ├─ SemanticSearch.tsx
 │     └─ ModelSelector.tsx
 ├─ pages/
 │    ├─ embeddings.tsx
 │    └─ search.tsx (extended)
```

Use:

- React or Next.js
- Tailwind (minimal, clean)
- Stateless components where possible
- Shared loading & error components

## 🧬 4. Backend Feature Requirements

### 4.1 Embedding Service

Create a new Rust service: `EmbeddingService`

- Uses `reqwest` for HTTP
- Uses `serde_json` for parsing
- Stores API key in `.env`
- Supports multiple models:
    - `text-embedding-3-small` (1536 dims)
    - `text-embedding-3-large` (3072 dims)

Functions:

- `embed_text(text: &str) -> Result<Vec<f32>>`
    - Trim whitespace
    - Validate non-empty
    - Call OpenAI embeddings API
    - Parse response → return `Vec<f32>`
- `embed_and_insert(id: String, text: String, metadata: Option<Value>)`
    - Generate embedding
    - Insert into vector DB
    - Return vector dimension + ID

### 4.2 API Endpoints

**POST /embed**

Generate embedding only.

Request:
```json
{
  "text": "hello world",
  "model": "text-embedding-3-small"
}
```

Response:
```json
{
  "vector": [...],
  "dimension": 1536
}
```

**POST /embed-and-insert**

Generate embedding + insert into DB.

Request:
```json
{
  "id": "doc_43",
  "text": "my favorite movie is interstellar",
  "model": "text-embedding-3-small",
  "metadata": { "genre": "sci-fi" }
}
```

Response:
```json
{
  "status": "ok",
  "id": "doc_43",
  "dimension": 1536
}
```

**POST /semantic-search**

Search using text input.

Request:
```json
{
  "query": "space movie",
  "k": 5
}
```

Response:
```json
{
  "results": [
    { "id": "doc_43", "score": 0.92 },
    ...
  ]
}
```

**Internal API Requirements**

- NO API key exposure
- Enforce request-size limits
- Return consistent error structure:
  ```json
  {
    "error": "Invalid input",
    "code": "BAD_REQUEST"
  }
  ```

## 🖼 5. Frontend Requirements

Add a new page: **Embeddings**

Components:

### 5.1 <EmbeddingInput />

- text input box (auto-expand)
- model selector dropdown
- submit button
- loader animation
- “Generate Embedding” button

UI Requirements:

- clean borders
- minimal shadows
- whitespace heavy
- centered layout
- responsive
- max-width container (600px)

### 5.2 <EmbeddingPreview />

Shows:

- Vector dimension
- Metadata
- First 10 values of vector with "Expand" modal

### 5.3 <SemanticSearch />

- Input for search text
- Dropdown for k (1→20)
- Animated result list

Each result card shows:

- ID
- Similarity score
- Optional metadata

### 5.4 Animations

Use:

- subtle fade-in
- subtle slide for results
- minimal transform-based animations

## 🧪 6. Validation Rules & Edge Cases

- ❌ **Empty text**: Return 400: "Text cannot be empty"
- ❌ **Text too long**: Limit: 8,000 characters
- ❌ **Model not supported**: Return 400: "Model not supported"
- ❌ **Dimension mismatch**: If DB dimension = 1536 but user selects a 3072 model → return 400 with clear message.
- ❌ **Duplicate ID on insert**: Return 409: “ID already exists”
- ❌ **OpenAI API error**: Return 502: “Embedding provider unavailable”
- ❌ **Network failure**: Retry using exponential backoff (3 attempts)
- ❌ **Rate limiting**: Cooldown for 1–3 seconds. Error message: "Too many requests"

## 📏 7. Coding Standards (Backend)

- Rust Edition 2021+
- Strict linting: `clippy::all`, `clippy::pedantic`
- All functions must return `Result<T, anyhow::Error>`
- Use `Arc<RwLock<T>>` for shared DB state
- Avoid clone-heavy operations
- Use `tokio` async everywhere
- Encapsulate API callers in service classes
- No business logic inside route handlers
- Maintain dimension consistency across operations
- All structs must derive: `#[derive(Serialize, Deserialize, Clone)]`

## 🎨 8. Coding Standards (Frontend)

- Use functional components only
- Use React Hooks
- CSS: Tailwind, minimal
- Reusable components (Input, Button, Card, Modal)
- No inline styles
- Use SWR/React-Query for API calls
- Standard response handler wrapper
- Error Toasts
- Loading spinners minimal

## 🚀 9. Performance Requirements

**Backend**

- < 50ms local latency (excluding external call)
- Vector insert < 2ms
- Search < 5ms for <10k vectors (parallel brute-force)
- Use `rayon` for vector search parallelization

**Frontend**

- First paint < 1s
- All transitions < 200ms
- No jank on mobile
- Avoid large re-renders

## 📦 10. Persistence Requirements

- All inserted embeddings must be saved with the existing save system
- Auto-save on shutdown
- Auto-load on startup
- File structure unchanged
- No corruption allowed: Save temp → rename atomically

## 📚 11. Testing Requirements

**Unit Tests**

- Embedding service mocks
- Search accuracy tests
- Edge-case validations

**Integration Tests**

- `/embed`
- `/embed-and-insert`
- `/semantic-search`

**Frontend Tests**

- Component rendering
- Search flow
- Model selector behavior

## 🧩 12. Deliverables

- Fully implemented backend embedding module
- Full set of new APIs
- Complete embedding UI page
- Extended semantic search UI
- Documentation for: usage, examples, API reference, testing, code structure

## 🟢 13. Alignment With Existing Repo

This new feature must:

- Use the existing DB insert, search, persistence modules
- Match the current coding style (clean modules, services, no business logic in handlers)
- Integrate into existing UI layout & theming
- Reuse existing common components
- Continue the architecture: API → Service Layer → DB → Persistent Storage
- All naming conventions must follow the existing repo’s patterns.
