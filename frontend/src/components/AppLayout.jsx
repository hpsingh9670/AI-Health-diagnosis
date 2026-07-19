import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/symptoms': 'AI Symptom Checker',
  '/hospitals': 'Nearby Hospitals',
  '/appointments': 'Appointments',
  '/sos': 'Emergency SOS',
  '/family': 'Family Health Records',
  '/chatbot': 'AI Chatbot',
  '/medicines': 'Medicine Reminders',
  '/health-tips': 'Health Tips',
  '/profile': 'My Profile',
  '/admin': 'Admin Dashboard',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'MediAI';

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <div className="page-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
