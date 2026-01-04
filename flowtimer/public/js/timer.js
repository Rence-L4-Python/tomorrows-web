import { settings, loadSettings } from "./settings.js";
import { playAudio } from "./audioSFX.js";
import { breakfinishPopup, sessionfinishPopup, timertoast, starttimerPopup, breakfinishWarning} from "./popups-toasts.js"
import { helpers, saveHelpers, loadHelpers } from "./helpcounter.js";
import { formatTime, formatHMS } from "./timeFormat.js";
import { addWorkTime } from "./graphUpdate.js";

let timerInterval = null;
let isRunning = false;
let isWorkSession = true;
export let isFinished = false;
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
export function startTimer(){
  const activeTask = document.querySelector('.task-item.active-task');
  if (!activeTask){
    starttimerPopup();
    return;
  }
  if (isFinished){ // stops user from repeating clicks. they have to click the restart button for the buttons to work again
    timertoast();
    return;
  }
  if (isRunning){
    pauseTimer();
    return;
  }
  if (isWorkSession){
    trackTaskTime();
  }

  isRunning = true;
  playButton.querySelector('img').src = 'media/pause-button.svg';

  startTime = Date.now();
  lastTime = remainingTime;
  lastTimeWorked = helpers.totalTimeWorked;

  timerInterval = setInterval(function(){
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    if (isFlowmodoro()){ // compared to the other timers, flowmodoro counts up instead of down
      remainingTime = lastTime + elapsed;
      circle.set(0); // circle should be static for flowmodoro since it has no set duration
      circle.setText(formatTime(remainingTime)); // update time display counting up
      return;
    }

    remainingTime = lastTime - elapsed;

    circle.set(1 - remainingTime / totalTime);
    circle.setText(formatTime(remainingTime));

    if (remainingTime <= 0){
      remainingTime = 0;
      clearInterval(timerInterval);
      isRunning = false;
      isFinished = true;
      playButton.querySelector('img').src = 'media/play-button.svg';
      
      playAudio();

      if (!isWorkSession){
        breakfinishPopup();
        startWorkSession();
        return;
      }

      if (isWorkSession){
        helpers.totalTimeWorked = lastTimeWorked + elapsed;

        addWorkTime(elapsed);

        if (elapsed > helpers.longestFocusTime){
          helpers.longestFocusTime = elapsed;
        }

        saveHelpers();
      }

      sessionfinishPopup();

      if (timerSelect.value !== 'timer-countdown'){ // 
        showSessionFinishModal();
        helpers.sessionNumber++;
        saveHelpers();
      }

      return;
    }
  }, 100) // runs every 100ms. since remainingTime is tied to JavaScript's date object, the timer should now run without any delays. previously the interval was supposed to increase remainingTime by 1 every second, but multiple events cause it to get delayed
}

// pause timer
export function pauseTimer(){
  clearInterval(timerInterval);
  isRunning = false;
  lastTime = remainingTime;
  playButton.querySelector('img').src = 'media/play-button.svg';
}

// restart timer
function restartTimer(){
  clearInterval(timerInterval);
  remainingTime = totalTime;
  circle.set(0);
  circle.setText(formatTime(remainingTime));
  isRunning = false;
  isFinished = false;
  playButton.querySelector('img').src = 'media/play-button.svg';
}

// finish timer
function finishTimer(){
  const activeTask = document.querySelector('.task-item.active-task');
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  if (!activeTask){
    starttimerPopup();
    return;
  }
  if (!isWorkSession){
    breakfinishWarning();
    return
  }
  if (isFinished){ // stops user from repeating clicks. they have to click the restart button for the buttons to work again
    timertoast();
    return;
  }
  if (!startTime){ // check to stop adding an absurd number for total time worked (like 490953+ hrs or the epoch time because of the date object)
    starttimerPopup();
    return;
  }

  clearInterval(timerInterval);
  isRunning = false;
  playButton.querySelector('img').src = 'media/play-button.svg';

  if (isWorkSession){
    helpers.totalTimeWorked = lastTimeWorked + elapsed;
    addWorkTime(elapsed);

    if (elapsed > helpers.longestFocusTime){
      helpers.longestFocusTime = elapsed;
    }

    saveHelpers();
  }

  if (isFlowmodoro()){
    const fmRatio = settings.fmRatio;
    const breakLength = Math.floor(remainingTime / fmRatio);
  
    sessionfinishPopup();
    startFlowmodoroBreak(breakLength);
    helpers.sessionNumber++;
    saveHelpers();
    return;
  }

  remainingTime = 0;
  circle.set(1);
  circle.setText(formatTime(remainingTime));
  isFinished = true;
  playAudio();

  if (timerSelect.value !== 'timer-countdown'){
    showSessionFinishModal();
    helpers.sessionNumber++;
    saveHelpers();
  }
  sessionfinishPopup();
}

function trackTaskTime(){
  const activeTask = document.querySelector('.task-item.active-task');
  if (!activeTask && taskTrackInterval !== null) return;

  const listtimetrack = activeTask.querySelector('.listtimetrack');
  taskTracked = Number(listtimetrack.dataset.seconds) || 0;

  taskTrackstartTime = Date.now();
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

  modalText.textContent = `Session ${helpers.sessionNumber + 1} is over!`;

  startBreakButton.addEventListener('click', () =>{
    overlay.remove();
    startBreak();
  })

  skipBreakButton.addEventListener('click', () =>{
    overlay.remove();
    restartTimer();
  })
}

function updateTimerMode(selected){
  remainingTime = getTimerDuration(selected);
  totalTime = remainingTime;

  if(circle){
    circle.set(0);
    circle.setText(formatTime(remainingTime));
  }
}

// initialize progress bar circle

function initializeCircle(){
  container.innerHTML = '';

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

// override working circle for the break circle

function breakCircle(){
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

function getTimerDuration(selected){
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
  return timerSelect.value === 'timer-flowmodoro' && isWorkSession; // only true if timer is set to flowmodoro and not on a break
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

  if (helpers.sessionNumber > 0 && helpers.sessionNumber % sessionsBeforeLongBreak == 0){
    remainingTime = longBreak;
  }
  else{
    remainingTime = shortBreak;
  }

  totalTime = remainingTime;
  breakCircle();
  startTimer();
  updateworkStatus();
}

function startWorkSession(){
  isWorkSession = true;
  isFinished = false;
  isRunning = false;
  remainingTime = getTimerDuration(timerSelect.value);
  totalTime = remainingTime;
  initializeCircle();
  updateworkStatus();
}

function updateworkStatus(){
  const statusText = document.getElementById('status-text');
  if (!isWorkSession){
    statusText.textContent = "Break";
  }
  else{
    statusText.textContent = "Working";
  }
}

// attempt at reworking

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

  // 

  timerSelect.addEventListener('change', () =>{
    const selected = timerSelect.value;
    updateTimerMode(selected);
  })
  
  initializeCircle();
  playButton.addEventListener('click', startTimer);
  restartButton.addEventListener('click', restartTimer);
  finishButton.addEventListener('click', finishTimer);
})