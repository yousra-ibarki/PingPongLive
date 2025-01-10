import React, { useState } from 'react';
import Axios from '../Components/axios';
import Modal from './Modal'; // Adjust the path as necessary

const DeleteAccount = async () => {
  try {
    const response = await Axios.delete('/api/delete-account/');
    if (response.status === 200) {
      alert('Account successfully deleted');
      window.location.href = '/login';
    }
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to delete account');
    console.error('Delete account error:', error);
  }
};

const DeleteConfirmationModal = ({ isModalOpen, setIsModalOpen, onDelete }) => {
  return (
    isModalOpen && (
      <Modal onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold text-center">Delete Account</h2>
        <p className="text-center mt-4">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div className="flex justify-center mt-8">
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            Delete
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </Modal>
    )
  );
};

const SaveDeleteButtons = ({ onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex lg:h-44 h-32 items-center justify-evenly">
      <button
        onClick={onSave} // Trigger save action from parent
        className={`lg:w-[25%] lg:h-[40%] w-[30%] h-[50%] bg-[#FFD369] lg:text-2xl text-lg font-bold text-[#222831] rounded-full
                      border-[0.5px] border-[#222831] transition duration-700 ease-in-out transform
                      hover:-translate-y-1 hover:scale-102`}
      >
        Save
      </button>
      <button
        className={`lg:w-[25%] lg:h-[40%] w-[30%] h-[50%] bg-[#C70000] lg:text-2xl text-lg font-bold text-[#222831] rounded-full 
                  border-[0.5px] border-[#FFD369] transition duration-700 ease-in-out transform 
                  hover:-translate-y-1 hover:scale-102`}
        onClick={() => setIsModalOpen(true)}
      >
        Delete Account
      </button>
      <DeleteConfirmationModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onDelete={DeleteAccount}
      />
    </div>
  );
};

export default SaveDeleteButtons;