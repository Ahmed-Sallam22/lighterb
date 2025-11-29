import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PageHeader from '../components/shared/PageHeader';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import Table from '../components/shared/Table';
import SlideUpModal from '../components/shared/SlideUpModal';
import { fetchJournalLines } from '../store/journalLinesSlice';

const StatPattern = () => (
<svg className='absolute top-0 inset-0 bottom-0' width="255" height="110" viewBox="0 0 255 110" fill="none" xmlns="http://www.w3.org/2000/svg">
<g opacity="0.5">
<mask id="mask0_188_15416" maskUnits="userSpaceOnUse" x="0" y="-1" width="255" height="111">
<rect opacity="0.2" y="-0.346924" width="254.875" height="110.172" rx="10" fill="white"/>
</mask>
<g mask="url(#mask0_188_15416)">
<path d="M185.206 64.0737L159.069 77.8952L211.325 108.498L185.206 64.0737Z" stroke="#7A9098" stroke-width="3"/>
<path d="M258.398 91.7837L235.567 84.3174L267.607 136.441L258.398 91.7837Z" stroke="#7A9098" stroke-width="3"/>
<path d="M114.257 92.693L103.282 123.022L144.403 96.1051L114.257 92.693Z" stroke="#7A9098" stroke-width="3"/>
<path d="M8.56127 93.1316L-2.03999 75.0951L-2.14153 120.528L18.3103 109.713L8.56127 93.1316Z" stroke="#7A9098" stroke-width="3"/>
<path d="M196.949 -2.34499L181.268 9.32849L208.636 24.0049L208.656 -11.0629L196.949 -2.34499Z" stroke="#7A9098" stroke-width="3"/>
<path d="M63.541 92.7497L47.8596 104.423L75.2274 119.1L75.2475 84.0319L63.541 92.7497Z" stroke="#7A9098" stroke-width="3"/>
<path d="M246.766 28.9628L260.84 -13.2088L239.212 -15.0905L246.766 28.9628Z" stroke="#7A9098" stroke-width="3"/>
</g>
</g>
</svg>

);

const TotalLinesIcon = () => (
  <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 9.03278C0 6.62404 0 4.27953 0 1.91094C0 0.586131 0.473717 -0.040179 1.85473 0.016025C3.95836 0.0882872 6.16637 0.0160485 8.12548 0.240864C9.28163 0.364627 10.4174 0.634414 11.5058 1.04378C12.6788 0.670614 13.8825 0.40193 15.1028 0.240864C17.2145 0.0401359 19.6393 0.00802914 21.9436 0C22.8188 0 23.2363 0.50582 23.2363 1.38903C23.2363 6.47415 23.2363 11.5593 23.2363 16.6444C23.2363 17.9371 22.4816 18.1539 21.4378 18.1458C19.3984 18.1458 17.351 18.1458 15.3116 18.1458C14.0028 18.1458 12.951 18.5152 12.8145 20.0648C12.7503 20.8115 12.3809 21.3334 11.578 21.3093C11.4286 21.3063 11.2814 21.2733 11.145 21.2123C11.0086 21.1513 10.8859 21.0635 10.784 20.9542C10.6822 20.8449 10.6033 20.7162 10.5522 20.5758C10.501 20.4355 10.4785 20.2863 10.4861 20.137C10.3656 18.459 9.2335 18.1378 7.86052 18.1378C5.87732 18.1378 3.90216 18.1378 1.92699 18.1378C0.61021 18.1378 -0.00803453 17.7123 0.0321112 16.3072C0.104373 13.8984 0.0321112 11.4255 0.0321112 8.98461L0 9.03278ZM21.1407 9.2094V7.23426C21.1407 1.80656 21.1407 1.80653 15.697 2.32842C15.4999 2.32951 15.3035 2.35105 15.1108 2.39267C13.8904 2.77004 12.8868 3.50069 12.8546 4.80141C12.7583 8.29408 12.8145 11.7948 12.8546 15.2955C12.8546 15.7371 12.7904 16.2911 13.5452 16.0984C15.697 15.6006 17.8809 15.9217 20.0488 15.8736C20.8998 15.8736 21.205 15.5765 21.1889 14.7174C21.1086 12.9349 21.1407 11.0641 21.1407 9.2094ZM2.14378 9.05684C2.14378 10.8393 2.22407 12.6218 2.14378 14.3962C2.06349 15.6809 2.57735 15.9298 3.74961 15.9217C5.71675 15.9217 7.70797 15.6488 9.65905 16.1225C10.7028 16.3714 10.5101 15.6247 10.5101 15.0867C10.5101 11.7868 10.5583 8.48677 10.5101 5.18679C10.5253 4.82144 10.4663 4.45679 10.3366 4.11488C10.207 3.77297 10.0094 3.46089 9.75572 3.19749C9.50207 2.93409 9.19767 2.72484 8.86089 2.58237C8.52412 2.4399 8.16195 2.3672 7.79629 2.36861C6.41527 2.23211 5.02624 2.36858 3.64522 2.28828C2.54523 2.21602 2.11969 2.56129 2.17589 3.70946C2.19998 5.49193 2.14378 7.31452 2.14378 9.05684Z"
      fill="#28819C"
    />
  </svg>
);

