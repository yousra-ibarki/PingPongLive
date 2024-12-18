# Chat System Sequence Diagrams

## System Components Flow
```mermaid
sequenceDiagram
    participant User1
    participant User2
    participant WebSocket
    participant ChatConsumer
    participant ChannelLayer
    participant Database

    Note over User1,Database: 1. Connection Setup
    User1->>WebSocket: Connect to websocket
    WebSocket->>ChatConsumer: connect()
    ChatConsumer->>Database: Verify user authentication
    alt Authentication Success
        ChatConsumer->>ChannelLayer: group_add(notifications_username1)
        ChatConsumer-->>User1: Connection Established
        ChatConsumer->>Database: Update user online status
    else Authentication Failed
        ChatConsumer-->>User1: Connection Rejected
    end

    Note over User1,Database: 2. Friend Request Flow (First Social Interaction)
    User1->>WebSocket: send_friend_request
    WebSocket->>ChatConsumer: receive_json(friend request)
    ChatConsumer->>Database: Create friendship record
    Database-->>ChatConsumer: friendship data
    ChatConsumer->>ChannelLayer: group_send to User2
    ChatConsumer-->>User2: Friend request notification
    alt Friend Accept
        User2->>WebSocket: accept_friend
        WebSocket->>ChatConsumer: handle_friend_response
        ChatConsumer->>Database: Update friendship status = 'accepted'
        ChatConsumer->>ChannelLayer: group_send(friend accepted)
        ChatConsumer-->>User1: Friend request accepted
    else Friend Decline
        User2->>WebSocket: decline_friend
        WebSocket->>ChatConsumer: handle_friend_response
        ChatConsumer->>Database: Update friendship status = 'declined'
        ChatConsumer->>ChannelLayer: group_send(friend declined)
        ChatConsumer-->>User1: Friend request declined
    end

    Note over User1,Database: 3. Chat Message Flow (Basic Communication)
    User1->>WebSocket: send_chat_message
    WebSocket->>ChatConsumer: receive_json(message data)
    ChatConsumer->>Database: get_or_create_room
    Database-->>ChatConsumer: room data
    ChatConsumer->>Database: save_message
    Database-->>ChatConsumer: saved message
    ChatConsumer->>ChannelLayer: group_send to User2
    ChannelLayer->>ChatConsumer: chat_message
    ChatConsumer-->>User2: Deliver message
    ChatConsumer-->>User1: Message sent confirmation

    Note over User1,Database: 4. Message Read Status
    User2->>WebSocket: mark_message_read
    WebSocket->>ChatConsumer: handle_read_status
    ChatConsumer->>Database: Update message status
    ChatConsumer->>ChannelLayer: group_send(read receipt)
    ChatConsumer-->>User1: Message read notification

    Note over User1,Database: 5. Game Request Flow (Complex Interaction)
    User1->>WebSocket: send_game_request
    WebSocket->>ChatConsumer: receive_json(game request)
    ChatConsumer->>Database: Create game request
    alt Game Accept
        User2->>WebSocket: accept_game
        WebSocket->>ChatConsumer: handle_game_response
        ChatConsumer->>ChannelLayer: group_send(game accepted)
        ChatConsumer-->>User1: Game accepted notification
    else Game Decline
        User2->>WebSocket: decline_game
        WebSocket->>ChatConsumer: handle_game_response
        ChatConsumer->>ChannelLayer: group_send(game declined)
        ChatConsumer-->>User1: Game declined notification
    end

    Note over User1,Database: 6. Disconnection
    User1->>WebSocket: Close connection
    WebSocket->>ChatConsumer: disconnect()
    ChatConsumer->>ChannelLayer: group_discard
    ChatConsumer->>Database: Update user status = offline