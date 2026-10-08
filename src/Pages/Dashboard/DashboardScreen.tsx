import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import type { AppDispatch, RootState } from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

export const DashboardScreen = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const config = useSelector((state: RootState) => state.configState);
	const [deviceName, setDeviceName] = useState<string>(window.localStorage.getItem("deviceName") || "");
	const [dashboardName, setDashboardName] = useState<string>(window.localStorage.getItem("dashboardName") || "");

	const [tmpDeviceName, setTmpDeviceName] = useState<string>(window.localStorage.getItem("deviceName") || "");
	const [tmpDashboardName, setTmpDashboardName] = useState<string>(
		window.localStorage.getItem("dashboardName") || "",
	);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);
	useEffect(() => {
		window.localStorage.setItem("deviceName", deviceName);
		if (dashboardName && config.DASHBOARDS[dashboardName]) {
			window.localStorage.setItem("dashboardName", dashboardName);
			if (deviceName) {
				if (searchParams.get("force") !== "true") {
					navigate(`/Dashboard?dashboard=${dashboardName}`);
				}
			}
		}
	}, [deviceName, dashboardName, searchParams, config]);
	return (
		<>
			<TextField label="Device Name" value={tmpDeviceName} onChange={(e) => setTmpDeviceName(e.target.value)} />

			<FormControl fullWidth>
				<InputLabel id="dashboard_name">Dashboard Name</InputLabel>
				<Select
					labelId="dashboard_name"
					value={tmpDashboardName}
					label="Dashboard Name"
					onChange={(e) => setTmpDashboardName(e.target.value)}
				>
					<MenuItem value="">Select Dashboard</MenuItem>
					{Object.keys(config.DASHBOARDS).map((dashboardKey) => (
						<MenuItem key={dashboardKey} value={dashboardKey}>
							{dashboardKey}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Button
				variant="contained"
				onClick={() => {
					if (tmpDeviceName && tmpDashboardName && config.DASHBOARDS[tmpDashboardName]) {
						setDeviceName(tmpDeviceName);
						setDashboardName(tmpDashboardName);
						setSearchParams(new URLSearchParams({}));
					}
				}}
				disabled={!tmpDeviceName || !tmpDashboardName || !config.DASHBOARDS[tmpDashboardName]}
			>
				Save And Run
			</Button>
		</>
	);
};
