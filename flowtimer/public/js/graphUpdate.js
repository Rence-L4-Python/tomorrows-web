import { dailyData, weeklyData, monthlyData, yearlyData } from "./graph.js";

export function addWorkTime(elapsed){
    const seconds = Math.floor(elapsed);
    if (seconds <= 0) return;

    const now = new Date();
    const hour = now.getHours();
    const weekday = (now.getDay() + 6) % 7; // JS getDay() returns Sundays as 0, so weeks start as Sundays. This makes the weeks start on Mondays so it works with graph.js
    const dayOfMonth = now.getDate() - 1;
    const month = now.getMonth();

    dailyData[hour].worktime += seconds; // update graph.js worktime data 
    weeklyData[weekday].worktime += seconds;
    monthlyData[dayOfMonth].worktime += seconds;
    yearlyData[month].worktime += seconds;

    localStorage.setItem('dailyData', JSON.stringify(dailyData));
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
    localStorage.setItem('monthlyData', JSON.stringify(monthlyData));
    localStorage.setItem('yearlyData', JSON.stringify(yearlyData));
}