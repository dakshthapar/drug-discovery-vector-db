"""
Download and prepare drug dataset for the vector database
"""
import pandas as pd
import numpy as np
from pathlib import Path
import requests
from typing import Optional


class DrugDataLoader:
    """Load and prepare drug datasets"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
    
    def download_drugbank_approved(self, limit: Optional[int] = None) -> pd.DataFrame:
        """
        Download FDA-approved drugs from public sources.
        We'll use a curated dataset from PubChem or ChEMBL.
        """
        print("Downloading FDA-approved drugs dataset...")
        
        # Using a public dataset of FDA-approved drugs
        # This is a simplified version - you can expand with more sources
        url = "https://raw.githubusercontent.com/dhimmel/drugbank/gh-pages/data/drugbank.tsv"
        
        try:
            df = pd.read_csv(url, sep='\t')
            print(f"Downloaded {len(df)} drugs from DrugBank")
        except Exception as e:
            print(f"Could not download from primary source: {e}")
            print("Using backup dataset...")
            df = self._get_backup_dataset()
        
        # Filter for approved drugs with valid SMILES
        if 'groups' in df.columns:
            df = df[df['groups'].str.contains('approved', case=False, na=False)]
        
        # Keep only necessary columns
        required_cols = ['name', 'smiles']
        available_cols = [col for col in required_cols if col in df.columns]
        
        if 'smiles' not in df.columns and 'structure' in df.columns:
            df = df.rename(columns={'structure': 'smiles'})
        
        # Clean the data
        df = df.dropna(subset=['smiles'])
        df = df[df['smiles'].str.len() > 0]
        
        # Add drug IDs
        df['drug_id'] = [f"DRUG_{i:06d}" for i in range(len(df))]
        
        if limit:
            df = df.head(limit)
        
        print(f"Prepared {len(df)} drugs with valid SMILES")
        return df
    
    def _get_backup_dataset(self) -> pd.DataFrame:
        """
        Backup dataset with common FDA-approved drugs
        """
        drugs = [
            {
                "name": "Aspirin",
                "smiles": "CC(=O)Oc1ccccc1C(=O)O",
                "indication": "Pain relief, anti-inflammatory"
            },
            {
                "name": "Ibuprofen",
                "smiles": "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
                "indication": "Pain relief, anti-inflammatory"
            },
            {
                "name": "Acetaminophen",
                "smiles": "CC(=O)Nc1ccc(O)cc1",
                "indication": "Pain relief, fever reduction"
            },
            {
                "name": "Caffeine",
                "smiles": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
                "indication": "Stimulant"
            },
            {
                "name": "Metformin",
                "smiles": "CN(C)C(=N)NC(=N)N",
                "indication": "Type 2 diabetes"
            },
            {
                "name": "Atorvastatin",
                "smiles": "CC(C)c1c(C(=O)Nc2ccccc2)c(c(c(c1)c1ccc(F)cc1)c1ccccc1)C(=O)O",
                "indication": "High cholesterol"
            },
            {
                "name": "Lisinopril",
                "smiles": "NCCCC[C@H](N[C@@H](CCc1ccccc1)C(=O)O)C(=O)N1CCC[C@H]1C(=O)O",
                "indication": "High blood pressure"
            },
            {
                "name": "Levothyroxine",
                "smiles": "NC(Cc1cc(I)c(Oc2cc(I)c(O)c(I)c2)c(I)c1)C(=O)O",
                "indication": "Hypothyroidism"
            },
            {
                "name": "Amlodipine",
                "smiles": "CCOC(=O)C1=C(COCCN)NC(C)=C(C(=O)OC)C1c1ccccc1Cl",
                "indication": "High blood pressure"
            },
            {
                "name": "Omeprazole",
                "smiles": "COc1ccc2nc(S(=O)Cc3ncc(C)c(OC)c3C)[nH]c2c1",
                "indication": "Acid reflux, ulcers"
            },
            {
                "name": "Simvastatin",
                "smiles": "CCC(C)(C)C(=O)O[C@H]1C[C@@H](C)C=C2C=C[C@H](C)[C@H](CC[C@@H]3C[C@@H](O)CC(=O)O3)[C@@H]12",
                "indication": "High cholesterol"
            },
            {
                "name": "Warfarin",
                "smiles": "CC(=O)CC(c1ccccc1)c1c(O)c2ccccc2oc1=O",
                "indication": "Blood thinner"
            },
            {
                "name": "Gabapentin",
                "smiles": "NCC1(CC(=O)O)CCCCC1",
                "indication": "Nerve pain, seizures"
            },
            {
                "name": "Hydrochlorothiazide",
                "smiles": "NS(=O)(=O)c1cc2c(cc1Cl)NCNS2(=O)=O",
                "indication": "High blood pressure, edema"
            },
            {
                "name": "Losartan",
                "smiles": "CCCCc1nc(Cl)c(CO)n1Cc1ccc(cc1)c1ccccc1c1nnn[nH]1",
                "indication": "High blood pressure"
            },
            {
                "name": "Albuterol",
                "smiles": "CC(C)(C)NCC(O)c1ccc(O)c(CO)c1",
                "indication": "Asthma, bronchospasm"
            },
            {
                "name": "Furosemide",
                "smiles": "NS(=O)(=O)c1cc(C(=O)O)c(NCc2ccco2)cc1Cl",
                "indication": "Edema, heart failure"
            },
            {
                "name": "Prednisone",
                "smiles": "CC12CCC(=O)C=C1CCC1C2CCC2(C)C(O)CCC12",
                "indication": "Inflammation, immune disorders"
            },
            {
                "name": "Ciprofloxacin",
                "smiles": "O=C(O)c1cn(C2CC2)c2cc(N3CCNCC3)c(F)cc2c1=O",
                "indication": "Bacterial infections"
            },
            {
                "name": "Amoxicillin",
                "smiles": "CC1(C)SC2C(NC(=O)C(N)c3ccc(O)cc3)C(=O)N2C1C(=O)O",
                "indication": "Bacterial infections"
            },
        ]
        
        df = pd.DataFrame(drugs)
        print(f"Using backup dataset with {len(df)} common drugs")
        return df
    
    def download_chembl_subset(self, limit: int = 1000) -> pd.DataFrame:
        """
        Download a subset of bioactive molecules from ChEMBL
        This gives us more diverse molecules for testing
        """
        print(f"Fetching {limit} molecules from ChEMBL...")
        
        # ChEMBL REST API
        base_url = "https://www.ebi.ac.uk/chembl/api/data"
        
        try:
            # Get approved drugs
            url = f"{base_url}/molecule.json?max_phase=4&limit={limit}"
            response = requests.get(url)
            data = response.json()
            
            molecules = []
            for mol in data['molecules']:
                if mol.get('molecule_structures', {}).get('canonical_smiles'):
                    molecules.append({
                        'drug_id': mol['molecule_chembl_id'],
                        'name': mol.get('pref_name', mol['molecule_chembl_id']),
                        'smiles': mol['molecule_structures']['canonical_smiles'],
                    })
            
            df = pd.DataFrame(molecules)
            print(f"Downloaded {len(df)} molecules from ChEMBL")
            return df
            
        except Exception as e:
            print(f"Could not download from ChEMBL: {e}")
            print("Falling back to backup dataset...")
            return self._get_backup_dataset()
    
    def save_dataset(self, df: pd.DataFrame, filename: str = "drugs.csv"):
        """Save dataset to CSV"""
        filepath = self.data_dir / filename
        df.to_csv(filepath, index=False)
        print(f"Saved dataset to {filepath}")
        return filepath
    
    def load_dataset(self, filename: str = "drugs.csv") -> pd.DataFrame:
        """Load dataset from CSV"""
        filepath = self.data_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Dataset not found: {filepath}")
        
        df = pd.read_csv(filepath)
        print(f"Loaded {len(df)} drugs from {filepath}")
        return df


def main():
    """Download and prepare the dataset"""
    loader = DrugDataLoader()
    
    print("\n" + "="*60)
    print("DRUG DATASET PREPARATION")
    print("="*60 + "\n")
    
    # Try to download from online sources, fall back to backup
    print("Option 1: Downloading from DrugBank...")
    try:
        df = loader.download_drugbank_approved(limit=500)
    except Exception as e:
        print(f"Error: {e}")
        print("\nOption 2: Using backup dataset...")
        df = loader._get_backup_dataset()
    
    # Show sample
    print("\n" + "="*60)
    print("DATASET SAMPLE")
    print("="*60)
    print(df.head(10))
    
    print("\n" + "="*60)
    print("DATASET STATISTICS")
    print("="*60)
    print(f"Total drugs: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    if 'smiles' in df.columns:
        print(f"Average SMILES length: {df['smiles'].str.len().mean():.1f}")
    
    # Save
    filepath = loader.save_dataset(df)
    
    print("\n" + "="*60)
    print(f"✓ Dataset ready at: {filepath}")
    print("="*60)
    
    return df


if __name__ == "__main__":
    df = main()
