import { helpers, saveHelpers } from "./helpcounter.js";
import { isFinished, startTimer, pauseTimer } from "./timer.js";
import { formatHMS } from "./timeFormat.js";

export function saveTasks(){
    const taskList = document.getElementById('task-list');
    const tasks = [];
    const items = taskList.querySelectorAll('.task-item');
    
    items.forEach(item =>{ // pushes task item details into tasks list
        const text = item.querySelector('.task-text').value;
        const active = item.classList.contains('active-task');
        const tracked = item.querySelector('.listtimetrack').dataset.seconds || 0; // this one is from timer.js, not crudFeature.js like everything else here
        tasks.push({text, active, trackedSeconds: Number(tracked)});
    })

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

export function loadTasks(){ // repopulate tasks in task list, just a duplicate of crudFeature.js
    const taskList = document.getElementById('task-list');
    const template = document.getElementById('task-template');
    const saved = JSON.parse(localStorage.getItem('tasks'));

    saved.forEach(task =>{ // for each task, clone template and populate fields just like in crudFeature.js
        const clone = template.content.cloneNode(true);
        const taskItem = clone.querySelector('.task-item');
        const taskText = taskItem.querySelector('.task-text');
        const finishButton = taskItem.querySelector('.finishtask');
        const trackButton = taskItem.querySelector('.tracktask');

        taskText.value = task.text;

        const listtimetrack = taskItem.querySelector('.listtimetrack');
        listtimetrack.dataset.seconds = task.trackedSeconds;
        listtimetrack.textContent = formatHMS(task.trackedSeconds);

        if (task.active){ // adds the active-task class to the item if it had one before
            taskItem.classList.add('active-task');
        }

        finishButton.addEventListener('click', () =>{ // clicking on the finish button will update the metric stat and remove the item from the list
            helpers.tasksCompleted++;
            saveHelpers();
            taskItem.remove();
        })

        trackButton.addEventListener('click', () =>{ // same as in crudFeature.js
            const span = trackButton.querySelector('span');

            if (trackButton.textContent === "▶"){
                if (isFinished) return;

                const currentlyActive = document.querySelector('.task-item.active-task');
                if (currentlyActive){
                    currentlyActive.classList.remove('active-task');
                }
                
                taskItem.classList.add('active-task');
                span.textContent = "⏸";
                startTimer();
            }
            else{
                span.textContent = "▶";
                pauseTimer();
            }
        })

        taskList.appendChild(clone);
    })
}