import Axios from "../Components/axios";
import { NextRequest } from "next/server"; 

export class Task {
    
    constructor(intervalInMinutes = 1, loggedInUser) {
        this.intervalInMs = intervalInMinutes * 20 * 1000;
        this.isRunning = false;
        this.timerId = null;
        this.loggedInUser = loggedInUser;
    }
  
    async makeApiRequest() {
        try {
            const response = await Axios.get('/api/update_user_last_active/');
            // this.loggedInUser = await Axios.get('/api/friends/friend_requests/');
            console.log('API response///***', this.loggedInUser );
            return response.data;
        } catch (error) {
            console.error('Error making API request', error);
        }
    }
  
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        // Make the first call after some time 
        setTimeout(() => {
            this.makeApiRequest();
        }, 3000);
  
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
