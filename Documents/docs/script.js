document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const prioritySelect = document.getElementById('priority-select');
    const tasksList = document.getElementById('tasks-list');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const showAllBtn = document.getElementById('show-all');
    const showImportantBtn = document.getElementById('show-important');
    const showLessImportantBtn = document.getElementById('show-less-important');

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function renderTasks(taskArray = tasks) {
        tasksList.innerHTML = '';
        
        if (taskArray.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        taskArray.forEach((task) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            
            const taskDate = new Date(task.date);
            const formattedDate = taskDate.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            let formattedTime = task.time;
            if (task.time) {
                const [hours, minutes] = task.time.split(':');
                const hourNum = parseInt(hours);
                const ampm = hourNum >= 12 ? 'PM' : 'AM';
                const displayHour = hourNum % 12 || 12;
                formattedTime = `${displayHour}:${minutes} ${ampm}`;
            }
            
            taskItem.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${task.name}</div>
                    <div class="task-details">
                        <span class="task-date">${formattedDate}</span>
                        <span class="task-time">${formattedTime}</span>
                        <span class="task-priority priority-${task.priority}">${task.priority === 'most-important' ? 'Most Important' : 'Less Important'}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-delete" data-id="${task.id}">Delete</button>
                </div>
            `;
            
            tasksList.appendChild(taskItem);
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const taskId = this.getAttribute('data-id');
                deleteTask(taskId);
            });
        });
    }

    function addTask(task) {
        task.id = Date.now().toString();
        tasks.push(task);
        saveTasks();
        renderTasks();
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function searchTasks(query) {
        if (!query || query.trim() === '') {
            renderTasks();
            return;
        }
        
        const filteredTasks = tasks.filter(task => 
            task.name.toLowerCase().includes(query.toLowerCase())
        );
        
        renderTasks(filteredTasks);
    }

    function filterTasks(priority) {
        if (priority === 'all') {
            renderTasks();
            return;
        }
        
        const filteredTasks = tasks.filter(task => task.priority === priority);
        renderTasks(filteredTasks);
    }

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const task = {
            name: taskInput.value.trim(),
            date: dateInput.value,
            time: timeInput.value,
            priority: prioritySelect.value
        };
        
        if (task.name) {
            addTask(task);
            taskForm.reset();
            dateInput.value = formattedDate;
        }
    });

    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        searchTasks(query);
    });

    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            searchTasks(query);
        }
    });

    showAllBtn.addEventListener('click', function() {
        updateActiveFilter(showAllBtn);
        filterTasks('all');
    });

    showImportantBtn.addEventListener('click', function() {
        updateActiveFilter(showImportantBtn);
        filterTasks('most-important');
    });

    showLessImportantBtn.addEventListener('click', function() {
        updateActiveFilter(showLessImportantBtn);
        filterTasks('less-important');
    });

    function updateActiveFilter(activeButton) {
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        activeButton.classList.add('active');
    }

    renderTasks();
});