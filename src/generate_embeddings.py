"""
Generate embeddings for all drugs in the dataset
"""
import pandas as pd
import numpy as np
from pathlib import Path
from embeddings.molecular_encoder import MolecularEncoder
from tqdm import tqdm


def generate_embeddings(input_file: str = "data/drugs.csv", 
                       output_file: str = "data/drug_embeddings.npz",
                       method: str = "morgan",
                       dim: int = 2048):
    """
    Generate embeddings for all drugs in the dataset
    """
    print(f"Loading dataset from {input_file}...")
    df = pd.read_csv(input_file)
    
    print(f"Dataset columns: {df.columns.tolist()}")
    
    # Add drug_id if it doesn't exist
    if 'drug_id' not in df.columns:
        df['drug_id'] = [f"DRUG_{i:06d}" for i in range(len(df))]
        print("Added drug_id column")
    
    print(f"Initializing encoder (method={method}, dim={dim})...")
    encoder = MolecularEncoder(method=method, dim=dim)
    
    print(f"Generating embeddings for {len(df)} molecules...")
    
    embeddings = []
    valid_indices = []
    
    for idx, row in tqdm(df.iterrows(), total=len(df)):
        try:
            smiles = row['smiles']
            embedding = encoder.encode(smiles)
            embeddings.append(embedding)
            valid_indices.append(idx)
        except Exception as e:
            print(f"Warning: Could not encode {row.get('name', 'unknown')}: {e}")
            continue
    
    # Convert to numpy array
    embeddings = np.array(embeddings)
    
    # Filter dataframe to only valid molecules
    df_valid = df.iloc[valid_indices].reset_index(drop=True)
    
    print(f"\nSuccessfully generated {len(embeddings)} embeddings")
    print(f"Embedding shape: {embeddings.shape}")
    
    # Save embeddings and metadata
    output_path = Path(output_file)
    output_path.parent.mkdir(exist_ok=True)
    
    # Prepare metadata - handle missing columns gracefully
    metadata = {
        'embeddings': embeddings,
        'drug_ids': df_valid['drug_id'].values,
        'smiles': df_valid['smiles'].values,
    }
    
    # Add optional columns if they exist
    if 'name' in df_valid.columns:
        metadata['names'] = df_valid['name'].values
    if 'indication' in df_valid.columns:
        metadata['indications'] = df_valid['indication'].values
    
    np.savez(output_path, **metadata)
    
    print(f"\n✓ Saved embeddings to {output_path}")
    
    # Also save the filtered dataframe
    df_path = output_path.parent / "drugs_with_embeddings.csv"
    df_valid.to_csv(df_path, index=False)
    print(f"✓ Saved filtered dataset to {df_path}")
    
    return embeddings, df_valid


def load_embeddings(file_path: str = "data/drug_embeddings.npz"):
    """
    Load pre-computed embeddings
    """
    data = np.load(file_path, allow_pickle=True)
    print(f"Loaded embeddings from {file_path}")
    print(f"Available keys: {list(data.keys())}")
    return data


def main():
    print("\n" + "="*60)
    print("GENERATING DRUG EMBEDDINGS")
    print("="*60 + "\n")
    
    embeddings, df = generate_embeddings()
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total molecules: {len(df)}")
    print(f"Embedding dimension: {embeddings.shape[1]}")
    print(f"Memory size: {embeddings.nbytes / 1024 / 1024:.2f} MB")
    print(f"\nSample drugs:")
    
    # Display available columns
    display_cols = ['drug_id', 'smiles']
    if 'name' in df.columns:
        display_cols.insert(1, 'name')
    
    print(df[display_cols].head(10))


if __name__ == "__main__":
    main()
