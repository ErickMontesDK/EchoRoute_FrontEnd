import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import RegisterVisit from './components/RegisterVisit';
import ProtectedRoutes from './components/ProtectedRoutes';
import VisitsData from './features/visits/components/VisitsData';
import RegisterClient from './components/RegisterClient';
import ClientsData from './features/clients/components/ClientsData';
import UsersData from './features/users/components/UsersData';
import Profile from './components/Profile';
import BusinessData from './features/business/components/BusinessData';
import { useEffect } from 'react';
import BackendHealthCheck from './components/BackendHealthCheck';

function App() {
  useEffect(() => {
    const name = localStorage.getItem("business_name");
    const logo = localStorage.getItem("logo_url");

    if (name) document.title = name;

    if (logo) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = logo;
    }
  }, []);

  return (
    <BackendHealthCheck>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoutes allowedRoles={['admin', 'operator', 'delivery']} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<ProtectedRoutes allowedRoles={['delivery']} />}>
            <Route path="/register-visit" element={<RegisterVisit />} />
          </Route>
          <Route element={<ProtectedRoutes allowedRoles={['admin', 'operator']} />}>
            <Route path="/visits-data" element={<VisitsData />} />
          </Route>
          <Route element={<ProtectedRoutes allowedRoles={['admin', 'operator']} />}>
            <Route path="/clients-data" element={<ClientsData />} />
          </Route>
          <Route element={<ProtectedRoutes allowedRoles={['delivery']} />}>
            <Route path="/register-client" element={<RegisterClient />} />
          </Route>
          <Route element={<ProtectedRoutes allowedRoles={['admin']} />}>
            <Route path="/users-data" element={<UsersData />} />
          </Route>
          <Route element={<ProtectedRoutes allowedRoles={['admin']} />}>
            <Route path="/business-data" element={<BusinessData />} />
          </Route>
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </Router>
    </BackendHealthCheck>
  );
}

export default App;
