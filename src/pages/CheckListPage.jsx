import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineClipboardCheck, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";
import { FiEdit2 } from "react-icons/fi";

import PageHeader from "../components/shared/PageHeader";
import Button from "../components/shared/Button";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";

const TASKS = [
	{
		id: 1,
		name: "Final QA Review",
		description: "Check responsiveness on all devices",
		owner: "Amr Elsayed",
		dueDate: "Tomorrow",
		dueDateType: "warning",
		status: "in-progress",
		completed: false,
	},
	{
		id: 2,
		name: "Server Configuration",
		description: "Setup production environment variables",
		owner: "Seif Elmoushy",
		dueDate: "Oct 24, 2024",
		dueDateType: "normal",
		status: "pending",
		completed: false,
	},
	{
		id: 3,
		name: "Content Upload",
		description: "Upload all blog images",
		owner: "Mohamed Ibrahim",
		dueDate: "Yesterday",
		dueDateType: "overdue",
		status: "review",
		completed: false,
	},
	{
		id: 4,
		name: "Database Migration",
		description: "Transfer user data to new schema",
		owner: "George Elkomos",
		dueDate: "Oct 20, 2024",
		dueDateType: "normal",
		status: "completed",
		completed: true,
	},
	{
		id: 5,
		name: "Design System Update",
		description: "Update color palette in Figma",
		owner: "Ziad Al Saadani",
		dueDate: "Oct 18, 2024",
		dueDateType: "normal",
		status: "completed",
		completed: true,
	},
];

const OWNERS = [
	{ value: "", label: "Owner" },
	{ value: "amr", label: "Amr Elsayed" },
	{ value: "seif", label: "Seif Elmoushy" },
	{ value: "mohamed", label: "Mohamed Ibrahim" },
	{ value: "george", label: "George Elkomos" },
	{ value: "ziad", label: "Ziad Al Saadani" },
];

const EMPLOYEES = [
	{ value: "", label: "Employee" },
	{ value: "amr", label: "Amr Elsayed" },
	{ value: "seif", label: "Seif Elmoushy" },
	{ value: "mohamed", label: "Mohamed Ibrahim" },
	{ value: "george", label: "George Elkomos" },
	{ value: "ziad", label: "Ziad Al Saadani" },
];

