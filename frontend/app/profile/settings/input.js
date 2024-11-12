

const InputField = ({ label, placeholder, type, value, onChange, error }) => {
  return (
    <div className="lg:h-[220px] flex flex-col items-center justify-center w-full p-2 ease-in-out duration-500 transform hover:-translate-y-1 hover:scale-102">
      <label className="text-[#EEEEEE] ">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-[80%] p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border ${
          error ? "border-red-500" : "border-[#FFD369]"
        }`}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default InputField;