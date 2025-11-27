"""
Setup drugs collection and load FDA-approved drugs
"""
import numpy as np
import pandas as pd
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from database.vector_db_client import VectorDBClient
from embeddings.molecular_encoder import MolecularEncoder


def setup_drugs_collection():
    """Create drugs collection with 2048 dimensions"""
    print("\n" + "="*60)
    print("SETTING UP DRUGS COLLECTION")
    print("="*60 + "\n")
    
    # Initialize client
    client = VectorDBClient()
    
    if not client.health_check():
        print("❌ Rust backend is not running!")
        print("   Start it with: cd backend && cargo run")
        return False
    
    # Check if drugs collection exists
    collections = client.list_collections()
    drugs_exists = any(c['name'] == 'drugs' for c in collections)
    
    if drugs_exists:
        print("⚠ 'drugs' collection already exists")
        response = input("Delete and recreate? (y/n): ")
        if response.lower() == 'y':
            client.delete_collection('drugs')
            print("✓ Deleted existing collection")
        else:
            print("✓ Using existing collection")
            return True
    
    # Create drugs collection with 2048 dimensions
    print("\nCreating 'drugs' collection with 2048 dimensions...")
    result = client.create_collection('drugs', 2048)
    print(f"✓ Created collection: {result}")
    
    return True


def load_drugs_to_db():
    """Load drug embeddings into the database"""
    print("\n" + "="*60)
    print("LOADING DRUGS INTO DATABASE")
    print("="*60 + "\n")
    
    client = VectorDBClient()
    encoder = MolecularEncoder(method="morgan", dim=2048)
    
    # Load drug dataset
    data_path = Path("data/drugs.csv")
    if not data_path.exists():
        print(f"❌ Drug dataset not found at {data_path}")
        print("   Run: uv run python src/data_loader.py")
        return False
    
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} drugs from {data_path}")
    
    # Prepare batch insert items
    print("\nGenerating molecular embeddings...")
    items = []
    failed = []
    
    for idx, row in df.iterrows():
        try:
            # Generate embedding
            smiles = row['smiles']
            vector = encoder.encode(smiles)
            
            # Prepare metadata (all values must be strings)
            metadata = {
                "name": str(row.get('name', f'drug_{idx}')),
                "smiles": str(smiles),
            }
            
            # Add optional fields if they exist
            if 'indication' in row and pd.notna(row['indication']):
                metadata["indication"] = str(row['indication'])
            
            if 'drug_id' in row:
                drug_id = str(row['drug_id'])
            else:
                drug_id = f"DRUG_{idx:06d}"
            
            items.append({
                "id": drug_id,
                "vector": vector,
                "metadata": metadata
            })
            
            if (idx + 1) % 5 == 0:
                print(f"  Processed {idx + 1}/{len(df)} drugs...")
                
        except Exception as e:
            failed.append((idx, str(e)))
            print(f"  ⚠ Failed to encode {row.get('name', f'drug_{idx}')}: {e}")
    
    print(f"\n✓ Successfully encoded {len(items)} drugs")
    if failed:
        print(f"⚠ Failed to encode {len(failed)} drugs")
    
    # Bulk insert into drugs collection
    print("\nInserting drugs into 'drugs' collection...")
    result = client.bulk_insert(items, collection="drugs")
    
    print(f"\n✓ Inserted {result['inserted']} drugs")
    if result['errors']:
        print(f"⚠ Errors: {len(result['errors'])}")
        for err in result['errors'][:5]:  # Show first 5 errors
            print(f"  - {err['id']}: {err['error']}")
    
    # Show final stats
    stats = client.get_stats("drugs")
    print(f"\n📊 Final Stats:")
    print(f"   Collection: drugs")
    print(f"   Dimension: {stats['dim']}")
    print(f"   Total vectors: {stats['num_vectors']}")
    print(f"   Memory: ~{stats['mem_bytes_approx'] / 1024 / 1024:.2f} MB")
    
    return True


def main():
    """Setup and load drugs"""
    # Step 1: Create collection
    if not setup_drugs_collection():
        return
    
    # Step 2: Load drugs
    print("\n")
    if not load_drugs_to_db():
        return
    
    print("\n" + "="*60)
    print("✓ DRUGS COLLECTION READY!")
    print("="*60)
    print("\nYou can now search for similar drugs!")
    print("Try: uv run python src/database/test_drug_search.py")


if __name__ == "__main__":
    main()
