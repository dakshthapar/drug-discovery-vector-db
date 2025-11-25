# Drug Discovery Vector Database - Hackathon Project

A full-stack molecular similarity search system combining a custom Rust vector database with Python-based drug discovery tools.

## 🎯 Project Overview

This project combines two powerful components:
1. **Custom Rust Vector Database** - High-performance KNN search with cosine similarity
2. **Drug Discovery ML Pipeline** - Molecular embeddings and similarity search for drug repurposing

### What is a Vector Database?

A vector database stores and searches data as mathematical vectors (arrays of numbers) rather than traditional text. It enables similarity search based on semantic meaning rather than exact keyword matches.

### Drug Discovery Use Case

Given a query molecule (SMILES string), find the most similar FDA-approved drugs for:
- **Drug Repurposing**: Identify existing drugs for new therapeutic uses
- **Lead Optimization**: Find structural analogs of lead compounds
- **Virtual Screening**: Rapid screening of molecular libraries

## 📁 Project Structure
```
drug-discovery-vector-db/
├── backend/              # Rust Vector Database (Actix-web)
│   ├── src/
│   │   ├── main.rs      # API endpoints and server
│   │   ├── models/      # Data structures
│   │   └── vector_db/   # Core vector database logic
│   ├── Cargo.toml       # Rust dependencies
│   ├── .env             # Environment variables
│   └── *.bin            # Database snapshots and WAL
│
├── frontend/             # React + TypeScript UI for Vector Database
│   ├── src/
│   │   ├── App.tsx      # Main React component
│   │   ├── App.css      # Styling
│   │   └── main.tsx
│   ├── package.json     # Node dependencies
│   └── vite.config.ts   # Vite configuration
│
├── docs/                 # Documentation
│   └── prps/            # Project proposals and specs
│
├── src/                  # Python Drug Discovery Components
│   ├── api/              # FastAPI drug discovery endpoints
│   ├── database/         # Vector DB Python client
│   ├── embeddings/       # Molecular encoder (SMILES → vectors)
│   │   ├── molecular_encoder.py
│   │   └── encode_molecule.py
│   ├── data_loader.py    # Drug dataset loader
│   └── generate_embeddings.py
│
├── data/                 # Drug datasets and embeddings
│   ├── drugs.csv
│   └── drug_embeddings.npz
│
├── notebooks/            # Jupyter notebooks for analysis
└── README.md
```

## 🚀 Features

### Rust Vector Database
- **Insert Vectors**: Add high-dimensional vectors with optional metadata
- **Similarity Search**: Find vectors similar to a query using cosine distance
- **Delete Vectors**: Remove vectors by ID
- **Real-time Stats**: View total vectors and dimensions
- **Persistent Storage**: Snapshots and Write-Ahead Logging (WAL)
- **Thread-Safe**: Concurrent access with `Arc<RwLock>`

### Drug Discovery Pipeline
- **Molecular Embeddings**: Convert SMILES to vectors using Morgan fingerprints
- **Drug Dataset**: FDA-approved drugs with SMILES and metadata
- **Batch Processing**: Efficient embedding generation for large datasets
- **REST API**: FastAPI endpoints for drug similarity search

## 🛠️ Tech Stack

### Backend (Rust)
- **Framework**: Actix-web (async HTTP server)
- **Vector Operations**: ndarray (efficient vector math)
- **Search Algorithm**: Cosine distance for similarity
- **Storage**: In-memory with persistence (snapshots + WAL)

### Frontend (React + TypeScript)
- **Framework**: React 18 with Vite
- **Language**: TypeScript for type safety
- **Styling**: Custom CSS with modern gradient design
- **API Communication**: Fetch API

### ML Pipeline (Python)
- **Chemistry**: RDKit for molecular processing
- **Embeddings**: Morgan fingerprints (ECFP)
- **API**: FastAPI for REST endpoints
- **Data**: NumPy, Pandas for data handling

## 📋 Prerequisites

- **Rust** (latest stable version)
- **Node.js** 22+ 
- **Python** 3.11+
- **uv** (Python package manager)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/drug-discovery-vector-db.git
cd drug-discovery-vector-db
```

### 2. Setup Rust Vector Database Backend
```bash
cd backend
cargo build --release
```

### 3. Setup Python Environment
```bash
# Install dependencies
uv sync

# Download and prepare drug dataset
uv run python src/data_loader.py

# Generate molecular embeddings
uv run python src/generate_embeddings.py
```

### 4. Setup Frontend
```bash
cd frontend
npm install
```

## 🎮 Usage

### Start the Rust Vector Database
```bash
cd backend

# Development mode (with hot reload)
cargo run

# Production mode
cargo run --release
```

Server runs on **http://localhost:8080**

The database will automatically:
- Load existing snapshots on startup
- Create WAL (Write-Ahead Log) for durability
- Persist data periodically

### Using the React Frontend
```bash
cd frontend
npm run dev
```

Navigate to **http://localhost:5173**

#### Frontend Features:
1. **Generate Random Vector**: Click "Generate Random (128D)" or manually enter comma-separated values
2. **Add Metadata** (optional):
```json
   {"name": "test", "category": "example"}
