export interface UserProps {
	id: string;
	icon: string | null;
	name: string;
	email: string | null;
	groups: string[] | null;
	vacations: string[] | null;
}

export interface UsersGroupProps {
	groups: string[];
	users: { [key: string]: UserProps };
}

export interface UsersGroupPropsSlice extends UsersGroupProps {
	loaded: number | null; // ms since epoch
}

export interface UserEditVacation {
	[key: string]: string;
}
