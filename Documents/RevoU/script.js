// Task management
let tasks = [];
let filteredTasks = [];
let editingId = null;

// DOM elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const prioritySelect = document.getElementById('prioritySelect');
const searchInput = document.getElementById('searchInput');
const priorityFilter = document.getElementById('priorityFilter');
const taskList = document.getElementById('taskList');
const noTasksMsg = document.getElementById('noTasksMsg');
const showAllBtn = document.getElementById('showAllBtn');
const submitBtn = document.getElementById('submitBtn');
const currentDateEl = document.getElementById('currentDate');

// Utility function to format datetime for display
function formatDateTime(due) {
    const date = new Date(due);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return `${date.toLocaleDateString('en-US', options)} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// Load tasks from localStorage on init
document.addEventListener('DOMContentLoaded', () => {
    currentDateEl.textContent = `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    loadTasks();
    applyFilters();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', handleSubmit);
    searchInput.addEventListener('input', applyFilters);
    priorityFilter.addEventListener('change', applyFilters);

    showAllBtn.addEventListener('click', () => {
        // Reset search and filter values
        searchInput.value = '';
        priorityFilter.value = '';
        applyFilters();
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'n':
                    e.preventDefault();
                    editingId = null;
                    submitBtn.textContent = 'Add Task';
                    taskForm.reset();
                    taskInput.focus();
                    break;
                case 'f':
                    e.preventDefault();
                    searchInput.focus();
                    break;
                case 'a':
                    e.preventDefault();
                    showAllBtn.click();
                    break;
            }
        }
        if (e.key === 'Escape') {
            taskForm.reset();
            searchInput.value = '';
            priorityFilter.value = '';
            editingId = null;
            submitBtn.textContent = 'Add Task';
            clearValidation([taskInput, dateInput, timeInput, prioritySelect]);
            taskInput.focus();
        }
    });
}

// Handle form submission (add or update)
function handleSubmit(e) {
    e.preventDefault();

    const taskText = taskInput.value.trim();
    const dueDate = dateInput.value;
    const dueTime = timeInput.value;
    const priority = prioritySelect.value;

    const inputs = [taskInput, dateInput, timeInput, prioritySelect];
    let valid = true;
    inputs.forEach(input => {
        if (!input.value.trim() || (input === prioritySelect && input.value === '')) {
            input.classList.add('error');
            valid = false;
        } else {
            input.classList.remove('error');
        }
    });

    if (!valid) {
        setTimeout(() => clearValidation(inputs), 2000);
        return;
    }

    const fullDateTime = `${dueDate}T${dueTime}`;
    const dueISO = new Date(fullDateTime).toISOString();

    if (editingId) {
        const task = tasks.find(t => t.id === editingId);
        if (task) {
            task.text = taskText;
            task.due = dueISO;
            task.priority = priority;
        }
        editingId = null;
        submitBtn.textContent = 'Add Task';
    } else {
        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            due: dueISO,
            priority: priority,
            completed: false
        };
        tasks.unshift(newTask);
    }

    taskForm.reset();
    taskInput.classList.add('success');
    setTimeout(() => {
        taskInput.classList.remove('success');
        clearValidation(inputs);
    }, 1000);

    saveTasks();
    applyFilters();
}

// Apply filters (text search + priority)
function applyFilters() {
    const query = searchInput.value.toLowerCase();
    const selectedPriority = priorityFilter.value;

    filteredTasks = tasks.filter(task => {
        const matchesText = !query || task.text.toLowerCase().includes(query);
        const matchesPriority = !selectedPriority || task.priority === selectedPriority;
        return matchesText && matchesPriority;
    });

    updateDisplay();
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const dueDateObj = new Date(task.due);
        taskInput.value = task.text;
        dateInput.value = dueDateObj.toISOString().split('T')[0];
        timeInput.value = dueDateObj.toTimeString().slice(0, 5);
        prioritySelect.value = task.priority;
        editingId = id;
        submitBtn.textContent = 'Update Task';
        taskInput.focus();
    }
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    filteredTasks = filteredTasks.filter(task => task.id !== id);
    saveTasks();
    applyFilters();
}

// Update display
function updateDisplay() {
    taskList.innerHTML = '';
    noTasksMsg.style.display = filteredTasks.length === 0 ? 'block' : 'none';

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-content">
                <div class="task-text">${task.text}
                    <span class="priority-badge priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                </div>
                <div class="task-date">Due: ${formatDateTime(task.due)}</div>
            </div>
            <div class="task-buttons">
                <button class="edit-btn" onclick="editTask('${task.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Clear validation classes
function clearValidation(inputs = []) {
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
}

// Save to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load from localStorage
function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved).map(task => ({
            ...task,
            due: task.due || new Date().toISOString()
        }));
        filteredTasks = [...tasks];
    }
}