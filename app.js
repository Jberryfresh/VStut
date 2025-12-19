(function(){
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');

  const THEME_KEY = 'theme_pref_v1';

  function applyTheme(theme){
    if(theme === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }

  function loadTheme(){
    try{
      const t = localStorage.getItem(THEME_KEY);
      if(t) return t;
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }catch(e){
      return 'light';
    }
  }

  function saveTheme(theme){
    try{ localStorage.setItem(THEME_KEY, theme); }catch(e){}
  }

  function toggleTheme(){
    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(newTheme);
    saveTheme(newTheme);
  }

  const themeToggleBtn = document.getElementById('theme-toggle');
  applyTheme(loadTheme());
  if(themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

  // API helpers
  const API_BASE = '';

  async function fetchTodos(){
    const res = await fetch(`${API_BASE}/api/todos`);
    if(!res.ok) throw new Error('Failed to fetch');
    return res.json();
  }

  async function createTodo(text){
    const res = await fetch(`${API_BASE}/api/todos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text })
    });
    if(!res.ok) throw new Error('Failed to create');
    return res.json();
  }

  async function updateTodo(id, patch){
    const res = await fetch(`${API_BASE}/api/todos/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch)
    });
    if(!res.ok) throw new Error('Failed to update');
    return res.json();
  }

  async function removeTodo(id){
    const res = await fetch(`${API_BASE}/api/todos/${id}`, { method: 'DELETE' });
    if(!res.ok && res.status !== 204) throw new Error('Failed to delete');
  }

  async function render(){
    list.innerHTML = '';
    let todos = [];
    try{
      todos = await fetchTodos();
    }catch(e){
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.textContent = 'Failed to load todos.';
      list.appendChild(li);
      console.error(e);
      return;
    }

    if(!todos || todos.length === 0){
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
      checkbox.dataset.id = String(todo.id);
      checkbox.checked = !!todo.completed;
      checkbox.setAttribute('aria-label', `Mark todo ${todo.text} completed`);

      const span = document.createElement('span');
      span.className = 'todo-text' + (todo.completed ? ' completed' : '');
      span.textContent = todo.text;

      const btn = document.createElement('button');
      btn.className = 'delete-btn';
      btn.textContent = 'Delete';
      btn.setAttribute('aria-label', `Delete todo ${todo.text}`);
      btn.dataset.id = String(todo.id);

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if(!value) return;
    try{
      await createTodo(value);
      input.value = '';
      input.focus();
      await render();
    }catch(err){
      console.error(err);
      alert('Failed to add todo');
    }
  });

  list.addEventListener('click', async (e) => {
    const del = e.target.closest('button.delete-btn');
    if(del){
      const id = del.dataset.id;
      const li = del.closest('li.todo-item');
      if(li){
        li.classList.add('removing');
        setTimeout(async () => { if(id){ await removeTodo(id); await render(); } }, 260);
      } else {
        if(id){ await removeTodo(id); await render(); }
      }
      return;
    }
    const cb = e.target.closest('input.todo-checkbox');
    if(cb){
      const id = cb.dataset.id;
      if(id){
        try{
          await updateTodo(id, { completed: cb.checked });
          await render();
        }catch(err){ console.error(err); }
      }
    }
  });

  // initial render
  render();
})();
