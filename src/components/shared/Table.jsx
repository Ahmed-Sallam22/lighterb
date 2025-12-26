import React, { memo } from "react";
import PropTypes from "prop-types";

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

const EditIcon = memo(() => (
	<svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g clipPath="url(#clip0_121_403)">
			<path
				d="M6.15643 8.91744C6.16168 9.05712 6.19449 9.19437 6.25295 9.32133C6.31142 9.44828 6.3944 9.56243 6.49712 9.65721C7.178 10.3381 7.86059 11.0207 8.54487 11.7051C10.3721 13.5304 12.1993 15.3565 14.0265 17.1832C14.1856 17.3459 14.3812 17.4684 14.597 17.5407C15.5271 17.8544 16.4543 18.1784 17.3844 18.4942C17.5595 18.5533 17.7383 18.6124 17.9316 18.5672C18.0434 18.5438 18.1491 18.4971 18.2417 18.4302C18.3343 18.3632 18.4118 18.2774 18.469 18.1785C18.5262 18.0796 18.5619 17.9697 18.5737 17.856C18.5856 17.7423 18.5734 17.6275 18.5378 17.5188C18.1837 16.4668 17.8221 15.4172 17.453 14.3701C17.4007 14.2532 17.3241 14.1487 17.2283 14.0637C15.8014 12.6333 14.3727 11.2046 12.9424 9.77758C11.8656 8.70174 10.7886 7.62614 9.71138 6.55079C9.63408 6.47084 9.55013 6.39763 9.46042 6.33192C9.33968 6.23786 9.19551 6.17861 9.04352 6.16061C8.89153 6.14261 8.7375 6.16653 8.59813 6.22978C8.44495 6.29255 8.30396 6.38169 8.18157 6.49315C7.6038 7.05344 7.03623 7.62395 6.46794 8.19373C6.36996 8.28717 6.29186 8.39944 6.23833 8.5238C6.18481 8.64816 6.15695 8.78205 6.15643 8.91744ZM11.0763 9.01739L16.5863 14.4854L14.4955 16.5522L9.04022 11.0806L11.0763 9.01739ZM10.5248 8.43375L8.43107 10.5254C8.41749 10.5147 8.40458 10.5033 8.39241 10.4911C7.92941 10.031 7.46738 9.57064 7.00632 9.11005C6.86042 8.96414 6.86042 8.85106 7.00632 8.70442C7.57146 8.1378 8.1378 7.57142 8.70537 7.00529C8.85127 6.85938 8.96289 6.85938 9.10952 7.00529L10.4774 8.38123C10.4971 8.40092 10.5131 8.42062 10.5248 8.43375ZM16.9445 15.1624C16.9531 15.1753 16.9609 15.1887 16.9679 15.2025C17.2553 16.0493 17.5423 16.8963 17.8287 17.7435C17.8367 17.7669 17.8338 17.8165 17.8221 17.8165C17.7908 17.8322 17.7549 17.8363 17.7207 17.8282C16.9037 17.5509 16.0874 17.2718 15.2718 16.9906C15.2513 16.9834 15.2324 16.9724 15.2032 16.9593L16.9445 15.1624Z"
				fill="#22C55E"
			/>
			<path
				d="M9.32748 15.5855H8.80223C8.58337 15.5855 8.579 15.5855 8.579 15.808C8.579 17.5917 8.579 19.3755 8.579 21.1599C8.58052 21.3433 8.61105 21.5253 8.66945 21.6991C8.84527 22.2207 9.30341 22.5424 9.8841 22.568C10.1081 22.5782 10.3335 22.5724 10.5574 22.5724H21.1106C21.3505 22.5802 21.5892 22.5349 21.8095 22.4396C22.3019 22.2105 22.5288 21.802 22.5646 21.2789C22.5814 21.0352 22.5711 20.7901 22.5711 20.5449C22.5711 17.0523 22.5711 13.5602 22.5711 10.0686C22.5718 9.8939 22.5515 9.71974 22.5106 9.54989C22.3778 9.01805 21.954 8.66641 21.3835 8.59783C21.285 8.58592 21.1858 8.57983 21.0866 8.57959H15.5977V9.32957H21.0625C21.1471 9.32881 21.2317 9.33393 21.3156 9.34489C21.6128 9.3872 21.7794 9.55743 21.8154 9.85557C21.8248 9.93668 21.8292 10.0183 21.8285 10.1C21.8285 13.7579 21.8285 17.4161 21.8285 21.0746C21.83 21.162 21.8241 21.2494 21.811 21.3358C21.7599 21.6276 21.5805 21.7881 21.2733 21.8202C21.2095 21.8259 21.1455 21.8283 21.0815 21.8275C17.4154 21.8275 13.7498 21.8275 10.0847 21.8275C9.99738 21.8291 9.91004 21.8237 9.82355 21.8114C9.53174 21.7618 9.37344 21.5926 9.34061 21.2964C9.33173 21.2123 9.32759 21.1278 9.32821 21.0432C9.32821 19.2714 9.32821 17.4991 9.32821 15.7263L9.32748 15.5855Z"
				fill="#22C55E"
			/>
		</g>
		<defs>
			<clipPath id="clip0_121_403">
				<rect width="16.4178" height="16.4178" fill="white" transform="matrix(-1 0 0 1 22.5742 6.15674)" />
			</clipPath>
		</defs>
	</svg>
));
EditIcon.displayName = "EditIcon";

const ViewIcon = memo(() => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 9.74 9.24 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 9 10.84 9 12.5C9 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z"
			fill="#28819C"
		/>
	</svg>
));
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
									className="hover:scale-110 transition-transform duration-200"
									title="View"
								>
									<ViewIcon />
								</button>
							)}
							{onEdit && (!showEditButton || showEditButton(row)) && (
								<button
									onClick={() => onEdit(row, rowIndex)}
									className="hover:scale-110 transition-transform duration-200"
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