const TotalDebitsIcon = () => (
  <svg width="23" height="12" viewBox="0 0 23 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.5915 3.66549C17.7024 5.61532 15.798 7.53483 13.9393 9.53019C12.9757 10.5696 12.2094 10.7061 11.1852 9.59085C10.0624 8.35419 8.81811 6.36642 7.57386 6.3209C6.13993 6.26779 5.07777 8.46044 3.78041 9.62882C3.14311 10.213 2.55133 10.8579 1.92921 11.4724C1.43606 11.958 0.904975 12.2311 0.328372 11.6014C0.217368 11.5048 0.130165 11.3839 0.0735573 11.248C0.0169494 11.1122 -0.0075315 10.9651 0.00201342 10.8183C0.0115583 10.6715 0.054866 10.5288 0.128581 10.4014C0.202297 10.274 0.304429 10.1654 0.427005 10.084L6.69377 3.91587C7.37659 3.23305 8.0139 3.40753 8.62843 4.03724C9.67543 5.10699 10.7604 6.13124 11.7694 7.23134C12.3688 7.8914 12.8012 7.90657 13.4233 7.23134C14.6979 5.8657 16.056 4.58351 17.3609 3.24822C17.6037 2.99785 18.0134 2.77023 17.8541 2.33019C17.6948 1.89015 17.2396 1.99639 16.8906 1.98122C16.3367 1.98122 15.7753 1.98122 15.2139 1.98122C14.6524 1.98122 14.0986 1.746 14.1213 1.01008C14.1168 0.868042 14.1432 0.726741 14.1988 0.595954C14.2544 0.465167 14.3378 0.348032 14.4432 0.252729C14.5486 0.157425 14.6735 0.0862284 14.8092 0.0440706C14.9449 0.00191275 15.0882 -0.0102005 15.229 0.00859965C17.1561 0.00859965 19.0832 0.00859965 21.0102 0.00859965C21.8979 0.00859965 22.171 0.615557 22.171 1.38942C22.171 3.12429 22.1508 4.86676 22.1103 6.6168C22.1103 7.37549 21.9965 8.02794 21.0102 7.97484C20.1605 7.92173 20.0619 7.32995 20.0771 6.64713C20.0771 5.77464 20.0771 4.90973 20.0771 4.03724L19.5915 3.66549Z"
      fill="#28819C"
    />
  </svg>
);

