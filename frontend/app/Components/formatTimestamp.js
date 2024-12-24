export const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
  
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return timestamp;
    }
};