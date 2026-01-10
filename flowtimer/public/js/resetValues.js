import { helpers, saveHelpers } from "./helpcounter.js";
import { saveSettings, settings } from "./settings.js";
import { dailyData, weeklyData, monthlyData, yearlyData, renderGraph } from "./graph.js";

export function resetMetrics(){ // just resets all the relevant values to 0 and saves them
    helpers.totalTimeWorked = 0;
    helpers.tasksCompleted = 0;
    helpers.longestFocusTime = 0;
    helpers.sessionNumber = 0;
    
    saveHelpers();

    for (let i = 0; i < dailyData.length; i++){ // has to be looped because they are an array
       dailyData[i].worktime = 0;
    }
    for (let i = 0; i < weeklyData.length; i++){
       weeklyData[i].worktime = 0;
    }
    for (let i = 0; i < monthlyData.length; i++){
       monthlyData[i].worktime = 0;
    }
    for (let i = 0; i < yearlyData.length; i++){
       yearlyData[i].worktime = 0;
    }

    localStorage.setItem('dailyData', JSON.stringify(dailyData)); // no external file for saving them so saving is just done here
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData))
    localStorage.setItem('monthlyData', JSON.stringify(monthlyData))
    localStorage.setItem('yearlyData', JSON.stringify(yearlyData))
    
    renderGraph(); // this has to be called to update the graph
}

export function resetSettings(){ // default values for settings. these are in seconds but the parse functions make it readable for users
    settings.fmRatio = 5; 
    settings.cdTimer = 60;
    settings.pmLength = 1500;
    settings.pmSB = 300;
    settings.pmLB = 900;
    settings.pmSesh = 4;
    
    saveSettings();
}