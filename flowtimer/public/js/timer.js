import { settings, loadSettings } from "./settings.js";
import { playAudio } from "./audioSFX.js";
import { breakfinishPopup, sessionfinishPopup, timertoast, starttimerPopup, breakfinishWarning} from "./popups-toasts.js"
import { helpers, saveHelpers, loadHelpers } from "./helpcounter.js";
import { formatTime, formatHMS } from "./timeFormat.js";
import { addWorkTime } from "./graphUpdate.js";

let timerInterval = null;
let isRunning = false;
let isWorkSession = true;
export let isFinished = false; // exported to use in crudFeature.js
let remainingTime;
let totalTime;
let circle = null;
let playButton = null;
let timerSelect = null;
let container= null;
let startTime = null;
let lastTime = null;
let lastTimeWorked = null;
let taskTrackInterval = null;
let taskTrackstartTime = null;
let taskTracklastTime = null;
let taskTracked = null;

// start timer
export function startTimer(){ // exported to use in crudFeature.js
  const activeTask = document.querySelector('.task-item.active-task'); // this gets added in crudFeature.js when you click the task item's start button
  if (!activeTask){ // basically tells the user to click play on a task item first or the rest of the functions wont happen
    starttimerPopup();
    return;
  }
  if (isFinished){ // stops user from repeating clicks. they have to click the restart button for the buttons to work again. mostly relevant when timer remaining time hits 0
    timertoast();
    return;
  }
  if (isRunning){ // since isRunning is false, pauseTimer() does not apply
    pauseTimer();
    return;
  }
  if (isWorkSession){ // the HMS time tracker in the task list only works if it is a work session and not a break
    trackTaskTime();
  }

  isRunning = true; // apply isRunning to true so we can apply pauseTimer() the next time
  playButton.querySelector('img').src = 'media/pause-button.svg';
  
  startTime = Date.now();
  lastTime = remainingTime;
  lastTimeWorked = helpers.totalTimeWorked;

  timerInterval = setInterval(function(){ // need an interval so the UI keeps updating
    const elapsed = Math.floor((Date.now() - startTime) / 1000); // using date.now() because just relying totalTime - remainingTime introduces some delays when too many things are happening at once

    if (isFlowmodoro()){ // compared to the other timers, flowmodoro counts up instead of down
      remainingTime = lastTime + elapsed;
      circle.set(0); // circle should be static for flowmodoro since it has no set duration
      circle.setText(formatTime(remainingTime)); // update time display counting up
      return;
    }

    remainingTime = lastTime - elapsed; // applies for every other timer type, just counts down

    circle.set(1 - remainingTime / totalTime); // when remainingTime/totalTime reaches 0, the circle is completed
    circle.setText(formatTime(remainingTime));

    if (remainingTime <= 0){ // follows same logic as finishTimer()
      clearInterval(timerInterval); // stops timer from counting down
      isRunning = false;
      isFinished = true; // has to be set to true or users can keep on clicking start or finish buttons when timer reaches 0
      playButton.querySelector('img').src = 'media/play-button.svg';
      
      playAudio();

      if (isWorkSession){ // if a timer finishes and it's a work session, the totalTimeWorked and longestFocusTime gets updated on the metrics
        helpers.totalTimeWorked = lastTimeWorked + elapsed;

        addWorkTime(elapsed);

        if (elapsed > helpers.longestFocusTime){ // overwrites the previous longest focus time if your current focus time is greater than your previous best
          helpers.longestFocusTime = elapsed;
        }

        saveHelpers();
      } else{ // if you are on a break and your break length reaches 0, a popup shows up and you start a work session. it does not automatically start the timer, but just handles changing your status from a break to work
        breakfinishPopup();
        startWorkSession();
        return;
      }

      sessionfinishPopup();

      if (timerSelect.value !== 'timer-countdown'){ // showSessionFinishModal only applies to Pomodoro timer. it doesn't apply to Flowmodoro timer because remainingTime never reaches 0 as it counts upwards
        showSessionFinishModal();
      }

      return;
    }
  }, 100) // runs every 100ms. since remainingTime is tied to JavaScript's date object, the timer should now run without any delays. previously the interval was supposed to increase remainingTime by 1 every second, but multiple events cause it to get delayed
}

// pause timer
export function pauseTimer(){ // exported to use in crudFeature.js
  clearInterval(timerInterval); // stops timer from counting down
  isRunning = false; // pauses the timer
  playButton.querySelector('img').src = 'media/play-button.svg';
}

