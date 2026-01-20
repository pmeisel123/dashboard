import { LayoutControls, LayoutProvider } from "@jalez/react-flow-automated-layout";
import { Link } from "@mui/material";
import type { ConfigProps, TicketProps } from "@src/Api";
import type { Edge, Node } from "@xyflow/react";

import type { Theme } from "@mui/material/styles";
import {
	ConnectionLineType,
	Controls,
	MarkerType,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FC } from "react";
import { useCallback } from "react";
import { RenderEstimate } from "./const";

export const TicketFlow: FC<{
	tickets: TicketProps[];
	defaultEstimate: number | null;
	config: ConfigProps;
	theme: Theme;
}> = ({ tickets, defaultEstimate, config, theme }) => {
	let initialNodes: Node[] = [];
	let groups: { [key: string]: { estimate: number; node: Node } } = {};
	let initialEdges: Edge[] = [];
	tickets.forEach((ticket: TicketProps) => {
		const id = ticket.key;
		let group = "";
		if (ticket.summary) {
			const matches = ticket.summary.match(/(.*?):/g) || [];
			if (matches.length) {
				let level = 0;
				matches.forEach((match: string) => {
					level += 5;
					const parent = group;
					group += match;
					const estimate =
						ticket.timeestimate != null ? ticket.timeestimate : defaultEstimate ? defaultEstimate : 0;
					if (!(group in groups)) {
						let groupnode: Node = {
							id: group,
							data: { label: <></> },
							position: { x: 0, y: 0 },
							style: { backgroundColor: "rgba(50, 0, 50, " + level / 100 + ")" },
						};
						if (parent) {
							groupnode.parentId = parent;
						}
						groups[group] = { node: groupnode, estimate: estimate };
						initialNodes.push(groupnode);
					} else {
						groups[group]["estimate"] += estimate;
					}
					groups[group]["node"].data.label = (
						<>
							{match}
							<br />
							Estimate: {groups[group]["estimate"]}
						</>
					);
				});
			}
		}

		let node: Node = {
			id: id,
			data: {
				label: (
					<>
						<Link
							href={(config.API_URL + "/browse/" + id) as string}
							target="_blank"
							rel="noopener noreferrer"
						>
							{id}
							<br />
							{ticket.summary}
							<br />
						</Link>
						Estimate:{" "}
						<RenderEstimate value={ticket.timeestimate} defaultEstimate={defaultEstimate}></RenderEstimate>
						<br />
						Assignee: {ticket.assignee}
						<br />
						Status: {ticket.status}
					</>
				),
			},
			style: { backgroundColor: ticket.isdone ? theme.palette.grey.A400 : "" },
			position: { x: 0, y: 0 },
		};
		if (group) {
			node.parentId = group;
		}
		if (ticket.blocked_by.length) {
			ticket.blocked_by.forEach((parent: string) => {
				initialEdges.push({
					id: id + "-" + parent,
					source: parent,
					target: id,
					markerEnd: { type: MarkerType.ArrowClosed },
				});
			});
		}
		initialNodes.push(node);
	});
	console.log(initialNodes);
	if (!initialNodes.length) {
		return null;
	}
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const nodeIdWithNode = new Map<string, Node>();
	nodes.forEach((node) => {
		nodeIdWithNode.set(node.id, node);
	});
	const updateNodesHandler = useCallback(
		(newNodes: Node[]) => {
			setNodes(newNodes);
		},
		[setNodes],
	);

	const updateEdgesHandler = useCallback(
		(newEdges: Edge[]) => {
			setEdges(newEdges);
		},
		[setEdges],
	);

	return (
		<ReactFlowProvider>
			<LayoutProvider
				initialDirection="DOWN"
				initialAutoLayout={true}
				initialPadding={50}
				initialSpacing={{ node: 80, layer: 80 }}
				nodeIdWithNode={nodeIdWithNode}
				updateNodes={updateNodesHandler}
				updateEdges={updateEdgesHandler}
			>
				<div style={{ width: "100%", height: "50vh" }}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						nodeOrigin={[0, 0]}
						minZoom={0.001}
						fitView
						fitViewOptions={{
							minZoom: 0.5,
							maxZoom: 5,
							padding: {
								top: 0,
								left: 0,
								right: "95%",
								bottom: "95%",
							},
						}}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						connectionLineType={ConnectionLineType.SmoothStep}
					>
						<Controls position="top-right" showFitView={false}>
							<LayoutControls
								showDirectionControls={true}
								showAutoLayoutToggle={true}
								showSpacingControls={true}
								showApplyLayoutButton={true}
							/>
						</Controls>
					</ReactFlow>
				</div>
			</LayoutProvider>
		</ReactFlowProvider>
	);
};
