```mermaid
sequenceDiagram
    participant User1
    participant User2
    participant WebSocket
    participant ChatConsumer
    participant ChannelLayer
    participant Database

    Note over User1,Database: Connection Phase
    User1->>WebSocket: Connect to WebSocket
    WebSocket->>ChatConsumer: connect()
    alt Authentication Success
        ChatConsumer->>ChannelLayer: Add to notification group (notifications_username)
        ChatConsumer-->>User1: Connection Established
    else Authentication Failed
        ChatConsumer-->>User1: Connection Rejected
    end