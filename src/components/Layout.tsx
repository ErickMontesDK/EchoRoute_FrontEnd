import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import '../styles/layout.css';

interface LayoutVars {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutVars) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const role = localStorage.getItem("role") || "";
    const name = localStorage.getItem("name") || "";

    return (
        <div className="d-flex bg-light min-vh-100 flex-column flex-md-row">

            <header className="mobile-top-bar px-3">
                <button
                    className="btn btn-link text-dark p-0 me-3"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={24} />
                </button>
                <h5 className="mb-0 fw-bold">EchoRoute</h5>
            </header>


            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            >
            </div>

            <Sidebar
                role={role}
                name={name}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <main className="main-content">
                <div className="container-fluid">
                    {children}
                </div>
            </main>
        </div>
    );
};



