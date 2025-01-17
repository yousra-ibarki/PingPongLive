import Link from "next/link";
import HorizontalCardScroll from '../Components/HorizontalCardScroll';

export default function CardGrid() {

  return (
    <div className="flex justify-center items-center min-h-screen min-w-screen bg-[#222831]">

      <div className="flex tablet:flex-row z-10 justify-center items-center h-screen w-screen overflow-hidden">
        <HorizontalCardScroll />
      </div>
    </div>
  );
}
