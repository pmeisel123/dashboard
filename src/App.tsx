import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './Pages/Home';
import EstimatorPage from '@src/Pages/Estimator';
import WhoIsOutPage from '@src/Pages/WhoIsOut';
import HolidayPage from '@src/Pages/Holiday';
import MyTicketsPage from '@src/Pages/MyTickets';
import RecentTicketsPage from '@src/Pages/RecentTickets';
import {TopNav} from '@src/Components/TopNav';
import {SideBar} from '@src/Components/SideBar';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const router = createBrowserRouter([{
	path: '/',
	element: <Main />,
	children: [
		{
			path: '/',
			element: <HomePage />,
		},
		{
			path: '/Estimator',
			element: <EstimatorPage />,
		},
		{
			path: '/MyTickets',
			element: <MyTicketsPage />,
		},
		{
			path: '/RecentTickets',
			element: <RecentTicketsPage />,
		},
		{
			path: '/holidays',
			element: <HolidayPage />,
		},
		{
			path: '/whoisout',
			element: <WhoIsOutPage />,
		},
	]
}]);

const defaultLeftWidth = 150;

function Main() {
	const [leftNavOpen, setLeftNavOpen] = useState<boolean>(true);
	const [sideWidth, setSideWidth] = useState<number>(defaultLeftWidth);
	const toggleLeftNav = () => {
		setLeftNavOpen(!leftNavOpen);
	};
	useEffect(() => {
		if (leftNavOpen) {
			setSideWidth(defaultLeftWidth);
		} else {
			setSideWidth(0);
		}
	}, [leftNavOpen]);

	return (
		<>
			<TopNav toggleDrawer={toggleLeftNav}></TopNav>
			<SideBar open={leftNavOpen} width={sideWidth}></SideBar>
			<Box sx={{
				paddingLeft: sideWidth + 'px', 
				transition: 'padding-left 0.1s'
			}}>
				<Outlet />
			</Box>
		</>
	);
}


function App() {
  return <RouterProvider router={router} />;
}

export default App;