  export function formatDate(timestamp) {
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj)) return 'Invalid Date';
  
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }); // e.g. June 16, 2025
  }
  
  export function formatTime(timestamp) {
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj)) return 'Invalid Time';
  
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }); // e.g. 3:45 PM
  }