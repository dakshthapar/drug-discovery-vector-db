"""
Python client for Rust Vector Database with Collections support
"""
import requests
import numpy as np
from typing import List, Dict, Optional, Any
import json


class VectorDBClient:
    """
    Python client for the Rust Vector Database API
    Supports collections, bulk insert, and search operations
    """
    
    def __init__(self, base_url: str = "http://localhost:8080"):
        """
        Initialize the client
        
        Args:
            base_url: Base URL of the vector database API
        """
        self.base_url = base_url.rstrip('/')
        self._check_connection()
    
    def _check_connection(self):
        """Check if the database is reachable"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=2)
            if response.status_code == 200:
                print(f"✓ Connected to vector database at {self.base_url}")
            else:
                print(f"⚠ Warning: Database returned status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"⚠ Warning: Could not connect to database: {e}")
            print(f"   Make sure the Rust backend is running at {self.base_url}")
    
    def health_check(self) -> bool:
        """Check if the database is healthy"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    # Collection Management
    
    def create_collection(self, name: str, dimension: int) -> Dict[str, Any]:
        """
        Create a new collection
        
        Args:
            name: Collection name (e.g., "drugs")
            dimension: Vector dimension (e.g., 2048 for Morgan fingerprints)
        """
        payload = {
            "name": name,
            "dimension": dimension
        }
        response = requests.post(
            f"{self.base_url}/collections",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    
    def list_collections(self) -> List[Dict[str, Any]]:
        """List all collections"""
        response = requests.get(f"{self.base_url}/collections")
        response.raise_for_status()
        return response.json()["collections"]
    
    def delete_collection(self, name: str) -> Dict[str, Any]:
        """Delete a collection"""
        response = requests.delete(f"{self.base_url}/collections/{name}")
        response.raise_for_status()
        return response.json()
    
    # Vector Operations
    
    def insert_vector(self, 
                     vector_id: str, 
                     vector: np.ndarray,
                     metadata: Optional[Dict[str, str]] = None,
                     collection: str = "default") -> Dict[str, Any]:
        """
        Insert a vector into a collection
        
        Args:
            vector_id: Unique identifier
            vector: NumPy array
            metadata: Metadata as dict with string values
            collection: Collection name
        """
        if isinstance(vector, np.ndarray):
            vector = vector.tolist()
        
        payload = {
            "id": vector_id,
            "vector": vector,
            "metadata": metadata or {}
        }
        
        response = requests.post(
            f"{self.base_url}/vectors?collection={collection}",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    
    def bulk_insert(self,
                   items: List[Dict[str, Any]],
                   collection: str = "default") -> Dict[str, Any]:
        """
        Insert multiple vectors at once
        
        Args:
            items: List of dicts with 'id', 'vector', 'metadata'
            collection: Collection name
        """
        # Convert numpy arrays to lists
        for item in items:
            if isinstance(item.get('vector'), np.ndarray):
                item['vector'] = item['vector'].tolist()
        
        payload = {"items": items}
        
        response = requests.post(
            f"{self.base_url}/vectors/bulk?collection={collection}",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    
    def search(self, 
               query_vector: np.ndarray,
               top_k: int = 10,
               metric: str = "cosine",
               collection: str = "default") -> List[Dict[str, Any]]:
        """
        Search for similar vectors
        
        Args:
            query_vector: Query vector as numpy array
            top_k: Number of results
            metric: Distance metric ("cosine", "euclidean", "dot")
            collection: Collection name
        """
        if isinstance(query_vector, np.ndarray):
            query_vector = query_vector.tolist()
        
        payload = {
            "vector": query_vector,
            "top_k": top_k,
            "metric": metric
        }
        
        response = requests.post(
            f"{self.base_url}/search?collection={collection}",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()["results"]
    
    def get_stats(self, collection: str = "default") -> Dict[str, Any]:
        """Get collection statistics"""
        response = requests.get(f"{self.base_url}/stats?collection={collection}")
        response.raise_for_status()
        return response.json()


def test_client():
    """Test the vector database client"""
    print("\n" + "="*60)
    print("TESTING VECTOR DATABASE CLIENT")
    print("="*60 + "\n")
    
    client = VectorDBClient()
    
    if not client.health_check():
        print("❌ Database is not running!")
        print("   Start the Rust backend with: cd backend && cargo run")
        return
    
    # List existing collections
    print("1. Listing collections:")
    collections = client.list_collections()
    for col in collections:
        print(f"   - {col['name']}: {col['dimension']}D, {col['num_vectors']} vectors")
    
    # Test with default collection
    print("\n2. Getting default collection stats:")
    stats = client.get_stats("default")
    print(f"   Vectors: {stats['num_vectors']}, Dimension: {stats['dim']}")
    
    print("\n" + "="*60)
    print("✓ Client test complete!")
    print("="*60)


if __name__ == "__main__":
    test_client()
