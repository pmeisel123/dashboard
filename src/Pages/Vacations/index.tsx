import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	Paper,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
} from "@mui/material";
import type { AppDispatch, RootState, UserEditVacation, UserProps } from "@src/Api";
import { fetchUsersAndGroups, isUserDataRecent, userHasGroup, vacationUpdateApi } from "@src/Api";
import { EstimatorCell } from "@src/Components";
import type { ChangeEvent, FC, FocusEvent } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

declare const __VACATION_KEY__: string;

const VacationPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride ? searchParamsOveride.toString() : {});
	const allJiraUsersGroups = useSelector((state: RootState) => state.usersAndGroupsState);
	const [userVacations, setUserVacations] = useState<UserEditVacation>({});
	let param_groups = searchParams.get("groups");
	const [groups, setGroups] = useState<string[]>(param_groups ? param_groups.split(/,/g) : []);
	const dispatch = useDispatch<AppDispatch>();
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const getVacationKey = (user: UserProps) => {
		let vacation_key: string = user.name || "";
		if (__VACATION_KEY__ == "email") {
			vacation_key = user.email || "";
		}
		return vacation_key;
	};

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (groups.length) {
			newSearchParams.set("groups", groups.join(","));
		} else {
			newSearchParams.delete("groups");
		}
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [groups]);

	const createUserVacations = () => {
		const localUserVacations: UserEditVacation = {};
		Object.keys(allJiraUsersGroups.users).forEach((user_id: string) => {
			const user = allJiraUsersGroups.users[user_id];
			const vacations = user.vacations?.join(",").replaceAll(/ [0-9]+:[0-9]+:[0-9]+/g, "") || "";
			let vacation_key: string = getVacationKey(user);
			if (vacation_key) {
				localUserVacations[vacation_key] = vacations;
			}
		});
		setUserVacations(localUserVacations);
	};

	const loadParams = () => {
		param_groups = searchParams.get("groups");
		setGroups(param_groups ? param_groups.split(/,/g) : []);
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	useEffect(() => {
		if (!isUserDataRecent(allJiraUsersGroups)) {
			dispatch(fetchUsersAndGroups());
		}
	}, [dispatch]);

	useEffect(() => {
		createUserVacations();
	}, [allJiraUsersGroups]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		if (event.target.checked) {
			// Add the value if checked
			setGroups((prev) => [...prev, value]);
		} else {
			// Remove the value if unchecked
			setGroups((prev) => prev.filter((item) => item !== value));
		}
	};

	const handleChangeUserChange = (event: ChangeEvent<HTMLInputElement>, user_id: string) => {
		const value = event.target.value;
		const localUserVacations = { ...userVacations };
		localUserVacations[getVacationKey(allJiraUsersGroups.users[user_id])] = value;
		setUserVacations(localUserVacations);
	};

	const validateDates = (dates: string, key: string) => {
		const local_errors = { ...errors };
		let valid = true;
		let invalid_date = "";
		if (
			dates.split(",").some((date) => {
				if (new Date(date).toString() == "Invalid Date") {
					invalid_date = date;
					return true;
				}
			})
		) {
			valid = false;
		}
		if (valid) {
			local_errors[key] = "";
		} else {
			local_errors[key] = invalid_date + " is not a valid date";
		}
		setErrors(local_errors);
		return valid;
	};

	const callSave = () => {
		let valid = true;
		Object.keys(userVacations).forEach((key) => {
			if (!validateDates(userVacations[key], key)) {
				valid = false;
			}
		});
		if (valid) {
			vacationUpdateApi(userVacations).then(() => {
				dispatch(fetchUsersAndGroups());
			});
		}
	};

	return (
		<>
			<FormGroup>
				<Box
					sx={{
						display: "flex",
						flexDirection: "row",
						minHeight: "3em",
					}}
				>
					{allJiraUsersGroups.groups.map((option, index) => (
						<FormControlLabel
							key={index}
							control={
								<Checkbox
									checked={groups.includes(option)}
									onChange={handleChange}
									name={option}
									value={option}
								/>
							}
							label={option}
							sx={{
								display: "inline",
							}}
						/>
					))}
				</Box>
			</FormGroup>
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<EstimatorCell>User</EstimatorCell>
							<EstimatorCell>Email</EstimatorCell>
							<EstimatorCell sx={{ width: "95%" }}>Vacations</EstimatorCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{Object.keys(allJiraUsersGroups.users).map((user_id) => {
							const user = allJiraUsersGroups.users[user_id];
							const user_key = getVacationKey(user);
							if (!userHasGroup(user, groups)) {
								return;
							}
							return (
								<TableRow
									key={user_id}
									sx={{ display: userHasGroup(user, groups) ? "table-row" : "none" }}
								>
									<EstimatorCell sx={{ whiteSpace: "nowrap" }}>{user.name}</EstimatorCell>
									<EstimatorCell>{user.email}</EstimatorCell>
									<EstimatorCell>
										{user.vacations && (
											<TextField
												id="search"
												value={userVacations[user_key] || ""}
												onChange={(event: ChangeEvent<HTMLInputElement>) => {
													handleChangeUserChange(event, user_id);
												}}
												onBlur={(event: FocusEvent<HTMLInputElement>) => {
													validateDates(event.target.value, user_key);
												}}
												error={user_key in errors && !!errors[user_key]}
												helperText={errors[user_key]}
												sx={{ width: "100%" }}
											/>
										)}
									</EstimatorCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<Button variant="contained" onClick={callSave}>
				Save
			</Button>
		</>
	);
};

export default VacationPage;
