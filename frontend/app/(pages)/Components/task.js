import Axios from "../Components/axios";

export class Task {
    constructor(intervalInMinutes = 1) {
        this.intervalInMs = intervalInMinutes * 60 * 1000;
        this.isRunning = false;
        this.timerId = null;
    }
  
    async makeApiRequest() {
        try {
            const response = await Axios.get('/api/update_user_last_active/');
            const data = response.data;
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
  
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.makeApiRequest(); // Initial call
  
        this.timerId = setInterval(() => {
            this.makeApiRequest();
        }, this.intervalInMs);
    }
  
    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isRunning = false;
    }
  }

