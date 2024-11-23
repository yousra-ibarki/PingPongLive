export class WebSocketService {
    private socket: WebSocket | null = null;
    private token: string | null = null;
  
    connect(token: string) {
      this.token = token;
      this.socket = new WebSocket(`ws://your-backend-websocket-url?token=${token}`);
  
      this.socket.onopen = () => {
        console.log('WebSocket Connected');
      };
  
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'achievement') {
          // Dispatch custom event for achievement
          window.dispatchEvent(new CustomEvent('achievement', { detail: data.achievement }));
        }
      };
  
      this.socket.onclose = () => {
        console.log('WebSocket Disconnected');
      };
    }
  
    disconnect() {
      this.socket?.close();
      this.socket = null;
    }
  }