import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeader from '../components/shared/PageHeader';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import Card from '../components/shared/Card';
import { createJournal, updateJournal } from '../store/journalsSlice';
import { fetchCurrencies } from '../store/currenciesSlice';
import { fetchAccounts } from '../store/accountsSlice';
import { fetchSegmentTypes, fetchSegmentValues } from '../store/segmentsSlice';

const HeroPattern = () => (
	<svg
		className="pointer-events-none absolute  "
		width="871"
		height="322"
		viewBox="0 0 871 322"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g opacity="0.1">
			<mask id="mask0_177_13244" maskUnits="userSpaceOnUse" x="0" y="0" width="871" height="308">
				<rect x="0.570312" y="0.219971" width="870.316" height="306.873" rx="40" fill="#D3D3D3" />
			</mask>
			<g mask="url(#mask0_177_13244)">
				<g opacity="0.5">
					<path
						d="M18.3834 263.045L52.9843 273.755L-16.53 296.535L18.3834 263.045Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M3.95954 -27.7887L38.5604 -17.079L-30.9538 5.70101L3.95954 -27.7887Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M-10.5961 206.382L27.6497 199.483L-26.3255 249.003L-10.5961 206.382Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M113.076 196.198L116.141 229.722L65.3326 180.103L113.076 196.198Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M-8.28617 127.401L-37.0226 167.353L-36.158 70.0641L-8.28617 127.401Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M290.992 284.036L294.057 317.561L243.249 267.942L290.992 284.036Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M36.124 233.656L36.125 233.656L55.6962 214.878L55.5298 259.447L20.53 248.614L36.124 233.656Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M28.9447 152.099L54.1792 163.039L7.98389 176.879L8.20654 143.105L28.9447 152.099Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M202.35 287.603L227.584 298.543L181.389 312.383L181.612 278.609L202.35 287.603Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M138.982 252.033L166.036 244.613L141.805 283.258L117.246 257.992L138.982 252.033Z"
						stroke="#28819C"
						stroke-width="3"
					/>
					<path
						d="M94.0883 317.309L70.3921 276.017L107.302 274.416L94.0883 317.309Z"
						stroke="#28819C"
						stroke-width="3"
					/>
				</g>
			</g>
		</g>
	</svg>
);

const CreateJournalPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const { currencies } = useSelector(state => state.currencies);
	const { accounts } = useSelector(state => state.accounts);
	const { types: segmentTypes = [], values: segmentValues = [] } = useSelector(state => state.segments);

	// Check if we're in edit mode (journal data passed via navigation state)
	const editJournal = location.state?.journal;
	const isEditMode = !!editJournal;

	// Generate currency options from Redux state
	const currencyOptions = currencies.map(currency => ({
		value: currency.id.toString(),
		label: `${currency.code} - ${currency.name}`,
	}));

	// Generate account options from Redux state
	const accountOptions = accounts.map(account => ({
		value: account.id.toString(),
		label: `${account.account_number || account.id} - ${account.account_name || account.name || 'Account'}`,
	}));

	const [formData, setFormData] = useState({
		name: '',
		date: '',
		reference: '',
		description: '',
		currency: '1', // USD is currency ID 1
		status: 'draft',
	});

	const [lines, setLines] = useState([]);
	const [segmentFormState, setSegmentFormState] = useState({}); // Track segment form for each line

	const [errors, setErrors] = useState({
		date: '',
		currency: '',
		description: '',
	});

	// Fetch currencies, accounts, segment types, and segment values on component mount
	useEffect(() => {
		dispatch(fetchCurrencies());
		dispatch(fetchAccounts());
		dispatch(fetchSegmentTypes());
		dispatch(fetchSegmentValues());
	}, [dispatch]);

	// Pre-fill form data when in edit mode
	useEffect(() => {
		if (editJournal) {
			setFormData({
				name: editJournal.memo || '',
				date: editJournal.date || '',
				reference: editJournal.reference || '',
				description: editJournal.memo || '',
				currency: editJournal.currency || 'USD',
				status: editJournal.is_posted ? 'posted' : 'draft',
			});

			// If journal has lines, populate them
			if (editJournal.lines && editJournal.lines.length > 0) {
				// Map API lines to form lines structure
				const mappedLines = editJournal.lines.map((line, index) => ({
					id: index + 1,
					account: line.account || '',
					debit: line.debit || '0.00',
					credit: line.credit || '0.00',
					segments: line.segments || [],
				}));
				setLines(mappedLines);
			}
		}
	}, [editJournal]);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const handleAddLine = () => {
		const newLine = {
			id: Date.now(), // Use timestamp as unique ID
			account: '',
			debit: '0.00',
			credit: '0.00',
			segments: [],
		};
		setLines([...lines, newLine]);
	};

	const handleRemoveLine = lineId => {
		if (lines.length > 1) {
			setLines(lines.filter(line => line.id !== lineId));
		}
	};

	const handleLineChange = (lineId, field, value) => {
		setLines(lines.map(line => (line.id === lineId ? { ...line, [field]: value } : line)));
	};

	const handleSegmentFormChange = (lineId, field, value) => {
		const currentSegmentForm = segmentFormState[lineId] || { segment_type: '', segment: '' };

		const updatedForm = {
			...currentSegmentForm,
			[field]: value,
			// Reset segment value when segment type changes
			...(field === 'segment_type' ? { segment: '' } : {}),
		};

		setSegmentFormState(prev => ({
			...prev,
			[lineId]: updatedForm,
		}));

		// Auto-add segment when both segment_type and segment are selected
		if (field === 'segment' && value && updatedForm.segment_type) {
			// Both are now selected, auto-add the segment
			const segmentType = segmentTypes.find(st => st.segment_id === parseInt(updatedForm.segment_type));
			const segmentValue = segmentValues.find(sv => sv.id === parseInt(value));

			const newSegment = {
				id: Date.now(),
				segment_type: parseInt(updatedForm.segment_type),
				segment: parseInt(value),
				// Store display names for UI
				segment_type_name:
					segmentType?.segment_name || segmentType?.segment_type || `Type ${updatedForm.segment_type}`,
				segment_value_name: segmentValue?.alias || segmentValue?.name || `Value ${value}`,
			};

			setLines(
				lines.map(line => {
					if (line.id === lineId) {
						return {
							...line,
							segments: [...(line.segments || []), newSegment],
						};
					}
					return line;
				})
			);

			// Reset segment form for this line
			setSegmentFormState(prev => ({
				...prev,
				[lineId]: { segment_type: '', segment: '' },
			}));

			toast.success('Segment added automatically');
		}
	};

	const handleRemoveSegmentFromLine = (lineId, segmentId) => {
		setLines(
			lines.map(line => {
				if (line.id === lineId) {
					return {
						...line,
						segments: line.segments.filter(seg => seg.id !== segmentId),
					};
				}
				return line;
			})
		);
		toast.success('Segment removed');
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.date) {
			newErrors.date = 'Date is required';
		}

		if (!formData.currency) {
			newErrors.currency = 'Currency is required';
		}

		if (!formData.description || formData.description.trim() === '') {
			newErrors.description = 'Description is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const calculateTotals = () => {
		const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
		const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
		return { totalDebit, totalCredit };
	};

	const handleSubmit = async e => {
		e.preventDefault();

		// Validate form first
		if (!validateForm()) {
			return;
		}

		const { totalDebit, totalCredit } = calculateTotals();

		if (totalDebit !== totalCredit) {
			toast.error('Total Debit and Total Credit must be equal!');
			return;
		}

		// Prepare journal data for API
		const journalData = {
			date: formData.date,
			currency: parseInt(formData.currency) || 1, // Convert currency to integer ID
			memo: formData.description,
			lines: lines.map(line => ({
				account: parseInt(line.account),
				debit: parseFloat(line.debit),
				credit: parseFloat(line.credit),
				segments: (line.segments || []).map(seg => ({
					segment_type: seg.segment_type || seg.id, // segment_type ID
					segment: seg.segment || seg.id, // segment ID
				})),
			})),
		};

		try {
			if (isEditMode) {
				// Update existing journal
				await dispatch(
					updateJournal({
						id: editJournal.id,
						data: journalData,
					})
				).unwrap();
				toast.success('Journal entry updated successfully!');
			} else {
				// Create new journal
				await dispatch(createJournal(journalData)).unwrap();
				toast.success('Journal entry created successfully!');
			}

			// Navigate back to journal entries page
			navigate('/journal/entries');
		} catch (err) {
			// Display detailed error message from API response
			const errorMessage = err?.message || err?.error || err?.detail || 'Failed to save journal entry';

			// If there are field-specific errors, display them
			if (err && typeof err === 'object' && !err.message && !err.error && !err.detail) {
				const errorMessages = [];
				Object.keys(err).forEach(key => {
					if (Array.isArray(err[key])) {
						errorMessages.push(`${key}: ${err[key].join(', ')}`);
					} else if (typeof err[key] === 'string') {
						errorMessages.push(`${key}: ${err[key]}`);
					} else if (typeof err[key] === 'object') {
						// Handle nested errors (e.g., lines[0].account: ["error"])
						errorMessages.push(`${key}: ${JSON.stringify(err[key])}`);
					}
				});

				if (errorMessages.length > 0) {
					toast.error(errorMessages.join(' | '), { autoClose: 5000 });
					return;
				}
			}

			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		navigate('/journal/entries');
	};

	const { totalDebit, totalCredit } = calculateTotals();
	const isBalanced = totalDebit === totalCredit && totalDebit > 0;

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<PageHeader
				title={isEditMode ? 'Edit Journal Entry' : 'New Journal Entry'}
				subtitle={isEditMode ? 'Update journal entry details' : 'Create a new journal entry'}
				icon={
					<svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M16.25 2.5C16.25 2.16848 16.1183 1.85054 15.8839 1.61612C15.6495 1.3817 15.3315 1.25 15 1.25H2.5C2.16848 1.25 1.85054 1.3817 1.61612 1.61612C1.3817 1.85054 1.25 2.16848 1.25 2.5V10.625C1.24854 11.8715 1.58661 13.0948 2.2279 14.1637C2.86919 15.2325 3.7895 16.1066 4.89 16.6919L8.125 18.4169V17L5.47875 15.5887C4.57853 15.1096 3.82568 14.3945 3.30093 13.52C2.77618 12.6456 2.49931 11.6448 2.5 10.625V2.5H15V8.125H16.25V2.5Z"
							fill="#28819C"
						/>
					</svg>
				}
			/>

			<div className=" mx-auto py-6">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Hero Card */}
					<div className="relative  rounded-[36px] border border-[#D7E8EF] bg-linear-to-br from-[#F4FBFE] via-white to-[#EAF5FB] p-8 shadow-xl">
						<HeroPattern />
						<div className="relative space-y-6 ">
							<div>
								<h2 className="text-3xl font-bold text-[#1F6F8B]">
									{isEditMode ? 'Edit Manual Journal Entry' : 'Create Manual Journal Entry'}
								</h2>
								<p className="mt-3 text-base text-[#2F6E8A]">
									{isEditMode
										? 'Update the journal entry details and lines below.'
										: 'Define how this invoice will post to the general ledger. Click ▼ to select segments for each line.'}
								</p>
							</div>

							<div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr]">
								<div className="text-left">
									<FloatingLabelInput
										label="Date"
										type="date"
										value={formData.date}
										onChange={e => handleInputChange('date', e.target.value)}
										required
										error={errors.date}
									/>
								</div>

								<div className="text-left">
									<FloatingLabelSelect
										label="Currency"
										value={formData.currency}
										onChange={e => handleInputChange('currency', e.target.value)}
										options={currencyOptions}
										required
										error={errors.currency}
									/>
								</div>

								<div className="text-left">
									<FloatingLabelInput
										label="Description"
										type="text"
										value={formData.description}
										onChange={e => handleInputChange('description', e.target.value)}
										placeholder="Add a short memo"
										required
										error={errors.description}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* GL Distribution Lines */}
					<Card
						title="GL Distribution Lines"
						subtitle="Posting"
						actionSlot={
							<button
								type="button"
								onClick={handleAddLine}
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
							>
								+ New Line
							</button>
						}
					>
						{lines.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
								<p className="text-lg font-semibold mb-2">No GL distribution lines added yet</p>
								<p className="text-sm mb-6">
									GL distribution lines are required to post this journal entry.
								</p>
								<button
									type="button"
									onClick={handleAddLine}
									className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
								>
									+ New First Line
								</button>
							</div>
						) : (
							<div className="">
								<table className="w-full border-collapse">
									<thead>
										<tr className="border-b border-gray-200 bg-gray-50">
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Account
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Debit
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Credit
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Segments Type
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Segments Value
											</th>
											<th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{lines.map(line => (
											<tr key={line.id} className="hover:bg-gray-50 transition-colors">
												<td className="px-4 py-3">
													<FloatingLabelSelect
														label="Account"
														value={line.account}
														onChange={e =>
															handleLineChange(line.id, 'account', e.target.value)
														}
														options={[
															{ value: '', label: 'Select Account' },
															...accountOptions,
														]}
													/>
												</td>
												<td className="px-4 py-3">
													<FloatingLabelInput
														label="Debit"
														type="number"
														step="0.01"
														value={line.debit}
														onChange={e =>
															handleLineChange(line.id, 'debit', e.target.value)
														}
														placeholder="0.00"
													/>
												</td>
												<td className="px-4 py-3">
													<FloatingLabelInput
														label="Credit"
														type="number"
														step="0.01"
														value={line.credit}
														onChange={e =>
															handleLineChange(line.id, 'credit', e.target.value)
														}
														placeholder="0.00"
													/>
												</td>
												<td className="px-4 py-3">
													<div className="flex flex-col gap-2">
														{/* Display existing segments */}
														{line.segments && line.segments.length > 0 && (
															<div className="flex flex-wrap gap-1 mb-2">
																{line.segments.map(segment => (
																	<span
																		key={segment.id}
																		className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group relative"
																	>
																		{segment.segment_type_name ||
																			segment.segment_type}
																		<button
																			type="button"
																			onClick={() =>
																				handleRemoveSegmentFromLine(
																					line.id,
																					segment.id
																				)
																			}
																			className="ml-1 text-blue-600 hover:text-red-600"
																			title="Remove segment"
																		>
																			×
																		</button>
																	</span>
																))}
															</div>
														)}

														<FloatingLabelSelect
															label="Segment Type"
															value={segmentFormState[line.id]?.segment_type || ''}
															onChange={e =>
																handleSegmentFormChange(
																	line.id,
																	'segment_type',
																	e.target.value
																)
															}
															options={[
																{ value: '', label: 'Select Segment Type' },
																...(segmentTypes?.map(type => ({
																	value: type.segment_id.toString(),
																	label: `${type.segment_name} (${type.segment_type})`,
																})) || []),
															]}
														/>

														{/* Optional manual add button (segments auto-add when both dropdowns are selected) */}
														<div className="text-xs text-gray-500 italic mt-1">
															Auto-adds when both selected
														</div>
													</div>
												</td>
												<td className="px-4 py-3">
													<div className="flex flex-col gap-2">
														{/* Display existing segment values */}
														{line.segments && line.segments.length > 0 && (
															<div className="flex flex-wrap gap-1 mb-2">
																{line.segments.map(segment => (
																	<span
																		key={segment.id}
																		className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 group relative"
																	>
																		{segment.segment_value_name ||
																			segment.alias ||
																			segment.name}
																		<button
																			type="button"
																			onClick={() =>
																				handleRemoveSegmentFromLine(
																					line.id,
																					segment.id
																				)
																			}
																			className="ml-1 text-green-600 hover:text-red-600"
																			title="Remove segment"
																		>
																			×
																		</button>
																	</span>
																))}
															</div>
														)}

														<FloatingLabelSelect
															label="Segment Value"
															value={segmentFormState[line.id]?.segment || ''}
															onChange={e =>
																handleSegmentFormChange(
																	line.id,
																	'segment',
																	e.target.value
																)
															}
															disabled={!segmentFormState[line.id]?.segment_type}
															options={[
																{ value: '', label: 'Select Segment Value' },
																...(segmentValues
																	?.filter(value => {
																		const selectedTypeId =
																			segmentFormState[line.id]?.segment_type;
																		if (!selectedTypeId) return false;
																		return (
																			value.segment_type ===
																			parseInt(selectedTypeId)
																		);
																	})
																	.map(value => ({
																		value: value.id.toString(),
																		label: `${value.alias} (${value.code})`,
																	})) || []),
															]}
														/>
													</div>
												</td>
												<td className="px-4 py-3 text-center">
													<button
														type="button"
														onClick={() => handleRemoveLine(line.id)}
														disabled={lines.length === 1}
														className={`p-2 rounded-lg transition-colors ${
															lines.length === 1
																? 'text-gray-300 cursor-not-allowed'
																: 'text-red-600 hover:bg-red-50'
														}`}
														title="Delete line"
													>
														<svg
															className="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
													</button>
												</td>
											</tr>
										))}
									</tbody>
									<tfoot className="border-t-2 border-gray-300 bg-gray-50">
										<tr className="font-semibold">
											<td className="px-4 py-3 text-right text-gray-700">Totals:</td>
											<td className="px-4 py-3 text-right text-lg text-[#28819C]">
												{totalDebit.toFixed(2)}
											</td>
											<td className="px-4 py-3 text-right text-lg text-[#28819C]">
												{totalCredit.toFixed(2)}
											</td>
											<td colSpan="2" className="px-4 py-3">
												{isBalanced ? (
													<span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
														<svg
															className="w-5 h-5"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fillRule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																clipRule="evenodd"
															/>
														</svg>
														Balanced
													</span>
												) : (
													<span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
														<svg
															className="w-5 h-5"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fillRule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
																clipRule="evenodd"
															/>
														</svg>
														Not Balanced (Diff:
														{Math.abs(totalDebit - totalCredit).toFixed(2)})
													</span>
												)}
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
						)}
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-4">
						<button
							type="button"
							onClick={handleCancel}
							className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!isBalanced}
							className={`px-6 py-2 rounded-lg font-medium transition-colors ${
								isBalanced
									? 'bg-[#28819C] text-white hover:bg-[#206a82]'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
							}`}
						>
							{isEditMode ? 'Update Entry' : 'Create Entry'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateJournalPage;
