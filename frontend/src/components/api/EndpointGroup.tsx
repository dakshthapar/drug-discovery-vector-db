import React, { useState } from 'react';
import { theme } from '../../styles/theme';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface EndpointGroupProps {
    name: string;
    children: React.ReactNode;
}

const EndpointGroup: React.FC<EndpointGroupProps> = ({ name, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{ marginBottom: theme.spacing.sm }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: theme.colors.text.secondary,
                    fontWeight: theme.typography.weight.semibold,
                    fontSize: theme.typography.size.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}
            >
                <span>{name}</span>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {isOpen && (
                <div style={{
                    animation: `slideDown ${theme.transitions.fast}`,
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default EndpointGroup;
