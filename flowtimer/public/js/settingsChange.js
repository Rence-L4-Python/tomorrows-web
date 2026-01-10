import { resetSettings } from './resetValues.js';
import {settings, loadSettings, saveSettings} from './settings.js';
import { parseTimeInput, formatTimeInput } from './timeFormat.js';

window.addEventListener('DOMContentLoaded', () => {
    loadSettings();

    const flowmoratio = document.getElementById('setting-flowmodoro');
    const countdownlength = document.getElementById('setting-countdown');
    const pomolength = document.getElementById('setting-pomodoro');
    const pomoshortbreak = document.getElementById('setting-shortbreak');
    const pomolongbreak = document.getElementById('setting-longbreak');
    const pomosesh = document.getElementById('setting-sessions');
    const currentTimerType = document.getElementById('timerselector');

    function UIUpdate(){ // updates the values on the settings screen. is a function so it runs on page load and also after pressing the reset to default settings button
        if (flowmoratio) flowmoratio.value = settings.fmRatio;
        if (countdownlength) countdownlength.value = formatTimeInput(settings.cdTimer);
        if (pomolength) pomolength.value = formatTimeInput(settings.pmLength);
        if (pomoshortbreak) pomoshortbreak.value = formatTimeInput(settings.pmSB);
        if (pomolongbreak) pomolongbreak.value = formatTimeInput(settings.pmLB);
        if (pomosesh) pomosesh.value = settings.pmSesh;
        if (currentTimerType) currentTimerType.value = settings.currentTimerType;
    }

    UIUpdate();

    if (flowmoratio) flowmoratio.addEventListener('input', e => { // just saves the changed values to localStorage
        settings.fmRatio = Number(e.target.value);
        saveSettings();
    })

    if (countdownlength) countdownlength.addEventListener('input', e => {
        const input = parseTimeInput(e.target.value); // parseTimeInput from timeFormat.js converts user input like 1h to 3600 which can be read by JS
        settings.cdTimer = input;
        saveSettings();
    })

    if (pomolength) pomolength.addEventListener('input', e => {
        const input = parseTimeInput(e.target.value); // same as before
        settings.pmLength = input;
        saveSettings();
    })

    if (pomoshortbreak) pomoshortbreak.addEventListener('input', e => {
        const input = parseTimeInput(e.target.value); // same as before
        settings.pmSB = input;
        saveSettings();
    })

    if (pomolongbreak) pomolongbreak.addEventListener('input', e => {
        const input = parseTimeInput(e.target.value); // same as before
        settings.pmLB = input;
        saveSettings();
    })

    if (pomosesh) pomosesh.addEventListener('input', e => {
        settings.pmSesh = Number(e.target.value);
        saveSettings();
    })

    if (currentTimerType) currentTimerType.addEventListener('change', e => {
        settings.currentTimerType = e.target.value;
        saveSettings();
    })

    const resetButton = document.getElementById('resetSettingsButton')
    if (!resetButton) return; // for fixing warnings in console logs
    
    resetButton.addEventListener("click", () => {
        if (window.confirm("Reset back settings to their default values?")){
          resetSettings();
          UIUpdate();
        }
      })
})