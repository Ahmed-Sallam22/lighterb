import React, { useMemo, useCallback } from "react";
import Tree from "react-d3-tree";
import { useTranslation } from "react-i18next";
import { HiBriefcase, HiUsers } from "react-icons/hi";

// Custom node component for positions
const PositionNodeElement = ({ nodeDatum, toggleNode, onNodeClick, t, isRtl }) => {
	const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
	const isCollapsed = nodeDatum.__rd3t?.collapsed;

	const statusColor =
		nodeDatum.status === "active"
			? "bg-green-100 border-green-500 text-green-800"
			: "bg-gray-100 border-gray-400 text-gray-600";

	const statusDot = nodeDatum.status === "active" ? "bg-green-500" : "bg-gray-400";

	return (
		<g>
			<foreignObject x={-130} y={-60} width={260} height={120}>
				<div
					className={`px-3 py-2.5 shadow-lg rounded-xl border-2 bg-white ${
						nodeDatum.isRoot ? "border-[#1D7A8C]" : "border-gray-300"
					} hover:shadow-xl transition-shadow cursor-pointer`}
					onClick={() => onNodeClick && onNodeClick(nodeDatum)}
				>
					<div className="flex items-start gap-2.5">
						<div
							className={`p-1.5 rounded-lg flex-shrink-0 ${
								nodeDatum.isRoot ? "bg-[#1D7A8C] text-white" : "bg-gray-100 text-gray-600"
							}`}
						>
							<HiBriefcase className="w-4 h-4" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-1.5 flex-wrap">
								<span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
									{nodeDatum.code}
								</span>
								{hasChildren && (
									<span className="text-[10px] text-[#1D7A8C] flex items-center gap-0.5">
										<HiUsers className="w-3 h-3" />
										<span>{nodeDatum.children.length}</span>
									</span>
								)}
							</div>
							<h3 className="font-semibold text-gray-800 text-xs mt-1 truncate" title={nodeDatum.name}>
								{nodeDatum.name}
							</h3>
							{nodeDatum.department && (
								<p className="text-[10px] text-gray-500 truncate mt-0.5" title={nodeDatum.department}>
									{nodeDatum.department}
								</p>
							)}
							{nodeDatum.status && (
								<div className="mt-1.5">
									<span
										className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColor}`}
									>
										<span
											className={`w-1 h-1 rounded-full ${statusDot} ${isRtl ? "ml-1" : "mr-1"}`}
										></span>
										{nodeDatum.status === "active" ? t("common.active") : t("common.inactive")}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</foreignObject>

			{/* Expand/Collapse button */}
			{hasChildren && (
				<g>
					<circle
						r={12}
						cx={0}
						cy={60}
						fill="#1D7A8C"
						stroke="#fff"
						strokeWidth={2}
						onClick={e => {
							e.stopPropagation();
							toggleNode();
						}}
						className="cursor-pointer hover:fill-[#156576] transition-colors"
					/>
					<text
						x={0}
						y={65}
						textAnchor="middle"
						fill="#fff"
						fontSize={14}
						fontWeight="bold"
						onClick={e => {
							e.stopPropagation();
							toggleNode();
						}}
						className="cursor-pointer select-none"
					>
						{isCollapsed ? "+" : "−"}
					</text>
				</g>
			)}
		</g>
	);
};

// Transform API data to react-d3-tree format
const transformTreeData = (data, isRoot = true) => {
	return data.map(node => ({
		name: node.name,
		code: node.code,
		department: node.department,
		status: node.status,
		id: node.id,
		isRoot: isRoot,
		children:
			node.direct_reports && node.direct_reports.length > 0
				? transformTreeData(node.direct_reports, false)
				: undefined,
	}));
};

const PositionTreeView = ({ treeData = [], loading = false, onNodeClick, onRefresh, className = "" }) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";

	const transformedData = useMemo(() => {
		if (!treeData || treeData.length === 0) return null;

		// If multiple root nodes, create a virtual root
		if (treeData.length > 1) {
			return {
				name: t("positions.tree.allPositions"),
				code: "ROOT",
				isRoot: true,
				isVirtualRoot: true,
				children: transformTreeData(treeData, true),
			};
		}

		// Single root node
		const transformed = transformTreeData(treeData, true);
		return transformed[0];
	}, [treeData, t]);

	const renderCustomNode = useCallback(
		({ nodeDatum, toggleNode }) => (
			<PositionNodeElement
				nodeDatum={nodeDatum}
				toggleNode={toggleNode}
				onNodeClick={node => {
					if (!node.isVirtualRoot && onNodeClick) {
						onNodeClick(node);
					}
				}}
				t={t}
				isRtl={isRtl}
			/>
		),
		[onNodeClick, t, isRtl]
	);

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
			<Tree
				data={transformedData}
				renderCustomNodeElement={renderCustomNode}
				orientation="vertical"
				pathFunc="step"
				translate={{ x: 400, y: 80 }}
				separation={{ siblings: 1.5, nonSiblings: 2 }}
				nodeSize={{ x: 280, y: 160 }}
				pathClassFunc={() => "tree-link"}
				enableLegacyTransitions
				transitionDuration={300}
				collapsible
				zoomable
				draggable
				scaleExtent={{ min: 0.3, max: 1.5 }}
			/>
			<style>
				{`
					.tree-link {
						stroke: #1D7A8C;
						stroke-width: 2px;
						fill: none;
					}
				`}
			</style>
		</div>
	);
};

export default PositionTreeView;
