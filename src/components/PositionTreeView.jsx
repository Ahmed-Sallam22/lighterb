import React, { useMemo } from "react";
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTranslation } from "react-i18next";
import { HiBriefcase, HiUsers } from "react-icons/hi";

// Custom node component for positions
const PositionNode = ({ data, isConnectable }) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";

	const statusColor =
		data.status === "active"
			? "bg-green-100 border-green-500 text-green-800"
			: "bg-gray-100 border-gray-400 text-gray-600";

	const statusDot = data.status === "active" ? "bg-green-500" : "bg-gray-400";

	return (
		<div
			className={`px-4 py-3 shadow-lg rounded-xl border-2 bg-white min-w-[220px] ${
				data.isRoot ? "border-[#1D7A8C]" : "border-gray-300"
			} hover:shadow-xl transition-shadow`}
		>
			<Handle type="target" position={Position.Top} isConnectable={false} className="bg-[#1D7A8C]! w-3! h-3!" />

			<div className="flex items-start gap-3">
				<div
					className={`p-2 rounded-lg ${
						data.isRoot ? "bg-[#1D7A8C] text-white" : "bg-gray-100 text-gray-600"
					}`}
				>
					<HiBriefcase className="w-5 h-5" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
							{data.code}
						</span>
						{data.hasChildren && (
							<span className="text-xs text-[#1D7A8C]">
								<HiUsers className="w-4 h-4 inline" />
								{data.childCount > 0 && <span className="ml-1">{data.childCount}</span>}
							</span>
						)}
					</div>
					<h3 className="font-semibold text-gray-800 text-sm mt-1 truncate" title={data.label}>
						{data.label}
					</h3>
					{data.department && (
						<p className="text-xs text-gray-500 truncate mt-0.5" title={data.department}>
							{data.department}
						</p>
					)}
					{data.status && (
						<div className="mt-2">
							<span
								className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
							>
								<span
									className={`w-1.5 h-1.5 rounded-full ${statusDot} ${isRtl ? "ml-1" : "mr-1"}`}
								></span>
								{data.status === "active" ? t("common.active") : t("common.inactive")}
							</span>
						</div>
					)}
				</div>
			</div>

			{data.onClick && (
				<button
					onClick={data.onClick}
					className="mt-2 w-full text-xs text-[#1D7A8C] hover:text-[#156576] font-medium py-1 border-t border-gray-100"
				>
					{t("positions.tree.viewDetails")}
				</button>
			)}

			<Handle
				type="source"
				position={Position.Bottom}
				isConnectable={isConnectable}
				className="bg-[#1D7A8C]! w-3! h-3!"
			/>
		</div>
	);
};

const nodeTypes = {
	position: PositionNode,
};

// Helper function to convert tree data to nodes and edges
const convertTreeToFlow = (treeData, onNodeClick) => {
	const nodes = [];
	const edges = [];
	const nodeWidth = 260;
	const xSpacing = 320; // Horizontal spacing between nodes
	const ySpacing = 180; // Vertical spacing between levels

	// First pass: calculate the width needed for each subtree
	const calculateSubtreeWidth = node => {
		const children = node.direct_reports || [];
		if (children.length === 0) {
			return nodeWidth;
		}
		let totalWidth = 0;
		children.forEach((child, index) => {
			totalWidth += calculateSubtreeWidth(child);
			if (index < children.length - 1) {
				totalWidth += xSpacing - nodeWidth; // Add spacing between siblings
			}
		});
		return Math.max(nodeWidth, totalWidth);
	};

	// Second pass: position nodes
	const positionNode = (node, level, startX, parentId) => {
		const children = node.direct_reports || [];
		const subtreeWidth = calculateSubtreeWidth(node);
		const nodeX = startX + subtreeWidth / 2 - nodeWidth / 2;
		const nodeY = level * ySpacing;
		const nodeId = `pos-${node.id}`;

		nodes.push({
			id: nodeId,
			type: "position",
			position: { x: nodeX, y: nodeY },
			data: {
				label: node.name,
				code: node.code,
				department: node.department,
				status: node.status,
				isRoot: level === 0,
				hasChildren: children.length > 0,
				childCount: children.length,
				onClick: onNodeClick ? () => onNodeClick(node) : undefined,
			},
		});

		if (parentId) {
			edges.push({
				id: `edge-${parentId}-${nodeId}`,
				source: parentId,
				target: nodeId,
				type: "smoothstep",
				animated: false,
				style: { stroke: "#1D7A8C", strokeWidth: 2 },
			});
		}

		// Position children
		if (children.length > 0) {
			let childStartX = startX;
			children.forEach(child => {
				const childWidth = calculateSubtreeWidth(child);
				positionNode(child, level + 1, childStartX, nodeId);
				childStartX += childWidth + (xSpacing - nodeWidth);
			});
		}
	};

	// Calculate total width of all root nodes
	let totalWidth = 0;
	treeData.forEach((rootNode, index) => {
		totalWidth += calculateSubtreeWidth(rootNode);
		if (index < treeData.length - 1) {
			totalWidth += xSpacing - nodeWidth;
		}
	});

	// Position all root nodes starting from left
	let currentX = -totalWidth / 2;
	treeData.forEach(rootNode => {
		const rootWidth = calculateSubtreeWidth(rootNode);
		positionNode(rootNode, 0, currentX, null);
		currentX += rootWidth + (xSpacing - nodeWidth);
	});

	return { nodes, edges };
};

const PositionTreeView = ({ treeData = [], loading = false, onNodeClick, onRefresh, className = "" }) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";

	const { nodes: initialNodes, edges: initialEdges } = useMemo(
		() => convertTreeToFlow(treeData, onNodeClick),
		[treeData, onNodeClick]
	);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Update nodes when treeData changes
	React.useEffect(() => {
		const { nodes: newNodes, edges: newEdges } = convertTreeToFlow(treeData, onNodeClick);
		setNodes(newNodes);
		setEdges(newEdges);
	}, [treeData, onNodeClick, setNodes, setEdges]);

	if (loading) {
		return (
			<div className={`flex items-center justify-center h-[500px] bg-gray-50 rounded-xl ${className}`}>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D7A8C] mx-auto"></div>
					<p className="mt-4 text-gray-500">{t("common.loading")}</p>
				</div>
			</div>
		);
	}

	if (!treeData || treeData.length === 0) {
		return (
			<div className={`flex items-center justify-center h-[500px] bg-gray-50 rounded-xl ${className}`}>
				<div className="text-center">
					<HiBriefcase className="w-16 h-16 text-gray-300 mx-auto" />
					<p className="mt-4 text-gray-500">{t("positions.tree.noData")}</p>
					{onRefresh && (
						<button
							onClick={onRefresh}
							className="mt-4 px-4 py-2 bg-[#1D7A8C] text-white rounded-lg hover:bg-[#156576] transition-colors"
						>
							{t("common.refresh")}
						</button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className={`h-[600px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden ${className}`}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				fitView
				fitViewOptions={{ padding: 0.2 }}
				minZoom={0.3}
				maxZoom={1.5}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={true}
				proOptions={{ hideAttribution: true }}
			>
				<Controls
					position={isRtl ? "bottom-left" : "bottom-right"}
					showInteractive={false}
					className="bg-white! shadow-lg! rounded-lg! border! border-gray-200!"
				/>
				<Background color="#e5e7eb" gap={20} size={1} />
			</ReactFlow>
		</div>
	);
};

export default PositionTreeView;
