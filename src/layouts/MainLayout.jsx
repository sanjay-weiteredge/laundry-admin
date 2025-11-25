import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Topbar from '../components/navigation/Topbar';
import '../styles/layouts.css';

const routeTitles = {
  '/': 'Dashboard Overview',
  '/stores': 'Stores Management',
  '/orders': 'Orders Monitoring',
  '/services': 'Service Management',
  '/users': 'Users Management',
  '/profile': 'Profile ',
};

const MainLayout = () => {
  const location = useLocation();

  // Try exact match first, then fallback to startsWith for nested routes
  const currentTitle =
    routeTitles[location.pathname] ||
    Object.entries(routeTitles).find(([path]) => 
      location.pathname.startsWith(path) && path !== '/'
    )?.[1] ||
    'Dashboard Overview';

  return (
    <div className="main-layout d-flex">
      <Sidebar />
      <div className="workspace d-flex flex-column flex-grow-1">
        <Topbar title={currentTitle} />
        <main className="workspace__content flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;


