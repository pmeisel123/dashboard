

import { default as BranchesComparePage } from "./branchesCompare";
import { default as BranchesPage } from "./branchPage";

export const GetPages = () => [
	{
		path: "/branches",
		name: "Branches",
		element: <BranchesPage />,
		description: <>List all the git repositories and their respective branches.</>,
		requires: "GIT_REPOS_PATHS",
	},
	{
		path: "/branchesCompare",
		name: "Compare Branches",
		element: <BranchesComparePage />,
		description: <>Find all commits in one branch and not the other</>,
		requires: "GIT_REPOS_PATHS",
	},
];