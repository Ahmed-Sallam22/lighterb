import React, { memo } from "react";
import PropTypes from "prop-types";

import ViewIcon from "../../assets/eye.svg?react";
import EditIcon from "../../assets/edit.svg?react";
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

// Memoized table row component
const TableRow = memo(
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
	}) => (
		<tr className="hover:bg-gray-50 transition-colors duration-150">
			{columns.map((column, colIndex) => (
				<td
					key={colIndex}
					className="px-6 py-4 text-sm text-gray-900"
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

			{(onView || onEdit || onDelete ) && (
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
	)
);
TableRow.displayName = "TableRow";

const Table = memo(
	({
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
	}) => {
		return (
			<div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
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
										Actions
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
									<TableRow
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
									/>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
);
Table.displayName = "Table";

Table.propTypes = {
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
};

export default Table;
