const DeleteAccount = async () => {
  // Show confirmation dialog
  const confirmDelete = window.confirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await Axios.delete("/api/delete_account/");
    
    // Clear all authentication cookies
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=None';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=None';
    document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=Strict';
    
    // Clear any local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to homepage
    window.location.href = "/";
  } catch (error) {
    console.error("Delete account error:", error);
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Try refreshing the token once
          try {
            await Axios.post("/api/accounts/refresh/");
            // Retry the delete request after refresh
            await Axios.delete("/api/delete_account/");
            window.location.href = "/";
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            alert("Session expired. Please login again.");
            window.location.href = "/login";
          }
          break;
          
        case 500:
          alert("Server error occurred. Please try again later.");
          break;
          
        default:
          alert("Failed to delete account. Please try again.");
      }
    } else {
      alert("Network error. Please check your connection.");
    }
  }
};