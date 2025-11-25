import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {TopNav, LeftNav} from '@src/Components';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { pages } from '@src/Pages/const';

const router = createBrowserRouter([{
	path: '/',
	element: <Main />,
	children: pages
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
			<LeftNav open={leftNavOpen} width={sideWidth}></LeftNav>
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