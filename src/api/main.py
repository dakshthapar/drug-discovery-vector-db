"""
FastAPI backend for Drug Discovery
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
from pathlib import Path
import traceback

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
        print(f"Error in /stats: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search/structure", response_model=DrugSearchResponse)
def search_by_structure(request: DrugSearchRequest):
    """
    Search for drugs similar to a query molecule structure (SMILES)
    """
    try:
        import time
        print(f"\n[SEARCH] Received request: {request.smiles[:50]}... (top_k={request.top_k})")
        start = time.time()
        
        # Encode query molecule
        print("[SEARCH] Encoding molecule...")
        query_vector = encoder.encode(request.smiles)
        print(f"[SEARCH] Encoded to {len(query_vector)}-dimensional vector")
        
        # Search in drugs collection - request more to account for filtering
        print(f"[SEARCH] Searching in 'drugs' collection...")
        results = client.search(
            query_vector=query_vector,
            top_k=request.top_k + 5,  # Request extra results for filtering
            metric="cosine",
            collection="drugs"
        )
        print(f"[SEARCH] Found {len(results)} raw results")
        
        # Convert to response format and filter
        drug_results = []
        for i, result in enumerate(results):
            distance = result['score']
            similarity = 1 - distance
            
            print(f"[SEARCH] Result {i}: {result['metadata'].get('name')} - distance: {distance:.4f}, similarity: {similarity:.4f}")
            
            # Skip if it's nearly identical (distance < 0.01 or similarity > 0.99)
            # This filters out the query drug itself
            if distance < 0.01 or similarity > 0.99:
                print(f"[SEARCH] Skipping (query drug itself)")
                continue
                
            drug_results.append(DrugResult(
                id=result['id'],
                name=result['metadata'].get('name', result['id']),
                smiles=result['metadata'].get('smiles', ''),
                similarity=similarity,
                distance=distance,
                indication=result['metadata'].get('indication')
            ))
        
        # Sort by similarity (descending) - higher similarity first
        drug_results.sort(key=lambda x: x.similarity, reverse=True)
        
        # Limit to top_k after filtering and sorting
        drug_results = drug_results[:request.top_k]
        
        search_time = (time.time() - start) * 1000  # Convert to ms
        print(f"[SEARCH] Returning {len(drug_results)} results in {search_time:.2f}ms")
        
        return DrugSearchResponse(
            query=request.smiles,
            results=drug_results,
            total_found=len(drug_results),
            search_time_ms=search_time
        )
        
    except Exception as e:
        print(f"\n[ERROR] Search failed!")
        print(f"[ERROR] Exception: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.post("/search/use-case", response_model=DrugSearchResponse)
def search_by_use_case(request: DrugSearchByUseCaseRequest):
    """
    Search for drugs by medical use case / indication
    """
    try:
        # This is a placeholder for future implementation
        return DrugSearchResponse(
            query=request.use_case,
            results=[],
            total_found=0,
            search_time_ms=0
        )
        
    except Exception as e:
        print(f"Error in /search/use-case: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/drugs/{drug_id}")
def get_drug(drug_id: str):
    """Get information about a specific drug"""
    try:
        collections = client.list_collections()
        
        return {
            "id": drug_id,
            "message": "Drug details endpoint - implementation pending"
        }
    except Exception as e:
        print(f"Error in /drugs/{drug_id}: {e}")
        traceback.print_exc()
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
