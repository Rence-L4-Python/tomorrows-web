import './accountModal.js';
import './timer.js';
import './settings.js';
import './themes.js';
import './graph.js';
import './graphChange.js';
import './settingsChange.js';
import './crudFeature.js';
import './audioSFX.js';
import './popups-toasts.js';
import './adminRedirect.js';

window.addEventListener('load', () =>{ // added a loading screen because the background image takes time to load
    setTimeout(() =>{
        document.getElementById('loadingscreen').classList.add('fade-out')
    }, 420);
})