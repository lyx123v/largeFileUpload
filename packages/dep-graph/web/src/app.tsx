import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { HomePage } from './pages/home';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { path: '', element: <HomePage /> },
      { path: '*', element: <div>404</div> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
