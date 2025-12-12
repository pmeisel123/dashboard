import * as MuiIcons from "@mui/icons-material";

// Ticket Props
export interface TicketProps {
	id: number;
	key: string;
	assignee: string | null;
	assignee_id: string | null;
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

interface BaseCustomFieldProps {
	Name: string;
}

interface CustomFieldsPropsText extends BaseCustomFieldProps {
	Type: "Text";
}

interface CustomFieldsPropsUser extends BaseCustomFieldProps {
	Type: "User";
}

type LinkDetails =
	| { LinkIcon: keyof typeof MuiIcons; LinkText?: never } // Must have Icon, cannot have Text
	| { LinkText: string; LinkIcon?: never } // Must have Text, cannot have Icon (using the XOR pattern from the previous answer for strictness)
	| { LinkText?: undefined; LinkIcon?: undefined }; // Or allow neither if the user wants just a bare link?

type CustomFieldsPropsLink = BaseCustomFieldProps &
	LinkDetails & {
		Type: "Link";
	};

export type CustomFieldsProps = CustomFieldsPropsText | CustomFieldsPropsUser | CustomFieldsPropsLink;

export interface CustomFieldsObjectProps {
	[key: string]: CustomFieldsProps;
}
