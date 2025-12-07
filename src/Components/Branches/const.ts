export interface rowProp {
	id: string;
	repo: string;
	branch_name: string;
	branch_creator: string | null;
	branch_creator_id: string | null;
	last_commit: Date | null;
	last_commit_message: string | null;
	ticket_key: string | null;
	ticket_summary: string | null;
	ticket_assignee: string | null;
	ticket_assignee_id: string | null;
	ticket_status: string | null;
}
