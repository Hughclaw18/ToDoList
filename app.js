document.addEventListener("DOMContentLoaded", () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    if (storedTasks.length) {
        tasks = storedTasks;
        updateTasksList();
        updateStats();
    }
});

let tasks = [];

const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Add a new task with the current timestamp
const addTask = () => {
    const taskInput = document.getElementById("taskInput");
    const text = taskInput.value.trim();
    
    if (text) {
        tasks.push({ 
            text: text, 
            completed: false, 
            date: new Date().toISOString() // Save timestamp when task is created
        });
        sortTasksByDate(); // Sort tasks after adding new task
        updateTasksList();
        updateStats();
        saveTasks();
        taskInput.value = ''; // Clear the input field
    }
};

// Sort tasks by their creation date (newest first)
const sortTasksByDate = () => {
    tasks.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTasksList();
    updateStats();
    saveTasks();
};

const deleteTask = (index) => {
    tasks.splice(index, 1);
    updateTasksList();
    updateStats();
    saveTasks();
};

const editTask = (index) => {
    const taskInput = document.getElementById("taskInput");
    taskInput.value = tasks[index].text;
    deleteTask(index);
};

const updateStats = () => {
    const completeTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks === 0 ? 0 : (completeTasks / totalTasks) * 100;
    const progressBar = document.getElementById('progress');
    
    progressBar.style.width = `${progress}%`;
    document.getElementById('numbers').innerText = `${completeTasks} / ${totalTasks}`;
    
    if (tasks.length && completeTasks === totalTasks) {
        blastConfetti();
    }
};

// Update tasks list in the UI
const updateTasksList = () => {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        const taskDate = new Date(task.date).toLocaleString(); // Convert ISO date to readable format
        
        listItem.innerHTML = `
            <div class="taskItem">
                <div class="task ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}/>
                    <div>
                        <p>${task.text}</p>
                        <small>${taskDate}</small> <!-- Display the task date -->
                    </div>
                </div>
                <div class="icons">
                    <img src="edit.png" onClick="editTask(${index})" alt="Edit"/>
                    <img src="bin.png" onClick="deleteTask(${index})" alt="Delete"/>
                </div>
            </div>
        `;
        listItem.querySelector(".checkbox").addEventListener("change", () => toggleTaskComplete(index));
        taskList.appendChild(listItem);
    });
};

document.getElementById("newTask").addEventListener("click", function(e) {
    e.preventDefault();
    addTask();
});

// Confetti effect integration
const fireConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
};

const blastConfetti = () => {
    const confettiContainer = document.getElementById('confetti-container');
    confettiContainer.innerHTML = ''; // Remove any existing canvas

    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    const ctx = canvas.getContext('2d');
    confettiContainer.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    confettiContainer.style.zIndex = 9999;

    fireConfetti();

    setTimeout(() => {
        confettiContainer.removeChild(canvas);
    }, 3000); // 3 seconds
};

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
