"""
FastAPI backend for Drug Discovery
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from database.vector_db_client import VectorDBClient
from embeddings.molecular_encoder import MolecularEncoder

app = FastAPI(title="Drug Discovery API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
client = VectorDBClient()
encoder = MolecularEncoder(method="morgan", dim=2048)


# Pydantic models
class DrugSearchRequest(BaseModel):
    smiles: str
    top_k: int = 10


class DrugSearchByUseCaseRequest(BaseModel):
    use_case: str
    top_k: int = 10


class DrugResult(BaseModel):
    id: str
    name: str
    smiles: str
    similarity: float
    distance: float
    indication: Optional[str] = None


class DrugSearchResponse(BaseModel):
    query: str
    results: List[DrugResult]
    total_found: int
    search_time_ms: Optional[float] = None


# Endpoints

@app.get("/")
def root():
    return {
        "service": "Drug Discovery API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """Check if backend and vector DB are healthy"""
    db_healthy = client.health_check()
    return {
        "api": "healthy",
        "vector_db": "healthy" if db_healthy else "unhealthy"
    }


@app.get("/stats")
def get_stats():
    """Get drug database statistics"""
    try:
        stats = client.get_stats("drugs")
        collections = client.list_collections()
        
        return {
            "collections": collections,
            "drugs_collection": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search/structure", response_model=DrugSearchResponse)
def search_by_structure(request: DrugSearchRequest):
    """
    Search for drugs similar to a query molecule structure (SMILES)
    """
    try:
        import time
        start = time.time()
        
        # Encode query molecule
        query_vector = encoder.encode(request.smiles)
        
        # Search in drugs collection
        results = client.search(
            query_vector=query_vector,
            top_k=request.top_k + 1,  # +1 to account for query drug itself
            metric="cosine",
            collection="drugs"
        )
        
        # Convert to response format
        drug_results = []
        for result in results:
            # Skip if it's the exact same molecule (distance = 0)
            if result['score'] == 0.0:
                continue
                
            drug_results.append(DrugResult(
                id=result['id'],
                name=result['metadata'].get('name', result['id']),
                smiles=result['metadata'].get('smiles', ''),
                similarity=1 - result['score'],  # Convert distance to similarity
                distance=result['score'],
                indication=result['metadata'].get('indication')
            ))
        
        # Limit to top_k after filtering
        drug_results = drug_results[:request.top_k]
        
        search_time = (time.time() - start) * 1000  # Convert to ms
        
        return DrugSearchResponse(
            query=request.smiles,
            results=drug_results,
            total_found=len(drug_results),
            search_time_ms=search_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.post("/search/use-case", response_model=DrugSearchResponse)
def search_by_use_case(request: DrugSearchByUseCaseRequest):
    """
    Search for drugs by medical use case / indication
    """
    try:
        # Get all collections stats to access all drugs
        stats = client.get_stats("drugs")
        
        # For now, we'll use a simple text matching approach
        # In the future, we can use embeddings for semantic search
        
        # This is a placeholder - we need to fetch all drugs and filter by metadata
        # For now, return a message that this endpoint is coming soon
        
        return DrugSearchResponse(
            query=request.use_case,
            results=[],
            total_found=0,
            search_time_ms=0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/drugs/{drug_id}")
def get_drug(drug_id: str):
    """Get information about a specific drug"""
    try:
        # Note: The current Rust API doesn't return vector in get endpoint
        # We'll just return what we can get
        collections = client.list_collections()
        
        return {
            "id": drug_id,
            "message": "Drug details endpoint - implementation pending"
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Drug not found: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Starting Drug Discovery API")
    print("="*60)
    print("\nAPI will be available at: http://localhost:8000")
    print("Docs at: http://localhost:8000/docs")
    print("\nMake sure Rust vector DB is running at http://localhost:8080")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
