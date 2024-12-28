export const WebSocketProviderForChat = ({ children }) => {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;
  
    // Main state object containing all WebSocket-related data
    const [state, setState] = useState({
      notifications: [],
      messages: {},
      currentUser: null,
      connectionStatus: "Disconnected",
      unreadCounts: {},
      activeChat: null,
      isLoading: true,
    });
    const [loggedInUser, setLoggedInUser] = useState({});
  
    // Fetch user on mount
    useEffect(() => {
      const fetchUser = async () => {
        const is42Login = localStorage.getItem('is42Login');
        
        try {
          if (is42Login) {
            // For 42 login, implement exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          }
  
          const userResponse = await Axios.get("/api/user_profile/");
          setState(prev => ({
            ...prev,
            currentUser: userResponse.data.username,
            isLoading: false,
          }));
          setLoggedInUser(userResponse.data);
          setAuthChecked(true);
          
          if (is42Login) {
            localStorage.removeItem('is42Login');
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          
          if (is42Login && retryCount < MAX_RETRIES) {
            // If we're in 42 login flow and haven't exceeded max retries, 
            // increment retry count and try again
            setRetryCount(prev => prev + 1);
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
            setAuthChecked(true);
            localStorage.removeItem('is42Login');
          }
        }
      };
  
      if (!authChecked) {
        fetchUser();
      }
    }, [authChecked, retryCount]);
  
    // Update user effect
    useEffect(() => {
      if (state.currentUser) {
        const fetchNotifications = async () => {
          try {
            const response = await Axios.get("/api/notifications/unread/");
            setState(prev => ({
              ...prev,
              notifications: response.data,
            }));
          } catch (error) {
            console.error("Failed to fetch notifications:", error);
          }
        };
  
        fetchNotifications();
      }
    }, [state.currentUser]);
  
    // Rest of your existing code...
  
    // Don't render children until we've checked auth status
    if (!authChecked) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD369]"></div>
        </div>
      );
    }
  
    return (
      <WebSocketContext.Provider value={contextValue}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#333333",
            },
          }}
        />
      </WebSocketContext.Provider>
    );
  };