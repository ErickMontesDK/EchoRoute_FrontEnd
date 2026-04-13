import {
    LayoutDashboard,
    MapPin,
    LogOut,
    User,
    Menu,
    Store,
    CircleUser,
    Building2,
    ClipboardList,
    Users
} from 'lucide-react';

import { api, clearAuthData } from '../api/axiosInstance';
import '../styles/layout.css';

interface SidebarVars {
    role: string;
    name: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ role, name, isOpen, setIsOpen }: SidebarVars) {
    const businessName = localStorage.getItem("business_name") || "EchoRoute";
    const logoUrl = localStorage.getItem("logo_url") || "./images/logo-simple.png";
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            clearAuthData();
            localStorage.removeItem("in_session");
            window.location.href = "/login";
        }
    };

    const currentPage = window.location.pathname;

    const normalizedRole = role.toLowerCase();

    return (
        <div className={`bg-dark text-white sidebar-container ${isOpen ? 'w-250 open' : 'w-70'}`}>


            <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-secondary">
                {isOpen && <h5 className="mb-0 fw-bold text-truncate">{businessName}</h5>}
                <button
                    className="btn btn-outline-light border-0 p-1 d-md-block"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu size={24} />
                </button>
            </div>



            <div className="p-3 mb-4 d-flex align-items-center overflow-hidden">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                    <User size={20} />
                </div>
                {isOpen && (
                    <div className="ms-3 text-truncate">
                        <div className="fw-bold">{name}</div>
                        <div className="small text-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>{role}</div>
                    </div>
                )}
            </div>



            <nav className="flex-grow-1 px-2">
                <ul className="list-unstyled">
                    <li>
                        <button className={`btn btn-dark w-100 text-start d-flex align-items-center py-3 px-3 mb-1 nav-link-custom ${currentPage === "/home" ? "active" : ""}`} onClick={() => window.location.href = "/"}>
                            <LayoutDashboard size={20} className="flex-shrink-0" />
                            {isOpen && <span className="ms-3">Dashboard</span>}
                        </button>
                    </li>
                    {normalizedRole === 'delivery' && (
                        <>
                            <li>
                                <button className={`btn btn-dark w-100 text-start d-flex align-items-center py-3 px-3 mb-1 nav-link-custom ${currentPage === "/register-visit" ? "active" : ""}`} onClick={() => window.location.href = "/register-visit"}>
                                    <MapPin size={20} className="flex-shrink-0" />
                                    {isOpen && <span className="ms-3">Register Visit</span>}
                                </button>
                            </li>
                            <li>
                                <button className={`btn btn-dark w-100 text-start d-flex align-items-center py-3 px-3 mb-1 nav-link-custom ${currentPage === "/register-client" ? "active" : ""}`} onClick={() => window.location.href = "/register-client"}>
                                    <Store size={20} className="flex-shrink-0" />
                                    {isOpen && <span className="ms-3">Register Client</span>}
                                </button>
                            </li>
                        </>
                    )}
                    {(normalizedRole === 'admin' || normalizedRole === 'operator') && (
                        <>
                            <li>
                                <button className={`btn btn-dark w-100 text-start d-flex align-items-center py-3 px-3 mb-1 nav-link-custom ${currentPage === "/visits-data" ? "active" : ""}`} onClick={() => window.location.href = "/visits-data"}>
                                    <ClipboardList size={20} className="flex-shrink-0" />
                                    {isOpen && <span className="ms-3">Visits</span>}
                                </button>
                            </li>
                            <li>
                                <button className={`btn btn-dark w-100 text-start d-flex align-items-center py-3 px-3 mb-1 nav-link-custom ${currentPage === "/clients-data" ? "active" : ""}`} onClick={() => window.location.href = "/clients-data"}>
                                    <Store size={20} className="flex-shrink-0" />
                                    {isOpen && <span className="ms-3">Clients</span>}
                                </button>
                            </li>
                        </>
                    )}

                    {normalizedRole === 'admin' && (
                        <li>
                            <button className={`btn btn-dark w-100 text-start d-flex align-items-center py-3 px-3 mb-1 nav-link-custom ${currentPage === "/users-data" ? "active" : ""}`} onClick={() => window.location.href = "/users-data"}>
                                <Users size={20} className="flex-shrink-0" />
                                {isOpen && <span className="ms-3">Users</span>}
                            </button>
                        </li>
                    )}
                    {normalizedRole === 'admin' && (
                        <li>
                            <button className={`btn btn-dark w-100 text-start d-flex align-items-center py-3 px-3 mb-1 nav-link-custom ${currentPage === "/business-data" ? "active" : ""}`} onClick={() => window.location.href = "/business-data"}>
                                <Building2 size={20} className="flex-shrink-0" />
                                {isOpen && <span className="ms-3">Business</span>}
                            </button>
                        </li>
                    )}
                    <li>
                        <button className={`btn btn-dark w-100 text-start d-flex align-items-center py-3 px-3 mb-1 nav-link-custom ${currentPage === "/profile" ? "active" : ""}`} onClick={() => window.location.href = "/profile"}>
                            <CircleUser size={20} className="flex-shrink-0" />
                            {isOpen && <span className="ms-3">Profile</span>}
                        </button>
                    </li>
                </ul>
            </nav>

            <div className={`p-3 d-flex justify-content-center ${isOpen ? "" : "px-1"}`}>
                <img
                    src={logoUrl}
                    alt="Logo"
                    className="img-fluid rounded"
                    style={{
                        maxHeight: isOpen ? '80px' : '30px',
                        objectFit: 'contain'
                    }}
                />
            </div>


            <div className="p-3 border-top border-secondary">
                <button className="btn btn-outline-danger w-100 d-flex align-items-center py-2 px-3 justify-content-center" onClick={handleLogout}>
                    <LogOut size={18} className="flex-shrink-0" />
                    {isOpen && <span className="ms-2">Log out</span>}
                </button>
            </div>

        </div>
    );
};


