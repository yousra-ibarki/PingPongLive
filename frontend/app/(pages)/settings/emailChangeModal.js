import React, { useState, useEffect } from 'react';

const EmailChangeModal = ({ isOpen, onClose, onSubmit, currentEmail }) => {
  const [emailData, setEmailData] = useState({
    old_email: currentEmail || '', // Initialize with current email
    new_email: '',
    confirm_email: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmailData({
        old_email: currentEmail || '',
        new_email: '',
        confirm_email: ''
      });
    }
  }, [isOpen, currentEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    // Validate emails match
    if (emailData.new_email !== emailData.confirm_email) {
      setError("New emails do not match");
      return;
    }
  
    setLoading(true);
  
    try {
      await onSubmit({
        old_email: emailData.old_email,
        new_email: emailData.new_email,
        confirm_email: emailData.confirm_email
      });
      
      // Clear form
      setEmailData({ old_email: '', new_email: '', confirm_email: '' });
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
        setError('Failed to change email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e) => {
    setEmailData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
          <h2 className="text-xl text-[#FFD369] font-bold">Change Email</h2>
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
            <label className="block text-[#EEEEEE] mb-1">Current Email</label>
            <input
              type="email"
              name="old_email"
              value={emailData.old_email}
              onChange={handleChange}
              className="w-full p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-[#FFD369]"
              required
            />
          </div>

          <div>
            <label className="block text-[#EEEEEE] mb-1">New Email</label>
            <input
              type="email"
              name="new_email"
              value={emailData.new_email}
              onChange={handleChange}
              className="w-full p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-[#FFD369]"
              required
            />
          </div>

          <div>
            <label className="block text-[#EEEEEE] mb-1">Confirm New Email</label>
            <input
              type="email"
              name="confirm_email"
              value={emailData.confirm_email}
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
              {loading ? 'Changing...' : 'Change Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailChangeModal;