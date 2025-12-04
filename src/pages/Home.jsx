import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { HiBookOpen, HiChevronRight, HiChevronLeft } from 'react-icons/hi';
import Group1 from '../ui/icons/Group1';
import Group2 from '../ui/icons/Group2';
import Group3 from '../ui/icons/Group3';
import Group4 from '../ui/icons/Group4';
import Group5 from '../ui/icons/Group5';
import Group6 from '../ui/icons/Group6';
import logo from '../assets/Logo.png';
import QuickActionsPanel from '../components/shared/QuickActionsPanel';
import { QUICK_ACTIONS } from '../constants/quickActions';
import { useLocale } from '../hooks/useLocale';
const Home = () => {
	const scrollContainerRef = useRef(null);
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { locale } = useLocale();
	const isRTL = locale === 'AR';
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [activeRoute, setActiveRoute] = useState('Dashboard');
	const [isAnimating, setIsAnimating] = useState(false);

	const routes = [
		{ name: t('home.routes.dashboard'), key: 'Dashboard', path: '/dashboard' },
		{ name: t('home.routes.assets'), key: 'Assets', path: '/assets' },
		{ name: t('home.routes.procurement'), key: 'Procurement', path: '/procurement' },
		{ name: t('home.routes.accounts'), key: 'Accounts', path: '/accounts' },
		{ name: t('home.routes.suppliers'), key: 'Suppliers', path: '/suppliers' },
		{ name: t('home.routes.customers'), key: 'Customers', path: '/customers' },
		{ name: t('home.routes.journal'), key: 'Journal', path: '/journal' },
		{ name: t('home.routes.arInvoices'), key: 'AR Invoices', path: '/ar-invoices' },
		{ name: t('home.routes.arPayments'), key: 'AR Payments', path: '/payments/ar' },
		{ name: t('home.routes.apInvoices'), key: 'AP Invoices', path: '/ap-invoices' },
		{ name: t('home.routes.apPayments'), key: 'AP Payments', path: '/payments/ap' },
		{ name: t('home.routes.reports'), key: 'Reports', path: '/reports' },
	];

	const createCardIcon = () => <HiBookOpen className="w-7 h-7 text-[#D3D3D3]" />;

	// Card data for each route
	const cardsData = {
		Dashboard: [
			{ title: t('home.cards.setup.title'), description: t('home.cards.setup.description'), key: 'Setup' },
			{
				title: t('home.cards.journalEntries.title'),
				description: t('home.cards.journalEntries.description'),
				key: 'Journal Entries',
			},
			{
				title: t('home.cards.journalLines.title'),
				description: t('home.cards.journalLines.description'),
				key: 'Journal Lines',
			},
			{
				title: t('home.cards.accountsReceivable.title'),
				description: t('home.cards.accountsReceivable.description'),
				key: 'Accounts Receivable',
			},
			{
				title: t('home.cards.accountsPayable.title'),
				description: t('home.cards.accountsPayable.description'),
				key: 'Accounts Payable',
			},
			{ title: t('home.cards.reports.title'), description: t('home.cards.reports.description'), key: 'Reports' },
			{
				title: t('home.cards.currencies.title'),
				description: t('home.cards.currencies.description'),
				key: 'Currencies',
			},
			{
				title: t('home.cards.exchangeRates.title'),
				description: t('home.cards.exchangeRates.description'),
				key: 'Exchange Rates',
			},
			{
				title: t('home.cards.fxConfiguration.title'),
				description: t('home.cards.fxConfiguration.description'),
				key: 'FX Configuration',
			},
			{
				title: t('home.cards.taxRates.title'),
				description: t('home.cards.taxRates.description'),
				key: 'Tax Rates',
			},
			{
				title: t('home.cards.corporateTax.title'),
				description: t('home.cards.corporateTax.description'),
				key: 'Corporate Tax',
			},
			{
				title: t('home.cards.customers.title'),
				description: t('home.cards.customers.description'),
				key: 'Customers',
			},
			{
				title: t('home.cards.suppliers.title'),
				description: t('home.cards.suppliers.description'),
				key: 'Suppliers',
			},
			{
				title: t('home.cards.invoiceApprovals.title'),
				description: t('home.cards.invoiceApprovals.description'),
				key: 'Invoice Approvals',
			},
		],
		Assets: [
			{
				title: t('home.cards.assetRegister.title'),
				description: t('home.cards.assetRegister.description'),
				key: 'Asset Register',
			},
			{
				title: t('home.cards.assetCategories.title'),
				description: t('home.cards.assetCategories.description'),
				key: 'Asset Categories',
			},
			{
				title: t('home.cards.assetLocations.title'),
				description: t('home.cards.assetLocations.description'),
				key: 'Asset Locations',
			},
			{
				title: t('home.cards.depreciation.title'),
				description: t('home.cards.depreciation.description'),
				key: 'Depreciation',
			},
		],
		Procurement: [
			{
				title: t('home.cards.procurementDashboard.title'),
				description: t('home.cards.procurementDashboard.description'),
				key: 'Procurement Dashboard',
			},
			{
				title: t('home.cards.procurement.title'),
				description: t('home.cards.procurement.description'),
				key: 'Procurement',
			},
		],
		Accounts: [
			{
				title: t('home.cards.chartOfAccounts.title'),
				description: t('home.cards.chartOfAccounts.description'),
				key: 'Chart of Accounts',
			},
			{
				title: t('home.cards.generalLedger.title'),
				description: t('home.cards.generalLedger.description'),
				key: 'General Ledger',
			},
			{
				title: t('home.cards.trialBalance.title'),
				description: t('home.cards.trialBalance.description'),
				key: 'Trial Balance',
			},
			{
				title: t('home.cards.bankAccounts.title'),
				description: t('home.cards.bankAccounts.description'),
				key: 'Bank Accounts',
			},
			{
				title: t('home.cards.reconciliation.title'),
				description: t('home.cards.reconciliation.description'),
				key: 'Reconciliation',
			},
			{ title: t('home.cards.budget.title'), description: t('home.cards.budget.description'), key: 'Budget' },
			{
				title: t('home.cards.costCenters.title'),
				description: t('home.cards.costCenters.description'),
				key: 'Cost Centers',
			},
			{
				title: t('home.cards.financialReports.title'),
				description: t('home.cards.financialReports.description'),
				key: 'Financial Reports',
			},
		],
		Journal: [
			{
				title: t('home.cards.journalEntries.title'),
				description: t('home.cards.journalEntries.description'),
				key: 'Journal Entries',
			},
			{
				title: t('home.cards.journalLines.title'),
				description: t('home.cards.journalLines.description'),
				key: 'Journal Lines',
			},
		],
	};

	const quickActionItems = QUICK_ACTIONS.map(action => ({
		id: action.id,
		label: t(action.labelKey),
		description: t(action.descriptionKey),
	}));

	const cards = (cardsData[activeRoute] || cardsData.Dashboard).map(card => ({
		...card,
		icon: createCardIcon(),
	}));

	const handleQuickActionClick = action => {
		navigate(`/quick-actions/${action.id}`);
	};

	const handleCardClick = cardKey => {
		// Special handling for Journal cards
		if (activeRoute === 'Journal') {
			if (cardKey === 'Journal Entries') {
				navigate('/journal/entries');
			} else if (cardKey === 'Journal Lines') {
				navigate('/journal/lines');
			}
		}

		// Special handling for Dashboard cards
		if (activeRoute === 'Dashboard') {
			if (cardKey === 'Setup') {
				navigate('/segments');
			} else if (cardKey === 'Currencies') {
				navigate('/currency');
			} else if (cardKey === 'Exchange Rates') {
				navigate('/exchange-rates');
			} else if (cardKey === 'Tax Rates') {
				navigate('/tax-rates');
			} else if (cardKey === 'Invoice Approvals') {
				navigate('/invoice-approvals');
			} else if (cardKey === 'Journal Entries') {
				navigate('/journal/entries');
			} else if (cardKey === 'Journal Lines') {
				navigate('/journal/lines');
			} else if (cardKey === 'Customers') {
				navigate('/customers');
			} else if (cardKey === 'Suppliers') {
				navigate('/Suppliers');
			} else if (cardKey === 'Reports') {
				navigate('/reports');
			} else if (cardKey === 'Accounts Receivable') {
				navigate('/ar-invoices');
			} else if (cardKey === 'Accounts Payable') {
				navigate('/ap-invoices');
			}
		}

		// Procurement dashboard card
		if (activeRoute === 'Procurement') {
			if (cardKey === 'Procurement Dashboard' || cardKey === 'Procurement') {
				navigate('/procurement');
			} else if (cardKey === 'Catalog Reference') {
				navigate('/procurement/catalog');
			}
		}
	};

	const handleRouteClick = routeKey => {
		// Check if this route has cards data (children)
		const hasChildren = cardsData[routeKey] && cardsData[routeKey].length > 0;

		if (hasChildren) {
			// If it has children, just change the active view (don't navigate)
			if (routeKey !== activeRoute) {
				setIsAnimating(true);
				setActiveRoute(routeKey);
				setTimeout(() => setIsAnimating(false), 300);
			}
		} else {
			// If it doesn't have children, navigate to the route
			const route = routes.find(r => r.key === routeKey);
			if (route && route.path) {
				navigate(route.path);
			}
		}
	};

	const updateScrollButtons = () => {
		if (!scrollContainerRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
		const maxScrollLeft = scrollWidth - clientWidth - 1;
		setCanScrollLeft(scrollLeft > 1);
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
						{t('home.title')}
						<img src={logo} alt="Light ERP Logo" className="w-28 h-auto inline-block ml-2" />
					</h1>
				</div>
				{/* Navigation Bar */}
				<div className="my-7 relative">
					<div className="flex items-center gap-3">
						{/* Left Arrow */}
						<button
							onClick={() => scroll(isRTL ? 'right' : 'left')}
							className="shrink-0 p-2 border border-white/20 bg-white/10 text-white rounded-full transition-all duration-300 transform backdrop-blur-md hover:bg-white/20 hover:border-white/40 hover:scale-110"
							aria-label={t('common.scrollLeft')}
						>
							{isRTL ? (
								<HiChevronRight className="w-5 h-5 text-[#48C1F0]" />
							) : (
								<HiChevronLeft className="w-5 h-5 text-[#48C1F0]" />
							)}
						</button>

						<div
							ref={scrollContainerRef}
							className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth  px-4 py-4"
							style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
						>
							{routes.map((route, index) => (
								<button
									key={index}
									onClick={() => handleRouteClick(route.key)}
									className={`px-6 py-3 rounded-lg whitespace-nowrap border text-sm font-semibold tracking-wide transition-all duration-300 transform backdrop-blur-md shadow-lg ${
										activeRoute === route.key
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
							onClick={() => scroll(isRTL ? 'left' : 'right')}
							className="shrink-0 p-2 border border-white/20 bg-white/10 text-white rounded-full transition-all duration-300 transform backdrop-blur-md hover:bg-white/20 hover:border-white/40 hover:scale-110"
							aria-label={t('common.scrollRight')}
						>
							{isRTL ? (
								<HiChevronLeft className="w-5 h-5 text-[#48C1F0]" />
							) : (
								<HiChevronRight className="w-5 h-5 text-[#48C1F0]" />
							)}
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
							onClick={() => handleCardClick(card.key)}
							className={`rounded-xl border border-white/10 bg-[#28819C]/30 py-6 px-3 shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_10px_30px_rgba(72,193,240,0.3)] animate-fadeInUp ${
								activeRoute === 'Journal' ||
								(activeRoute === 'Dashboard' &&
									(card.key === 'Setup' ||
										card.key === 'Journal Entries' ||
										card.key === 'Journal Lines' ||
										card.key === 'Currencies' ||
										card.key === 'Exchange Rates' ||
										card.key === 'Tax Rates' ||
										card.key === 'Invoice Approvals'))
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
								<div className="shrink-0 w-[1px] h-20 bg-[#7A9098] opacity-50"></div>

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
						title={t('home.quickActions')}
						actions={quickActionItems}
						onActionClick={handleQuickActionClick}
					/>
				</div>
			</div>
		</section>
	);
};

export default Home;
