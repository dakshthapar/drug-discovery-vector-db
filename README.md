# Drug Discovery Vector Database

A molecular similarity search system using custom vector database and KNN retrieval for drug discovery applications.

## Features
- Custom vector database with KNN retrieval
- Molecular embedding generation from SMILES strings
- REST API for similarity search
- Drug repurposing and lead optimization use cases

## Setup

1. Clone the repository
2. Install dependencies: `uv sync`
3. Run the API: `uv run python src/api/main.py`

## Tech Stack
- Custom Vector Database (KNN)
- RDKit for molecular processing
- Transformers for molecular embeddings
- FastAPI for REST API

## Hackathon Demo
Query a molecule and find the most similar drugs in the database for potential repurposing or lead optimization.
