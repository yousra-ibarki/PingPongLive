import Axios from '../Components/axios';


const DeleteAccount = async () => {
  // Show a confirmation dialog
  const isConfirmed = window.confirm(
    "Are you sure you want to delete your account? This action cannot be undone."
  );

  if (!isConfirmed) {
    return;
  }

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
}

const SaveDeleteButtons = ({ onSave }) => {
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
        onClick={DeleteAccount}
      >
        Delete Account
      </button>
    </div>
  );
};

export default SaveDeleteButtons;