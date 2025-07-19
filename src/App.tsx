import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Individuals } from './pages/Individuals';
import { Families } from './pages/Families';
import { Needs } from './pages/Needs';
import { Reports } from './pages/Reports';
import { Distributions } from './pages/Distributions';
import { Children } from './pages/Children';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Projects } from './pages/Projects';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { TestMCPUpload } from './components/tests/TestMCPUpload';
import { SecurityAnalysis } from './pages/SecurityAnalysis';
import { Users } from './pages/Users';

export default function App() {
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/test-upload" element={<TestMCPUpload />} />
        <Route path="/security-analysis" element={<SecurityAnalysis />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/individuals" element={<Individuals />} />
            <Route path="/families" element={<Families />} />
            <Route path="/children" element={<Children />} />
            <Route path="/needs" element={<Needs />} />
            <Route path="/distributions/*" element={<Distributions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
