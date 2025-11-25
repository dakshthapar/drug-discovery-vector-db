"""
Molecular Encoder: Converts SMILES strings to vector embeddings
"""
import numpy as np
from typing import List, Union
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors
import torch


class MolecularEncoder:
    """
    Encodes molecular SMILES strings into fixed-dimensional vectors.
    Supports multiple encoding methods.
    """
    
    def __init__(self, method: str = "morgan", dim: int = 2048):
        """
        Initialize the molecular encoder.
        
        Args:
            method: Encoding method ('morgan', 'rdkit_descriptors', or 'transformer')
            dim: Dimension of output vectors
        """
        self.method = method
        self.dim = dim
        
        if method == "transformer":
            self._init_transformer()
    
    def _init_transformer(self):
        """Initialize transformer-based model (ChemBERTa or similar)"""
        try:
            from transformers import AutoTokenizer, AutoModel
            self.tokenizer = AutoTokenizer.from_pretrained("seyonec/ChemBERTa-zinc-base-v1")
            self.model = AutoModel.from_pretrained("seyonec/ChemBERTa-zinc-base-v1")
            self.model.eval()
            print("Loaded ChemBERTa transformer model")
        except Exception as e:
            print(f"Warning: Could not load transformer model: {e}")
            print("Falling back to Morgan fingerprints")
            self.method = "morgan"
    
    def smiles_to_mol(self, smiles: str):
        """Convert SMILES string to RDKit molecule object"""
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            raise ValueError(f"Invalid SMILES string: {smiles}")
        return mol
    
    def encode_morgan(self, smiles: str) -> np.ndarray:
        """
        Encode molecule using Morgan fingerprints (ECFP).
        Fast and commonly used in drug discovery.
        """
        mol = self.smiles_to_mol(smiles)
        fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=self.dim)
        arr = np.zeros((self.dim,), dtype=np.float32)
        Chem.DataStructs.ConvertToNumpyArray(fp, arr)
        return arr
    
    def encode_rdkit_descriptors(self, smiles: str) -> np.ndarray:
        """
        Encode molecule using RDKit molecular descriptors.
        Provides physicochemical properties as features.
        """
        mol = self.smiles_to_mol(smiles)
        
        # Calculate key descriptors
        descriptors = [
            Descriptors.MolWt(mol),
            Descriptors.MolLogP(mol),
            Descriptors.NumHDonors(mol),
            Descriptors.NumHAcceptors(mol),
            Descriptors.TPSA(mol),
            Descriptors.NumRotatableBonds(mol),
            Descriptors.NumAromaticRings(mol),
            Descriptors.NumSaturatedRings(mol),
            Descriptors.NumAliphaticRings(mol),
            Descriptors.RingCount(mol),
        ]
        
        # Pad or truncate to desired dimension
        vec = np.array(descriptors, dtype=np.float32)
        if len(vec) < self.dim:
            vec = np.pad(vec, (0, self.dim - len(vec)), mode='constant')
        else:
            vec = vec[:self.dim]
        
        return vec
    
    def encode_transformer(self, smiles: str) -> np.ndarray:
        """
        Encode molecule using transformer model (ChemBERTa).
        Most accurate but slower.
        """
        if self.method != "transformer":
            raise ValueError("Transformer not initialized")
        
        # Tokenize and encode
        inputs = self.tokenizer(smiles, return_tensors="pt", padding=True, truncation=True)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            # Use [CLS] token embedding
            embeddings = outputs.last_hidden_state[:, 0, :].squeeze().numpy()
        
        # Adjust dimension if needed
        if len(embeddings) < self.dim:
            embeddings = np.pad(embeddings, (0, self.dim - len(embeddings)), mode='constant')
        else:
            embeddings = embeddings[:self.dim]
        
        return embeddings.astype(np.float32)
    
    def encode(self, smiles: Union[str, List[str]]) -> np.ndarray:
        """
        Encode one or more SMILES strings to vectors.
        
        Args:
            smiles: Single SMILES string or list of SMILES strings
            
        Returns:
            np.ndarray: Vector(s) of shape (dim,) or (n, dim)
        """
        # Handle single SMILES
        if isinstance(smiles, str):
            if self.method == "morgan":
                return self.encode_morgan(smiles)
            elif self.method == "rdkit_descriptors":
                return self.encode_rdkit_descriptors(smiles)
            elif self.method == "transformer":
                return self.encode_transformer(smiles)
            else:
                raise ValueError(f"Unknown encoding method: {self.method}")
        
        # Handle batch of SMILES
        else:
            return np.array([self.encode(s) for s in smiles])
    
    def batch_encode(self, smiles_list: List[str], batch_size: int = 32) -> np.ndarray:
        """
        Encode a list of SMILES in batches for efficiency.
        
        Args:
            smiles_list: List of SMILES strings
            batch_size: Number of molecules to process at once
            
        Returns:
            np.ndarray: Array of shape (n, dim)
        """
        all_embeddings = []
        
        for i in range(0, len(smiles_list), batch_size):
            batch = smiles_list[i:i + batch_size]
            embeddings = self.encode(batch)
            all_embeddings.append(embeddings)
        
        return np.vstack(all_embeddings)


def test_encoder():
    """Test the molecular encoder with sample molecules"""
    # Sample drug SMILES
    test_molecules = {
        "Aspirin": "CC(=O)Oc1ccccc1C(=O)O",
        "Caffeine": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
        "Penicillin": "CC1(C)SC2C(NC(=O)Cc3ccccc3)C(=O)N2C1C(=O)O",
    }
    
    print("Testing Molecular Encoder\n" + "="*50)
    
    # Test Morgan fingerprints (default)
    encoder = MolecularEncoder(method="morgan", dim=2048)
    
    for name, smiles in test_molecules.items():
        try:
            embedding = encoder.encode(smiles)
            print(f"\n{name}:")
            print(f"  SMILES: {smiles}")
            print(f"  Embedding shape: {embedding.shape}")
            print(f"  Non-zero elements: {np.count_nonzero(embedding)}")
            print(f"  First 10 values: {embedding[:10]}")
        except Exception as e:
            print(f"\n{name}: Error - {e}")
    
    # Test batch encoding
    print("\n" + "="*50)
    print("Testing batch encoding...")
    smiles_list = list(test_molecules.values())
    batch_embeddings = encoder.batch_encode(smiles_list)
    print(f"Batch embeddings shape: {batch_embeddings.shape}")


if __name__ == "__main__":
    test_encoder()
