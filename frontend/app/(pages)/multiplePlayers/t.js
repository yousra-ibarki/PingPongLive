// In ChatApp.js
const ChatApp = () => {
  // ... existing imports and state ...

  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch friends list
        const usersResponse = await Axios.get('/api/friends/');
        
        // Fetch initial unread messages
        const unreadMessagesResponse = await Axios.get('/chat/unread_messages/');
        
        // Ensure we're working with an array and transform the data
        let usersArray = Array.isArray(usersResponse.data) 
          ? usersResponse.data 
          : usersResponse.data.data || [];
        
        // Transform the data and add Tournament System user
        const transformedUsers = [
          // Add Tournament System as the first user
          {
            id: 'system',
            name: 'Tournament System',
            email: '',
            image: '/tournament-system-icon.svg', // You should add this icon to your public folder
            firstName: 'Tournament',
            lastName: 'System',
            is_online: true, // Always online
            isSystemUser: true
          },
          // Add regular users
          ...usersArray.map(user => ({
            id: user.id,
            name: user.username,
            email: user.email,
            image: user.image,
            firstName: user.first_name,
            lastName: user.last_name,
            is_online: user.is_online,
          }))
        ];
        
        setUsers(transformedUsers);

        // Update unread counts in WebSocketContext
        setState(prev => ({
          ...prev,
          unreadCounts: unreadMessagesResponse.data
        }));

        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize chat');
        setLoading(false);
      }
    };

    initialize();
    return () => {
      setActiveChat(null);
    };
  }, []);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setIsUserListVisible(false);
    setActiveChat(user.name);

    try {
      // If it's the system user, handle differently
      if (user.isSystemUser) {
        // Get system messages from the backend
        const response = await Axios.get(`/chat/system_messages/`);
        
        // Transform system messages
        const systemMessages = response.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          timestamp: msg.timestamp,
          isUser: false,
          isRead: true,
          sender: 'Tournament System',
          receiver: currentUser,
          isSystemMessage: true
        }));

        // Update messages state with system messages
        setState(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            ['Tournament System']: systemMessages
          }
        }));
        return;
      }

      // Regular user message handling...
      const response = await Axios.get(`/chat/messages/${user.name}/`);
      // ... rest of existing handleUserSelect code ...
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // ... rest of existing code ...
};