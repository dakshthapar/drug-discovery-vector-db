"""
Simple script to encode a molecule from command line
"""
import sys
from molecular_encoder import MolecularEncoder


def main():
    if len(sys.argv) < 2:
        print("Usage: python encode_molecule.py '<SMILES_STRING>'")
        print("\nExample:")
        print("  python encode_molecule.py 'CC(=O)Oc1ccccc1C(=O)O'  # Aspirin")
        sys.exit(1)
    
    smiles = sys.argv[1]
    
    encoder = MolecularEncoder(method="morgan", dim=2048)
    
    try:
        embedding = encoder.encode(smiles)
        print(f"SMILES: {smiles}")
        print(f"Embedding dimension: {len(embedding)}")
        print(f"Non-zero elements: {(embedding != 0).sum()}")
        print(f"\nFirst 20 values:")
        print(embedding[:20])
        
    except Exception as e:
        print(f"Error encoding molecule: {e}")


if __name__ == "__main__":
    main()
