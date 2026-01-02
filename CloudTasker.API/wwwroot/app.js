// Адреса нашого двигуна (API)
const API_URL = '/api/Tasks';

// Коли сторінка завантажилась - покажи задачі
document.addEventListener('DOMContentLoaded', loadTasks);

// Коли натиснули "Додати задачу"
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Щоб сторінка не перезавантажувалась
    const title = document.getElementById('taskTitleInput').value;
    const priority = document.getElementById('taskPrioritySelect').value;

    if (!title.trim()) return; // Якщо пусто - нічого не робимо

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: title, 
                priority: priority, 
                status: 'ToDo' // Нові задачі завжди летять в ToDo
            })
        });

        if (response.ok) {
            document.getElementById('taskTitleInput').value = ''; // Очистити поле
            loadTasks(); // Оновити список задач
        } else {
            console.error('Помилка при додаванні');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Функція: Завантажити список задач з сервера
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();

        // Очищаємо колонки перед новим малюванням
        const columns = {
            'ToDo': document.getElementById('todo-list'),
            'InProgress': document.getElementById('inprogress-list'),
            'Done': document.getElementById('done-list')
        };
        
        // Робимо колонки пустими
        Object.values(columns).forEach(col => col.innerHTML = '');

        // Лічильники
        let counts = { 'ToDo': 0, 'InProgress': 0, 'Done': 0 };

        // Розкладаємо задачі по колонках
        tasks.forEach(task => {
            const card = createTaskCard(task);
            if (columns[task.status]) {
                columns[task.status].appendChild(card);
                counts[task.status]++;
            }
        });

        // Оновлюємо цифри
        document.getElementById('todo-count').textContent = counts['ToDo'];
        document.getElementById('inprogress-count').textContent = counts['InProgress'];
        document.getElementById('done-count').textContent = counts['Done'];

    } catch (error) {
        console.error('Не вдалося завантажити задачі:', error);
    }
}

// Функція: Намалювати одну картку (HTML)
function createTaskCard(task) {
    const div = document.createElement('div');
    div.className = 'task-card';
    
    // Вибираємо колір бейджа
    const badgeClass = `badge-${task.priority.toLowerCase()}`;
    
    // Формуємо кнопки
    let actionButtons = '';
    
    if (task.status !== 'Done') {
        actionButtons += `<button onclick="moveTask(${task.id}, '${getNextStatus(task.status)}')" class="btn-icon" title="Вперед"> <i class="fa-solid fa-angles-right fa-beat"></i>  </button>`;
    }
    
    // Кнопка видалення
    actionButtons += `<button onclick="deleteTask(${task.id})" class="btn-icon" title="Видалити" style="color: #f87171;"> <i class="fa-regular fa-trash-can fa-beat"> </i> </button>`;

    // Вставляємо HTML
    div.innerHTML = `
        <span class="priority-badge ${badgeClass}">${task.priority}</span>
        <h4>${task.title}</h4>
        <div class="card-actions">
            ${actionButtons}
        </div>
    `;
    return div;
}

// Логіка: Куди рухати задачу далі?
function getNextStatus(current) {
    if (current === 'ToDo') return 'InProgress';
    if (current === 'InProgress') return 'Done';
    return 'Done';
}

// Функція: Змінити статус (рух задачі)
async function moveTask(id, newStatus) {
    try {
        // 1. Отримуємо задачу
        const getRes = await fetch(`${API_URL}/${id}`);
        const task = await getRes.json();
        
        // 2. Міняємо їй статус
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();

        // 3. Відправляємо назад на сервер
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        
        // 4. Оновлюємо екран
        loadTasks(); 
    } catch (err) {
        console.error(err);
    }
}

// Функція: Видалити
async function deleteTask(id) {
    if(confirm('Ви точно хочете видалити цю задачу?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadTasks();
    }
}