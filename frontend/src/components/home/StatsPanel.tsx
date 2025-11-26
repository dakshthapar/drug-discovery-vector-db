import React, { useEffect, useState } from 'react';
import Card from '../layout/Card';
import { theme } from '../../styles/theme';
import { Activity, Database, Layers, Clock } from 'lucide-react';

const API_URL = 'http://localhost:8080';

interface StatsPanelProps {
    collection: string;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ collection }) => {
    const [stats, setStats] = useState<any>(null);
    const [collectionCount, setCollectionCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            // Fetch stats for current collection
            const statsRes = await fetch(`${API_URL}/stats?collection=${encodeURIComponent(collection)}`);
            const statsData = await statsRes.json();
            setStats(statsData);

            // Fetch total collection count
            const collectionsRes = await fetch(`${API_URL}/collections`);
            const collectionsData = await collectionsRes.json();
            setCollectionCount(collectionsData.collections?.length || 0);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, [collection]);

    if (loading) return <div>Loading stats...</div>;

    const items = [
        { label: 'Total Vectors', value: stats?.num_vectors || 0, icon: Database },
        { label: 'Dimension', value: stats?.dim || 0, icon: Layers },
        { label: 'Collections', value: collectionCount, icon: Activity },
        { label: 'Current Collection', value: collection, icon: Clock },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.section,
        }}>
            {items.map((item) => (
                <Card key={item.label} className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                        <div style={{
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            background: theme.colors.primary.light,
                            color: theme.colors.primary.base,
                        }}>
                            <item.icon size={20} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: theme.typography.size.sm,
                                color: theme.colors.text.secondary,
                            }}>
                                {item.label}
                            </div>
                            <div style={{
                                fontSize: theme.typography.size.xl,
                                fontWeight: theme.typography.weight.bold,
                                color: theme.colors.text.primary,
                            }}>
                                {item.value}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default StatsPanel;
