"""
Drug structural analysis and scaffold suggestion
"""
import numpy as np
from typing import List, Dict
from rdkit import Chem
from rdkit.Chem import Descriptors
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from embeddings.molecular_encoder import MolecularEncoder


def analyze_structural_features(smiles_list: List[str]) -> Dict[str, any]:
    """Analyze common structural features across a list of molecules"""
    features = {
        "total_molecules": len(smiles_list),
        "molecular_weights": [],
        "ring_counts": [],
        "aromatic_rings": [],
        "rotatable_bonds": [],
        "h_donors": [],
        "h_acceptors": [],
        "common_features": {}
    }
    
    for smiles in smiles_list:
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                continue
                
            features["molecular_weights"].append(Descriptors.MolWt(mol))
            features["ring_counts"].append(Descriptors.RingCount(mol))
            features["aromatic_rings"].append(Descriptors.NumAromaticRings(mol))
            features["rotatable_bonds"].append(Descriptors.NumRotatableBonds(mol))
            features["h_donors"].append(Descriptors.NumHDonors(mol))
            features["h_acceptors"].append(Descriptors.NumHAcceptors(mol))
            
        except Exception as e:
            print(f"Error analyzing {smiles}: {e}")
            continue
    
    if features["molecular_weights"]:
        features["avg_molecular_weight"] = np.mean(features["molecular_weights"])
        features["avg_ring_count"] = np.mean(features["ring_counts"])
        features["avg_aromatic_rings"] = np.mean(features["aromatic_rings"])
        features["avg_rotatable_bonds"] = np.mean(features["rotatable_bonds"])
        features["avg_h_donors"] = np.mean(features["h_donors"])
        features["avg_h_acceptors"] = np.mean(features["h_acceptors"])
        
        features["molecules_with_aromatic_rings"] = sum(1 for x in features["aromatic_rings"] if x > 0)
        features["molecules_with_multiple_rings"] = sum(1 for x in features["ring_counts"] if x > 1)
    
    return features


def compute_centroid_vector(vectors: List[np.ndarray]) -> np.ndarray:
    """Compute the centroid (average) of multiple vectors"""
    if not vectors:
        return np.array([])
    return np.mean(vectors, axis=0)


def suggest_drug_scaffolds(
    query_drugs: List[Dict],
    all_drugs: List[Dict],
    encoder: MolecularEncoder,
    top_k: int = 5
) -> Dict:
    """
    Suggest drug scaffolds based on query drugs
    
    Returns:
        dict with 'suggestions' and 'centroid_info'
    """
    query_vectors = []
    query_smiles_set = set()
    
    for drug in query_drugs:
        try:
            smiles = drug['smiles']
            query_smiles_set.add(smiles)
            vector = encoder.encode(smiles)
            query_vectors.append(vector)
        except Exception as e:
            print(f"Error encoding query drug: {e}")
            continue
    
    if not query_vectors:
        return {"suggestions": [], "centroid_info": None}
    
    # Compute centroid
    centroid = compute_centroid_vector(query_vectors)
    
    # Centroid metadata
    centroid_info = {
        "dimension": len(centroid),
        "num_source_drugs": len(query_vectors),
        "source_drug_names": [d.get('name', 'Unknown') for d in query_drugs],
        "note": "Centroid is a mathematical average in 2048D space, not a real molecule"
    }
    
    # Find drugs closest to centroid
    candidates = []
    closest_drug = None
    min_distance = float('inf')
    
    for drug in all_drugs:
        smiles = drug.get('smiles', '')
        
        if smiles in query_smiles_set:
            continue
        
        try:
            vector = encoder.encode(smiles)
            distance = 1 - np.dot(centroid, vector) / (np.linalg.norm(centroid) * np.linalg.norm(vector))
            similarity = 1 - distance
            
            drug_with_score = {
                **drug,
                'distance_to_centroid': float(distance),
                'similarity_to_centroid': float(similarity)
            }
            
            candidates.append(drug_with_score)
            
            if distance < min_distance:
                min_distance = distance
                closest_drug = drug_with_score
                
        except Exception as e:
            print(f"Error processing drug {drug.get('name')}: {e}")
            continue
    
    candidates.sort(key=lambda x: x['similarity_to_centroid'], reverse=True)
    
    # Add closest drug to centroid_info
    if closest_drug:
        centroid_info["closest_drug"] = {
            "name": closest_drug.get('name', 'Unknown'),
            "smiles": closest_drug.get('smiles', ''),
            "similarity": closest_drug['similarity_to_centroid'],
            "indication": closest_drug.get('indication')
        }
    
    return {
        "suggestions": candidates[:top_k],
        "centroid_info": centroid_info
    }
