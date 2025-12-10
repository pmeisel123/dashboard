export interface GitBranch {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
	ticket?: string;
	creator?: string;
	lastCommitDate?: string;
	lastCommitMessage?: string | null;
}

export interface GitBranches {
	[key: string]: GitBranch[];
}

export interface ReportNamePaths {
	path: string;
	url: string;
}

export interface TicketCache {
	[key: string]: {
		[key: string]: {
			name: string;
			branch: GitBranch;
			repo: ReportNamePaths;
		};
	};
}

export interface BranchesAndTicket {
	branches: GitBranches;
	tickets: TicketCache;
	loaded: number | null; // ms since epoch
}

export interface ReposProps {
	name: string;
	url: string;
}
