import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from '../layout/SuperAdminLayout';
import Overview from '../Overview';
import Clients from '../Clients';
import AppsDeployments from '../AppsDeployments';
import PlatformUsers from '../PlatformUsers';
import SystemQuality from '../SystemQuality';
import AutoAppCreator from '../autoapp/AutoAppCreator';
import AuditLogs from '../AuditLogs';
import AiAppCreator from '../../ai/AiAppCreator';
import AiContentStudio from '../../ai/AiContentStudio';
import AiDashboardBuilder from '../../ai/AiDashboardBuilder';
import { useAuth } from '../../context/AuthContext';
import { getUserPlan } from '../../utils/starterFreePlan';

export default function SuperAdminRoutes() {
  const { user } = useAuth();

  if (getUserPlan(user?.email || null) !== "MAXIMUM_MASTER_PLAN") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <SuperAdminLayout>
      <Routes>
        <Route path="overview" element={<Overview />} />
        <Route path="clients" element={<Clients />} />
        <Route path="autoapp" element={<AutoAppCreator />} />
        <Route path="deployments" element={<AppsDeployments />} />
        <Route path="users" element={<PlatformUsers />} />
        <Route path="diagnostics" element={<SystemQuality />} />
        <Route path="audit" element={<AuditLogs />} />
        
        {/* Sistenfox AI Assistant Routes */}
        <Route path="ai-assistant" element={<AiAppCreator />} />
        <Route path="ai-assistant/content" element={<AiContentStudio />} />
        <Route path="ai-assistant/dashboard" element={<AiDashboardBuilder />} />
        
        {/* Fallback to Overview */}
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </SuperAdminLayout>
  );
}
