import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import AdminDashboard from './components/AdminDashboard'
import UserDashboard from './components/UserDashboard'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/super-admin" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'super_admin' ? <Navigate to="/super-admin" replace /> :
            user.role === 'admin' ? <Navigate to="/admin" replace /> :
            <Navigate to="/user" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/unauthorized" 
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>
        } 
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
