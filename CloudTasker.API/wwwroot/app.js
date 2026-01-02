// Адреса API
const API_URL = '/api/Tasks';

// Словник статусів
const TaskStatus = {
    Todo: 0,
    InProgress: 1,
    CodeReview: 2,
    Done: 3
};

// Запуск
document.addEventListener('DOMContentLoaded', loadTasks);

// 1. ДОДАВАННЯ
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitleInput').value;
    const priority = document.getElementById('taskPrioritySelect').value;

    if (!title.trim()) return;

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: title, 
                priority: priority, 
                status: TaskStatus.Todo
            })
        });
        document.getElementById('taskTitleInput').value = '';
        loadTasks();
    } catch (error) { console.error(error); }
});

// 2. ЗАВАНТАЖЕННЯ
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();

        const columns = {
            [TaskStatus.Todo]: document.getElementById('todo-list'),
            [TaskStatus.InProgress]: document.getElementById('inprogress-list'),
            [TaskStatus.CodeReview]: document.getElementById('codereview-list'),
            [TaskStatus.Done]: document.getElementById('done-list')
        };
        
        Object.values(columns).forEach(col => { if(col) col.innerHTML = ''; });
        let counts = { 0: 0, 1: 0, 2: 0, 3: 0 };

        tasks.forEach(task => {
            const statusId = normalizeStatus(task.status);
            if (columns[statusId]) {
                columns[statusId].appendChild(createTaskCard(task, statusId));
                counts[statusId]++;
            }
        });

        updateCount('todo-count', counts[TaskStatus.Todo]);
        updateCount('inprogress-count', counts[TaskStatus.InProgress]);
        updateCount('codereview-count', counts[TaskStatus.CodeReview]);
        updateCount('done-count', counts[TaskStatus.Done]);

    } catch (error) { console.error(error); }
}

// 3. КАРТКА (Оновлена логіка кнопок)
function createTaskCard(task, currentStatusId) {
    const div = document.createElement('div');
    div.className = 'task-card';
    
    let buttonsHtml = '';

    // ⬅КНОПКА "НАЗАД" (Якщо статус не ToDo)
    if (currentStatusId > TaskStatus.Todo) {
        const prevStatusId = currentStatusId - 1;
        buttonsHtml += `
            <button onclick="moveTask(${task.id}, ${prevStatusId})" class="btn-icon" title="Move Back">
                <i class="fa-solid fa-angles-left fa-beat"></i>
            </button>`;
    }

    //  КНОПКА "ВПЕРЕД" (Якщо статус не Done)
    if (currentStatusId < TaskStatus.Done) {
        const nextStatusId = currentStatusId + 1;
        buttonsHtml += `
            <button onclick="moveTask(${task.id}, ${nextStatusId})" class="btn-icon" title="Move Next">
                <i class="fa-solid fa-angles-right fa-beat-fade"></i>
            </button>`;
    }
    
    //  КНОПКА "ВИДАЛИТИ"
    buttonsHtml += `
        <button onclick="deleteTask(${task.id})" class="btn-icon" title="Delete">
            <i class="fa-solid fa-trash-can"></i>
        </button>`;

    div.innerHTML = `
        <span class="priority-badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
        <h4>${task.title}</h4>
        <div class="card-actions">
            ${buttonsHtml}
        </div>
    `;
    return div;
}

// 4. РУХ
async function moveTask(id, newStatusId) {
    try {
        const getRes = await fetch(`${API_URL}/${id}`);
        const task = await getRes.json();
        
        task.status = Number(newStatusId); // Строго число

        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        loadTasks(); 
    } catch (err) { console.error(err); }
}

// 5. ВИДАЛЕННЯ
async function deleteTask(id) {
    if(confirm('Delete task?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadTasks();
    }
}

// ХЕЛПЕРИ
function normalizeStatus(status) {
    if (typeof status === 'number') return status;
    const map = { 'Todo': 0, 'InProgress': 1, 'CodeReview': 2, 'Done': 3 };
    return map[status] !== undefined ? map[status] : 0;
}
function updateCount(id, value) {
    const el = document.getElementById(id);
    if(el) el.textContent = value;
}