import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home/index';
import ApiDocs from './pages/ApiDocs';
import { Embeddings } from './pages/Embeddings';
import { theme } from './styles/theme';
import './App.css';

function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            style={{
                textDecoration: 'none',
                color: isActive ? theme.colors.primary.base : theme.colors.text.secondary,
                fontWeight: isActive ? theme.typography.weight.semibold : theme.typography.weight.medium,
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.radii.md,
                backgroundColor: isActive ? theme.colors.primary.light : 'transparent',
                transition: theme.transitions.fast,
            }}
        >
            {children}
        </Link>
    );
}

function NavBar() {
    return (
        <nav style={{
            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: theme.colors.background,
        }}>
            <div style={{ fontWeight: 'bold', fontSize: theme.typography.size.lg }}>VectorDB</div>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/embeddings">Embeddings</NavLink>
                <NavLink to="/api-docs">API Explorer</NavLink>
            </div>
        </nav>
    );
}

import ErrorBoundary from './components/ErrorBoundary';

function App() {
    console.log("App rendering");
    console.log("Theme:", theme);
    return (
        <ErrorBoundary>
            <Router>
                <div style={{ minHeight: '100vh', background: theme.colors.surface }}>
                    <NavBar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/embeddings" element={<Embeddings />} />
                        <Route path="/api-docs" element={<ApiDocs />} />
                    </Routes>
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
