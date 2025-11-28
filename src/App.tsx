import './App.css'
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import { matchRoutes } from "react-router";
import {TopNav, LeftNav} from '@src/Components';
import { useState, useEffect} from 'react';
import type {JSX} from 'react';
import { Box, Typography, useTheme, useMediaQuery} from '@mui/material';
import { pages } from '@src/Pages/const';

const router = createBrowserRouter([{
	path: '/',
	element: <Main />,
	children: pages
}]);

const defaultLeftWidth = 150;

function Main() {
	const theme = useTheme();
	const isSmallOrLarger = useMediaQuery(theme.breakpoints.up('sm'))
	const [leftNavOpen, setLeftNavOpen] = useState<boolean>(isSmallOrLarger);
	const [sideWidth, setSideWidth] = useState<number>(defaultLeftWidth);
	const [currentDescription, setCurrentDescription] = useState<JSX.Element>();
	const [currentName, setName] = useState<String>();
	const [hideTitle, setHideTitle] = useState<boolean>( window.localStorage.getItem('hideTitle') == 'true' );
	const location = useLocation();
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	const toggleLeftNav = () => {
		setLeftNavOpen(!leftNavOpen);
	};
	const toggleHideTitle = () => {
		window.localStorage.setItem('hideTitle', (!hideTitle).toString());
		setHideTitle(!hideTitle);
	};
	useEffect(() => {
		console.log(isSmallOrLarger, leftNavOpen);
		if (!isSmallOrLarger) {
			let tmp_width = windowSize.width * .75;
			if (tmp_width > defaultLeftWidth * 2) {
				tmp_width = defaultLeftWidth * 2;
			}
			setSideWidth(tmp_width);
		} else if (leftNavOpen && isSmallOrLarger) {
			setSideWidth(defaultLeftWidth);
		} else {
			setSideWidth(0);
		}
	}, [leftNavOpen, isSmallOrLarger, windowSize]);

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
	
		window.addEventListener('resize', handleResize);
	
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	
	useEffect(() => {
		const route = matchRoutes(pages, {pathname: window.location.pathname});
		let title = 'Dashboard';
		if (window.location.pathname != '/' && route && route.length == 1) {
			setCurrentDescription(route[0].route.description);
			setName(route[0].route.name);
			title += ' - ' + route[0].route.name;
		} else {
			setCurrentDescription(<></>);
			setName('');
		}
		document.title = title;
	}, [location]);

	return (
		<>
			<TopNav toggleLeftNav={toggleLeftNav} toggleHideTitle={toggleHideTitle} hideTitle={hideTitle}></TopNav>
			<LeftNav open={leftNavOpen} width={sideWidth}></LeftNav>
			<Box sx={{
				paddingLeft: isSmallOrLarger ? (sideWidth + 20) + 'px' : 0, 
				transition: 'padding-left 0.1s'
			}}>
				{ !hideTitle &&
					<>
						<Typography variant="h6" component="div">
							{currentName}
						</Typography>
						<Typography variant="subtitle2" color="text.secondary" sx={{padding: '10px 25px 25px 25px'}}>
							{currentDescription}
						</Typography>
					</>
				}
				<Outlet />
			</Box>
		</>
	);
}


function App() {
  return <RouterProvider router={router} />;
}

export default App;