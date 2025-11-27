"""
Test drug similarity search
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from database.vector_db_client import VectorDBClient
from embeddings.molecular_encoder import MolecularEncoder


def search_similar_drugs(query_smiles: str, drug_name: str = None, top_k: int = 5):
    """
    Search for drugs similar to a query molecule
    
    Args:
        query_smiles: SMILES string of query molecule
        drug_name: Optional name for display
        top_k: Number of results to return
    """
    print("\n" + "="*60)
    print(f"DRUG SIMILARITY SEARCH")
    if drug_name:
        print(f"Query: {drug_name}")
    print("="*60 + "\n")
    
    # Initialize
    client = VectorDBClient()
    encoder = MolecularEncoder(method="morgan", dim=2048)
    
    # Encode query molecule
    print(f"Query SMILES: {query_smiles}")
    print("Generating molecular fingerprint...")
    query_vector = encoder.encode(query_smiles)
    print(f"✓ Generated {len(query_vector)}-dimensional vector\n")
    
    # Search in drugs collection
    print(f"Searching for top {top_k} similar drugs...")
    results = client.search(
        query_vector=query_vector,
        top_k=top_k,
        metric="cosine",
        collection="drugs"
    )
    
    # Display results
    print(f"\n📊 Found {len(results)} similar drugs:\n")
    print("-" * 60)
    
    for i, result in enumerate(results, 1):
        similarity = 1 - result['score']  # Convert distance to similarity
        print(f"\n#{i} {result['metadata'].get('name', result['id'])}")
        print(f"   Similarity: {similarity:.3f} ({similarity*100:.1f}%)")
        print(f"   Distance: {result['score']:.4f}")
        print(f"   SMILES: {result['metadata'].get('smiles', 'N/A')}")
        if 'indication' in result['metadata']:
            print(f"   Use: {result['metadata']['indication']}")
        print("-" * 60)
    
    return results


def main():
    """Run example searches"""
    
    # Example 1: Search for Aspirin-like drugs
    print("\n" + "="*70)
    print("EXAMPLE 1: Find drugs similar to Aspirin (pain reliever)")
    print("="*70)
    
    aspirin_smiles = "CC(=O)Oc1ccccc1C(=O)O"
    results1 = search_similar_drugs(aspirin_smiles, "Aspirin", top_k=5)
    
    # Example 2: Search for Ibuprofen-like drugs
    print("\n\n" + "="*70)
    print("EXAMPLE 2: Find drugs similar to Ibuprofen (anti-inflammatory)")
    print("="*70)
    
    ibuprofen_smiles = "CC(C)Cc1ccc(cc1)C(C)C(=O)O"
    results2 = search_similar_drugs(ibuprofen_smiles, "Ibuprofen", top_k=5)
    
    # Example 3: Search for Metformin-like drugs
    print("\n\n" + "="*70)
    print("EXAMPLE 3: Find drugs similar to Metformin (diabetes)")
    print("="*70)
    
    metformin_smiles = "CN(C)C(=N)NC(=N)N"
    results3 = search_similar_drugs(metformin_smiles, "Metformin", top_k=5)
    
    print("\n\n" + "="*70)
    print("✓ Drug similarity search working!")
    print("="*70)
    print("\nNext: Build FastAPI endpoints for the frontend")


if __name__ == "__main__":
    main()
