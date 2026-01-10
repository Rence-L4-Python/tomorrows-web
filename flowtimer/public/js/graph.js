import { helpers, loadHelpers } from './helpcounter.js';
import { resetMetrics } from './resetValues.js'; 
import { formatHMS } from './timeFormat.js';

let chartInstance = null;
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const daysInMonth = getDaysInMonth(year, month); // custom func
//////////

export const dailyData = Array.from({ length: 24 }, (_, hour) => {
  const start = String(hour).padStart(2,'0');
  const end = String((hour + 1) % 24).padStart(2,'0');

  return{
    time: `${start}:00-${end}:00`, // 24h format, starts from 00:00 to 23:00
    worktime: 0, 
  }
});

const weekdayNames = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]
const dayNames = Array.from( // just based on how getDaysInMonth() gets how many days there are in a month
  {length:daysInMonth}, (_, i) => `Day ${i+1}`
);
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
]

export const weeklyData = weekdayNames.map(day => ({ // just mapping the names with the label to show in the rendered graph
  time: day,
  worktime: 0,
}))
export const monthlyData = dayNames.map(day => ({
  time: day,
  worktime: 0,
}))
export const yearlyData = monthNames.map(month => ({
  time: month,
  worktime: 0,
}))

function getDaysInMonth(year, month){ // uses getDaysInMonth() so the amount of days are accurate per month (like February having 28 days this year, etc.)
  return new Date(year, month + 1, 0).getDate();
}

////////// loading from localStorage. graph worktime data is updated from the saved data in graphUpdate.js

const savedDaily = JSON.parse(localStorage.getItem('dailyData'));
if (savedDaily){
  for (let i = 0; i < dailyData.length; i++){
    dailyData[i].worktime = savedDaily[i].worktime;
  }
}

const savedWeekly = JSON.parse(localStorage.getItem('weeklyData'));
if (savedWeekly){
  for (let i = 0; i < weeklyData.length; i++){
    weeklyData[i].worktime = savedWeekly[i].worktime;
  }
}

const savedMonthly = JSON.parse(localStorage.getItem('monthlyData'));
if (savedMonthly){
  for (let i = 0; i < monthlyData.length; i++){
    monthlyData[i].worktime = savedMonthly[i].worktime;
  }
}

const savedYearly = JSON.parse(localStorage.getItem('yearlyData'));
if (savedYearly){
  for (let i = 0; i < yearlyData.length; i++){
    yearlyData[i].worktime = savedYearly[i].worktime;
  }
}

//////////

function loadDatafromHelpers(){ // this is for displaying the lifetime stats in the metrics page under the graph
  document.getElementById('timeworked').textContent = formatHMS(helpers.totalTimeWorked);
  document.getElementById('numtaskcompleted').textContent = helpers.tasksCompleted;
  document.getElementById('longestfocustime').textContent = formatHMS(helpers.longestFocusTime);
  document.getElementById('amntsessions').textContent = helpers.sessionNumber;
}

//////////
export function renderGraph(type = 'daily'){ // function using chart.js API. follows structure and naming from the documentation
  const ctx = document.getElementById('acquisitions');

  if (chartInstance){
    chartInstance.destroy();
  }

  let data;

  if (type === 'daily'){ // just loads the graph data based on dropdown selection value
    data = dailyData;
  } else if (type === 'weekly'){
    data = weeklyData;
  } else if (type === 'monthly'){
    data = monthlyData;
  } else if (type === 'yearly'){
    data = yearlyData;
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(row => row.time),
      datasets: [
        {
          label: 'Total time worked',
          data: data.map(row => row.worktime),
          backgroundColor: '#4F46E5',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { // plugin feature allows the values to be formatted with the formatHMS function. otherwise without it, just returns raw seconds
        tooltip: { 
          callbacks: { 
            label: function(context) { 
              const seconds = context.raw; 
              return formatHMS(seconds); } 
            } 
          } 
        }, 
        scales: { 
          y: { 
            display: false
          } 
        } 
      }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.getElementById('resetMetricsButton')

  if (!resetButton){ // for fixing warnings in console logs
    return;
  }

  resetButton.addEventListener("click", () => {
    if (window.confirm("Do you really want to reset your data? This will clear EVERYTHING on the metrics page!")) {
      resetMetrics();
      loadDatafromHelpers();
    }
  })
  renderGraph('daily');
  loadHelpers();
  loadDatafromHelpers();
})