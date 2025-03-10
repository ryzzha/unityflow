export const daysLeft = (deadline: Date) => {
    const difference = new Date(deadline).getTime() - Date.now();
    const remainingDays = difference / (1000 * 3600 * 24);
  
    return remainingDays.toFixed(0);
  };
  
// export const calculateBarPercentage = (goal, raisedAmount) => {
//     const percentage = Math.round((raisedAmount * 100) / goal);
  
//     return percentage;
// };