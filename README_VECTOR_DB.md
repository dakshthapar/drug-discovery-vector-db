# Vector Database

A full-stack vector database application built with Rust (backend) and React (frontend).

## What is a Vector Database?

A vector database stores and searches data as mathematical vectors (arrays of numbers) rather than traditional text. It enables similarity search based on semantic meaning rather than exact keyword matches.

## Features

- **Insert Vectors**: Add high-dimensional vectors with optional metadata
- **Similarity Search**: Find vectors similar to a query using cosine distance
- **Delete Vectors**: Remove vectors by ID
- **Real-time Stats**: View total vectors and dimensions
- **Random Generation**: Generate random test vectors

## Architecture

### Backend (Rust)
- **Framework**: Actix-web (async HTTP server)
- **Vector Operations**: ndarray (efficient vector math)
- **Search Algorithm**: Cosine distance for similarity
- **Storage**: In-memory (RwLock for thread-safe access)

### Frontend (React)
- **Framework**: React 18 with Vite
- **Styling**: Custom CSS with modern gradient design
- **API Communication**: Fetch API

## Project Structure

```
vector_database/
├── backend/
│   ├── src/
│   │   ├── main.rs           # API endpoints and server
│   │   ├── models/           # Data structures
│   │   │   └── mod.rs
│   │   └── vector_db/        # Core vector database logic
│   │       └── mod.rs
│   └── Cargo.toml            # Rust dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx           # Main React component
    │   ├── App.css           # Styling
    │   └── main.jsx
    └── package.json          # Node dependencies
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/stats` | Get database statistics |
| POST | `/vectors` | Insert a new vector |
| POST | `/search` | Search for similar vectors |
| DELETE | `/vectors/{id}` | Delete a vector |

## Installation & Setup

### Prerequisites
- Rust (installed automatically if not present)
- Node.js 22+ (installed)

### Backend Setup

```bash
cd backend
cargo build --release
cargo run
```

Server runs on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

### 1. Start the Backend
```bash
cd backend
source $HOME/.cargo/env  # Load Rust environment
cargo run
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173`

## Example Usage

### Insert a Vector
1. Click "Generate Random (128D)" or manually enter comma-separated values
2. Optionally add metadata: `{"name": "test", "category": "example"}`
3. Click "Insert Vector"

### Search for Similar Vectors
1. Enter a query vector (same dimensions as stored vectors)
2. Set "Top K" to the number of results you want
3. Click "Search"
4. Results show ID, distance (lower = more similar), and metadata

### Understanding Distance
- **0.0**: Identical vectors
- **< 0.3**: Very similar
- **0.3-0.7**: Somewhat similar
- **> 0.7**: Very different

## Technical Details

### Vector Storage
Vectors are stored in-memory using Rust's `Vec` wrapped in `Arc<RwLock>` for thread-safe concurrent access.

### Similarity Metric
Cosine distance is used:
```
distance = 1 - (A · B) / (||A|| × ||B||)
```

### Dimensions
Default: 128 dimensions (configurable in `backend/src/main.rs:70`)

## Future Enhancements

- Persistent storage (save to disk)
- Advanced indexing (HNSW, IVF)
- Batch operations
- Vector visualization
- Authentication
- Database export/import

## Development

### Build for Production

Backend:
```bash
cargo build --release
./target/release/vector_db_backend
```

Frontend:
```bash
npm run build
npm run preview
```

## License

MIT
