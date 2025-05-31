import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchCurrentUser } from '../store/slices/userSlice';
import { setUser } from '../store/slices/authSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { isLoading } = useAppSelector((state) => state.user);
  const [authLoading, setAuthLoading] = React.useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      dispatch(setUser(firebaseUser));
      
      if (firebaseUser) {
        dispatch(fetchCurrentUser());
      }
      
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
