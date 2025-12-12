import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import SegmentTypes from "../components/segments/SegmentTypes";
import SegmentValues from "../components/segments/SegmentValues";
import { fetchSegmentTypes, fetchSegmentValues, setValuesPage } from "../store/segmentsSlice";
import SegmentPageHeaderIcon from "../assets/icons/SegmentPageHeaderIcon";

const SegmentsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const { types, values, typesLoading, valuesLoading, valuesCount, valuesPage, valuesHasNext, valuesHasPrevious } =
		useSelector(state => state.segments);

	const [selectedSegmentType, setSelectedSegmentType] = useState("");
	const [pageSize, setPageSize] = useState(20);

	// Fetch data on component mount
	useEffect(() => {
		dispatch(fetchSegmentTypes());
	}, [dispatch]);

	// Refetch values when filter or pagination changes
	useEffect(() => {
		dispatch(
			fetchSegmentValues({
				segment_type: selectedSegmentType,
				page: valuesPage,
				page_size: pageSize,
			})
		);
	}, [dispatch, selectedSegmentType, valuesPage, pageSize]);

	const handleSegmentTypeChange = value => {
		setSelectedSegmentType(value);
		dispatch(setValuesPage(1)); // Reset to first page when filter changes
	};

	const handlePageChange = page => {
		dispatch(setValuesPage(page));
	};

	const handlePageSizeChange = newPageSize => {
		setPageSize(newPageSize);
		dispatch(setValuesPage(1)); // Reset to first page when page size changes
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				title={t("segments.title")}
				subtitle={t("segments.subtitle")}
				icon={<SegmentPageHeaderIcon />}
			/>

			{/* Segment Types Section */}
			<SegmentTypes types={types} loading={typesLoading} />

			{/* Segment Values Section */}
			<SegmentValues
				types={types}
				values={values}
				loading={valuesLoading}
				selectedSegmentType={selectedSegmentType}
				onSegmentTypeChange={handleSegmentTypeChange}
				// Pagination props
				currentPage={valuesPage}
				totalCount={valuesCount}
				pageSize={pageSize}
				hasNext={valuesHasNext}
				hasPrevious={valuesHasPrevious}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
			/>

			{/* Toast Container */}
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
		</div>
	);
};

export default SegmentsPage;