const TotalCreditsIcon = () => (
  <svg width="23" height="12" viewBox="0 0 23 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.5922 8.30278C17.703 6.35294 15.7987 4.43343 13.9398 2.43808C12.9762 1.39867 12.2099 1.26214 11.1856 2.37741C10.0627 3.61408 8.81844 5.60184 7.57415 5.64736C6.14017 5.70047 5.07796 3.50782 3.78055 2.33944C3.14323 1.75525 2.55143 1.11037 1.92928 0.495833C1.43611 0.0102712 0.905011 -0.262844 0.328385 0.366868C0.217377 0.463474 0.130171 0.584403 0.0735611 0.720235C0.0169511 0.856066 -0.00753083 1.00312 0.00201445 1.14996C0.0115597 1.29681 0.054869 1.4395 0.128587 1.56686C0.202305 1.69422 0.304442 1.80282 0.427022 1.88425L6.69403 8.05239C7.37688 8.73521 8.0142 8.56074 8.62876 7.93102C9.6758 6.86127 10.7608 5.83703 11.7699 4.73693C12.3692 4.07687 12.8017 4.06169 13.4239 4.73693C14.6985 6.10257 16.0566 7.38475 17.3616 8.72005C17.6044 8.97041 18.0141 9.19804 17.8548 9.63808C17.6954 10.0781 17.2402 9.97187 16.8912 9.98704C16.3373 9.98704 15.7759 9.98704 15.2144 9.98704C14.653 9.98704 14.0991 10.2223 14.1219 10.9582C14.1173 11.1002 14.1438 11.2415 14.1993 11.3723C14.2549 11.5031 14.3383 11.6202 14.4437 11.7155C14.5491 11.8108 14.6741 11.882 14.8098 11.9242C14.9455 11.9664 15.0887 11.9785 15.2296 11.9597C17.1568 11.9597 19.0839 11.9597 21.011 11.9597C21.8987 11.9597 22.1719 11.3527 22.1719 10.5788C22.1719 8.84397 22.1517 7.10151 22.1112 5.35146C22.1112 4.59277 21.9974 3.94032 21.011 3.99343C20.1613 4.04653 20.0626 4.63831 20.0778 5.32113C20.0778 6.19363 20.0778 7.05853 20.0778 7.93103L19.5922 8.30278Z"
      fill="#28819C"
    />
  </svg>
);

