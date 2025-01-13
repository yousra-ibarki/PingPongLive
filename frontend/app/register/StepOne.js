import React from "react";

const StepOne = ({ userData, setUserData, errors, loading, onNext, onClose }) => {
  const handleChange = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const formFields = [
    { id: "first_name", label: "Name", type: "text" },
    { id: "username", label: "Username", type: "text" },
    { id: "email", label: "Email", type: "email" },
    { id: "password", label: "Password", type: "password" },
    { id: "password2", label: "Confirm Password", type: "password" },
  ];

  return (
    <div className="w-full max-w-lg bg-[#393E46] p-2 rounded-lg shadow-lg flex flex-col justify-center items-center border border-[#FFD369]">
      <div className="w-full h-8 flex justify-end items-center">
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 text-4xl"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <h1 className="text-[#FFD369] h-10 w-full font-kreon text-3xl text-center mb-6">
        Register
      </h1>
      {errors.general && (
        <p className="text-red-500 text-center mb-4">{errors.general}</p>
      )}
      <form
        className="w-full h-[550px] flex flex-col gap-4 items-center justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {formFields.map(({ id, label, type }) => (
          <div key={id} className="flex flex-col items-center justify-center w-full gap-2">
            <label htmlFor={id} className="text-[#FFD369] font-kreon text-sm">
              {label}
            </label>
            <input
              type={type}
              id={id}
              value={userData[id]}
              placeholder={`Enter ${label.toLowerCase()}`}
              onChange={handleChange}
              className="w-[80%] p-2 rounded-lg bg-[#222831] text-white border border-[#FFD369] focus:outline-none focus:ring-2 focus:ring-[#FFD369]"
              required
            />
            {errors[id] && (
              <p className="text-red-500 text-sm text-center">{errors[id]}</p>
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-[40%] py-2 mt-4 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg hover:bg-[#e6bf56] transition duration-300"
        >
          {loading ? (
            <div className="loader w-6 h-6 border-2 border-t-[#222831] rounded-full animate-spin mx-auto"></div>
          ) : (
            "Next ->"
          )}
        </button>
      </form>
    </div>
  );
};

export default StepOne;