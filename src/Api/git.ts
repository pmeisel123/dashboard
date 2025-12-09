import type { BranchesAndTicket, GitBranch, ReportNamePaths, TicketCache } from "./Types";

declare const __GIT_REPOS_PATHS__: { [key: string]: ReportNamePaths };

const paramaters = {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
};

const parseBranchName = (branch_name: string) => {
	let creator = "";
	let ticket = "";
	// Looking for branches named like OPS-14_pmeisel_testing_git
	const matches = branch_name.match(/^([A-Z]+-[0-9]+)_([^_]+)/);
	if (matches) {
		if (matches[1]) {
			ticket = matches[1];
		}
		if (matches[2]) {
			creator = matches[2];
		}
	}
	return [ticket, creator];
};

const getOwnerFromLastCommit = (commits: any) => {
	if (commits.length) {
		for (var i = 0; i < 5 && i < commits.length; i++) {
			const commit = commits[i].commit;
			let creator = "";
			if (commit.author && commit.author.email && !commit.author.email.match(/noreply/)) {
				creator = commit.author.email.replace(/@.*/, "");
				return creator;
			}
			if (commit.committer && commit.committer.email && !commit.committer.email.match(/noreply/)) {
				creator = commit.committer.email.replace(/@.*/, "");
				return creator;
			}
		}
	}
	return "";
};

const getTicketFromLastCommit = (commits: any) => {
	if (commits.length) {
		for (var i = 0; i < 5 && i < commits.length; i++) {
			const commit = commits[i].commit;
			if (commit.message) {
				const matches = commit.message.match(/^([A-Z]+-[0-9]+)/);
				if (matches) {
					return matches[1];
				}
			}
		}
	}
	return "";
};

const getCommits = async (repo_name: string, branch_name: string): Promise<any> => {
	const repo: ReportNamePaths = __GIT_REPOS_PATHS__[repo_name];
	const path = repo.path;
	const url = path + "/commits?sha=" + encodeURI(branch_name);
	let response = await fetch(url, paramaters);
	const ajax_result: any = await response.json();
	return ajax_result;
};

const getBranchOwner = (branch_name: string, commits: any): [string, string] => {
	let [ticket, creator] = parseBranchName(branch_name);
	if (!creator) {
		creator = getOwnerFromLastCommit(commits);
	}
	return [ticket, creator];
};

const getLastCommit = (commits: any) => {
	if (commits.length) {
		// lastCommitDate
		const commit = commits[0].commit;
		if (commit.author && commit.author.date) {
			return commit.author.date;
		}
	}
	return null;
};

export const getBranches = async (): Promise<BranchesAndTicket> => {
	const branches: { [key: string]: GitBranch[] } = {};
	const ticketBranches: TicketCache = {};
	for (const [repo_name, repo] of Object.entries(__GIT_REPOS_PATHS__)) {
		const path = repo.path;
		const url = path + "/branches";
		let response = await fetch(url, paramaters);
		const ajax_result: any = await response.json();
		branches[repo_name] = ajax_result as GitBranch[];
		for (const branch of branches[repo_name]) {
			const branch_name: string = branch.name;
			const commits: any = await getCommits(repo_name, branch_name);
			const last_commit = getLastCommit(commits);
			if (last_commit) {
				branch.lastCommitDate = last_commit;
				branch.lastCommitMessage = commits[0].commit.message;
			}
			if (branch_name != "main" && branch_name != "master") {
				let [ticket, creator] = getBranchOwner(branch_name, commits);
				if (!ticket) {
					ticket = getTicketFromLastCommit(commits);
				}
				if (ticket) {
					branch.ticket = ticket;
					if (!ticketBranches[ticket]) {
						ticketBranches[ticket] = {};
					}
					ticketBranches[ticket][repo_name + "/" + branch_name] = {
						name: branch_name,
						branch: branch,
						repo: repo,
					};
				}
				if (creator) {
					branch.creator = creator;
				}
			}
		}
	}
	return {
		tickets: ticketBranches,
		branches: branches,
		loaded: null,
	};
};
