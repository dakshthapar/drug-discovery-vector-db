import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import StatsPanel from '../../components/home/StatsPanel';
import InsertVectorForm from '../../components/home/InsertVectorForm';
import SearchKNNForm from '../../components/home/SearchKNNForm';
import LoadCollectionForm from '../../components/home/LoadCollectionForm';
import { theme } from '../../styles/theme';

const Home: React.FC = () => {
    return (
        <PageContainer>
            <div style={{ textAlign: 'center', marginBottom: theme.spacing.section }}>
                <h1 style={{ fontSize: theme.typography.size.display, fontWeight: theme.typography.weight.bold, color: theme.colors.text.primary }}>
                    Vector Database
                </h1>
                <p style={{ color: theme.colors.text.secondary }}>
                    High-performance vector similarity search
                </p>
            </div>

            <StatsPanel />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: theme.spacing.xl }}>
                <div>
                    <InsertVectorForm />
                    <LoadCollectionForm />
                </div>
                <div>
                    <SearchKNNForm />
                </div>
            </div>
        </PageContainer>
    );
};

export default Home;
