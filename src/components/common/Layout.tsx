import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show navbar only when user is logged in */}
      {user && <Navbar />}
      <main className={user ? "pt-16" : ""}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;