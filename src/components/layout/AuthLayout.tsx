import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 logo-circle rounded-2xl flex items-center justify-center shadow-medium-dark">
              <span className="text-2xl">🎸</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-accent-gradient mb-2">BandSync</h1>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {subtitle && (
            <p className="mt-3 text-gray-400">{subtitle}</p>
          )}
        </div>
        
        <div className="bg-surface-dark py-8 px-8 shadow-medium-dark rounded-2xl border border-dark">
          {children}
        </div>
      </div>
    </div>
  );
};
