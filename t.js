function MatchHistoryCard({ match, playerName, userData, openModal }) {
    const [opponentImage, setOpponentImage] = useState(null);
    let custMatch = formatGameData(match, playerName);
    const { result, opponent } = custMatch;
    const playerResult = result.toUpperCase();
    const opponentResult = playerResult === "WIN" ? "LOSE" : "WIN";
  
    // Use useEffect to fetch the opponent's image when the component mounts
    useEffect(() => {
      const loadOpponentImage = async () => {
        try {
          const image = await getUserImage(custMatch.opponent);
          setOpponentImage(image);
          custMatch.opponentImage = image; // Update the custMatch object with the new image
        } catch (error) {
          console.error("Error loading opponent image:", error);
        }
      };
  
      loadOpponentImage();
    }, [custMatch.opponent]); // Add dependency on opponent
  
    return (
      <div
        className="text-[#FFD369] my-2 py-2 w-full h-auto text-center font-kreon text-lg
                   rounded-lg cursor-pointer hover:bg-[#393E46]"
        onClick={() => openModal(custMatch)}
      >
        {/* ... rest of your JSX ... */}
        <img
          src={opponentImage || "./user_img.svg"}
          alt="user_img"
          className="w-8 h-8 rounded-full ml-4"
        />
        {/* ... rest of your JSX ... */}
      </div>
    );
  }