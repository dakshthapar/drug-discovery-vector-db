import React, { useEffect, useState } from 'react';
import Card from '../layout/Card';
import { theme } from '../../styles/theme';
import { Activity, Database, Layers, Clock } from 'lucide-react';

const API_URL = 'http://localhost:8080';

const StatsPanel: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/stats`);
            const data = await res.json();
            setStats(data);
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
    }, []);

    if (loading) return <div>Loading stats...</div>;

    const items = [
        { label: 'Total Vectors', value: stats?.vector_count || 0, icon: Database },
        { label: 'Dimension', value: stats?.dimension || 0, icon: Layers },
        { label: 'Collections', value: 1, icon: Activity }, // Placeholder
        { label: 'Uptime', value: '99.9%', icon: Clock }, // Placeholder
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
