import PropTypes from 'prop-types';

const Toggle = ({ label, checked, onChange, disabled = false }) => {
  return (
    <div className="rounded-2xl  px-6 py-4">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-[#1F2B3B]">{label}</span>
        <button
          type="button"
          onClick={onChange}
          disabled={disabled}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            checked ? 'bg-[#22C55E]' : 'bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
              checked ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

Toggle.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Toggle;
