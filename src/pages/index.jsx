import Layout from "./Layout.jsx";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import CRM from "./CRM";
import Settings from "./Settings";
import Management from "./Management";
import Drive from "./Drive";
import Activities from "./Activities";
import Playbooks from "./Playbooks";
import Forms from "./Forms";
import Records from "./Records";
import Commissions from "./Commissions";
import ViewForm from "./ViewForm";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

const PAGES = {
    LoginPage: LoginPage,
    Dashboard: Dashboard,
    CRM: CRM,
    Settings: Settings,
    Management: Management,
    Drive: Drive,
    Activities: Activities,
    Playbooks: Playbooks,
    Forms: Forms,
    Records: Records,
    Commissions: Commissions,
    ViewForm: ViewForm,
}

// Componente de proteção de rota
function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function _getCurrentPage(url) {
    if (url === '/' || url === '') {
        return 'LoginPage';
    }
    
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || 'LoginPage';
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    // Não renderiza o Layout na página de login
    if (currentPage === 'LoginPage') {
        return <LoginPage />;
    }
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/" element={<LoginPage />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/crm" 
                    element={
                        <PrivateRoute>
                            <CRM />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/settings" 
                    element={
                        <PrivateRoute>
                            <Settings />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/management" 
                    element={
                        <PrivateRoute>
                            <Management />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/drive" 
                    element={
                        <PrivateRoute>
                            <Drive />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/activities" 
                    element={
                        <PrivateRoute>
                            <Activities />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/playbooks" 
                    element={
                        <PrivateRoute>
                            <Playbooks />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/forms" 
                    element={
                        <PrivateRoute>
                            <Forms />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/records" 
                    element={
                        <PrivateRoute>
                            <Records />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/commissions" 
                    element={
                        <PrivateRoute>
                            <Commissions />
                        </PrivateRoute>
                    } 
                />
                <Route path="/viewform" element={<ViewForm />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}