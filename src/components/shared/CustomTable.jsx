import React, { memo } from "react";
import PropTypes from "prop-types";
import ViewIcon from "../../assets/eye.svg?react";
import EditIcon from "../../assets/edit.svg?react";
import { useTranslation } from "react-i18next";

// Memoized icon components
const DeleteIcon = memo(() => (
	<svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M12.3329 8.6191C12.4813 8.19853 12.7565 7.83434 13.1206 7.57673C13.4846 7.31912 13.9196 7.18079 14.3656 7.18079C14.8116 7.18079 15.2466 7.31912 15.6107 7.57673C15.9748 7.83434 16.25 8.19853 16.3983 8.6191M20.471 10.0557H8.26025M19.2736 11.8514L18.9432 16.8075C18.8161 18.7138 18.7529 19.6669 18.1316 20.248C17.5102 20.8291 16.5542 20.8298 14.6436 20.8298H14.0876C12.177 20.8298 11.221 20.8298 10.5997 20.248C9.97838 19.6669 9.91445 18.7138 9.78803 16.8075L9.45762 11.8514M12.5699 13.6471L12.9291 17.2384M16.1613 13.6471L15.8022 17.2384"
			stroke="#F41A1A"
			strokeWidth="0.82089"
			strokeLinecap="round"
		/>
	</svg>
));
DeleteIcon.displayName = "DeleteIcon";
EditIcon.displayName = "EditIcon";
ViewIcon.displayName = "ViewIcon";

// Memoized custom table row component
const CustomTableRow = memo(
	({
		row,
		rowIndex,
		columns,
		onView,
		onEdit,
		onDelete,
		customActions,
		showActions,
		showDeleteButton,
		showViewButton,
		showEditButton,
		hasLatestVersion,
	}) => {
		const isLatest = hasLatestVersion && rowIndex === 0;
		// Styles for the latest version row
		const rowClass = isLatest
			? "border-l-3 border-r-3 border-[#187FC3] border-b-0 hover:bg-gray-50 transition-colors duration-150"
			: "hover:bg-gray-50 transition-colors duration-150";

		const textClass = isLatest ? "text-[#187FC3]" : "text-gray-900";

		return (
			<tr className={rowClass}>
				{columns.map((column, colIndex) => (
					<td
						key={colIndex}
						className={`px-6 py-4 text-sm ${textClass}`}
						style={{
							textAlign: "center",
							...(column.width ? { width: column.width, minWidth: column.width } : {}),
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								width: "100%",
							}}
						>
							{column.render ? column.render(row[column.accessor], row, rowIndex) : row[column.accessor]}
						</div>
					</td>
				))}

				{(onView || onEdit || onDelete) && (
					<td className="px-6 py-4" style={{ textAlign: "center" }}>
						{!showActions ||
							showActions(row) ||
							(onView && (!showViewButton || showViewButton(row))) ||
							(onEdit && (!showEditButton || showEditButton(row))) ||
							customActions ? (
							<div className="flex items-center justify-center gap-3">
								{onView && (!showViewButton || showViewButton(row)) && (
									<button
										onClick={() => onView(row, rowIndex)}
										className="hover:scale-110 transition-transform duration-200 rounded-full border border-gray-300 p-2"
										title="View"
									>
										<ViewIcon />
									</button>
								)}
								{onEdit && (!showEditButton || showEditButton(row)) && (
									<button
										onClick={() => onEdit(row, rowIndex)}
										className="hover:scale-110 transition-transform duration-200 rounded-full border border-gray-300 p-2"
										title="Edit"
									>
										<EditIcon />
									</button>
								)}
								{(!showActions || showActions(row)) &&
									onDelete &&
									(!showDeleteButton || showDeleteButton(row)) && (
										<button
											onClick={() => onDelete(row, rowIndex)}
											className="hover:scale-110 transition-transform duration-200"
											title="Delete"
										>
											<DeleteIcon />
										</button>
									)}
								{/* Custom Actions */}
								{customActions &&
									customActions
										.filter(action => !action.showWhen || action.showWhen(row))
										.map((action, actionIndex) => (
											<button
												key={actionIndex}
												onClick={() => action.onClick(row, rowIndex)}
												className="hover:scale-110 transition-transform duration-200"
												title={action.title}
											>
												{action.icon}
											</button>
										))}
							</div>
						) : (
							<div className="flex items-center justify-center">
								<span className="text-gray-400 text-xs">N/A</span>
							</div>
						)}
					</td>
				)}
			</tr>
		);
	}
);
CustomTableRow.displayName = "CustomTableRow";

