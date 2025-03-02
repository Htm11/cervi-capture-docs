
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';

import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PatientRegistration from './pages/PatientRegistration';
import Camera from './pages/Camera';
import Feedback from './pages/Feedback';
import Results from './pages/Results';
import ResultDetail from './pages/ResultDetail';
import Settings from './pages/Settings';

// Wrapper component to handle auth initialization
const AuthRoutesWrapper = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  
  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-cervi-50 via-cervi-100 to-white">
      <div className="animate-pulse flex flex-col items-center">
        <img 
          src="/lovable-uploads/77cb8974-0f23-401c-a300-d69d6f0523ce.png" 
          alt="Cervi Scanner Logo" 
          className="h-24 mx-auto mb-4"
        />
        <p className="text-cervi-800 text-lg font-medium">Loading...</p>
      </div>
    </div>;
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        { 
          index: true, 
          element: isAuthenticated ? <Navigate to="/patient-registration" /> : <Login /> 
        },
        { 
          path: 'login', 
          element: isAuthenticated ? <Navigate to="/patient-registration" /> : <Login /> 
        },
        { 
          path: 'patient-registration', 
          element: isAuthenticated ? <PatientRegistration /> : <Navigate to="/" /> 
        },
        { 
          path: 'camera', 
          element: isAuthenticated ? <Camera /> : <Navigate to="/" /> 
        },
        { 
          path: 'feedback', 
          element: isAuthenticated ? <Feedback /> : <Navigate to="/" /> 
        },
        { 
          path: 'results', 
          element: isAuthenticated ? <Results /> : <Navigate to="/" /> 
        },
        { 
          path: 'results/:resultId', 
          element: isAuthenticated ? <ResultDetail /> : <Navigate to="/" /> 
        },
        { 
          path: 'settings', 
          element: isAuthenticated ? <Settings /> : <Navigate to="/" /> 
        },
        { 
          path: '*', 
          element: <NotFound /> 
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AuthRoutesWrapper />
  </AuthProvider>
);
