import { memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const ChevronLeftIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
		<path
			fillRule="evenodd"
			d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

const ChevronRightIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
		<path
			fillRule="evenodd"
			d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

const DoubleChevronLeftIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
		<path
			fillRule="evenodd"
			d="M15.707 5.293a1 1 0 010 1.414L12.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
			clipRule="evenodd"
		/>
		<path
			fillRule="evenodd"
			d="M9.707 5.293a1 1 0 010 1.414L6.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

const DoubleChevronRightIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
		<path
			fillRule="evenodd"
			d="M4.293 14.707a1 1 0 010-1.414L7.586 10 4.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
			clipRule="evenodd"
		/>
		<path
			fillRule="evenodd"
			d="M10.293 14.707a1 1 0 010-1.414L13.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

const Pagination = memo(
	({
		currentPage,
		totalCount,
		pageSize,
		onPageChange,
		onPageSizeChange,
		hasNext,
		hasPrevious,
		pageSizeOptions = [10, 20, 50, 100],
		showPageSizeSelector = true,
		className = "",
	}) => {
		const { t, i18n } = useTranslation();
		const isRtl = i18n.dir() === "rtl";

		const totalPages = Math.ceil(totalCount / pageSize);
		const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
		const endItem = Math.min(currentPage * pageSize, totalCount);

		// Generate page numbers to display
		const getPageNumbers = () => {
			const pages = [];
			const maxPagesToShow = 5;

			if (totalPages <= maxPagesToShow) {
				for (let i = 1; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				// Always show first page
				pages.push(1);

				let start = Math.max(2, currentPage - 1);
				let end = Math.min(totalPages - 1, currentPage + 1);

				// Adjust if we're near the beginning
				if (currentPage <= 3) {
					end = Math.min(4, totalPages - 1);
				}

				// Adjust if we're near the end
				if (currentPage >= totalPages - 2) {
					start = Math.max(2, totalPages - 3);
				}

				// Add ellipsis after first page if needed
				if (start > 2) {
					pages.push("...");
				}

				// Add middle pages
				for (let i = start; i <= end; i++) {
					pages.push(i);
				}

				// Add ellipsis before last page if needed
				if (end < totalPages - 1) {
					pages.push("...");
				}

				// Always show last page
				if (totalPages > 1) {
					pages.push(totalPages);
				}
			}

			return pages;
		};

		const handlePageClick = page => {
			if (page !== "..." && page !== currentPage) {
				onPageChange(page);
			}
		};

		const handleFirstPage = () => {
			if (currentPage !== 1) {
				onPageChange(1);
			}
		};

		const handleLastPage = () => {
			if (currentPage !== totalPages) {
				onPageChange(totalPages);
			}
		};

		const handlePreviousPage = () => {
			if (hasPrevious && currentPage > 1) {
				onPageChange(currentPage - 1);
			}
		};

		const handleNextPage = () => {
			if (hasNext && currentPage < totalPages) {
				onPageChange(currentPage + 1);
			}
		};

		if (totalCount === 0) {
			return null;
		}

		return (
			<div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2 ${className}`}>
				{/* Info and Page Size */}
				<div className="flex items-center gap-4 text-sm text-gray-600">
					<span>{t("pagination.showing", { start: startItem, end: endItem, total: totalCount })}</span>

					{showPageSizeSelector && (
						<div className="flex items-center gap-2">
							<span>{t("pagination.rowsPerPage")}:</span>
							<select
								value={pageSize}
								onChange={e => onPageSizeChange(Number(e.target.value))}
								className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent"
							>
								{pageSizeOptions.map(size => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{/* Pagination Controls */}
				<div className={`flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
					{/* First Page */}
					<button
						onClick={handleFirstPage}
						disabled={currentPage === 1}
						className={`p-2 rounded-md transition-colors duration-200 ${
							currentPage === 1
								? "text-gray-300 cursor-not-allowed"
								: "text-gray-600 hover:bg-gray-100 hover:text-[#28819C]"
						}`}
						title={t("pagination.firstPage")}
					>
						{isRtl ? <DoubleChevronRightIcon /> : <DoubleChevronLeftIcon />}
					</button>

					{/* Previous Page */}
					<button
						onClick={handlePreviousPage}
						disabled={!hasPrevious}
						className={`p-2 rounded-md transition-colors duration-200 ${
							!hasPrevious
								? "text-gray-300 cursor-not-allowed"
								: "text-gray-600 hover:bg-gray-100 hover:text-[#28819C]"
						}`}
						title={t("pagination.previousPage")}
					>
						{isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
					</button>

					{/* Page Numbers */}
					<div className="flex items-center gap-1">
						{getPageNumbers().map((page, index) => (
							<button
								key={index}
								onClick={() => handlePageClick(page)}
								disabled={page === "..."}
								className={`min-w-9 h-9 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
									page === currentPage
										? "bg-[#28819C] text-white"
										: page === "..."
										? "text-gray-400 cursor-default"
										: "text-gray-600 hover:bg-gray-100 hover:text-[#28819C]"
								}`}
							>
								{page}
							</button>
						))}
					</div>

					{/* Next Page */}
					<button
						onClick={handleNextPage}
						disabled={!hasNext}
						className={`p-2 rounded-md transition-colors duration-200 ${
							!hasNext
								? "text-gray-300 cursor-not-allowed"
								: "text-gray-600 hover:bg-gray-100 hover:text-[#28819C]"
						}`}
						title={t("pagination.nextPage")}
					>
						{isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
					</button>

					{/* Last Page */}
					<button
						onClick={handleLastPage}
						disabled={currentPage === totalPages}
						className={`p-2 rounded-md transition-colors duration-200 ${
							currentPage === totalPages
								? "text-gray-300 cursor-not-allowed"
								: "text-gray-600 hover:bg-gray-100 hover:text-[#28819C]"
						}`}
						title={t("pagination.lastPage")}
					>
						{isRtl ? <DoubleChevronLeftIcon /> : <DoubleChevronRightIcon />}
					</button>
				</div>
			</div>
		);
	}
);

Pagination.displayName = "Pagination";

Pagination.propTypes = {
	currentPage: PropTypes.number.isRequired,
	totalCount: PropTypes.number.isRequired,
	pageSize: PropTypes.number.isRequired,
	onPageChange: PropTypes.func.isRequired,
	onPageSizeChange: PropTypes.func,
	hasNext: PropTypes.bool,
	hasPrevious: PropTypes.bool,
	pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
	showPageSizeSelector: PropTypes.bool,
	className: PropTypes.string,
};

export default Pagination;
