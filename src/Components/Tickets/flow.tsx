import { LayoutControls, LayoutProvider } from "@jalez/react-flow-automated-layout";
import { Link } from "@mui/material";
import type { ConfigProps, TicketProps } from "@src/Api";
import type { Edge, Node } from "@xyflow/react";
import {
	ConnectionLineType,
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
}> = ({ tickets, defaultEstimate, config }) => {
	let initialNodes: Node[] = [];
	let groups: { [key: string]: boolean } = {};
	let initialEdges: Edge[] = [];
	tickets.forEach((ticket: TicketProps) => {
		const id = ticket.key;
		let group = "";
		if (ticket.summary) {
			const matches = ticket.summary.match(/(.*?):/g);
			if (matches) {
				matches.forEach((match: string) => {
					const parent = group;
					group += match;
					if (!(group in groups)) {
						groups[group] = true;
						let groupnode: Node = {
							id: group,
							data: { label: match },
							position: { x: 0, y: 0 },
						};
						if (parent) {
							groupnode.parentId = parent;
						}
						initialNodes.push(groupnode);
					}
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
					</>
				),
			},
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
				initialDirection="RIGHT"
				initialAutoLayout={true}
				initialPadding={50}
				nodeIdWithNode={nodeIdWithNode}
				updateNodes={updateNodesHandler}
				updateEdges={updateEdgesHandler}
			>
				<div style={{ width: "100%", height: "100vh", overflow: "auto", position: "relative" }}>
					<div style={{ position: "absolute", right: 0, zIndex: 99999999 }}>
						<LayoutControls
							showDirectionControls={true}
							showAutoLayoutToggle={true}
							showSpacingControls={true}
							showApplyLayoutButton={true}
						/>
					</div>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						fitView
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						connectionLineType={ConnectionLineType.SmoothStep}
					/>
				</div>
			</LayoutProvider>
		</ReactFlowProvider>
	);
};
