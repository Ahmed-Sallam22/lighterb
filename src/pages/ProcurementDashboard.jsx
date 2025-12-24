import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/shared/PageHeader';
import { TbRulerMeasure } from "react-icons/tb";

const HeaderIcon = () => (
	<div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center shadow-lg">
		<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M22 10.5L14 4L6 10.5V22H22V10.5Z" stroke="#D3D3D3" strokeWidth="1.5" strokeLinejoin="round" />
			<path d="M11 22V16H17V22" stroke="#48C1F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M9 12H19" stroke="#48C1F0" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	</div>
);

const IconBubble = ({ colors, children }) => (
	<div
		className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
		style={{
			background: colors ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` : undefined,
			boxShadow: colors ? `0 12px 32px -12px ${colors[0]}` : undefined,
		}}
	>
		{children}
	</div>
);

// Define keys and static assets here, text is removed
const cardConfigs = [
	{
		key: 'requisitions',
		icon: (
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M25.0013 3.33203H10.0013C9.11725 3.33203 8.2694 3.68322 7.64428 4.30834C7.01916 4.93346 6.66797 5.78131 6.66797 6.66536V33.332C6.66797 34.2161 7.01916 35.0639 7.64428 35.6891C8.2694 36.3142 9.11725 36.6654 10.0013 36.6654H30.0013C30.8854 36.6654 31.7332 36.3142 32.3583 35.6891C32.9834 35.0639 33.3346 34.2161 33.3346 33.332V11.6654L25.0013 3.33203Z"
					stroke="#155DFC"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M23.332 3.33203V9.9987C23.332 10.8828 23.6832 11.7306 24.3083 12.3557C24.9335 12.9808 25.7813 13.332 26.6654 13.332H33.332"
					stroke="#155DFC"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M16.6654 15H13.332"
					stroke="#155DFC"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M26.6654 21.668H13.332"
					stroke="#155DFC"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M26.6654 28.332H13.332"
					stroke="#155DFC"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		path: '/requisitions',
	},
	
	{
		key: 'purchaseOrders',
		icon: (
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M13.3346 36.6663C14.2551 36.6663 15.0013 35.9201 15.0013 34.9997C15.0013 34.0792 14.2551 33.333 13.3346 33.333C12.4142 33.333 11.668 34.0792 11.668 34.9997C11.668 35.9201 12.4142 36.6663 13.3346 36.6663Z"
					stroke="#00A63E"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M31.6667 36.6663C32.5871 36.6663 33.3333 35.9201 33.3333 34.9997C33.3333 34.0792 32.5871 33.333 31.6667 33.333C30.7462 33.333 30 34.0792 30 34.9997C30 35.9201 30.7462 36.6663 31.6667 36.6663Z"
					stroke="#00A63E"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M3.41797 3.41504H6.7513L11.1846 24.115C11.3473 24.8731 11.7691 25.5508 12.3775 26.0315C12.9859 26.5121 13.7428 26.7656 14.518 26.7484H30.818C31.5766 26.7471 32.3121 26.4872 32.903 26.0114C33.4939 25.5357 33.9049 24.8726 34.068 24.1317L36.818 11.7484H8.53464"
					stroke="#00A63E"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
	{
		key: 'receiving',
		icon: (
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M18.3333 36.2168C18.8401 36.5094 19.4149 36.6634 20 36.6634C20.5851 36.6634 21.1599 36.5094 21.6667 36.2168L33.3333 29.5502C33.8396 29.2579 34.26 28.8376 34.5526 28.3316C34.8451 27.8255 34.9994 27.2514 35 26.6668V13.3335C34.9994 12.749 34.8451 12.1748 34.5526 11.6688C34.26 11.1627 33.8396 10.7424 33.3333 10.4502L21.6667 3.7835C21.1599 3.49093 20.5851 3.33691 20 3.33691C19.4149 3.33691 18.8401 3.49093 18.3333 3.7835L6.66667 10.4502C6.16044 10.7424 5.73997 11.1627 5.44744 11.6688C5.1549 12.1748 5.0006 12.749 5 13.3335V26.6668C5.0006 27.2514 5.1549 27.8255 5.44744 28.3316C5.73997 28.8376 6.16044 29.2579 6.66667 29.5502L18.3333 36.2168Z"
					stroke="#F54900"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M20 36.6667V20"
					stroke="#F54900"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M5.48438 11.667L20.001 20.0003L34.5177 11.667"
					stroke="#F54900"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12.5 7.11621L27.5 15.6995"
					stroke="#F54900"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
	{
		key: 'UOM',
		path: '/uom',
		icon: (
			<TbRulerMeasure size={26}/>

		),
	},
	{
		key: 'catalog',
		colors: ['#06b6d4', '#22d3ee'],
		path: '/procurement/catalog',
		icon: (
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M36.6673 11.6654L20.0007 3.33203L3.33398 11.6654V28.332L20.0007 36.6654L36.6673 28.332V11.6654Z"
					stroke="#05B8BE"
					strokeWidth="3.33333"
					strokeLinejoin="round"
				/>
				<path
					d="M3.33398 11.666L20.0007 19.9993"
					stroke="#05B8BE"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M20 36.6657V19.999"
					stroke="#05B8BE"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M36.6667 11.666L20 19.9993"
					stroke="#05B8BE"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M28.3327 7.49902L11.666 15.8324"
					stroke="#05B8BE"
					strokeWidth="3.33333"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
];

const ProcurementDashboard = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === 'rtl';
	const navigate = useNavigate();

	useEffect(() => {
		document.title = t('procurementDashboard.metaTitle');
		return () => {
			document.title = 'LightERP';
		};
	}, [t]);

	const handleCardClick = path => {
		if (path) {
			navigate(path);
		}
	};

	return (
		<div className="min-h-screen bg-[#f3f4f6]">
			<PageHeader
				icon={<HeaderIcon />}
				title={t('procurementDashboard.title')}
				subtitle={t('procurementDashboard.subtitle')}
			/>

			<div className="max-w-6xl mx-auto  mt-6">
				<div className="bg-white/80 backdrop-blur-sm border border-white/70 rounded-3xl shadow-[0_18px_50px_rgba(3,27,40,0.12)]">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 md:p-10">
						{cardConfigs.map(card => (
							<div
								key={card.key}
								role="button"
								tabIndex={0}
								onClick={() => handleCardClick(card.path)}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleCardClick(card.path);
									}
								}}
								className="group bg-white rounded-3xl border border-gray-100 shadow-[0_12px_30px_rgba(3,27,40,0.08)] p-7 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(3,27,40,0.12)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/60"
							>
								<IconBubble colors={card.colors}>{card.icon}</IconBubble>
								<h3 className="mt-5 text-xl font-semibold text-[#0d2438]">
									{t(`procurementDashboard.cards.${card.key}.title`)}
								</h3>
								<p className="mt-2 text-sm text-[#4b6374]">
									{t(`procurementDashboard.cards.${card.key}.description`)}
								</p>
								<div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#28819C] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
									<span>{t('procurementDashboard.open')}</span>
									<svg
										width="14"
										height="14"
										viewBox="0 0 14 14"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className={isRtl ? 'rotate-180' : ''}
									>
										<path
											d="M3 7H11"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M7 3L11 7L7 11"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProcurementDashboard;
