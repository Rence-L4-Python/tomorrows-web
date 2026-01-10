export const settings = {
    fmRatio: 5, // Flowmodoro Ratio
    cdTimer: 60, // Countdown Timer
    pmLength: 1500, // Pomodoro Length
    pmSB: 300, // Pomodoro short break
    pmLB: 900, // Pomodoro Long break
    pmSesh: 4, // Pomodoro Sessions until Long Break
    themeIndex: 0, // Background image
    currentTimerType: 'timer-flowmodoro' // Default timer
}

// localStorage functionalities for the app to work
export function saveSettings(){
    localStorage.setItem('timerSettings', JSON.stringify(settings));
}

export function loadSettings(){
    const saved = localStorage.getItem('timerSettings');
    if (saved){
        Object.assign(settings, JSON.parse(saved));
    }
}