const PostedIcon = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_188_15472)">
      <path
        d="M10.9633 21C8.83042 21.1403 6.70692 20.6114 4.88853 19.4871C3.07013 18.3629 1.64737 16.6991 0.818378 14.7275C0.013799 12.849 -0.226208 10.7765 0.127707 8.76356C0.481623 6.75064 1.41412 4.88457 2.81113 3.39362C5.91258 0.261026 9.64446 -0.790427 13.9343 0.580084C14.2758 0.68459 14.6059 0.823063 14.9198 0.993418C15.5575 1.36324 16.5793 1.58078 16.101 2.62498C15.6227 3.66918 14.8256 3.16883 14.1227 2.80626C11.5213 1.45025 8.96331 1.68956 6.44157 3.04557C4.62316 4.00659 3.21176 5.59121 2.46606 7.50899C1.72035 9.42678 1.69029 11.5492 2.38138 13.4874C3.07247 15.4256 4.43843 17.0496 6.22888 18.0618C8.01934 19.074 10.1144 19.4066 12.13 18.9986C14.1277 18.5963 15.9207 17.5046 17.1961 15.9142C18.4715 14.3238 19.1483 12.3357 19.1082 10.297C19.1082 9.43404 18.2097 7.91125 19.8329 7.85324C21.3329 7.80973 20.9633 9.47028 21.0068 10.413C21.0522 13.1424 20.0254 15.7807 18.1472 17.7605C16.2691 19.7403 13.6895 20.9035 10.9633 21Z"
        fill="#28819C"
      />
      <path
        d="M21.0003 2.95869C20.9424 3.5243 20.5293 3.79985 20.196 4.13341C17.3916 6.96145 14.5511 9.76045 11.783 12.6247C10.8916 13.5384 10.1815 13.7197 9.29019 12.6828C8.63077 11.9141 7.84092 11.2325 7.16701 10.5074C6.71773 10.0505 6.39164 9.55743 6.96411 8.97007C7.53657 8.38271 7.99309 8.66549 8.50758 9.08607C9.23222 9.67343 9.70324 10.9642 10.6163 10.7611C11.4134 10.5871 12.0221 9.56469 12.696 8.89031C14.8409 6.7439 16.981 4.59507 19.1163 2.44382C19.4569 2.10301 19.8409 1.71869 20.3627 1.99424C20.5538 2.0718 20.717 2.20543 20.8308 2.37757C20.9447 2.54971 21.0037 2.75231 21.0003 2.95869Z"
        fill="#28819C"
      />
    </g>
    <defs>
      <clipPath id="clip0_188_15472">
        <rect width="21" height="21" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const DraftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.5669 12.0581L16.6919 10.1831C16.5747 10.066 16.4157 10.0001 16.25 10.0001C16.0843 10.0001 15.9253 10.066 15.8081 10.1831L10 15.9913V18.75H12.7587L18.5669 12.9419C18.684 12.8247 18.7499 12.6657 18.7499 12.5C18.7499 12.3343 18.684 12.1753 18.5669 12.0581ZM12.2413 17.5H11.25V16.5087L14.375 13.3837L15.3663 14.375L12.2413 17.5ZM16.25 13.4913L15.2587 12.5L16.25 11.5087L17.2413 12.5L16.25 13.4913ZM5 10H11.25V11.25H5V10ZM5 6.25H12.5V7.5H5V6.25Z"
      fill="#28819C"
    />
    <path
      d="M16.25 2.5C16.25 2.16848 16.1183 1.85054 15.8839 1.61612C15.6495 1.3817 15.3315 1.25 15 1.25H2.5C2.16848 1.25 1.85054 1.3817 1.61612 1.61612C1.3817 1.85054 1.25 2.16848 1.25 2.5V10.625C1.24854 11.8715 1.58661 13.0948 2.2279 14.1637C2.86919 15.2325 3.7895 16.1066 4.89 16.6919L8.125 18.4169V17L5.47875 15.5887C4.57853 15.1096 3.82568 14.3945 3.30093 13.52C2.77618 12.6456 2.49931 11.6448 2.5 10.625V2.5H15V8.125H16.25V2.5Z"
      fill="#28819C"
    />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.5 12.5L7.5 7.5L11.25 11.25L17.5 5"
      stroke="#1A8CB3"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12.5 5H17.5V10" stroke="#1A8CB3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.5 7.5L7.5 12.5L11.25 8.75L17.5 15"
      stroke="#1A8CB3"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12.5 15H17.5V10" stroke="#1A8CB3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const JournalLinesPage = () => {
  const dispatch = useDispatch();
  const { lines, loading, error, statistics } = useSelector((state) => state.journalLines);

  const [filters, setFilters] = useState({
    code: '',
    name: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });

  const [selectedLine, setSelectedLine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch journal lines on mount
  useEffect(() => {
    dispatch(fetchJournalLines());
  }, [dispatch]);

  // Display error toast
  useEffect(() => {
    if (error) {
      toast.error(error, { autoClose: 5000 });
    }
  }, [error]);

  // Transform API data for table display
  const journalLines = lines.map((line) => ({
    id: line.id,
    account: line.account?.name || '-',
    code: line.account?.code || '-',
    memo: line.entry?.memo || '-',
    date: line.entry?.date || '-',
    entry: line.entry?.id || '-',
    type: Number(line.debit) > 0 ? 'Debit' : 'Credit',
    debit: Number(line.debit) > 0 ? `$${Number(line.debit).toFixed(2)}` : '-',
    credit: Number(line.credit) > 0 ? `$${Number(line.credit).toFixed(2)}` : '-',
    status: line.entry?.posted ? 'Posted' : 'Draft',
    rawData: line, // Keep original data for modal
  }));

  const columns = [
    {
      header: 'Account',
      accessor: 'account',
    },
    {
      header: 'ID',
      accessor: 'id',
      width: '120px',
    },
    {
      header: 'Date',
      accessor: 'date',
      width: '130px',
    },
    {
      header: 'Entry',
      accessor: 'entry',
      width: '130px',
    },
    {
      header: 'Type',
      accessor: 'type',
      width: '100px',
      render: (value) => {
        const typeColors = {
          Debit: 'text-red-600 font-semibold',
          Credit: 'text-green-600 font-semibold',
        };
        return <span className={typeColors[value] || ''}>{value}</span>;
      },
    },
    {
      header: 'Debit',
      accessor: 'debit',
      width: '130px',
      render: (value) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      header: 'Credit',
      accessor: 'credit',
      width: '130px',
      render: (value) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '120px',
      render: (value) => {
        const statusColors = {
          Posted: 'bg-green-100 text-green-800',
          Draft: 'bg-gray-100 text-gray-800',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColors[value] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {value}
          </span>
        );
      },
    },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'posted', label: 'Posted' },
    { value: 'draft', label: 'Draft' },
  ];

  const formatDisplayDate = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const normalizedAmount = (amount) => (amount && amount !== '-' ? amount : '$0.00');

  const statCards = [
    {
      title: 'Total Lines',
      value: statistics?.totalLines || 0,
      icon: <TotalLinesIcon />,
      iconBg: 'bg-[#E1F5FE]',
      valueColor: 'text-gray-900',
    },
    {
      title: 'Total Debits',
      value: `$${(statistics?.totalDebits || 0).toFixed(2)}`,
      icon: <TotalDebitsIcon />,
      iconBg: 'bg-red-50',
      valueColor: 'text-red-600',
    },
    {
      title: 'Total Credits',
      value: `$${(statistics?.totalCredits || 0).toFixed(2)}`,
      icon: <TotalCreditsIcon />,
      iconBg: 'bg-green-50',
      valueColor: 'text-green-600',
    },
    {
      title: 'Posted',
      value: statistics?.postedLines || 0,
      icon: <PostedIcon />,
      iconBg: 'bg-green-50',
      valueColor: 'text-gray-900',
    },
    {
      title: 'Draft',
      value: statistics?.draftLines || 0,
      icon: <DraftIcon />,
      iconBg: 'bg-gray-50',
      valueColor: 'text-gray-900',
    },
  ];

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const filterParams = {
      account_code: filters.code,
      account_name: filters.name,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      posted: filters.status === 'posted' ? 'true' : filters.status === 'draft' ? 'false' : '',
    };
    dispatch(fetchJournalLines(filterParams));
  };

  const handleClearFilters = () => {
    setFilters({
      code: '',
      name: '',
      dateFrom: '',
      dateTo: '',
      status: '',
    });
    // Fetch all lines without filters
    dispatch(fetchJournalLines());
  };

  const handleView = (row) => {
    setSelectedLine(row);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title="Journal Lines"
        subtitle="Detailed view of old journal entry line items with filtering and analysis"
        icon={
          <svg width="29" height="27" viewBox="0 0 29 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.5" clipPath="url(#clip0_188_15408)">
              <path d="M0.0214844 11.24C0.0214844 8.23999 0.0214844 5.31999 0.0214844 2.37C0.0214844 0.719995 0.611482 -0.0600513 2.33148 0.00994873C4.95148 0.0999487 7.70148 0.00997803 10.1415 0.289978C11.5814 0.44412 12.996 0.78013 14.3515 1.28998C15.8124 0.825216 17.3116 0.490579 18.8315 0.289978C21.4615 0.039978 24.4815 -9.76585e-06 27.3515 -0.0100098C28.4415 -0.0100098 28.9615 0.619971 28.9615 1.71997C28.9615 8.0533 28.9615 14.3866 28.9615 20.72C28.9615 22.33 28.0215 22.6 26.7215 22.59C24.1815 22.59 21.6315 22.59 19.0915 22.59C17.4615 22.59 16.1515 23.05 15.9815 24.98C15.9015 25.91 15.4415 26.56 14.4415 26.53C14.2554 26.5262 14.0721 26.4851 13.9022 26.4091C13.7323 26.3331 13.5794 26.2239 13.4526 26.0877C13.3258 25.9515 13.2276 25.7913 13.1638 25.6165C13.1001 25.4416 13.0721 25.2558 13.0815 25.0699C12.9315 22.9799 11.5215 22.58 9.81148 22.58C7.34148 22.58 4.88148 22.58 2.42148 22.58C0.781478 22.58 0.0114777 22.05 0.0614777 20.3C0.151478 17.3 0.0614777 14.22 0.0614777 11.18L0.0214844 11.24ZM26.3515 11.46V9C26.3515 2.24 26.3515 2.23995 19.5715 2.88995C19.326 2.89131 19.0814 2.91814 18.8415 2.96997C17.3215 3.43997 16.0715 4.34997 16.0315 5.96997C15.9115 10.32 15.9815 14.68 16.0315 19.04C16.0315 19.59 15.9515 20.28 16.8915 20.04C19.5715 19.42 22.2915 19.8199 24.9915 19.7599C26.0515 19.7599 26.4315 19.3899 26.4115 18.3199C26.3115 16.0999 26.3515 13.77 26.3515 11.46ZM2.69148 11.27C2.69148 13.49 2.79148 15.71 2.69148 17.92C2.59148 19.52 3.23148 19.8299 4.69148 19.8199C7.14148 19.8199 9.62148 19.4799 12.0515 20.0699C13.3515 20.3799 13.1115 19.45 13.1115 18.78C13.1115 14.67 13.1715 10.56 13.1115 6.44995C13.1304 5.99491 13.0569 5.54076 12.8954 5.11493C12.7339 4.68909 12.4878 4.30041 12.1719 3.97235C11.856 3.6443 11.4768 3.38368 11.0574 3.20624C10.638 3.02879 10.1869 2.93826 9.73148 2.94C8.01148 2.77 6.28148 2.93997 4.56148 2.83997C3.19148 2.74997 2.66148 3.17999 2.73148 4.60999C2.76148 6.82999 2.69148 9.09996 2.69148 11.27Z" fill="#D3D3D3"/>
            </g>
            <defs>
              <clipPath id="clip0_188_15408">
                <rect width="28.95" height="26.57" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        }
      />

      <div className="w-[95%] mx-auto py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md px-5 py-4 hover:shadow-lg transition-shadow relative overflow-hidden"
            >
              <StatPattern  />
              <div className="relative flex flex-col">
                <div className="flex items-center gap-x-3">
                  <div >
                    {card.icon}
                  </div>
                  <p className="text-[#28819C] text-lg font-medium">{card.title}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-semibold ${card.valueColor || 'text-gray-900'}`}>
                    {card.value}
                  </p>
                  {card.subLabel && (
                    <p className="text-xs text-gray-500 mt-1">{card.subLabel}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className=" rounded-xl  p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
            {/* Code Filter */}
            <FloatingLabelInput
              id="code"
              label="Code"
              value={filters.code}
              onChange={(e) => handleFilterChange('code', e.target.value)}
              placeholder="Enter code"
            />

            {/* Name Filter */}
            <FloatingLabelInput
              id="name"
              label="Name"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Enter name"
            />

            {/* Date From */}
            <FloatingLabelInput
              id="dateFrom"
              label="Date From"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            {/* Date To */}
            <FloatingLabelInput
              id="dateTo"
              label="Date To"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />

            {/* Status Filter */}
            <FloatingLabelSelect
              id="status"
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Clear all
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2.5 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] font-medium transition-colors"
            >
              Apply filters
            </button>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28819C]"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={journalLines}
            onEdit={handleView}
            editIcon="view"
            className="mb-8"
            emptyMessage="No journal lines found"
          />
        )}
      </div>

      {/* View Modal */}
      <SlideUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Journal Line Details"
      >
        {selectedLine && (
          <div className="space-y-2 text-gray-900">
            <div className="relative overflow-hidden rounded-3xl border border-[#D7EEF6] bg-linear-to-br from-white via-white to-[#F3FBFE] p-4">
              <p className="text-2xl font-bold text-[#147A9C]">
                Journal Line {selectedLine?.id}
              </p>
              <p className="mt-1 text-sm text-[#5E7F8C]">
                Part of Journal Entry {selectedLine.entry}
              </p>
            </div>

            <div className="space-y-2">
              <section className="rounded-2xl border border-[#DCE8EE] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Journal Entry Details</p>
                    <p className="text-sm text-gray-500">Entry ID : {selectedLine.entry}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    Date : {formatDisplayDate(selectedLine.date)}
                  </p>
                </div>
                <div className="mt-5 space-y-3 text-sm text-[#526875]">
                  <div>
                    <p className="font-semibold text-gray-600">Memo</p>
                    <p>{selectedLine.memo || '—'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-600">Status :</span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedLine.status === 'Posted'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {selectedLine.status}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#DCE8EE] bg-white p-5 shadow-sm">
                <p className="text-lg font-semibold text-gray-900 mb-4">Account details</p>
                <div className="grid gap-3 text-sm text-[#526875] sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-gray-600">Code</p>
                    <p>{selectedLine.code || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Name</p>
                    <p>{selectedLine.account}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Type</p>
                    <p className="capitalize">{selectedLine.type?.toLowerCase()}</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#CDE5EE] bg-white p-5 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 text-[#1A8CB3] text-lg font-semibold">
                  <TrendUpIcon />
                  Total Debits
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900">{normalizedAmount(selectedLine.debit)}</p>
              </div>
              <div className="rounded-2xl border border-[#CDE5EE] bg-white p-5 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 text-[#1A8CB3] text-lg font-semibold">
                  <TrendDownIcon />
                  Total Credits
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900">{normalizedAmount(selectedLine.credit)}</p>
              </div>
            </div>
          </div>
        )}
      </SlideUpModal>
    </div>
  );
};

export default JournalLinesPage;