const CustomTable = memo(
	({
		title,
		columns = [],
		data = [],
		onView,
		onEdit,
		onDelete,
		customActions = [],
		className = "",
		emptyMessage = "No data available",
		showActions,
		showDeleteButton,
		showViewButton,
		showEditButton,
		hasLatestVersion = false,
		isClosed = true,
	}) => {
		const { t } = useTranslation();

		// If isClosed is false, we might remove bottom rounded corners or borders
		// Standard Table uses: bg-white rounded-2xl shadow-lg overflow-hidden
		const containerClass = `bg-transparent shadow-lg overflow-hidden ${isClosed ? "rounded-2xl" : "rounded-t-2xl rounded-b-none border-b-0"} ${className}`;

		return (
				<div className="overflow-x-auto">

					<h4 className="text-lg font-semibold text-[#1D7A8C] mb-6 pl-3 border-l-4 border-[#1D7A8C]">
						{title}
					</h4>


					<div className={containerClass}>
						<div className="overflow-x-auto">
							<table className="w-full" style={{ textAlign: "center" }}>
								<thead className="bg-[#ececec] border-b-2 border-gray-200">
									<tr>
										{columns.map((column, index) => (
											<th
												key={index}
												className="px-6 py-4 text-sm font-semibold text-[#000000] border-r border-gray-300 last:border-r-0"
												style={{
													textAlign: "center",
													...(column.width ? { width: column.width, minWidth: column.width } : {}),
												}}
											>
												{column.header}
											</th>
										))}
										{(onView || onEdit || onDelete || customActions.length > 0) && (
											<th
												className="px-6 py-4 text-sm font-semibold text-[#000000]"
												style={{ textAlign: "center" }}
											>
												{t("table.actions")}
											</th>
										)}
									</tr>
								</thead>

								<tbody className="bg-white divide-y divide-gray-200">
									{data.length === 0 ? (
										<tr>
											<td
												colSpan={
													columns.length +
													(onView || onEdit || onDelete || customActions.length > 0 ? 1 : 0)
												}
												className="px-6 py-12 text-gray-500"
												style={{ textAlign: "center" }}
											>
												{emptyMessage}
											</td>
										</tr>
									) : (
										data.map((row, rowIndex) => (
											<CustomTableRow
												key={rowIndex}
												row={row}
												rowIndex={rowIndex}
												columns={columns}
												onView={onView}
												onEdit={onEdit}
												onDelete={onDelete}
												customActions={customActions}
												showActions={showActions}
												showDeleteButton={showDeleteButton}
												showViewButton={showViewButton}
												showEditButton={showEditButton}
												hasLatestVersion={hasLatestVersion}
											/>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
		);
	}
);
CustomTable.displayName = "CustomTable";

CustomTable.propTypes = {
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			header: PropTypes.string.isRequired,
			accessor: PropTypes.string.isRequired,
			render: PropTypes.func,
			width: PropTypes.string,
		})
	).isRequired,
	data: PropTypes.array.isRequired,
	onView: PropTypes.func,
	onEdit: PropTypes.func,
	onDelete: PropTypes.func,
	customActions: PropTypes.arrayOf(
		PropTypes.shape({
			icon: PropTypes.node.isRequired,
			title: PropTypes.string.isRequired,
			onClick: PropTypes.func.isRequired,
			showWhen: PropTypes.func,
		})
	),
	className: PropTypes.string,
	emptyMessage: PropTypes.string,
	showActions: PropTypes.func,
	showDeleteButton: PropTypes.func,
	showViewButton: PropTypes.func,
	showEditButton: PropTypes.func,
	hasLatestVersion: PropTypes.bool,
	isClosed: PropTypes.bool,
};

export default CustomTable;
