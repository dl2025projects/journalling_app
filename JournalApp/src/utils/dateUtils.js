/**
 * Formats a date string in a more readable format
 * @param {string} dateString - The date string in ISO format (YYYY-MM-DD)
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns {string} - Today's date in ISO format
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Calculates the difference in days between two dates
 * @param {string} date1 - The first date in ISO format (YYYY-MM-DD)
 * @param {string} date2 - The second date in ISO format (YYYY-MM-DD)
 * @returns {number} - The difference in days (positive if date2 is after date1)
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Set hours to 0 to ensure we're just comparing days
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds and convert to days
  const diffTime = d2 - d1;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calculates the streak based on an array of entry dates
 * @param {Array<string>} dates - Array of entry dates in ISO format (YYYY-MM-DD)
 * @returns {number} - The current streak count
 */
export const calculateStreak = (dates) => {
  if (!dates || dates.length === 0) return 0;
  
  // Sort dates in descending order (newest first)
  const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
  
  const today = getTodayDate();
  const lastEntryDate = sortedDates[0];
  
  // If the last entry is more than 1 day old, the streak is broken
  const daysSinceLastEntry = getDaysDifference(lastEntryDate, today);
  if (daysSinceLastEntry > 1) return 0;
  
  // Start with 1 (for the last entry) and count consecutive days
  let streak = 1;
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i]);
    const prevDate = new Date(sortedDates[i + 1]);
    
    // Set hours to 0 to ensure we're just comparing days
    currentDate.setHours(0, 0, 0, 0);
    prevDate.setHours(0, 0, 0, 0);
    
    // Get the difference in days
    const diffTime = currentDate - prevDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If the difference is 1 day, increment the streak
    if (diffDays === 1) {
      streak++;
    } else {
      // Break in the streak
      break;
    }
  }
  
  return streak;
};

/**
 * Checks if a date is today
 * @param {string} dateString - The date string in ISO format (YYYY-MM-DD)
 * @returns {boolean} - True if the date is today
 */
export const isToday = (dateString) => {
  const today = getTodayDate();
  return dateString === today;
}; 