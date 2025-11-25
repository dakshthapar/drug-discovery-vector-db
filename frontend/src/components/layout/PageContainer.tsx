import React from 'react';
import { theme } from '../../styles/theme';

interface PageContainerProps {
    children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
    return (
        <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '2rem',
            animation: `fadeIn ${theme.transitions.default}`,
        }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
            {children}
        </div>
    );
};

export default PageContainer;
