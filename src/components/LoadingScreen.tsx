import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen: React.FC = () => {
    return (
        <div className="loading-screen-overlay">
            <div className="loading-content">
                <div className="loading-logo-container">
                    <div className="loading-spinner-outer"></div>
                    <div className="loading-spinner-inner"></div>
                    <img 
                        src="./images/logo-simple.png" 
                        alt="EchoRoute" 
                        className="loading-logo"
                        onError={(e) => {
                            // Fallback if logo fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
                <div className="loading-text-container">
                    <h1 className="loading-title">EchoRoute</h1>
                    <p className="loading-subtitle">
                        Waking up the system
                        <span className="loading-dots">
                            <span className="loading-dot"></span>
                            <span className="loading-dot"></span>
                            <span className="loading-dot"></span>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
