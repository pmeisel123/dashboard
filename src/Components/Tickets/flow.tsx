import { LayoutControls, LayoutProvider } from "@jalez/react-flow-automated-layout";
import { Link } from "@mui/material";
import type { ConfigProps, TicketProps } from "@src/Api";
import type { Edge, Node } from "@xyflow/react";
import { useResizeObserver } from "../Misc";

import type { Theme } from "@mui/material/styles";
import {
	ConnectionLineType,
	Controls,
	MarkerType,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FC } from "react";
import { useCallback, useEffect } from "react";
import { RenderEstimate } from "./const";

export const FlowInternal: FC<{
	tickets: TicketProps[];
	defaultEstimate: number | null;
	config: ConfigProps;
	theme: Theme;
}> = ({ tickets, defaultEstimate, config, theme }) => {
	const { fitView } = useReactFlow();
	const [ref, size] = useResizeObserver<HTMLDivElement>();

	let initialNodes: Node[] = [];
	let groups: { [key: string]: { estimate: number; node: Node } } = {};
	let initialEdges: Edge[] = [];
	const createGroupNode = (group: string, match: string, ticket: TicketProps, parent: string) => {
		if (!(group in groups)) {
			let groupnode: Node = {
				id: group,
				data: { label: <></> },
				position: { x: 0, y: 0 },
				style: { backgroundColor: "rgba(75, 25, 75, 0.1" },
			};
			if (parent) {
				groupnode.parentId = parent;
			}
			groups[group] = { node: groupnode, estimate: 0 };
			initialNodes.push(groupnode);
		}
		const estimate = ticket.timeestimate != null ? ticket.timeestimate : defaultEstimate ? defaultEstimate : 0;
		groups[group]["estimate"] += estimate;
		groups[group]["node"].data.label = (
			<>
				{match}
				<br />
				Total Estimate: {groups[group]["estimate"]}
			</>
		);
	};
	tickets.forEach((ticket: TicketProps) => {
		const id = ticket.key;
		let group = "";
		if (ticket.summary) {
			const matches = ticket.summary.match(/(.*?):/g) || [];
			if (matches.length) {
				matches.forEach((match: string) => {
					const parent = group;
					group += match;
					createGroupNode(group, match, ticket, parent);
				});
			} else {
				group = "Uncategorized (Names without a ':')";
				createGroupNode(group, group, ticket, "");
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
					markerEnd: {
						height: 50,
						type: MarkerType.ArrowClosed,
						width: 50,
					},
					
				});
			});
		}
		initialNodes.push(node);
	});
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	useEffect(() => {
		const timeout = setTimeout(() => {
			fitView({
				duration: 100,
			});
		}, 300);

		return () => clearTimeout(timeout);
	}, [fitView, nodes.length, size]);
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

	if (!initialNodes.length) {
		return null;
	}
	return (
		<LayoutProvider
			initialDirection="RIGHT"
			initialAutoLayout={true}
			initialPadding={50}
			initialSpacing={{ node: 80, layer: 80 }}
			nodeIdWithNode={nodeIdWithNode}
			updateNodes={updateNodesHandler}
			updateEdges={updateEdgesHandler}
		>
			<div
				style={{
					width: "100%",
					height: "75vh",
					resize: "vertical",
					border: "1px solid black",
					overflow: "auto",
				}}
				ref={ref}
			>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodeOrigin={[0, 0]}
					minZoom={0.001}
					fitView
					fitViewOptions={{
						minZoom: 0.5,
						maxZoom: 5,
					}}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					connectionLineType={ConnectionLineType.SmoothStep}
				>
					<Controls position="top-right">
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
	);
};

export const TicketFlow: FC<{
	tickets: TicketProps[];
	defaultEstimate: number | null;
	config: ConfigProps;
	theme: Theme;
}> = (props) => {
	return (
		<ReactFlowProvider>
			<FlowInternal {...props} />
		</ReactFlowProvider>
	);
};