```
3. **Insert Vector**: Click "Insert Vector"
4. **Search**:
   - Enter a query vector (same dimensions as stored vectors)
   - Set "Top K" to number of results
   - Click "Search"
5. **Results**: Shows ID, distance (lower = more similar), and metadata

#### Understanding Distance Scores:
- **0.0**: Identical vectors
- **< 0.3**: Very similar
- **0.3-0.7**: Somewhat similar
- **> 0.7**: Very different

### Load Drugs into Vector Database
```bash
# Make sure Rust backend is running first!
cd backend
cargo run

# In another terminal, load drugs
uv run python src/database/load_drugs_to_db.py
```

### Search for Similar Drugs
```bash
# Search by SMILES string
uv run python src/api/search_drug.py "CC(=O)Oc1ccccc1C(=O)O"  # Aspirin
```

## 🌐 API Reference

### Vector Database API (Rust - Port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/stats` | Get database statistics |
| POST | `/vectors` | Insert a new vector |
| POST | `/search` | Search for similar vectors |
| DELETE | `/vectors/{id}` | Delete a vector |

#### Example: Insert Vector
```bash
curl -X POST http://localhost:8080/vectors \
  -H "Content-Type: application/json" \
  -d '{
    "id": "drug_001",
    "data": [0.1, 0.2, 0.3, ...],
    "metadata": {"name": "Aspirin", "smiles": "CC(=O)Oc1ccccc1C(=O)O"}
  }'
```

#### Example: Search
```bash
curl -X POST http://localhost:8080/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": [0.1, 0.2, 0.3, ...],
    "top_k": 10
  }'
```

### Drug Discovery API (Python - Port 8000)

Coming soon - FastAPI endpoints for drug similarity search.

## 🧪 How It Works

### Vector Database Implementation

**Storage:**
- In-memory vectors using `Vec<VectorData>` wrapped in `Arc<RwLock>`
- Periodic snapshots saved to `snapshot.bin`
- Write-Ahead Log (WAL) at `wal.bin` for crash recovery

**Cosine Distance Formula:**
```
distance = 1 - (A · B) / (||A|| × ||B||)
```

Where:
- A · B = dot product of vectors A and B
- ||A|| = magnitude of vector A
- ||B|| = magnitude of vector B

### Drug Similarity Search Pipeline

1. **Molecular Encoding**: SMILES string → Morgan fingerprint (2048-bit vector)
2. **Storage**: Insert drug embeddings into Rust vector database
3. **Query**: Convert query molecule to vector
4. **Search**: KNN search using cosine distance
5. **Results**: Return top-K most similar drugs with metadata

## 📊 Configuration

### Vector Dimensions

Default in Rust backend: **128 dimensions** (configurable in `backend/src/main.rs`)

For drug discovery, we use **2048 dimensions** (Morgan fingerprints).

To change dimensions in Python:
```python
encoder = MolecularEncoder(method="morgan", dim=2048)
```

### Environment Variables

Backend `.env`:
```bash
PORT=8080
HOST=127.0.0.1
SNAPSHOT_INTERVAL=300  # seconds
```

## 🚀 Production Deployment

### Backend
```bash
cd backend
cargo build --release
./target/release/vector_db_backend
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🔮 Future Enhancements

- [x] Persistent storage (snapshots + WAL)
- [ ] Advanced indexing (HNSW, IVF)
- [ ] Batch operations API
- [ ] Vector visualization in frontend
- [ ] Authentication & authorization
- [ ] Database export/import
- [ ] Multi-modal embeddings (images, proteins)
- [ ] Real-time drug-drug interaction prediction
- [ ] Distributed vector search
- [ ] GPU acceleration for similarity search

## 🧬 Example: Drug Repurposing Workflow
```python
from embeddings.molecular_encoder import MolecularEncoder
from database.vector_db_client import VectorDBClient

# 1. Initialize
encoder = MolecularEncoder(method="morgan", dim=128)
db = VectorDBClient()

# 2. Encode your novel compound
novel_drug_smiles = "CC(C)Cc1ccc(cc1)C(C)C(=O)O"
query_vector = encoder.encode(novel_drug_smiles)

# 3. Search for similar FDA-approved drugs
results = db.search(query_vector, top_k=10)

# 4. Analyze results
for result in results:
    print(f"Drug: {result['metadata']['name']}")
    print(f"Similarity: {1 - result['distance']:.3f}")
    print(f"SMILES: {result['metadata']['smiles']}\n")
```

## 📚 Documentation

See the `docs/` folder for:
- Project proposals and specifications
- Architecture diagrams
- API documentation
- Performance benchmarks

## 🤝 Contributing

This is a hackathon project. Feel free to fork and experiment!

## 📄 License

MIT

## 👥 Team

Built by a team combining Rust systems programming expertise with Python ML/chemistry tools for the hackathon.

## 🙏 Acknowledgments

- RDKit for molecular cheminformatics
- Actix-web for Rust HTTP framework
- React + Vite for frontend
- ndarray for Rust numerical computing
- OpenAI for inspiration on vector databases

---

**Star ⭐ this repo if you find it useful for your drug discovery projects!**