const CheckListPage = () => {
	const { t } = useTranslation();
	const [page, setPage] = useState(2);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState(null);
	const [tasks, setTasks] = useState(TASKS);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		owner: "",
		dueDate: "",
		status: "pending",
	});

	useEffect(() => {
		document.title = `${t("checklist.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const stats = useMemo(() => {
		const total = tasks.length;
		const completed = tasks.filter(task => task.status === "completed").length;
		const pending = total - completed;
		const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
		return { total, completed, pending, percentage };
	}, [tasks]);

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleStatusChange = status => {
		setFormData(prev => ({ ...prev, status }));
	};

	const handleOpenAdd = () => {
		setFormData({
			name: "",
			description: "",
			owner: "",
			dueDate: "",
			status: "pending",
		});
		setIsAddModalOpen(true);
	};

	const handleOpenEdit = task => {
		setSelectedTask(task);
		setFormData({
			name: task.name,
			description: task.description,
			owner: task.owner,
			dueDate: task.dueDate,
			status: task.status,
		});
		setIsEditModalOpen(true);
	};

	const handleToggleComplete = taskId => {
		setTasks(prev =>
			prev.map(task =>
				task.id === taskId
					? {
							...task,
							completed: !task.completed,
							status: !task.completed ? "completed" : "pending",
					  }
					: task
			)
		);
	};

	const handleAddTask = () => {
		if (!formData.name) return;
		const newTask = {
			id: tasks.length + 1,
			name: formData.name,
			description: formData.description,
			owner: formData.owner,
			dueDate: formData.dueDate,
			dueDateType: "normal",
			status: formData.status,
			completed: formData.status === "completed",
		};
		setTasks(prev => [...prev, newTask]);
		setIsAddModalOpen(false);
	};

	const handleEditTask = () => {
		if (!formData.name || !selectedTask) return;
		setTasks(prev =>
			prev.map(task =>
				task.id === selectedTask.id
					? {
							...task,
							name: formData.name,
							description: formData.description,
							owner: formData.owner,
							dueDate: formData.dueDate,
							status: formData.status,
							completed: formData.status === "completed",
					  }
					: task
			)
		);
		setIsEditModalOpen(false);
	};

	const renderStatusBadge = status => {
		const statusMap = {
			"in-progress": { className: "bg-cyan-100 text-cyan-700", label: t("checklist.status.inProgress") },
			pending: { className: "bg-gray-100 text-gray-600", label: t("checklist.status.pending") },
			review: { className: "bg-amber-100 text-amber-700", label: t("checklist.status.review") },
			completed: { className: "bg-green-100 text-green-700", label: t("checklist.status.completed") },
		};
		const statusInfo = statusMap[status] || statusMap.pending;
		return (
			<span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
				{statusInfo.label}
			</span>
		);
	};

	const renderDueDate = (date, type) => {
		const typeMap = {
			warning: { icon: "📅", className: "text-amber-600" },
			overdue: { icon: "🔴", className: "text-red-600" },
			normal: { icon: "📅", className: "text-gray-600" },
		};
		const info = typeMap[type] || typeMap.normal;
		return (
			<span className={`flex items-center gap-1 ${info.className}`}>
				<span>{info.icon}</span>
				{date}
			</span>
		);
	};

	const StatusToggle = ({ active, status, label, onClick }) => (
		<button
			type="button"
			onClick={() => onClick(status)}
			className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
				active ? "ring-2 ring-offset-1 ring-[#1D7A8C]" : ""
			} ${
				status === "completed"
					? "bg-green-100 text-green-700"
					: status === "review"
					? "bg-amber-100 text-amber-700"
					: status === "pending"
					? "bg-gray-100 text-gray-600"
					: "bg-cyan-100 text-cyan-700"
			}`}
		>
			{label}
			<span
				className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
					active ? "border-current bg-current" : "border-current"
				}`}
			>
				{active && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
			</span>
		</button>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				icon={<HiOutlineClipboardCheck className="w-8 h-8 text-white mr-3" />}
				title={t("checklist.title")}
				subtitle={t("checklist.subtitle")}
			/>

			<div className="px-6 py-8 space-y-6">
				{/* Progress Indicator Section */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("checklist.progressTitle")}</h2>
						<Button
							onClick={handleOpenAdd}
							title={t("checklist.buttons.addItem")}
							icon={<HiOutlinePlus className="w-4 h-4" />}
							className="text-sm px-4 py-2"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{/* Progress Circle */}
						<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center">
							<div className="relative w-28 h-28">
								<svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
									<circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
									<circle
										cx="50"
										cy="50"
										r="40"
										stroke="#1D7A8C"
										strokeWidth="8"
										fill="none"
										strokeLinecap="round"
										strokeDasharray={`${stats.percentage * 2.51} 251`}
									/>
								</svg>
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<span className="text-2xl font-bold text-[#1D7A8C]">{stats.percentage}%</span>
									<span className="text-xs text-gray-500 uppercase">{t("checklist.complete")}</span>
								</div>
							</div>
						</div>

						{/* Stats Cards */}
						<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
							<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
								<span className="text-blue-600 text-lg">≡</span>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("checklist.stats.totalTasks")}</p>
								<p className="text-3xl font-bold text-gray-900">{stats.total}</p>
							</div>
						</div>

						<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
							<div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
								<span className="text-green-600 text-lg">✓</span>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("checklist.stats.completed")}</p>
								<p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
							</div>
						</div>

						<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
							<div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
								<span className="text-red-600 text-lg">⊘</span>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("checklist.stats.pending")}</p>
								<p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Tasks Table Section */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
					<div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
						<h3 className="text-lg font-semibold text-gray-900">{t("checklist.tasksTitle")}</h3>
						<div className="relative">
							<HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input
								type="text"
								placeholder={t("checklist.searchPlaceholder")}
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D7A8C] focus:border-transparent"
							/>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
										<input type="checkbox" className="rounded border-gray-300" />
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										{t("checklist.table.taskName")}
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										{t("checklist.table.owner")}
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										{t("checklist.table.dueDate")}
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
										{t("checklist.table.status")}
									</th>
									<th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
										{t("checklist.table.actions")}
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{tasks.map(task => (
									<tr
										key={task.id}
										className={`hover:bg-gray-50 transition-colors ${
											task.completed ? "bg-gray-50/50" : ""
										}`}
									>
										<td className="px-6 py-4">
											<input
												type="checkbox"
												checked={task.completed}
												onChange={() => handleToggleComplete(task.id)}
												className="rounded border-gray-300 text-[#1D7A8C] focus:ring-[#1D7A8C]"
											/>
										</td>
										<td className="px-6 py-4">
											<div>
												<p
													className={`font-semibold ${
														task.completed ? "text-[#1D7A8C] line-through" : "text-gray-900"
													}`}
												>
													{task.name}
												</p>
												<p className="text-xs text-gray-500">{task.description}</p>
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-gray-700">{task.owner}</td>
										<td className="px-6 py-4 text-sm">
											{renderDueDate(task.dueDate, task.dueDateType)}
										</td>
										<td className="px-6 py-4">{renderStatusBadge(task.status)}</td>
										<td className="px-6 py-4">
											<div className="flex items-center justify-center gap-2">
												{!task.completed ? (
													<button
														onClick={() => handleOpenEdit(task)}
														className="text-gray-400 hover:text-[#1D7A8C] transition-colors"
														title={t("common.edit")}
													>
														<FiEdit2 className="w-4 h-4" />
													</button>
												) : (
													<button
														className="text-gray-400 hover:text-red-500 transition-colors"
														title={t("common.delete")}
													>
														<HiOutlineTrash className="w-4 h-4" />
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="px-6 py-4 bg-gray-50">
						<Pagination
							currentPage={page}
							totalCount={25}
							pageSize={5}
							onPageChange={setPage}
							onPageSizeChange={() => {}}
							hasNext
							hasPrevious
							showPageSizeSelector={false}
						/>
					</div>
				</div>
			</div>

			{/* Add Item Modal */}
			<SlideUpModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				title={t("checklist.modals.addItem")}
				maxWidth="600px"
			>
				<div className="space-y-6">
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-4">
							{t("checklist.modals.taskDetails")}
						</h4>
						<div className="space-y-4">
							<FloatingLabelInput
								label={t("checklist.modals.fields.taskName")}
								name="name"
								value={formData.name}
								onChange={handleInputChange}
							/>
							<FloatingLabelTextarea
								label={t("checklist.modals.fields.description")}
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								rows={3}
							/>
							<FloatingLabelSelect
								label={t("checklist.modals.fields.owner")}
								name="owner"
								options={OWNERS}
								value={formData.owner}
								onChange={handleInputChange}
							/>
						</div>
					</div>

					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-2">
							{t("checklist.modals.fields.dueDate")}
						</h4>
						<FloatingLabelInput
							label={t("checklist.modals.fields.dueDate")}
							name="dueDate"
							type="date"
							value={formData.dueDate}
							onChange={handleInputChange}
						/>
					</div>

					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-2">
							{t("checklist.modals.fields.status")}
						</h4>
						<div className="flex items-center gap-2 flex-wrap">
							<FloatingLabelSelect
								label={t("checklist.modals.fields.status")}
								name="status"
								options={[
									{ value: "", label: t("checklist.modals.fields.status") },
									{ value: "completed", label: t("checklist.status.completed") },
									{ value: "review", label: t("checklist.status.review") },
									{ value: "pending", label: t("checklist.status.pending") },
									{ value: "in-progress", label: t("checklist.status.inProgress") },
								]}
								value={formData.status}
								onChange={handleInputChange}
								className="flex-1 min-w-[150px]"
							/>
							<div className="flex items-center gap-2">
								<StatusToggle
									active={formData.status === "completed"}
									status="completed"
									label={t("checklist.status.completed")}
									onClick={handleStatusChange}
								/>
								<StatusToggle
									active={formData.status === "review"}
									status="review"
									label={t("checklist.status.review")}
									onClick={handleStatusChange}
								/>
								<StatusToggle
									active={formData.status === "pending"}
									status="pending"
									label={t("checklist.status.pending")}
									onClick={handleStatusChange}
								/>
								<StatusToggle
									active={formData.status === "in-progress"}
									status="in-progress"
									label={t("checklist.status.inProgress")}
									onClick={handleStatusChange}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 pt-6">
					<Button
						onClick={() => setIsAddModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button onClick={handleAddTask} title={t("checklist.buttons.add")} />
				</div>
			</SlideUpModal>

			{/* Edit Item Modal */}
			<SlideUpModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				title={t("checklist.modals.editItem")}
				maxWidth="600px"
			>
				<div className="space-y-6">
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-4">
							{t("checklist.modals.taskDetails")}
						</h4>
						<div className="space-y-4">
							<FloatingLabelInput
								label={t("checklist.modals.fields.taskName")}
								name="name"
								value={formData.name}
								onChange={handleInputChange}
							/>
							<FloatingLabelTextarea
								label={t("checklist.modals.fields.description")}
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								rows={3}
							/>
							<FloatingLabelSelect
								label={t("checklist.modals.fields.employee")}
								name="owner"
								options={EMPLOYEES}
								value={formData.owner}
								onChange={handleInputChange}
							/>
						</div>
					</div>

					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-2">
							{t("checklist.modals.fields.dueDate")}
						</h4>
						<FloatingLabelInput
							label={t("checklist.modals.fields.dueDate")}
							name="dueDate"
							type="date"
							value={formData.dueDate}
							onChange={handleInputChange}
						/>
					</div>

					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-2">
							{t("checklist.modals.fields.status")}
						</h4>
						<div className="flex items-center gap-2 flex-wrap">
							<FloatingLabelSelect
								label={t("checklist.modals.fields.status")}
								name="status"
								options={[
									{ value: "", label: t("checklist.modals.fields.status") },
									{ value: "completed", label: t("checklist.status.completed") },
									{ value: "review", label: t("checklist.status.review") },
									{ value: "pending", label: t("checklist.status.pending") },
									{ value: "in-progress", label: t("checklist.status.inProgress") },
								]}
								value={formData.status}
								onChange={handleInputChange}
								className="flex-1 min-w-[150px]"
							/>
							<div className="flex items-center gap-2">
								<StatusToggle
									active={formData.status === "completed"}
									status="completed"
									label={t("checklist.status.completed")}
									onClick={handleStatusChange}
								/>
								<StatusToggle
									active={formData.status === "review"}
									status="review"
									label={t("checklist.status.review")}
									onClick={handleStatusChange}
								/>
								<StatusToggle
									active={formData.status === "pending"}
									status="pending"
									label={t("checklist.status.pending")}
									onClick={handleStatusChange}
								/>
								<StatusToggle
									active={formData.status === "in-progress"}
									status="in-progress"
									label={t("checklist.status.inProgress")}
									onClick={handleStatusChange}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 pt-6">
					<Button
						onClick={() => setIsEditModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button onClick={handleEditTask} title={t("checklist.buttons.edit")} />
				</div>
			</SlideUpModal>
		</div>
	);
};

export default CheckListPage;
