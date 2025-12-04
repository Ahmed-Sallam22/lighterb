import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Group1 from '../ui/icons/Group1';
import Group2 from '../ui/icons/Group2';
import Group3 from '../ui/icons/Group3';
import Group4 from '../ui/icons/Group4';
import Group5 from '../ui/icons/Group5';
import Group6 from '../ui/icons/Group6';
import QuickActionsPanel from '../components/shared/QuickActionsPanel';
import { QUICK_ACTIONS } from '../constants/quickActions';
const Home = () => {
	const scrollContainerRef = useRef(null);
	const navigate = useNavigate();
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [activeRoute, setActiveRoute] = useState('Dashboard');
	const [isAnimating, setIsAnimating] = useState(false);

	const routes = [
		{ name: 'Dashboard', path: '/dashboard' },
		{ name: 'Assets', path: '/assets' },
		{ name: 'Procurement', path: '/procurement' },
		{ name: 'Accounts', path: '/accounts' },
		{ name: 'Suppliers', path: '/suppliers' },
		{ name: 'Customers', path: '/customers' },
		{ name: 'Journal', path: '/journal' },
		{ name: 'AR Invoices', path: '/ar-invoices' },
		{ name: 'AR Payments', path: '/payments/ar' },
		{ name: 'AP Invoices', path: '/ap-invoices' },
		{ name: 'AP Payments', path: '/payments/ap' },
		{ name: 'Reports', path: '/reports' },
	];

	const createCardIcon = () => (
		<svg width="29" height="27" viewBox="0 0 29 27" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clipPath="url(#clip0_22_314)">
				<path
					d="M0.0200195 11.24C0.0200195 8.24 0.0200195 5.31999 0.0200195 2.35999C0.0200195 0.719994 0.610017 -0.0600522 2.33002 -5.2179e-05C4.95002 0.0999478 7.70001 -1.3113e-05 10.14 0.289987C11.5808 0.438995 12.9961 0.77516 14.35 1.28999C15.8111 0.836921 17.3108 0.518908 18.83 0.339975C21.46 0.0899747 24.48 0.0399869 27.35 0.0399869C28.44 0.0399869 28.96 0.659967 28.96 1.76997C28.96 8.08997 28.96 14.4233 28.96 20.77C28.96 22.37 28.02 22.65 26.72 22.64C24.18 22.64 21.63 22.64 19.09 22.64C17.46 22.64 16.15 23.1 15.98 25.03C15.9 25.97 15.44 26.62 14.44 26.59C14.2531 26.5863 14.0688 26.5449 13.8983 26.4683C13.7277 26.3917 13.5744 26.2815 13.4474 26.1442C13.3204 26.007 13.2224 25.8455 13.1593 25.6695C13.0962 25.4935 13.0692 25.3066 13.08 25.1199C12.93 23.0399 11.52 22.64 9.81001 22.64C7.34001 22.64 4.88001 22.59 2.42001 22.64C0.780013 22.64 0.0100128 22.12 0.0600128 20.36C0.150013 17.36 0.0600128 14.2799 0.0600128 11.2499L0.0200195 11.24ZM26.35 11.46V8.99C26.35 2.24 26.35 2.23995 19.57 2.87995C19.3246 2.88957 19.0804 2.9197 18.84 2.96998C17.32 3.42998 16.07 4.34998 16.03 5.96998C15.91 10.33 15.98 14.69 16.03 19.04C16.03 19.6 15.95 20.29 16.89 20.04C19.57 19.42 22.29 19.8199 24.99 19.7499C26.05 19.7499 26.43 19.38 26.41 18.32C26.31 16.06 26.35 13.76 26.35 11.46ZM2.68002 11.26C2.68002 13.48 2.78002 15.71 2.68002 17.92C2.58002 19.52 3.22002 19.82 4.68002 19.82C7.13002 19.82 9.61002 19.4799 12.04 20.0599C13.34 20.3699 13.1 19.45 13.1 18.77C13.1 14.66 13.16 10.55 13.1 6.43995C13.1189 5.98491 13.0454 5.53076 12.8839 5.10493C12.7224 4.67909 12.4763 4.29041 12.1604 3.96235C11.8445 3.63429 11.4654 3.37368 11.0459 3.19624C10.6265 3.01879 10.1754 2.92826 9.72002 2.93C8.00002 2.77 6.27002 2.92996 4.55002 2.82996C3.18002 2.73996 2.65002 3.17999 2.72002 4.60999C2.76002 6.81999 2.69002 9.03996 2.69002 11.26H2.68002Z"
					fill="#D3D3D3"
				/>
			</g>
			<defs>
				<clipPath id="clip0_22_314">
					<rect width="28.95" height="26.57" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);

	// Card data for each route
	const cardsData = {
		Dashboard: [
			{ title: 'Setup', description: 'Segments & Types' },
			{ title: 'Journal Entries', description: 'General Ledger' },
			{ title: 'Journal Lines', description: 'Line Item Analysis' },
			{ title: 'Accounts Receivable', description: 'Customer Invoices' },
			{ title: 'Accounts Payable', description: 'Supplier Invoices' },
			{ title: 'Reports', description: 'Financial Reports' },
			{ title: 'Currencies', description: 'Currency Management' },
			{ title: 'Exchange Rates', description: 'FX Management' },
			{ title: 'FX Configuration', description: 'Base Currency & Accounts' },
			{ title: 'Tax Rates', description: 'VAT/Tax Configuration' },
			{ title: 'Corporate Tax', description: 'Income Tax Management' },
			{ title: 'Customers', description: 'Customer Management' },
			{ title: 'Suppliers', description: 'Customer Management' },
			{ title: 'Invoice Approvals', description: 'Review & Approve' },
		],
		Assets: [
			{ title: 'Asset Register', description: 'All Assets' },
			{ title: 'Asset Categories', description: 'Categories & Setup' },
			{ title: 'Asset Locations', description: 'Location & Custodians' },
			{ title: 'Depreciation', description: 'Calculate & Post' },
		],
		Procurement: [
			{ title: 'Procurement Dashboard', description: 'Analytics & Insights' },
			{ title: 'Procurement', description: 'PRs, POs, Bills and Payments' },
		],
		Accounts: [
			{ title: 'Chart of Accounts', description: 'Account Structure' },
			{ title: 'General Ledger', description: 'GL Entries' },
			{ title: 'Trial Balance', description: 'Account Balances' },
			{ title: 'Bank Accounts', description: 'Banking Operations' },
			{ title: 'Reconciliation', description: 'Account Reconciliation' },
			{ title: 'Budget', description: 'Budget Management' },
			{ title: 'Cost Centers', description: 'Cost Allocation' },
			{ title: 'Financial Reports', description: 'Financial Statements' },
		],
		Journal: [
			{ title: 'Journal Entries', description: 'General Ledger' },
			{ title: 'Journal Lines', description: 'Line Item Analysis' },
		],
	};

	const quickActionItems = QUICK_ACTIONS;

	const cards = (cardsData[activeRoute] || cardsData.Dashboard).map(card => ({
		...card,
		icon: createCardIcon(),
	}));

	const handleQuickActionClick = action => {
		navigate(`/quick-actions/${action.id}`);
	};

	const handleCardClick = cardTitle => {
		// Special handling for Journal cards
		if (activeRoute === 'Journal') {
			if (cardTitle === 'Journal Entries') {
				navigate('/journal/entries');
			} else if (cardTitle === 'Journal Lines') {
				navigate('/journal/lines');
			}
		}

		// Special handling for Dashboard cards
		if (activeRoute === 'Dashboard') {
			if (cardTitle === 'Setup') {
				navigate('/segments');
			} else if (cardTitle === 'Currencies') {
				navigate('/currency');
			} else if (cardTitle === 'Exchange Rates') {
				navigate('/exchange-rates');
			} else if (cardTitle === 'Tax Rates') {
				navigate('/tax-rates');
			} else if (cardTitle === 'Invoice Approvals') {
				navigate('/invoice-approvals');
			} else if (cardTitle === 'Journal Entries') {
				navigate('/journal/entries');
			} else if (cardTitle === 'Journal Lines') {
				navigate('/journal/lines');
			} else if (cardTitle === 'Customers') {
				navigate('/customers');
			} else if (cardTitle === 'Suppliers') {
				navigate('/Suppliers');
			} else if (cardTitle === 'Reports') {
				navigate('/reports');
			} else if (cardTitle === 'Accounts Receivable') {
				navigate('/ar-invoices');
			} else if (cardTitle === 'Accounts Payable') {
				navigate('/ap-invoices');
			}
		}

		// Procurement dashboard card
		if (activeRoute === 'Procurement') {
			if (cardTitle === 'Procurement Dashboard' || cardTitle === 'Procurement') {
				navigate('/procurement');
			} else if (cardTitle === 'Catalog Reference') {
				navigate('/procurement/catalog');
			}
		}
	};

	const handleRouteClick = routeName => {
		// Check if this route has cards data (children)
		const hasChildren = cardsData[routeName] && cardsData[routeName].length > 0;

		if (hasChildren) {
			// If it has children, just change the active view (don't navigate)
			if (routeName !== activeRoute) {
				setIsAnimating(true);
				setActiveRoute(routeName);
				setTimeout(() => setIsAnimating(false), 300);
			}
		} else {
			// If it doesn't have children, navigate to the route
			const route = routes.find(r => r.name === routeName);
			if (route && route.path) {
				navigate(route.path);
			}
		}
	};

	const updateScrollButtons = () => {
		if (!scrollContainerRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
		const maxScrollLeft = scrollWidth - clientWidth - 1;
		setCanScrollRight(scrollLeft < maxScrollLeft);
	};

	const scroll = direction => {
		if (scrollContainerRef.current) {
			const scrollAmount = 200;
			scrollContainerRef.current.scrollBy({
				left: direction === 'right' ? scrollAmount : -scrollAmount,
				behavior: 'smooth',
			});
		}
	};

	useEffect(() => {
		const container = scrollContainerRef.current;
		updateScrollButtons();

		if (!container) return;

		container.addEventListener('scroll', updateScrollButtons, { passive: true });
		window.addEventListener('resize', updateScrollButtons);

		return () => {
			container.removeEventListener('scroll', updateScrollButtons);
			window.removeEventListener('resize', updateScrollButtons);
		};
	}, []);

	return (
		<section className="min-h-screen relative overflow-hidden bg-[#031b28] py-8 px-6 text-white">
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						'linear-gradient(135deg, rgba(3,17,32,0.98) 0%, rgba(8,61,92,0.95) 45%, rgba(13,97,122,0.9) 100%)',
				}}
				aria-hidden="true"
			/>
			<div
				className="absolute inset-0 opacity-40"
				style={{
					backgroundImage:
						'radial-gradient(circle at 20% 20%, rgba(40,129,156,0.45), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.18), transparent 35%), radial-gradient(circle at 10% 90%, rgba(40,129,156,0.35), transparent 40%)',
				}}
				aria-hidden="true"
			/>
			<Group1 />
			<Group2 />
			<Group3 />
			<Group4 />
			<Group5 />
			<Group6 />

			<div className="relative  mx-auto">
				{/* Title Section */}
				<div className="text-left">
					<h1 className="text-[32px] font-bold text-[#D3D3D3]  flex items-center gap-2">
						Let's get started with
						<svg width="60" height="22" viewBox="0 0 66 23" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								opacity="0.8"
								d="M5.37415 8.97832L7.80908 11.4449L5.42137 13.8639H18.2648V8.97832H5.37415Z"
								fill="white"
							/>
							<path opacity="0.8" d="M18.2649 17.9567H0V22.8422H18.2649V17.9567Z" fill="white" />
							<path
								opacity="0.8"
								d="M45.9346 22.8372V0.035614H54.1556C57.2699 0.035614 59.3006 0.148784 60.2476 0.375125C61.7121 0.723899 63.0003 1.5114 63.8991 2.60741C64.8801 3.75382 65.3706 5.23409 65.3706 7.04821C65.3706 8.44926 65.0879 9.62623 64.5225 10.5791C64.0156 11.4732 63.2762 12.2442 62.3671 12.8267C61.57 13.3414 60.6673 13.7089 59.7111 13.908C58.4871 14.1253 56.7158 14.234 54.3973 14.234H51.0576V22.8355L45.9346 22.8372ZM51.0576 3.89246V10.3635H53.8609C55.8758 10.3635 57.2258 10.2441 57.9109 10.0053C58.5603 9.78861 59.1196 9.39742 59.5128 8.88496C59.904 8.36175 60.1065 7.74297 60.0927 7.11272C60.1234 6.3597 59.832 5.62472 59.2786 5.05868C58.741 4.51867 58.0148 4.15941 57.2195 4.04014C56.6075 3.93716 55.3784 3.8851 53.5322 3.88397L51.0576 3.89246Z"
								fill="white"
							/>
							<path
								opacity="0.8"
								d="M20.693 22.8372V0.035614H31.4774C34.1875 0.035614 36.1577 0.240453 37.3881 0.650129C38.617 1.0596 39.6565 1.82926 40.3387 2.83488C41.0861 3.9116 41.4706 5.15977 41.4457 6.4286C41.4457 8.1386 40.8865 9.55323 39.7683 10.6725C38.65 11.7917 36.9763 12.4945 34.7473 12.7808C35.7609 13.2951 36.6856 13.9396 37.492 14.694C38.2123 15.3889 39.1845 16.6224 40.4086 18.3947L43.5066 22.8439H37.3768L33.6724 17.882C32.3577 16.1097 31.4578 14.9928 30.973 14.531C30.5519 14.1084 30.0239 13.7829 29.4335 13.5821C28.8894 13.4101 28.0293 13.3246 26.8531 13.3258H25.816V22.8439L20.693 22.8372ZM25.8179 9.67942H29.6072C32.0655 9.67942 33.6 9.58605 34.2108 9.39932C34.7959 9.23038 35.3017 8.89112 35.6483 8.43511C36.0111 7.92549 36.1923 7.32856 36.1678 6.72398C36.1678 5.95668 35.9399 5.33707 35.484 4.86515C34.9794 4.37003 34.2949 4.05282 33.5534 3.97054C33.1378 3.91848 31.8917 3.89246 29.815 3.89246H25.816L25.8179 9.67942Z"
								fill="white"
							/>
							<path opacity="0.8" d="M18.2649 0H0V4.87707H18.2649V0Z" fill="white" />
						</svg>
					</h1>
				</div>

				{/* Navigation Bar */}
				<div className="my-7 relative">
					<div className="flex items-center gap-3">
						{/* Left Arrow */}

						<div
							ref={scrollContainerRef}
							className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth  px-4 py-4"
							style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
						>
							{routes.map((route, index) => (
								<button
									key={index}
									onClick={() => handleRouteClick(route.name)}
									className={`px-6 py-3 rounded-lg whitespace-nowrap border text-sm font-semibold tracking-wide transition-all duration-300 transform backdrop-blur-md shadow-lg ${
										activeRoute === route.name
											? 'border-[#48C1F0] bg-[#48C1F0]/20 text-white scale-105 shadow-[0_0_20px_rgba(72,193,240,0.4)]'
											: 'border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5'
									}`}
								>
									{route.name}
								</button>
							))}
						</div>
						{/* Right Arrow */}
						<button
							onClick={() => scroll('right')}
							className={`shrink-0 p-2 border border-white/20 bg-white/10 text-white rounded-full transition-all duration-300 transform backdrop-blur-md ${
								canScrollRight
									? 'opacity-100 hover:bg-white/20 hover:border-white/40 hover:scale-110'
									: 'opacity-0 pointer-events-none'
							}`}
							aria-label="Scroll right"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 11 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M2.16939 -3.49691e-07L10.8474 8L2.16939 16L-0.000120827 14L6.5084 8L-0.000120258 2L2.16939 -3.49691e-07Z"
									fill="#48C1F0"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Cards Section */}
				<div
					className={`grid grid-cols-1 md:grid-cols-2 ${
						cards.length > 2 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'
					} gap-6 transition-all duration-500 ${
						isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
					}`}
				>
					{cards.map((card, index) => (
						<div
							key={`${activeRoute}-${index}`}
							onClick={() => handleCardClick(card.title)}
							className={`rounded-xl border border-white/10 bg-[#28819C]/30 py-6 px-3 shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_10px_30px_rgba(72,193,240,0.3)] animate-fadeInUp ${
								activeRoute === 'Journal' ||
								(activeRoute === 'Dashboard' &&
									(card.title === 'Setup' ||
										card.title === 'Journal Entries' ||
										card.title === 'Journal Lines' ||
										card.title === 'Currencies' ||
										card.title === 'Exchange Rates' ||
										card.title === 'Tax Rates' ||
										card.title === 'Invoice Approvals'))
									? 'cursor-pointer'
									: 'cursor-pointer'
							}`}
							style={{
								animationDelay: `${index * 50}ms`,
							}}
						>
							<div className="flex flex-row items-center gap-4">
								{/* Icon */}
								<div className="shrink-0 transition-transform duration-300 hover:scale-110">
									{card.icon}
								</div>

								{/* Border */}
								<div className="shrink-0">
									<svg
										width="1"
										height="81"
										viewBox="0 0 1 81"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<rect opacity="0.5" width="0.942444" height="80.5992" fill="#7A9098" />
									</svg>
								</div>

								{/* Title and Description */}
								<div className="flex-1">
									<h3 className="text-white font-semibold text-lg mb-1 transition-colors duration-300">
										{card.title}
									</h3>
									<p className="text-white/80 text-sm leading-relaxed">{card.description}</p>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="mt-12">
					<QuickActionsPanel
						title="Quick Actions"
						actions={quickActionItems}
						onActionClick={handleQuickActionClick}
					/>
				</div>
			</div>
		</section>
	);
};

export default Home;