// restart timer
function restartTimer(){
  clearInterval(timerInterval); // in case user restarts an ongoing timer, this will stop the timer from running
  remainingTime = totalTime; // restarts time back to what the timer started with
  circle.set(0);
  circle.setText(formatTime(remainingTime));
  isRunning = false; // has to be set to false or user cant press the start button
  isFinished = false; // has to be set to false or user cant press the start button
  playButton.querySelector('img').src = 'media/play-button.svg';
}

// finish timer
function finishTimer(){
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  if (!isWorkSession){ // a lot of stuff breaks when you try to use the finish button while on a break, so i just disallowed the finish button from working while on a break :(
    breakfinishWarning();
    return
  }
  if (remainingTime === totalTime){ // guard to stop user from repeating clicks, especially when the timer hasn't started yet.
    starttimerPopup();
    return;
  }
  if (isFinished){ // stops user from repeating clicks. they have to click the restart button for the buttons to work again. this is more relevant when time is 0.
    timertoast();
    return;
  }

  clearInterval(timerInterval); // stops timer from counting down
  isRunning = false; // has to be set to false or user cant press the start button
  playButton.querySelector('img').src = 'media/play-button.svg';

  if (isWorkSession){ // adds the elapsed time to metrics when the finish button is clicked
    helpers.totalTimeWorked = lastTimeWorked + elapsed;

    addWorkTime(elapsed);

    if (elapsed > helpers.longestFocusTime){
      helpers.longestFocusTime = elapsed;
    }

    helpers.sessionNumber++;
    saveHelpers();
  }

  if (isFlowmodoro()){ // flowmodoro finish is different because it uses a different break logic. instead of relying on static changes, the break length is dynamically changed according to the work-break ratio
    const fmRatio = settings.fmRatio; // this is the work-break ratio
    const breakLength = Math.floor(remainingTime / fmRatio); // break length is your work time divided by your ratio. so if you work for ten minutes and your ratio is 5, your break time is 2 minutes

    sessionfinishPopup();
    startFlowmodoroBreak(breakLength);
    return;
  }

  remainingTime = 0; // just some updates for a timer to be considered as finished
  circle.set(1);
  circle.setText(formatTime(remainingTime));
  isFinished = true;
  playAudio(); // ping sound when finished

  if (timerSelect.value !== 'timer-countdown'){ // finish modal shouldnt show up for countdown timers because they are just the same as normal timers
    showSessionFinishModal();
  }

  sessionfinishPopup();
}

function trackTaskTime(){
  const activeTask = document.querySelector('.task-item.active-task');
  if (!activeTask) return;

  const listtimetrack = activeTask.querySelector('.listtimetrack');
  taskTracked = Number(listtimetrack.dataset.seconds) || 0; // bypasses the need of having to save and load things to localStorage, also needed because the time resets to 0 everytime you resume a timer

  taskTrackstartTime = Date.now(); // same logic as in startTimer(), but we use a different one or else the tracked time gets overwritten. basically if you start a task at 0 seconds, the list's tracked time also resets to 0, but we don't want that because it should just add up
  taskTracklastTime = taskTracked;

  taskTrackInterval = setInterval(() =>{
    if (!isRunning){
      clearInterval(taskTrackInterval);
      taskTrackInterval = null;
      taskTracked = taskTracklastTime + Math.floor((Date.now() - taskTrackstartTime) / 1000);
      return;
    }

    const elapsed = Math.floor((Date.now() - taskTrackstartTime) / 1000);
    const timetracked = taskTracklastTime + elapsed;

    listtimetrack.textContent = formatHMS(timetracked);
    listtimetrack.dataset.seconds = timetracked;
  }, 100)
}

// when finished, display a message/modal that the timer is complete. Should be clicked to dismiss.
function showSessionFinishModal(){
  const template = document.getElementById('session-finish-template');
  const modal = template.content.cloneNode(true);

  document.body.appendChild(modal);

  const overlay = document.querySelector('.modal-overlay');
  const modalText = overlay.querySelector('.modal-text');
  const startBreakButton = overlay.querySelector('#start-break-btn');
  const skipBreakButton = overlay.querySelector('#skip-break-btn');

  modalText.textContent = `Session ${helpers.sessionNumber + 1} is over!`; // session number starts with a 0, added by 1 just so it looks appropriate on the modal

  startBreakButton.addEventListener('click', () =>{
    overlay.remove();
    startBreak();
  })

  skipBreakButton.addEventListener('click', () =>{
    overlay.remove();
    restartTimer();
  })
}

function updateTimerMode(selected){ // just updates remainingTime and the circle text's UI with the timer type's length settings
  remainingTime = getTimerDuration(selected);
  totalTime = remainingTime;

  if(circle){
    circle.set(0);
    circle.setText(formatTime(remainingTime));
  }
}

// initialize progress bar circle

