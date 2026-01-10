export function breakfinishPopup(){
    /// prevents popups from stacking
    if (document.querySelector('#break-finish-popup-content')){
        return;
    }
    
    const popupTemplate = document.getElementById('break-finish-popup');
    const popupClone = popupTemplate.content.cloneNode(true);
    document.body.appendChild(popupClone);

    const popup = document.getElementById('break-finish-popup-content');
    setTimeout(() => { // slide animation
        popup.classList.add('hide');
    }, 3600)
    setTimeout(() => {
        popup.remove();
    }, 4000)
}

export function sessionfinishPopup(){
    /// prevents popups from stacking
    if (document.querySelector('#session-finish-popup-content')){
        return;
    }
    
    const popupTemplate = document.getElementById('session-finish-popup');
    const popupClone = popupTemplate.content.cloneNode(true);
    document.body.appendChild(popupClone);

    const popup = document.getElementById('session-finish-popup-content');
    setTimeout(() => { // slide animation
        popup.classList.add('hide');
    }, 3600)
    setTimeout(() => {
        popup.remove();
    }, 4000)
}

export function timertoast(){
    /// prevents popups from stacking
    if (document.querySelector('#timer-toast')){
        return;
    }

    const toastTemplate = document.getElementById('timer-toast-template');
    const toastClone = toastTemplate.content.cloneNode(true);
    document.body.appendChild(toastClone);

    const toast = document.getElementById('timer-toast');
    setTimeout(() => { // slide animation
        toast.classList.add('hide');
    }, 3600)
    setTimeout(() => {
        toast.remove();
    }, 4000)
}

export function starttimerPopup(){
    /// prevents popups from stacking
    if (document.querySelector('#start-timer-popup-content')){
        return
    }

    const popupTemplate = document.getElementById('start-timer-popup');
    const popupClone = popupTemplate.content.cloneNode(true);
    document.body.appendChild(popupClone);

    const popup = document.getElementById('start-timer-popup-content');
    setTimeout(() => { // slide animation
        popup.classList.add('hide');
    }, 3600)
    setTimeout(() => {
        popup.remove();
    }, 4000)
}

export function breakfinishWarning(){
        /// prevents popups from stacking
    if (document.querySelector('#break-finish-warning-content')){
        return
    }

    const popupTemplate = document.getElementById('break-finish-warning');
    const popupClone = popupTemplate.content.cloneNode(true);
    document.body.appendChild(popupClone);

    const popup = document.getElementById('break-finish-warning-content');
    setTimeout(() => { // slide animation
        popup.classList.add('hide');
    }, 3600)
    setTimeout(() => {
        popup.remove();
    }, 4000)
}

// previously guidePopup.js
window.addEventListener('DOMContentLoaded', () =>{
    const helpguideBtn = document.getElementById('helpguide-btn');
    const closehelpguideBtn = document.getElementById('closehelpguide');

    if (!helpguideBtn || !closehelpguideBtn){ // for fixing warnings in console logs
        return;
    }

    helpguideBtn.addEventListener('click', () => {
        const guidePopup = document.getElementById('guide-popup');
        guidePopup.classList.remove('hidden');
    })

    closehelpguideBtn.addEventListener('click', () => {
        const guidePopup = document.getElementById('guide-popup');
        guidePopup.classList.add('hidden');
    })
})