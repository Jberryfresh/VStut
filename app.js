(function(){
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const STORAGE_KEY = 'simple_todos_v1';

  function loadTodos(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw? JSON.parse(raw) : [];
    }catch(e){
      console.error('Failed to parse todos', e);
      return [];
    }
  }

  function saveTodos(todos){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function render(){
    const todos = loadTodos();
    list.innerHTML = '';
    if(todos.length === 0){
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.textContent = 'No todos yet.';
      list.appendChild(li);
      return;
    }

    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.dataset.id = todo.id;
      checkbox.checked = !!todo.completed;
      checkbox.setAttribute('aria-label', `Mark todo ${todo.text} completed`);

      const span = document.createElement('span');
      span.className = 'todo-text' + (todo.completed ? ' completed' : '');
      span.textContent = todo.text;

      const btn = document.createElement('button');
      btn.className = 'delete-btn';
      btn.textContent = 'Delete';
      btn.setAttribute('aria-label', `Delete todo ${todo.text}`);
      btn.dataset.id = todo.id;

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function addTodo(text){
    const todos = loadTodos();
    const todo = { id: Date.now().toString(), text: text.trim(), completed: false };
    todos.push(todo);
    saveTodos(todos);
    render();
  }

  function toggleCompleted(id){
    const todos = loadTodos();
    const idx = todos.findIndex(t => t.id === id);
    if(idx === -1) return;
    todos[idx].completed = !todos[idx].completed;
    saveTodos(todos);
    render();
  }

  function deleteTodo(id){
    let todos = loadTodos();
    todos = todos.filter(t => t.id !== id);
    saveTodos(todos);
    render();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if(!value) return;
    addTodo(value);
    input.value = '';
    input.focus();
  });

  list.addEventListener('click', (e) => {
    const del = e.target.closest('button.delete-btn');
    if(del){
      const id = del.dataset.id;
      if(id) deleteTodo(id);
      return;
    }
    const cb = e.target.closest('input.todo-checkbox');
    if(cb){
      const id = cb.dataset.id;
      if(id) toggleCompleted(id);
    }
  });

  // initial render
  render();
})();
