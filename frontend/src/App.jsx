import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JournalDashboard from './pages/JournalDashboard';
import JournalEditor from './pages/JournalEditor';
import JournalView from './pages/JournalView';
import WeeklyPlannerPage from './pages/WeeklyPlannerPage';
import DailyPlannerPage from './pages/DailyPlannerPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Journal Routes */}
        <Route
          path="journal"
          element={
            <ProtectedRoute>
              <JournalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="journal/new"
          element={
            <ProtectedRoute>
              <JournalEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="journal/:id"
          element={
            <ProtectedRoute>
              <JournalView />
            </ProtectedRoute>
          }
        />
        <Route
          path="journal/:id/edit"
          element={
            <ProtectedRoute>
              <JournalEditor />
            </ProtectedRoute>
          }
        />

        {/* Protected Planner Routes */}
        <Route
          path="planner"
          element={
            <ProtectedRoute>
              <WeeklyPlannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="planner/:date"
          element={
            <ProtectedRoute>
              <DailyPlannerPage />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
