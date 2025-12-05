import type { GitBranch, ReportNamePaths, TicketCache } from "./types";

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

const getOwnerFromLastCommit = async (repo_name: string, branch_name: string) => {
	const repo: ReportNamePaths = __GIT_REPOS_PATHS__[repo_name];
	const path = repo.path;
	const url = path + "/commits?sha=" + encodeURI(branch_name);
	let response = await fetch(url, paramaters);
	const ajax_result: any = await response.json();
	if (ajax_result.length) {
		for (var i = 0; i < 5 && i < ajax_result.length; i++) {
			const first_commit = ajax_result[i].commit;
			let creator = "";
			if (
				first_commit.author &&
				first_commit.author.email &&
				!first_commit.author.email.match(/noreply/)
			) {
				creator = first_commit.author.email.replace(/@.*/, "");
				return creator;
			}
			if (
				first_commit.committer &&
				first_commit.committer.email &&
				!first_commit.committer.email.match(/noreply/)
			) {
				creator = first_commit.committer.email.replace(/@.*/, "");
				return creator;
			}
		}
	}
	return "";
};

const branchCache: { [key: string]: [string, string] } = {};
const getBranchOwner = async (repo_name: string, branch_name: string): Promise<[string, string]> => {
	const key: string = repo_name + "____" + branch_name;
	if (branchCache[key]) {
		return branchCache[key];
	}
	let [ticket, creator] = parseBranchName(branch_name);
	if (!creator) {
		creator = await getOwnerFromLastCommit(repo_name, branch_name);
	}
	branchCache[key] = [ticket, creator];
	return branchCache[key];
};

const ticketCache: TicketCache = {};
export const getBranches = async (): Promise<{
	[key: string]: GitBranch[];
}> => {
	const branches: { [key: string]: GitBranch[] } = {};
	Object.keys(ticketCache).forEach((key) => {
		delete ticketCache[key];
	});
	for (const [repo_name, repo] of Object.entries(__GIT_REPOS_PATHS__)) {
		const path = repo.path;
		const url = path + "/branches";
		let response = await fetch(url, paramaters);
		const ajax_result: any = await response.json();
		branches[repo_name] = ajax_result as GitBranch[];
		for (const branch of branches[repo_name]) {
			const branch_name: string = branch.name;
			if (branch_name != "main" && branch_name != "master") {
				let [ticket, creator] = await getBranchOwner(repo_name, branch_name);
				if (ticket) {
					branch.ticket = ticket;
					if (!ticketCache[ticket]) {
						ticketCache[ticket] = {};
					}
					ticketCache[ticket][repo_name + "/" + branch_name] = {
						name: branch_name,
						repo: repo,
					};
				}
				if (creator) {
					branch.creator = creator;
				}
			}
		}
	}
	return branches;
};

export const getTicketBranches = async () => {
	if (!Object.keys(ticketCache).length) {
		await getBranches();
	}
	return ticketCache;
};
