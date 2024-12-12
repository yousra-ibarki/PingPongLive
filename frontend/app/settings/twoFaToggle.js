const TwoFaToggle = ({ isTwoFaEnabled, onToggle }) => {
  return (
    <div className=" w-full h-[70%]">
      <p className="text-[#EEEEEE] text-center  h-[17%]">
        Two Factor Authentication *
      </p>
      <label
        className="flex items-center justify-center cursor-pointer w-full space-x-4"
        aria-label={`2FA is currently ${
          isTwoFaEnabled ? "enabled" : "disabled"
        }`}
      >
        <input
          type="checkbox"
          checked={isTwoFaEnabled}
          onChange={onToggle}
          className="sr-only"
          aria-pressed={isTwoFaEnabled}
        />
        <div
          className={`relative h-14 max-w-[250px] min-w-[150px] w-[40%] border rounded-full transition-colors duration-700 
            ${
              isTwoFaEnabled
                ? "border-[#FFD369] bg-[#393E46]"
                : "border-[#C70000] bg-[#393E46]"
            }
          `}
        >
          <span
            className={`absolute w-16 h-16 bg-cover rounded-full transition-transform duration-700 ease-in-out top-1/2 transform -translate-y-1/2
              ${isTwoFaEnabled ? "right-0 bg-[#FFD369]" : "left-0 bg-[#C70000]"}
            `}
            style={{
              backgroundImage: `url('../../../2FAicon.png')`,
            }}
            aria-hidden="true"
          />
          {isTwoFaEnabled ? (
            <span
              className="absolute left-3 top-2.5 text-3xl font-extrabold text-start
                             text-[#FFD369] transform -translate-x-1 transition-transform duration-700 ease-in-out"
            >
              2FA
            </span>
          ) : (
            <span
              className="absolute right-2 top-2.5 text-3xl font-extrabold text-start
                         text-[#C70000] transform -translate-x-1 transition-transform duration-700 ease-in-out"
            >
              2FA
            </span>
          )}
        </div>
      </label>
    </div>
  );
};

export default TwoFaToggle;
