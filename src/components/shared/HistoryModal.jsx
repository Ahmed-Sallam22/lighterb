import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { HiClock, HiX } from "react-icons/hi";
import Button from "./Button";

const HistoryModal = ({
	isOpen,
	onClose,
	title,
	loading = false,
	data = [],
	columns = [],
	renderRates = null,
	className = "",
	maxWidth = "900px",
}) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleKeyDown = event => {
			if (event.key === "Escape") {
				onClose?.();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen || typeof document === "undefined") {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	const formatDate = dateString => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	};

	const renderStatus = value => {
		const isActive = value === "active";
		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
					isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
				}`}
			>
				<span
					className={`w-2 h-2 rounded-full ${isRtl ? "ml-1.5" : "mr-1.5"} ${
						isActive ? "bg-green-500" : "bg-gray-400"
					}`}
				></span>
				{isActive ? t("common.active") : t("common.inactive")}
			</span>
		);
	};

	const renderCellValue = (item, column) => {
		const value = item[column.accessor];

		if (column.render) {
			return column.render(value, item);
		}

		if (column.accessor === "status") {
			return renderStatus(value);
		}

		if (column.accessor.includes("date")) {
			return formatDate(value);
		}

		return value || "-";
	};

	if (!isMounted || !isOpen || typeof document === "undefined") {
		return null;
	}

	const modalContent = (
		<div className="fixed inset-0 z-999 flex items-end sm:items-center justify-center">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
				onClick={onClose}
				aria-hidden="true"
			/>

			<div
				className={`
					relative w-full bg-[#F2F4F5] rounded-t-3xl sm:rounded-2xl shadow-2xl
					transform transition-all duration-300 animate-fadeInUp
					max-h-[90vh] overflow-hidden ${className}
				`}
				style={{ maxWidth }}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				onClick={event => event.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center px-6 py-4 justify-between border-b border-gray-200 bg-white">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-[#1D7A8C]/10 rounded-lg">
							<HiClock className="w-5 h-5 text-[#1D7A8C]" />
						</div>
						<h2 className="text-xl font-bold text-[#1D7A8C]">{title}</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<HiX className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7A8C]"></div>
							<span className="ml-3 text-gray-600">{t("common.loading")}</span>
						</div>
					) : data.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<HiClock className="w-12 h-12 mb-3 text-gray-300" />
							<p>{t("history.noHistory")}</p>
						</div>
					) : (
						<div className="space-y-6">
							{data.map((item, index) => (
								<div
									key={item.id || index}
									className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
								>
									{/* Timeline marker */}
									<div className="flex items-center gap-3 px-4 py-3 bg-[#1D7A8C]/5 border-b border-gray-100">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-full bg-[#1D7A8C]"></div>
											<span className="text-sm font-medium text-gray-700">
												{formatDate(item.effective_start_date)}
												{item.effective_end_date && (
													<>
														<span className="mx-2 text-gray-400">→</span>
														{formatDate(item.effective_end_date)}
													</>
												)}
												{!item.effective_end_date && (
													<span className="ml-2 text-xs text-green-600 font-medium">
														({t("history.current")})
													</span>
												)}
											</span>
										</div>
									</div>

									{/* Data grid */}
									<div className="p-4">
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{columns.map((column, colIndex) => (
												<div key={colIndex} className="space-y-1">
													<label className="text-xs text-gray-500 font-medium">
														{column.header}
													</label>
													<div className="text-sm text-gray-900">
														{renderCellValue(item, column)}
													</div>
												</div>
											))}
										</div>

										{/* Rates section for grades */}
										{renderRates && item.rates && item.rates.length > 0 && (
											<div className="mt-4 pt-4 border-t border-gray-100">
												<h4 className="text-sm font-medium text-gray-700 mb-3">
													{t("history.rates")}
												</h4>
												{renderRates(item.rates)}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-white">
					<Button
						onClick={onClose}
						title={t("common.close")}
						className="bg-gray-200 hover:bg-gray-300 text-gray-800"
					/>
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};

HistoryModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	loading: PropTypes.bool,
	data: PropTypes.array,
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			header: PropTypes.string.isRequired,
			accessor: PropTypes.string.isRequired,
			render: PropTypes.func,
		})
	),
	renderRates: PropTypes.func,
	className: PropTypes.string,
	maxWidth: PropTypes.string,
};

export default HistoryModal;
