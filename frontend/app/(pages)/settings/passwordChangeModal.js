import React, { useState } from 'react';

const PasswordChangeModal = ({ isOpen, onClose, onSubmit }) => {
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(passwordData);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      onClose();
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          setError(String(errorData));
        }
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Close modal when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-[#131313] p-6 rounded-lg w-full max-w-md border border-[#FFD369]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-[#FFD369] font-bold">Change Password</h2>
          <button
            onClick={onClose}
            className="text-[#FFD369] hover:text-[#e6be5f]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
          
        {error && (
          <div className="mb-4 p-2 bg-red-500/10 border border-red-500 rounded text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#EEEEEE] mb-1">Current Password</label>
            <input
              type="password"
              name="old_password"
              value={passwordData.old_password}
              onChange={handleChange}
              className="w-full p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-[#FFD369]"
              required
            />
          </div>

          <div>
            <label className="block text-[#EEEEEE] mb-1">New Password</label>
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handleChange}
              className="w-full p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-[#FFD369]"
              required
            />
          </div>

          <div>
            <label className="block text-[#EEEEEE] mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handleChange}
              className="w-full p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-[#FFD369]"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#EEEEEE] hover:bg-[#393E46] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#FFD369] text-black rounded hover:bg-[#e6be5f] disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;