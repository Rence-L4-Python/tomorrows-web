import { startTimer, pauseTimer } from './timer.js';
import { helpers, saveHelpers } from './helpcounter.js';
import { isFinished } from './timer.js';
import { loadTasks, saveTasks } from './tasksStorage.js';

window.addEventListener('DOMContentLoaded', () =>{
    const addButton = document.getElementById('add-task');
    const input = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const template = document.getElementById('task-template');

    if (!addButton || !input || !taskList || !template){ // for fixing warnings in console logs
        return;
    }

    addButton.addEventListener('click', () =>{
        const value = input.value.trim();
        if (!value) return; // cross-browser testing, firefox has this guard by default but you end up adding tasks without names on chrome if this guard is not present

        const clone = template.content.cloneNode(true);
        const taskItem = clone.querySelector('.task-item');
        const taskText = taskItem.querySelector('.task-text');
        const finishButton = taskItem.querySelector('.finishtask');
        const trackButton = taskItem.querySelector('.tracktask');

        taskText.value = value; // this is the changeable name of the task

        finishButton.addEventListener('click', () =>{ // clicking on the finish button will update the metric stat and remove the item from the list
            helpers.tasksCompleted++;
            saveHelpers();
            taskItem.remove();
        })

        trackButton.addEventListener('click', () =>{
            const span = trackButton.querySelector('span');

            if (trackButton.textContent === "▶"){
                if (isFinished) return; // stops button from working if timer is finished so it works like in timer.js

                const currentlyActive = document.querySelector('.task-item.active-task'); // makes it so that only one task can be active at a time
                if (currentlyActive){
                    currentlyActive.classList.remove('active-task');
                }

                taskItem.classList.add('active-task'); // clicking on the play button on a task will make it an active task. this then ties in together with startTimer() in timer.js because the function only runs if a task is active
                span.textContent = "⏸";
                startTimer();
                return;
            }
            else{
                span.textContent = "▶";
                pauseTimer();
                return;
        }
        })

        taskList.appendChild(clone); // task item is put into the tasks list
        input.value = ''; // this is to clear user input after they add a task to the list
    })

    input.addEventListener('keypress', (e) =>{ // enter key is recognized as the same as clicking the add task button
        if (e.key === 'Enter') addButton.click();
    })
    
    loadTasks();
    setInterval(saveTasks, 1000) // autosaves every second
})