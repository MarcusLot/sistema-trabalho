// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7P_UIuH-Ti1fj9kIyz34uDnHrVDUgMLU",
  authDomain: "sistematrabalho-f7006.firebaseapp.com",
  databaseURL: "https://sistematrabalho-f7006-default-rtdb.firebaseio.com",
  projectId: "sistematrabalho-f7006",
  storageBucket: "sistematrabalho-f7006.firebasestorage.app",
  messagingSenderId: "217286716506",
  appId: "1:217286716506:web:e6f64c2b7250dc7cf2bc63",
  measurementId: "G-ZWSHVMXQ8R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global Variables
let currentUser = null;
let currentPage = 'dashboard';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    }
    setupEventListeners();
});

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            } else if (this.id === 'logoutBtn') {
                handleLogout();
            }
        });
    });
    document.getElementById('createTaskForm')?.addEventListener('submit', handleCreateTask);
    document.getElementById('createEmployeeForm')?.addEventListener('submit', handleCreateEmployee);
    document.getElementById('createStoreForm')?.addEventListener('submit', handleCreateStore);
    document.getElementById('createUserForm')?.addEventListener('submit', handleCreateUser);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email === 'admin@admin.com' && password === 'admin123') {
        currentUser = {
            email: email,
            name: 'Administrador',
            role: 'admin',
            id: 'admin_001'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
        showNotification('✅ Login realizado com sucesso!');
    } else {
        database.ref('users').once('value', (snapshot) => {
            const users = snapshot.val();
            let userFound = false;
            
            if (users) {
                for (let userId in users) {
                    const user = users[userId];
                    if (user.email === email && user.password === password) {
                        currentUser = {
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            id: userId
                        };
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        showApp();
                        showNotification('✅ Login realizado com sucesso!');
                        userFound = true;
                        break;
                    }
                }
            }
            
            if (!userFound) {
                showNotification('❌ Email ou senha incorretos!');
            }
        });
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
    showNotification('👋 Logout realizado com sucesso!');
}

function showLogin() {
    loginScreen.style.display = 'flex';
    appScreen.style.display = 'none';
}

function showApp() {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';
    updateUserInterface();
    loadDashboardData();
    startRealtimeListeners();
}

function updateUserInterface() {
    if (!currentUser) return;

    const userAvatar = document.getElementById('userAvatar');
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();

    const adminElements = document.querySelectorAll('.admin-only, .nav-admin-only');
    adminElements.forEach(element => {
        if (currentUser.role === 'admin') {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });

    if (currentPage === 'tasks') {
        loadTasks();
    } else if (currentPage === 'employees') {
        loadEmployees();
    } else if (currentPage === 'stores') {
        loadStores();
    } else if (currentPage === 'users') {
        loadUsers();
    }
}

function navigateToPage(page) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    pages.forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(page + 'Page').classList.add('active');

    currentPage = page;
    updateUserInterface();

    switch(page) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'tasks':
            loadTasks();
            loadEmployeesSelect();
            break;
        case 'employees':
            loadEmployees();
            loadStoresSelect();
            break;
        case 'stores':
            loadStores();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

function loadDashboardData() {
    database.ref('tasks').once('value', (snapshot) => {
        const tasks = snapshot.val();
        let totalTasks = 0;
        let pendingTasks = 0;
        let completedTasks = 0;

        if (tasks) {
            for (let taskId in tasks) {
                totalTasks++;
                if (tasks[taskId].status === 'pending') {
                    pendingTasks++;
                } else if (tasks[taskId].status === 'completed') {
                    completedTasks++;
                }
            }
        }

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    });

    database.ref('employees').once('value', (snapshot) => {
        const employees = snapshot.val();
        const count = employees ? Object.keys(employees).length : 0;
        document.getElementById('totalEmployees').textContent = count;
    });

    loadRecentTasks();
}

function loadRecentTasks() {
    database.ref('tasks').orderByChild('createdAt').limitToLast(5).once('value', (snapshot) => {
        const tasks = snapshot.val();
        const recentTasksList = document.getElementById('recentTasks');
        
        if (!tasks || Object.keys(tasks).length === 0) {
            recentTasksList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 2C7.89 2 7 2.89 7 4V20C7 21.11 7.89 22 9 22H15C16.11 22 17 21.11 17 20V4C17 2.89 16.11 2 15 2H9M9 4H15V20H9V4M10 6V8H14V6H10M10 10V12H14V10H10Z"/>
                    </svg>
                    <h3>Nenhuma tarefa ainda</h3>
                    <p>Crie sua primeira tarefa para começar</p>
                </div>
            `;
            return;
        }

        recentTasksList.innerHTML = '';
        
        const tasksArray = Object.entries(tasks).map(([id, task]) => ({ id, ...task }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        tasksArray.forEach(task => {
            const taskElement = createTaskElement(task);
            recentTasksList.appendChild(taskElement);
        });
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    
    const priorityColors = {
        urgent: '#ef4444',
        normal: '#2563eb',
        low: '#64748b'
    };

    const statusColors = {
        pending: '#f59e0b',
        completed: '#10b981'
    };

    const createdAt = task.createdAt ? new Date(task.createdAt).toLocaleString('pt-BR') : '';

    li.innerHTML = `
        <div class="task-header">
            <div class="task-recipient">${task.employeeName || 'Não atribuído'}</div>
            <div style="display: flex; gap: 8px;">
                <span class="task-status" style="background: ${priorityColors[task.priority] || '#64748b'}20; color: ${priorityColors[task.priority] || '#64748b'}">
                    ${task.priority === 'urgent' ? '🔴' : task.priority === 'normal' ? '🔵' : '⚪'} ${task.priority || 'normal'}
                </span>
                <span class="task-status" style="background: ${statusColors[task.status] || '#f59e0b'}20; color: ${statusColors[task.status] || '#f59e0b'}">
                    ${task.status === 'completed' ? '✅' : '⏳'} ${task.status || 'pending'}
                </span>
            </div>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="task-meta">
            <span>📅 ${createdAt}</span>
            ${task.status !== 'completed' ? `
                <button class="btn btn-primary" onclick="completeTask('${task.id}')" style="padding: 4px 8px; font-size: 12px;">
                    ✅ Concluir
                </button>
            ` : ''}
        </div>
    `;

    return li;
}

function showNotification(message) {
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function loadTasks() {
    database.ref('tasks').once('value', (snapshot) => {
        const tasks = snapshot.val();
        const myTasksList = document.getElementById('myTasks');
        
        if (!tasks || Object.keys(tasks).length === 0) {
            myTasksList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 2C7.89 2 7 2.89 7 4V20C7 21.11 7.89 22 9 22H15C16.11 22 17 21.11 17 20V4C17 2.89 16.11 2 15 2H9M9 4H15V20H9V4M10 6V8H14V6H10M10 10V12H14V10H10Z"/>
                    </svg>
                    <h3>Nenhuma tarefa encontrada</h3>
                    <p>Você não tem tarefas no momento</p>
                </div>
            `;
            return;
        }

        myTasksList.innerHTML = '';
        
        const userTasks = [];
        for (let taskId in tasks) {
            const task = tasks[taskId];
            if (currentUser.role === 'admin' || task.assignedTo === currentUser.id) {
                userTasks.push({ id: taskId, ...task });
            }
        }

        userTasks.sort((a, b) => {
            const priorityOrder = { urgent: 0, normal: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return (b.createdAt || 0) - (a.createdAt || 0);
        });

        userTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            myTasksList.appendChild(taskElement);
        });
    });
}

function loadEmployees() {
    database.ref('employees').once('value', (snapshot) => {
        const employees = snapshot.val();
        const employeesTable = document.getElementById('employeesTable');
        
        if (!employees || Object.keys(employees).length === 0) {
            employeesTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <p>Nenhum funcionário cadastrado</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        employeesTable.innerHTML = '';
        
        for (let employeeId in employees) {
            const employee = employees[employeeId];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.storeName || 'Não atribuído'}</td>
                <td><span class="task-status status-pending">Ativo</span></td>
                <td>
                    <button class="btn btn-primary" onclick="editEmployee('${employeeId}')" style="padding: 4px 8px; font-size: 12px;">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteEmployee('${employeeId}')" style="padding: 4px 8px; font-size: 12px;">
                        🗑️ Excluir
                    </button>
                </td>
            `;
            
            employeesTable.appendChild(tr);
        }
    });
}

function loadStores() {
    database.ref('stores').once('value', (snapshot) => {
        const stores = snapshot.val();
        const storesTable = document.getElementById('storesTable');
        
        if (!stores || Object.keys(stores).length === 0) {
            storesTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <p>Nenhuma loja cadastrada</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        storesTable.innerHTML = '';
        
        for (let storeId in stores) {
            const store = stores[storeId];
            const tr = document.createElement('tr');
            
            let employeeCount = 0;
            database.ref('employees').once('value', (empSnapshot) => {
                const employees = empSnapshot.val();
                if (employees) {
                    for (let empId in employees) {
                        if (employees[empId].storeId === storeId) {
                            employeeCount++;
                        }
                    }
                }
                tr.querySelector('.employee-count').textContent = employeeCount;
            });
            
            tr.innerHTML = `
                <td>${store.name}</td>
                <td>${store.code}</td>
                <td>${store.address || 'Não informado'}</td>
                <td class="employee-count">0</td>
                <td>
                    <button class="btn btn-primary" onclick="editStore('${storeId}')" style="padding: 4px 8px; font-size: 12px;">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteStore('${storeId}')" style="padding: 4px 8px; font-size: 12px;">
                        🗑️ Excluir
                    </button>
                </td>
            `;
            
            storesTable.appendChild(tr);
        }
    });
}

function loadUsers() {
    database.ref('users').once('value', (snapshot) => {
        const users = snapshot.val();
        const usersTable = document.getElementById('usersTable');
        
        if (!users || Object.keys(users).length === 0) {
            usersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <p>Nenhum usuário encontrado</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        usersTable.innerHTML = '';
        
        for (let userId in users) {
            const user = users[userId];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role === 'admin' ? 'Administrador' : 'Funcionário'}</td>
                <td><span class="task-status status-pending">Ativo</span></td>
                <td>
                    <button class="btn btn-primary" onclick="editUser('${userId}')" style="padding: 4px 8px; font-size: 12px;">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser('${userId}')" style="padding: 4px 8px; font-size: 12px;">
                        🗑️ Excluir
                    </button>
                </td>
            `;
            
            usersTable.appendChild(tr);
        }
    });
}

function loadEmployeesSelect() {
    database.ref('employees').once('value', (snapshot) => {
        const employees = snapshot.val();
        const select = document.getElementById('taskEmployee');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um funcionário</option>';
        
        if (employees) {
            for (let employeeId in employees) {
                const employee = employees[employeeId];
                const option = document.createElement('option');
                option.value = employeeId;
                option.textContent = `${employee.name} - ${employee.storeName || 'Sem loja'}`;
                select.appendChild(option);
            }
        }
    });
}

function loadStoresSelect() {
    database.ref('stores').once('value', (snapshot) => {
        const stores = snapshot.val();
        const select = document.getElementById('employeeStore');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione uma loja</option>';
        
        if (stores) {
            for (let storeId in stores) {
                const store = stores[storeId];
                const option = document.createElement('option');
                option.value = storeId;
                option.textContent = `${store.name} (${store.code})`;
                select.appendChild(option);
            }
        }
    });
}

function handleCreateTask(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('taskEmployee').value;
    const priority = document.getElementById('taskPriority').value;
    const description = document.getElementById('taskDescription').value;
    
    if (!employeeId || !description) {
        showNotification('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    database.ref('employees/' + employeeId).once('value', (snapshot) => {
        const employee = snapshot.val();
        
        const task = {
            assignedTo: employeeId,
            employeeName: employee.name,
            priority: priority,
            description: description,
            status: 'pending',
            createdBy: currentUser.id,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        database.ref('tasks').push(task).then(() => {
            document.getElementById('createTaskForm').reset();
            showNotification('✅ Tarefa criada com sucesso!');
            loadTasks();
            loadDashboardData();
        }).catch((error) => {
            showNotification('❌ Erro ao criar tarefa!');
            console.error(error);
        });
    });
}

function handleCreateEmployee(e) {
    e.preventDefault();
    
    const name = document.getElementById('employeeName').value;
    const storeId = document.getElementById('employeeStore').value;
    const email = document.getElementById('employeeEmail').value;
    const phone = document.getElementById('employeePhone').value;
    
    if (!name || !storeId || !email) {
        showNotification('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    database.ref('stores/' + storeId).once('value', (snapshot) => {
        const store = snapshot.val();
        
        const employee = {
            name: name,
            storeId: storeId,
            storeName: store.name,
            email: email,
            phone: phone,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        database.ref('employees').push(employee).then(() => {
            document.getElementById('createEmployeeForm').reset();
            showNotification('✅ Funcionário adicionado com sucesso!');
            loadEmployees();
            loadDashboardData();
        }).catch((error) => {
            showNotification('❌ Erro ao adicionar funcionário!');
            console.error(error);
        });
    });
}

function handleCreateStore(e) {
    e.preventDefault();
    
    const name = document.getElementById('storeName').value;
    const code = document.getElementById('storeCode').value;
    const address = document.getElementById('storeAddress').value;
    
    if (!name || !code) {
        showNotification('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    const store = {
        name: name,
        code: code,
        address: address,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    database.ref('stores').push(store).then(() => {
        document.getElementById('createStoreForm').reset();
        showNotification('✅ Loja adicionada com sucesso!');
        loadStores();
    }).catch((error) => {
        showNotification('❌ Erro ao adicionar loja!');
        console.error(error);
    });
}

function handleCreateUser(e) {
    e.preventDefault();
    
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const name = document.getElementById('userName').value;
    const role = document.getElementById('userRole').value;
    
    if (!email || !password || !name) {
        showNotification('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    if (password.length < 6) {
        showNotification('❌ A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    const user = {
        email: email,
        password: password,
        name: name,
        role: role,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    database.ref('users').push(user).then(() => {
        document.getElementById('createUserForm').reset();
        showNotification('✅ Usuário criado com sucesso!');
        loadUsers();
    }).catch((error) => {
        showNotification('❌ Erro ao criar usuário!');
        console.error(error);
    });
}

function completeTask(taskId) {
    if (confirm('Tem certeza que deseja concluir esta tarefa?')) {
        database.ref('tasks/' + taskId).update({
            status: 'completed',
            completedAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            showNotification('✅ Tarefa concluída com sucesso!');
            loadTasks();
            loadDashboardData();
        }).catch((error) => {
            showNotification('❌ Erro ao concluir tarefa!');
            console.error(error);
        });
    }
}

function deleteEmployee(employeeId) {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
        database.ref('employees/' + employeeId).remove().then(() => {
            showNotification('✅ Funcionário excluído com sucesso!');
            loadEmployees();
            loadDashboardData();
        }).catch((error) => {
            showNotification('❌ Erro ao excluir funcionário!');
            console.error(error);
        });
    }
}

function deleteStore(storeId) {
    if (confirm('Tem certeza que deseja excluir esta loja?')) {
        database.ref('stores/' + storeId).remove().then(() => {
            showNotification('✅ Loja excluída com sucesso!');
            loadStores();
        }).catch((error) => {
            showNotification('❌ Erro ao excluir loja!');
            console.error(error);
        });
    }
}

function deleteUser(userId) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        database.ref('users/' + userId).remove().then(() => {
            showNotification('✅ Usuário excluído com sucesso!');
            loadUsers();
        }).catch((error) => {
            showNotification('❌ Erro ao excluir usuário!');
            console.error(error);
        });
    }
}

function editEmployee(employeeId) {
    showNotification('🔧 Funcionalidade de edição em desenvolvimento!');
}

function editStore(storeId) {
    showNotification('🔧 Funcionalidade de edição em desenvolvimento!');
}

function editUser(userId) {
    showNotification('🔧 Funcionalidade de edição em desenvolvimento!');
}

function startRealtimeListeners() {
    database.ref('tasks').on('value', (snapshot) => {
        if (currentPage === 'dashboard') {
            loadDashboardData();
        } else if (currentPage === 'tasks') {
            loadTasks();
        }
    });

    database.ref('employees').on('value', (snapshot) => {
        if (currentPage === 'dashboard') {
            loadDashboardData();
        } else if (currentPage === 'employees') {
            loadEmployees();
        }
    });

    database.ref('stores').on('value', (snapshot) => {
        if (currentPage === 'stores') {
            loadStores();
        }
    });

    database.ref('users').on('value', (snapshot) => {
        if (currentPage === 'users') {
            loadUsers();
        }
    });
}

function initializeDefaultData() {
    database.ref('stores').once('value', (snapshot) => {
        if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
            const defaultStore = {
                name: 'Matriz',
                code: 'MAT001',
                address: 'Rua Principal, 123 - Centro',
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };
            database.ref('stores').push(defaultStore);
        }
    });
}

setTimeout(initializeDefaultData, 1000);
