import Profile from "./profile";
import "../globals.css";
function App() {
  return (
    <div className="m-4 lg:m-10 bg-[#131313] border border-[#FFD369] rounded-2xl min-w-[300px]">
      <Profile wichPage="profile" />
    </div>
  );
}

export default App;
