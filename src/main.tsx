
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PatientRegistration from './pages/PatientRegistration';
import Camera from './pages/Camera';
import Feedback from './pages/Feedback';
import Results from './pages/Results';
import ResultDetail from './pages/ResultDetail';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Login /> },
      { path: 'patient-registration', element: <PatientRegistration /> },
      { path: 'camera', element: <Camera /> },
      { path: 'feedback', element: <Feedback /> },
      { path: 'results', element: <Results /> },
      { path: 'results/:resultId', element: <ResultDetail /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
