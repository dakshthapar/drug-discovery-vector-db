import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import StatsPanel from '../../components/home/StatsPanel';
import InsertVectorForm from '../../components/home/InsertVectorForm';
import SearchKNNForm from '../../components/home/SearchKNNForm';
import LoadCollectionForm from '../../components/home/LoadCollectionForm';
import CollectionSelector from '../../components/collection/CollectionSelector';
import { theme } from '../../styles/theme';

const Home: React.FC = () => {
    const [selectedCollection, setSelectedCollection] = useState<string>('default');

    return (
        <PageContainer>
            <div style={{ textAlign: 'center', marginBottom: theme.spacing.section }}>
                <h1 style={{ fontSize: theme.typography.size.display, fontWeight: theme.typography.weight.bold, color: theme.colors.text.primary }}>
                    Vector Database
                </h1>
                <p style={{ color: theme.colors.text.secondary }}>
                    High-performance vector similarity search with multiple collections
                </p>
            </div>

            <CollectionSelector
                selectedCollection={selectedCollection}
                onCollectionChange={setSelectedCollection}
            />

            <StatsPanel collection={selectedCollection} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: theme.spacing.xl }}>
                <div>
                    <InsertVectorForm collection={selectedCollection} />
                    <LoadCollectionForm collection={selectedCollection} />
                </div>
                <div>
                    <SearchKNNForm collection={selectedCollection} />
                </div>
            </div>
        </PageContainer>
    );
};

export default Home;