function initializeCircle(){
  container.innerHTML = ''; // this is done because we are overriding it with a different circle which is breakCircle, and that contains a different color

  circle = new ProgressBar.Circle(container, {
    strokeWidth: 3,
    trailWidth: 3,
    color: '#00bcd4',
    trailColor: '#FFF',
    easing: 'linear',
    duration: 1000,
    text:{
      value: formatTime(remainingTime),
      className: 'progress-text',
      style: { // this has to be styled or else the text color will also be cyan.
        color: '#FFFFFF',
        position: 'absolute', // this is because the text starts off at the bottom left corner
        left: '50%',
        top: '50%',
        padding: 0, // just resetting some stuff to be careful
        margin: 0,
        transform: 'translate(-50%, -50%)',
        fontSize: '24px', // original text is too small
      }
    }
  })
  circle.set(0); // means the circle is not finished. when it reaches 1, it is finished. needs some basic math to get there
}

// override working circle for the break circle

function breakCircle(){ // same explanation as initializeCircle
  container.innerHTML = '';

  circle = new ProgressBar.Circle(container, {
    strokeWidth: 3,
    trailWidth: 3,
    color: '#9fd400ff',
    trailColor: '#FFF',
    easing: 'linear',
    duration: 1000,
    text:{
      value: formatTime(remainingTime),
      className: 'progress-text',
      style: {
        color: '#FFFFFF',
        position: 'absolute',
        left: '50%',
        top: '50%',
        padding: 0,
        margin: 0,
        transform: 'translate(-50%, -50%)',
        fontSize: '24px',
      }
    }
  })
  circle.set(0);
}

function getTimerDuration(selected){ // switch case that changes how long remainingTime is based on the type of timer and their length setting
  switch(selected){
    case "timer-flowmodoro":
      return 0;
    case "timer-pomodoro":
      return settings.pmLength;
    case "timer-countdown":
      return settings.cdTimer;
    default:
      return 0;
  }
}

function isFlowmodoro(){
  if (isWorkSession && timerSelect.value === 'timer-flowmodoro') return true; // rewrote previous line to follow the same conventions as other code here
}

function startFlowmodoroBreak(breakLength){ // break length is tied to time worked divided by fmRatio in settings
  isWorkSession = false;
  isFinished = false;
  isRunning = false;
  remainingTime = breakLength;
  totalTime = breakLength;
  breakCircle();
  startTimer();
  updateworkStatus();
}

// initialize break when startBreakButton in modal is clicked
function startBreak(){
  isWorkSession = false;
  isFinished = false;
  isRunning = false;

  const sessionsBeforeLongBreak = settings.pmSesh;
  const shortBreak = settings.pmSB;
  const longBreak = settings.pmLB;

  if (helpers.sessionNumber > 0 && helpers.sessionNumber % sessionsBeforeLongBreak == 0){ // basically just means that you get a long break if your session number is a multiple of the sessionsBeforeLongBreak setting
    remainingTime = longBreak;
  }
  else{ // if its not a multiple you get a short break
    remainingTime = shortBreak;
  }

  totalTime = remainingTime; // timer value is set to your break length
  breakCircle();
  startTimer();
  updateworkStatus();
}

function startWorkSession(){ // relevant after a break
  isWorkSession = true;
  isFinished = false; // has to be set to false or user cant press the start button
  remainingTime = getTimerDuration(timerSelect.value); // this has to update or the work session after a break starts at 0
  totalTime = remainingTime;
  initializeCircle();
  updateworkStatus();
}

function updateworkStatus(){ // just a small check that changes your working status if it's a work session or a break
  const statusText = document.getElementById('status-text');
  if (isWorkSession){
    statusText.textContent = "Working";
  } else{
    statusText.textContent = "Break";
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadSettings(); 
  loadHelpers();

  container = document.querySelector('#timer');
  playButton = document.getElementById('play-btn');
  const restartButton = document.getElementById('restart-btn');
  const finishButton = document.getElementById('finish-btn');
  timerSelect = document.getElementById('timerselector');

  if (!container || !playButton || !restartButton || !finishButton || !timerSelect){ // for fixing warnings in console logs
    return;
  }

  // make timer selection work and display different times based on selection
  if (timerSelect){
    timerSelect.value = settings.currentTimerType ?? 'timer-flowmodoro';
  }

  remainingTime = getTimerDuration(timerSelect.value);
  totalTime = remainingTime;

  timerSelect.addEventListener('change', () =>{ // updates the timer mode based on the selected value in the dropdown list
    const selected = timerSelect.value;
    updateTimerMode(selected);
  })
  
  initializeCircle();
  playButton.addEventListener('click', startTimer);
  restartButton.addEventListener('click', restartTimer);
  finishButton.addEventListener('click', finishTimer);
})