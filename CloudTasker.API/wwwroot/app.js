// Адреса API
const API_URL = '/api/Tasks';

// Словник статусів (C# Enum: 0=Todo, 1=InProgress, 2=CodeReview, 3=Done)
const TaskStatus = {
    Todo: 0,
    InProgress: 1,
    CodeReview: 2,
    Done: 3
};

// Запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', loadTasks);

// --- 1. ЗАВАНТАЖЕННЯ ЗАДАЧ ---
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            console.error("Failed to fetch tasks");
            return;
        }
        const tasks = await response.json();

        // Очищаємо колонки
        const columns = {
            [TaskStatus.Todo]: document.getElementById('todo-list'),
            [TaskStatus.InProgress]: document.getElementById('inprogress-list'),
            [TaskStatus.CodeReview]: document.getElementById('codereview-list'),
            [TaskStatus.Done]: document.getElementById('done-list')
        };
        
        Object.values(columns).forEach(col => { if(col) col.innerHTML = ''; });

        let counts = { 0: 0, 1: 0, 2: 0, 3: 0 };

        tasks.forEach(task => {
            // Нормалізація: перетворюємо "InProgress" -> 1, якщо сервер повернув текст
            const statusId = normalizeStatus(task.status);
            
            if (columns[statusId]) {
                const card = createTaskCard(task, statusId);
                columns[statusId].appendChild(card);
                counts[statusId]++;
            }
        });

        // Оновлюємо лічильники
        updateCount('todo-count', counts[0]);
        updateCount('inprogress-count', counts[1]);
        updateCount('codereview-count', counts[2]);
        updateCount('done-count', counts[3]);

    } catch (error) {
        console.error('Load error:', error);
    }
}

// --- 2. СТВОРЕННЯ КАРТКИ ---
function createTaskCard(task, currentStatusId) {
    const div = document.createElement('div');
    div.className = 'task-card';
    
    let buttonsHtml = '';

    // Кнопка НАЗАД ( < )
    if (currentStatusId > TaskStatus.Todo) {
        buttonsHtml += `
            <button onclick="moveTask(${task.id}, ${currentStatusId - 1})" class="btn-icon" title="Back">
                <i class="fa-solid fa-angles-left"></i>
            </button>`;
    }

    // Кнопка ВПЕРЕД ( > )
    if (currentStatusId < TaskStatus.Done) {
        buttonsHtml += `
            <button onclick="moveTask(${task.id}, ${currentStatusId + 1})" class="btn-icon" title="Next">
                <i class="fa-solid fa-angles-right"></i>
            </button>`;
    }
    
    // Кнопка ВИДАЛИТИ
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

// --- 3. РУХ ЗАДАЧІ (Виправлення помилки 400) ---
async function moveTask(id, newStatusId) {
    try {
        console.log(`Moving task ${id} to status ${newStatusId}`);

        // 1. Отримуємо поточну задачу
        const getRes = await fetch(`${API_URL}/${id}`);
        const task = await getRes.json();
        
        // 2. ЖОРСТКО ставимо статус як ЧИСЛО
        task.status = Number(newStatusId); 

        // 3. Відправляємо на сервер
        const putRes = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });

        if (putRes.ok) {
            loadTasks(); // Оновлюємо борд
        } else {
            console.error('Server Error:', await putRes.text());
            alert('Помилка сервера. Дивись консоль.');
        }
    } catch (err) {
        console.error('Network Error:', err);
    }
}

// --- 4. ДОДАВАННЯ ЗАДАЧІ ---
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitleInput').value;
    const priority = document.getElementById('taskPrioritySelect').value;

    if (!title.trim()) return;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title: title, 
            priority: priority, 
            status: 0 // Завжди як число 0
        })
    });
    
    document.getElementById('taskTitleInput').value = '';
    loadTasks();
});

// --- 5. ВИДАЛЕННЯ ---
async function deleteTask(id) {
    if(confirm('Видалити задачу?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadTasks();
    }
}

// --- ХЕЛПЕРИ ---
function normalizeStatus(status) {
    if (typeof status === 'number') return status;
    const map = { 'Todo': 0, 'InProgress': 1, 'CodeReview': 2, 'Done': 3 };
    return map[status] !== undefined ? map[status] : 0;
}

function updateCount(id, value) {
    const el = document.getElementById(id);
    if(el) el.textContent = value;
}