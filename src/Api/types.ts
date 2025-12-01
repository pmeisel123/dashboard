import * as MuiIcons from "@mui/icons-material";

// Users Props
export interface UserProps {
	id: number;
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
	loaded: number | null;
}

// Ticket Props

export interface TicketProps {
	id: number;
	key: string;
	assignee: string | null;
	creator: string | null;
	status: string | null;
	summary: string | null;
	created: Date | null;
	updated: Date | null;
	timeestimate: number | null;
	timeoriginalestimate: number | null;
	timespent: number | null;
	parentkey: string | null;
	parentname: string | null;
	isdone: boolean;
	customFields: { [key: string]: string | null };
}

export interface CustomFieldsProps {
	Name: string;
	Type: "Text" | "Link";
	LinkText?: string;
	LinkIcon?: keyof typeof MuiIcons;
}
