const LOCAL_STORAGE_KEY = 'todos';
let todos = loadTodos();
const todoStats = document.querySelector('.todos-left');
const filterCompleted = document.getElementById('filter-completed');
const filterActive = document.getElementById('filter-active');

function loadTodos() {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(t => t && typeof t.id === 'number' && typeof t.text === 'string');
    } catch (e) {
        console.error('Failed to load todos:', e);
        return [];
    }
}

function saveTodos() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
        console.error('Failed to save todos:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderTodo(todos);
    updateTodoStats();
    updateClearButtonState();
    
    const todoInput = document.getElementById('todo-input');
    todoInput.addEventListener('change', (event) => {
        console.log('Input change event', event);
    });
    todoInput.addEventListener('keydown', (event) => {
        console.log('Input keydown event', event);
    });
    
    const todoForm = document.getElementById('todo-form');
    todoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const todoText = event.target[0].value.trim();
        if (!todoText) return;
        addTodo(todoText);
        updateTodoStats();
        event.target[0].value = '';
    });
    
    const todoList = document.getElementById('todos-list');
    todoList.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            const li = event.target.closest('li');
            const todoId = Number(li.getAttribute('data-id'));
            const todo = todos.find(t => t.id === todoId);
            
            if (todo) {
                todo.completed = event.target.checked;
                saveTodos();
                renderTodo(todos);
                updateTodoStats();
                updateClearButtonState();
            }
        }
    });

    const clearButton = document.getElementById('clear-completed');
    clearButton.addEventListener('click', () => {
        const completedIds = todos.filter(todo => todo.completed).map(todo => todo.id);
        clearCompletedItems(completedIds);
    });

    const filterAll = document.getElementById('filter-all');
    filterAll.addEventListener('click', () => {
        renderTodo(todos);
    });

    filterActive.addEventListener('click', () => {
        renderTodo(getActiveTodos());
    });

    filterCompleted.addEventListener('click', () => {
        renderTodo(getCompletedTodos());
    });
    filterActive.disabled = todos.length === 0;
    filterCompleted.disabled = todos.filter(todo => todo.completed).length === 0;
});

function addTodo(todoText) {
    const todo = {
        id: Date.now(),
        text: todoText,
        completed: false
    };
    
    todos.push(todo);
    saveTodos();
    renderTodo(todos);
}

function renderTodo(todos) {
    console.log('Rendering todos:', todos);
    const todosList = document.getElementById('todos-list');
    todosList.innerHTML = '';
    todos.map(todo => {
        const li = renderTodoItem(todo);
        todosList.appendChild(li);
        return li;
    })
    filterActive.disabled = todos.length === 0;
    filterCompleted.disabled = todos.filter(todo => todo.completed).length === 0;
}

function renderTodoItem(todo) {
    const li = document.createElement('li');
    li.setAttribute('data-id', todo.id);
    
    if (todo.completed) {
        li.classList.add('completed');
    }
    
    const inputId = 'todo-' + todo.id;
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = todo.completed;
    input.id = inputId;
    
    li.appendChild(input);
    const textLabel = document.createElement('label');
    textLabel.textContent = todo.text;
    textLabel.setAttribute('for', inputId);
    li.appendChild(textLabel);
    return li;
}



function updateTodoStatus(todoId, status) {
    const todo = todos.find(todo => todo.id === todoId);
    if (todo) {
        todo.completed = status;
        saveTodos();
        renderTodo(todos);
    }
}

function getTodosCount() {
    return todos.length;
}

function getCompletedTodosCount() {
    return todos.filter(todo => todo.completed).length;
}

function updateTodoStats() {
    todoStats.textContent = `${getCompletedTodosCount()}/${getTodosCount()} items left`;
}

function updateClearButtonState() {
    const clearButton = document.getElementById('clear-completed');
    const completedCount = getCompletedTodosCount();
    clearButton.disabled = completedCount === 0;
    clearButton.textContent = completedCount > 0 ? `Clear Completed [${completedCount}]` : 'Clear Completed';
}

function clearCompletedItems(idsToRemove) {
    const incomplete = todos.filter(todo => !idsToRemove.includes(todo.id));
    todos.length = 0;
    todos.push(...incomplete);
    saveTodos();
    renderTodo(todos);
    updateTodoStats();
    updateClearButtonState();
}

function getActiveTodos() {
    return todos.filter(todo => !todo.completed);
}

function getCompletedTodos() {
    return todos.filter(todo => todo.completed);
}
