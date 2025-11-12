
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './Pages/Home';
import EstimatorPage from './Pages/Estimator';


const router = createBrowserRouter([
	{
		path: '/',
		element: <HomePage />,
	},
	{
		path: '/Estimator',
		element: <EstimatorPage />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}
export default App;