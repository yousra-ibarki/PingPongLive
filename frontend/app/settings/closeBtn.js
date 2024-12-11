import { useRouter } from "next/navigation";

const CloseButton = ({ size = 24, color = "#000" }) => {
  const profileRouter = useRouter();
  const onClose = () => {
    profileRouter.push("/home");
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="bg-[#393E46] rounded-full p-1 ease-in-out duration-500 transform hover:bg-[#C70000] hover:text-[#EEEEEE]"
      onClick={onClose}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
};

export default CloseButton;