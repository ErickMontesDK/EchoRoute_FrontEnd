import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosInstance';
import LoadingScreen from './LoadingScreen';

interface BackendHealthCheckProps {
    children: React.ReactNode;
}

const BackendHealthCheck: React.FC<BackendHealthCheckProps> = ({ children }) => {
    const [isBackendReady, setIsBackendReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 10;
        const retryDelay = 6000;

        const checkHealth = async () => {
            try {
                await api.get('public-business-config/');

                if (isMounted) {
                    setIsBackendReady(true);
                }
            } catch (err) {
                console.warn(`Backend health check failed (attempt ${retryCount + 1}):`, err);

                if (isMounted && retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(checkHealth, retryDelay);
                } else if (isMounted) {

                    setIsBackendReady(true);
                    setError('Backend is taking longer than expected to respond.');
                }
            }
        };

        checkHealth();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!isBackendReady) {
        return <LoadingScreen />;
    }

    return (
        <>
            {error && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    zIndex: 10000,
                    fontSize: '14px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {error}
                </div>
            )}
            {children}
        </>
    );
};

export default BackendHealthCheck;
