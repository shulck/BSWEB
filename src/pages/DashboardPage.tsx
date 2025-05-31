import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Welcome to BandSync!</p>
      </div>
    </MainLayout>
  );
};
