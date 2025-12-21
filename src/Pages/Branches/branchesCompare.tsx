import type { AppDispatch, BranchCommit, BranchesAndTicket, GitRelease, RootState, TicketProps } from "@src/Api";
import { fetchBranches, fetchTickets, getBranchesCompare, getReleases, isGitDataRecent } from "@src/Api";
import { CommitsSelector, CommitsTable } from "@src/Components";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const BranchesComparePage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride ? searchParamsOveride.toString() : {});
	const ticketsBranches: BranchesAndTicket = useSelector((state: RootState) => state.gitBranchState);
	const [repo, setRepo] = useState<string>(searchParams.get("repo") || "");
	const [branch1, setBranch1] = useState<string>(searchParams.get("branch1") || "");
	const [branch2, setBranch2] = useState<string>(searchParams.get("branch2") || "");
	const [commits, setCommits] = useState<BranchCommit[]>([]);
	const [tickets, setTickets] = useState<{ [key: string]: TicketProps }>({});
	const dispatch = useDispatch<AppDispatch>();
	const [loading, setLoading] = useState<boolean>(false);
	const [releases, setReleases] = useState<GitRelease[]>([]);

	const loadParams = () => {
		setRepo(searchParams.get("repo") || "");
		setBranch1(searchParams.get("branch1") || "");
		setBranch2(searchParams.get("branch2") || "");
	};
	useEffect(() => {
		loadParams();
	}, [searchParams]);

	useEffect(() => {
		if (!searchParamsOveride) {
			const newSearchParams = new URLSearchParams(searchParams.toString());
			if (repo != "") {
				newSearchParams.set("repo", repo);
				if (branch1 != "") {
					newSearchParams.set("branch1", branch1);
				} else {
					newSearchParams.delete("branch1");
				}
				if (branch2 != "") {
					newSearchParams.set("branch2", branch2);
				} else {
					newSearchParams.delete("branch2");
				}
			} else {
				newSearchParams.delete("repo");
				newSearchParams.delete("branch1");
				newSearchParams.delete("branch2");
				setBranch1("");
				setBranch2("");
			}
			if (searchParams.toString() != newSearchParams.toString()) {
				setSearchParams(newSearchParams);
			}
		}
		if (repo && branch1 && branch2) {
			setLoading(true);
			getBranchesCompare(repo, branch1, branch2).then((data: BranchCommit[]) => {
				setLoading(false);
				setCommits(data);
			});
		} else {
			setCommits([]);
		}
	}, [repo, branch1, branch2]);

	useEffect(() => {
		let ticket_search = "";
		commits.forEach((commit) => {
			if (commit.ticket) {
				if (ticket_search) {
					ticket_search += " OR ";
				}
				ticket_search += 'key = "' + commit.ticket + '"';
			}
		});
		if (ticket_search) {
			dispatch(fetchTickets(ticket_search)).then((data: any) => {
				let local_tickets = { ...tickets };
				if (data && data.payload && data.payload.length) {
					data.payload.forEach((ticket: TicketProps) => {
						local_tickets[ticket.key] = ticket;
					});
				}
				setTickets(local_tickets);
			});
		}
	}, [commits]);

	useEffect(() => {
		if (!isGitDataRecent(ticketsBranches)) {
			dispatch(fetchBranches());
		}
	}, [dispatch]);
	useEffect(() => {
		getReleases(repo).then((data: GitRelease[]) => {
			setReleases(data);
		});
	}, [repo]);
	useEffect(() => {
		if (ticketsBranches.branches && Object.keys(ticketsBranches.branches).length == 1) {
			setRepo(Object.keys(ticketsBranches.branches)[0]);
		}
	});
	if (!Object.keys(ticketsBranches.branches).length) {
		return;
	}
	return (
		<>
			<CommitsSelector
				repo={repo}
				branch1={branch1}
				branch2={branch2}
				setRepo={setRepo}
				setBranch1={setBranch1}
				setBranch2={setBranch2}
				ticketsBranches={ticketsBranches}
				releases={releases}
			/>
			{repo && branch1 && branch2 && (
				<CommitsTable
					repo={repo}
					ticketsBranches={ticketsBranches}
					tickets={tickets}
					loading={loading}
					commits={commits}
				/>
			)}
		</>
	);
};
export default BranchesComparePage;
