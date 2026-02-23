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
try {
    firebase.initializeApp(firebaseConfig);
    window.database = firebase.database();
    console.log("✅ Firebase inicializado com sucesso!");
    
    // Test connection
    window.database.ref('.info/connected').on('value', (snapshot) => {
        const connected = snapshot.val();
        console.log("🔗 Status da conexão Firebase:", connected ? "Conectado" : "Desconectado");
    });
} catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error);
}

const database = window.database;

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
    // Check for remembered user first
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
    
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
    document.getElementById('modalEmployeeForm')?.addEventListener('submit', handleCreateEmployee);
    document.getElementById('modalUserForm')?.addEventListener('submit', handleCreateUser);
    document.getElementById('modalPermissionsForm')?.addEventListener('submit', handleSavePermissions);
    document.getElementById('permissionsForm')?.addEventListener('submit', handleSavePermissions);
    document.getElementById('addStoreForm')?.addEventListener('submit', handleCreateStore);
    
    // Edit forms
    document.getElementById('editEmployeeForm')?.addEventListener('submit', handleEditEmployee);
    document.getElementById('editStoreForm')?.addEventListener('submit', handleEditStore);
    document.getElementById('editUserForm')?.addEventListener('submit', handleEditUser);
    
    // Phone formatting
    document.getElementById('modalEmployeePhone')?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
        }
        
        e.target.value = value;
    });
    
    document.getElementById('editEmployeePhone')?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
        }
        
        e.target.value = value;
    });
    
    // Tab switching (removido - agora usa botões diretos)
    
    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
            document.body.style.overflow = 'auto';
        }
    });
}

// Modal functions (globais)
function showAddEmployeeModal() {
    // Show modal first
    document.getElementById('addEmployeeModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Then load stores with delay
    setTimeout(() => {
        loadStoresSelect('modalEmployeeStore');
    }, 100);
}

function showAddStoreModal() {
    document.getElementById('addStoreModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function showPermissionsModal() {
    // Show modal first
    document.getElementById('permissionsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Then load employees with delay
    setTimeout(() => {
        loadEmployeesForPermissions();
    }, 100);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

function handleLogin(e) {
    e.preventDefault();
    console.log("🔐 Tentativa de login iniciada");
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    console.log("📧 Email digitado:", email);
    console.log("🔑 Senha digitada:", password ? "***" : "(vazia)");
    console.log("💾 Lembrar usuário:", rememberMe);

    if (email === 'admin@admin.com' && password === 'admin123') {
        console.log("✅ Login admin bem-sucedido");
        
        // Save email if remember me is checked
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        currentUser = {
            email: email,
            name: 'Administrador',
            role: 'admin',
            id: 'admin_001'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
        showNotification('✅ Login realizado com sucesso!');
        return; // Importante: sair da função aqui
    }
    
    console.log("🔍 Verificando usuários no Firebase...");
    database.ref('users').once('value', (snapshot) => {
        console.log("📊 Dados recebidos:", snapshot.val());
        const users = snapshot.val();
        let userFound = false;
        
        if (users) {
            for (let userId in users) {
                const user = users[userId];
                console.log("👤 Verificando usuário:", user.email);
                if (user.email === email && user.password === password) {
                    console.log("✅ Usuário encontrado:", user.name);
                    
                    // Save email if remember me is checked
                    if (rememberMe) {
                        localStorage.setItem('rememberedEmail', email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    
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
            console.log("❌ Nenhum usuário encontrado com essas credenciais");
            showNotification('❌ Email ou senha incorretos!');
        }
    }).catch((error) => {
        console.error("❌ Erro ao acessar Firebase:", error);
        showNotification('❌ Erro de conexão com o servidor!');
    });
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

    // Apply permissions based on user role and custom permissions
    applyUserPermissions();

    // Update floating buttons based on user role
    updateFloatingButtons();

    // Load page-specific data
    if (currentPage === 'tasks') {
        loadTasks();
        loadEmployeesSelect();
    } else if (currentPage === 'people') {
        loadEmployees();
    } else if (currentPage === 'stores') {
        loadStores();
    }
}

function updateFloatingButtons() {
    const fabContainer = document.querySelector('.fab-container');
    if (!fabContainer) return;

    if (currentUser.role === 'admin') {
        // Admin: Show buttons based on current page
        switch(currentPage) {
            case 'people':
                fabContainer.innerHTML = `
                    <button class="fab fab-primary" onclick="showAddEmployeeModal()" title="Adicionar Funcionário">
                        +
                    </button>
                `;
                break;
            case 'stores':
                fabContainer.innerHTML = `
                    <button class="fab fab-secondary" onclick="showAddStoreModal()" title="Adicionar Loja">
                        +
                    </button>
                `;
                break;
            case 'permissions':
                fabContainer.innerHTML = `
                    <button class="fab fab-tertiary" onclick="showPermissionsModal()" title="Gerenciar Permissões">
                        +
                    </button>
                `;
                break;
            case 'dashboard':
                fabContainer.innerHTML = `
                    <button class="fab fab-primary" onclick="showAddEmployeeModal()" title="Adicionar Funcionário">
                        +
                    </button>
                    <button class="fab fab-secondary" onclick="showAddStoreModal()" title="Adicionar Loja">
                        L
                    </button>
                    <button class="fab fab-tertiary" onclick="showPermissionsModal()" title="Gerenciar Permissões">
                        P
                    </button>
                `;
                break;
            default:
                // tasks e outras páginas: não mostrar botões
                fabContainer.innerHTML = '';
        }
    } else {
        // Employee: Show only add employee button when on people page
        if (currentPage === 'people') {
            fabContainer.innerHTML = `
                <button class="fab fab-primary" onclick="showAddEmployeeModal()" title="Adicionar Funcionário">
                    +
                </button>
            `;
        } else {
            fabContainer.innerHTML = '';
        }
    }
}

function applyUserPermissions() {
    // Admin always has all permissions
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.nav-admin-only').forEach(el => {
            el.classList.remove('hidden');
        });
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.remove('hidden');
        });
        return;
    }

    // For employees, check custom permissions
    database.ref('permissions/' + currentUser.id).once('value', (snapshot) => {
        const permissions = snapshot.val();
        const allowedPages = permissions ? permissions.pages : ['tasks']; // Default: only tasks

        // Hide all admin-only elements first
        document.querySelectorAll('.nav-admin-only').forEach(el => {
            el.classList.add('hidden');
        });
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.add('hidden');
        });

        // Show only allowed navigation items (NEVER include permissions for employees)
        allowedPages.forEach(page => {
            if (page !== 'permissions') { // Employees can never access permissions page
                const navItem = document.querySelector(`[data-page="${page}"]`);
                if (navItem) {
                    navItem.parentElement.classList.remove('hidden');
                }
            }
        });

        // If current page is not allowed, redirect to tasks
        if (!allowedPages.includes(currentPage)) {
            navigateToPage('tasks');
        }
    });
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
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error('Página não encontrada:', page + 'Page');
        return;
    }

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
        case 'people':
            loadEmployees();
            break;
        case 'stores':
            loadStores();
            break;
        case 'permissions':
            loadEmployeesForPermissions();
            loadPermissions();
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

    // Create recipient info with store if available
    let recipientInfo = task.employeeName || 'Não atribuído';
    if (task.storeName && task.storeName !== 'Não atribuído') {
        recipientInfo += ` - ${task.storeName}`;
    }
    if (task.employeeEmail) {
        recipientInfo += ` (${task.employeeEmail})`;
    }

    li.innerHTML = `
        <div class="task-header">
            <div class="task-recipient">${recipientInfo}</div>
            <div style="display: flex; gap: 8px;">
                <span class="task-status" style="background: ${priorityColors[task.priority] || '#64748b'}20; color: ${priorityColors[task.priority] || '#64748b'}">
                    ${task.priority === 'urgent' ? 'Urgente' : task.priority === 'normal' ? 'Normal' : 'Baixa'}
                </span>
                <span class="task-status" style="background: ${statusColors[task.status] || '#f59e0b'}20; color: ${statusColors[task.status] || '#f59e0b'}">
                    ${task.status === 'completed' ? 'Concluída' : 'Pendente'}
                </span>
                ${task.assignedToType === 'user' ? '<span class="task-status" style="background: #f59e0b20; color: #f59e0b">Usuário</span>' : ''}
                ${task.assignedToType === 'admin' ? '<span class="task-status" style="background: #2563eb20; color: #2563eb">Administrador</span>' : ''}
            </div>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="task-meta">
            <span>${createdAt}</span>
            <div style="display: flex; gap: 8px;">
                ${task.status !== 'completed' ? `
                    <button class="btn btn-success" onclick="completeTask('${task.id}')" style="padding: 4px 8px; font-size: 12px;">
                        ✓ Concluir
                    </button>
                ` : ''}
                <button class="btn btn-danger" onclick="deleteTask('${task.id}')" style="padding: 4px 8px; font-size: 12px;">
                    🗑️ Excluir
                </button>
            </div>
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
            
            // Show tasks assigned to current user or all tasks for admin
            if (currentUser.role === 'admin') {
                userTasks.push({ id: taskId, ...task });
            } else if (task.assignedTo === currentUser.id) {
                userTasks.push({ id: taskId, ...task });
            }
        }

        // Sort by priority and date
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
    // Load employees
    database.ref('employees').once('value', (empSnapshot) => {
        const employees = empSnapshot.val();
        
        // Load users
        database.ref('users').once('value', (userSnapshot) => {
            const users = userSnapshot.val();
            const peopleTable = document.getElementById('peopleTable');
            
            if ((!employees || Object.keys(employees).length === 0) && 
                (!users || Object.keys(users).length === 0)) {
                peopleTable.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">
                            <div class="empty-state">
                                <p>Nenhuma pessoa cadastrada</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            peopleTable.innerHTML = '';
            
            // Add employees
            if (employees) {
                for (let employeeId in employees) {
                    const employee = employees[employeeId];
                    const tr = document.createElement('tr');
                    
                    tr.innerHTML = `
                        <td>${employee.name}</td>
                        <td>${employee.email}</td>
                        <td>Funcionário</td>
                        <td><span class="task-status status-pending">Ativo</span></td>
                        <td>${employee.storeName || 'Não atribuído'}</td>
                        <td>${employee.phone || '-'}</td>
                        <td>
                            <button class="btn btn-primary" onclick="editEmployee('${employeeId}')" style="padding: 4px 8px; font-size: 12px;">
                                Editar
                            </button>
                            <button class="btn btn-danger" onclick="deleteEmployee('${employeeId}')" style="padding: 4px 8px; font-size: 12px;">
                                Excluir
                            </button>
                        </td>
                    `;
                    
                    peopleTable.appendChild(tr);
                }
            }
            
            // Add users (admins)
            if (users) {
                for (let userId in users) {
                    const user = users[userId];
                    if (user.role === 'admin') {
                        const tr = document.createElement('tr');
                        
                        tr.innerHTML = `
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>Administrador</td>
                            <td><span class="task-status status-pending">Ativo</span></td>
                            <td>-</td>
                            <td>-</td>
                            <td>
                                <button class="btn btn-primary" onclick="editUser('${userId}')" style="padding: 4px 8px; font-size: 12px;">
                                    Editar
                                </button>
                                <button class="btn btn-danger" onclick="deleteUser('${userId}')" style="padding: 4px 8px; font-size: 12px;">
                                    Excluir
                                </button>
                            </td>
                        `;
                        
                        peopleTable.appendChild(tr);
                    }
                }
            }
        });
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
            
            tr.innerHTML = `
                <td>${store.name}</td>
                <td>${store.code}</td>
                <td>${store.address || 'Não informado'}</td>
                <td><span class="task-status status-pending">Ativa</span></td>
                <td>
                    <button class="btn btn-primary" onclick="editStore('${storeId}')" style="padding: 4px 8px; font-size: 12px;">
                        Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteStore('${storeId}')" style="padding: 4px 8px; font-size: 12px;">
                        Excluir
                    </button>
                </td>
            `;
            
            storesTable.appendChild(tr);
        }
    });
}

function loadStoresSelect(selectId = 'modalEmployeeStore') {
    database.ref('stores').once('value', (snapshot) => {
        const stores = snapshot.val();
        const select = document.getElementById(selectId);
        
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

function handleEditEmployee(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('editEmployeeId').value;
    const name = document.getElementById('editEmployeeName').value;
    const storeId = document.getElementById('editEmployeeStore').value;
    const email = document.getElementById('editEmployeeEmail').value;
    const phone = document.getElementById('editEmployeePhone').value;
    const password = document.getElementById('editEmployeePassword').value;
    const role = document.getElementById('editEmployeeRole').value;
    
    if (!name || !storeId || !email) {
        showNotification('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    if (password && password.length < 6) {
        showNotification('❌ A senha deve ter pelo menos 6 caracteres!');
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
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Update employee
        database.ref('employees/' + employeeId).update(employee).then(() => {
            // Also update user if password or role changed
            if (password || role) {
                const userUpdate = { updatedAt: firebase.database.ServerValue.TIMESTAMP };
                if (password) userUpdate.password = password;
                if (role) userUpdate.role = role;
                
                // Find user by email and update
                database.ref('users').orderByChild('email').equalTo(email).once('value', (snapshot) => {
                    const users = snapshot.val();
                    if (users) {
                        const userId = Object.keys(users)[0];
                        database.ref('users/' + userId).update(userUpdate);
                    }
                });
            }
            
            document.getElementById('editEmployeeForm').reset();
            closeModal('editEmployeeModal');
            showNotification('✅ Funcionário atualizado com sucesso!');
            loadEmployees();
            loadDashboardData();
        }).catch((error) => {
            showNotification('❌ Erro ao atualizar funcionário!');
            console.error(error);
        });
    });
}

function handleEditStore(e) {
    e.preventDefault();
    
    const storeId = document.getElementById('editStoreId').value;
    const name = document.getElementById('editStoreName').value;
    const code = document.getElementById('editStoreCode').value;
    const address = document.getElementById('editStoreAddress').value;
    
    if (!name || !code || !address) {
        showNotification('❌ Preencha todos os campos!');
        return;
    }
    
    const store = {
        name: name,
        code: code,
        address: address,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    database.ref('stores/' + storeId).update(store).then(() => {
        document.getElementById('editStoreForm').reset();
        closeModal('editStoreModal');
        showNotification('✅ Loja atualizada com sucesso!');
        loadStores();
        loadDashboardData();
    }).catch((error) => {
        showNotification('❌ Erro ao atualizar loja!');
        console.error(error);
    });
}

function handleEditUser(e) {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const password = document.getElementById('editUserPassword').value;
    const role = document.getElementById('editUserRole').value;
    
    if (!name || !email) {
        showNotification('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    if (password && password.length < 6) {
        showNotification('❌ A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    const user = {
        name: name,
        email: email,
        role: role,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    if (password) {
        user.password = password;
    }
    
    database.ref('users/' + userId).update(user).then(() => {
        document.getElementById('editUserForm').reset();
        closeModal('editUserModal');
        showNotification('✅ Usuário atualizado com sucesso!');
        loadEmployees();
    }).catch((error) => {
        showNotification('❌ Erro ao atualizar usuário!');
        console.error(error);
    });
}

function loadEmployeesSelect() {
    // Load employees for selection
    database.ref('employees').once('value', (snapshot) => {
        const employees = snapshot.val();
        const select = document.getElementById('taskEmployee');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um destinatário</option>';
        
        if (employees) {
            for (let employeeId in employees) {
                const employee = employees[employeeId];
                const option = document.createElement('option');
                option.value = employeeId;
                
                let displayName = employee.name;
                if (employee.storeName) {
                    displayName += ` - ${employee.storeName}`;
                }
                if (employee.email) {
                    displayName += ` (${employee.email})`;
                }
                
                option.textContent = displayName;
                select.appendChild(option);
            }
        }
        
        database.ref('users').once('value', (userSnapshot) => {
            const users = userSnapshot.val();
            if (users) {
                for (let userId in users) {
                    const user = users[userId];
                    
                    // Only include admin users
                    if (user.role === 'admin') {
                        const option = document.createElement('option');
                        option.value = userId;
                        option.textContent = `${user.name} (${user.email}) - Administrador`;
                        option.style.color = '#2563eb'; // Blue color for distinction
                        select.appendChild(option);
                    }
                }
            }
        });
    });
}


function handleCreateTask(e) {
    e.preventDefault();
    
    const recipientId = document.getElementById('taskEmployee').value;
    const priority = document.getElementById('taskPriority').value;
    const description = document.getElementById('taskDescription').value;
    
    if (!recipientId || !description) {
        showNotification('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    // Check if it's an employee or admin user
    database.ref('employees/' + recipientId).once('value', (empSnapshot) => {
        const employee = empSnapshot.val();
        
        if (employee) {
            // It's a proper employee record
            const task = {
                assignedTo: recipientId,
                assignedToType: 'employee',
                employeeName: employee.name,
                employeeEmail: employee.email,
                storeName: employee.storeName,
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
        } else {
            // Check if it's an admin user
            database.ref('users/' + recipientId).once('value', (userSnapshot) => {
                const user = userSnapshot.val();
                
                if (user && user.role === 'admin') {
                    const task = {
                        assignedTo: recipientId,
                        assignedToType: 'admin',
                        employeeName: user.name,
                        employeeEmail: user.email,
                        storeName: 'Administrador',
                        priority: priority,
                        description: description,
                        status: 'pending',
                        createdBy: currentUser.id,
                        createdAt: firebase.database.ServerValue.TIMESTAMP
                    };
                    
                    database.ref('tasks').push(task).then(() => {
                        document.getElementById('createTaskForm').reset();
                        showNotification('✅ Tarefa criada para administrador!');
                        loadTasks();
                        loadDashboardData();
                    }).catch((error) => {
                        showNotification('❌ Erro ao criar tarefa!');
                        console.error(error);
                    });
                } else {
                    showNotification('❌ Destinatário não encontrado!');
                }
            });
        }
    });
}

function handleCreateEmployee(e) {
    e.preventDefault();
    
    const name = document.getElementById('modalEmployeeName').value;
    const storeId = document.getElementById('modalEmployeeStore').value;
    const email = document.getElementById('modalEmployeeEmail').value;
    const phone = document.getElementById('modalEmployeePhone').value;
    const password = document.getElementById('modalEmployeePassword').value;
    const role = document.getElementById('modalEmployeeRole').value;
    
    if (!name || !storeId || !email || !password) {
        showNotification('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    if (password.length < 6) {
        showNotification('❌ A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    database.ref('stores/' + storeId).once('value', (snapshot) => {
        const store = snapshot.val();
        
        // Criar usuário para login primeiro para obter o ID
        const user = {
            email: email,
            password: password,
            name: name,
            role: role,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Salvar usuário primeiro para obter o ID
        database.ref('users').push(user).then((userSnapshot) => {
            const userId = userSnapshot.key;
            
            // Criar funcionário com o MESMO ID
            const employee = {
                name: name,
                storeId: storeId,
                storeName: store.name,
                email: email,
                phone: phone,
                userId: userId, // Referência para o usuário
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            // Salvar funcionário com o ID do usuário
            database.ref('employees/' + userId).set(employee).then(() => {
                document.getElementById('modalEmployeeForm').reset();
                closeModal('addEmployeeModal');
                showNotification('✅ Funcionário e usuário criados com sucesso!');
                loadEmployees();
                loadUsers();
                loadDashboardData();
            }).catch((error) => {
                showNotification('❌ Erro ao criar funcionário!');
                console.error(error);
            });
        }).catch((error) => {
            showNotification('❌ Erro ao criar usuário!');
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
        document.getElementById('addStoreForm').reset();
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
        document.getElementById('modalUserForm').reset();
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

function deleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        database.ref('tasks/' + taskId).remove().then(() => {
            showNotification('✅ Tarefa excluída com sucesso!');
            loadTasks();
            loadDashboardData();
        }).catch((error) => {
            showNotification('❌ Erro ao excluir tarefa!');
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
    database.ref('employees/' + employeeId).once('value', (snapshot) => {
        const employee = snapshot.val();
        if (!employee) return;

        // Show modal first
        document.getElementById('editEmployeeModal').style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Then load stores and fill form
        setTimeout(() => {
            loadStoresSelect('editEmployeeStore');
            
            // Fill form with employee data
            document.getElementById('editEmployeeId').value = employeeId;
            document.getElementById('editEmployeeName').value = employee.name;
            document.getElementById('editEmployeeEmail').value = employee.email;
            document.getElementById('editEmployeePhone').value = employee.phone || '';
            document.getElementById('editEmployeeStore').value = employee.storeId || '';
            document.getElementById('editEmployeePassword').value = ''; // Don't show current password
            document.getElementById('editEmployeeRole').value = employee.role || 'employee';
        }, 100);
    });
}

function editStore(storeId) {
    database.ref('stores/' + storeId).once('value', (snapshot) => {
        const store = snapshot.val();
        if (!store) return;

        // Fill form with store data
        document.getElementById('editStoreId').value = storeId;
        document.getElementById('editStoreName').value = store.name;
        document.getElementById('editStoreCode').value = store.code;
        document.getElementById('editStoreAddress').value = store.address;

        // Show modal
        document.getElementById('editStoreModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
}

function editUser(userId) {
    database.ref('users/' + userId).once('value', (snapshot) => {
        const user = snapshot.val();
        if (!user) return;

        // Fill form with user data
        document.getElementById('editUserId').value = userId;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;
        document.getElementById('editUserPassword').value = ''; // Don't show current password

        // Show modal
        document.getElementById('editUserModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
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
        } else if (currentPage === 'permissions') {
            loadPermissions();
        }
    });

    database.ref('stores').on('value', (snapshot) => {
        if (currentPage === 'stores') {
            loadStores();
        }
    });

    database.ref('users').on('value', (snapshot) => {
        if (currentPage === 'people') {
            loadEmployees();
        }
    });

    database.ref('permissions').on('value', (snapshot) => {
        if (currentPage === 'permissions') {
            loadPermissions();
        }
    });
}

function loadEmployeesForPermissions() {
    // Load employees for selection (from employees table, not users)
    database.ref('employees').once('value', (snapshot) => {
        const employees = snapshot.val();
        
        // Load for main form select
        const select = document.getElementById('permissionEmployee');
        if (select) {
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
        }
        
        // Load for modal select
        const modalSelect = document.getElementById('modalPermissionEmployee');
        if (modalSelect) {
            modalSelect.innerHTML = '<option value="">Selecione um funcionário</option>';
            
            if (employees) {
                for (let employeeId in employees) {
                    const employee = employees[employeeId];
                    const option = document.createElement('option');
                    option.value = employeeId;
                    option.textContent = `${employee.name} - ${employee.storeName || 'Sem loja'}`;
                    modalSelect.appendChild(option);
                }
            }
        }
    });
}

function loadPermissions() {
    // Load existing permissions
    database.ref('permissions').once('value', (snapshot) => {
        const permissions = snapshot.val();
        const permissionsTable = document.getElementById('permissionsTable');
        
        if (!permissions || Object.keys(permissions).length === 0) {
            permissionsTable.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        <div class="empty-state">
                            <p>Nenhuma permissão configurada</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        permissionsTable.innerHTML = '';
        
        for (let userId in permissions) {
            const userPermissions = permissions[userId];
            
            // Get employee name
            database.ref('employees/' + userId).once('value', (empSnapshot) => {
                const employee = empSnapshot.val();
                if (!employee) return;
                
                const tr = document.createElement('tr');
                
                const pagesText = userPermissions.pages.map(page => {
                    const pageNames = {
                        'tasks': '📋 Tarefas',
                        'dashboard': '📊 Dashboard',
                        'employees': '👥 Funcionários',
                        'stores': '🏪 Lojas'
                    };
                    return pageNames[page] || page;
                }).join(', ');
                
                tr.innerHTML = `
                    <td>${employee.name}</td>
                    <td>${employee.email}</td>
                    <td>${pagesText}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deletePermissions('${userId}')" style="padding: 4px 8px; font-size: 12px;">
                            🗑️ Remover
                        </button>
                    </td>
                `;
                
                permissionsTable.appendChild(tr);
            });
        }
    });
}

function handleSavePermissions(e) {
    e.preventDefault();
    
    // Try to get from modal first, then from main form
    let employeeId = document.getElementById('modalPermissionEmployee')?.value;
    if (!employeeId) {
        employeeId = document.getElementById('permissionEmployee')?.value;
    }
    
    if (!employeeId) {
        showNotification('❌ Selecione um funcionário!');
        return;
    }
    
    // Get selected permissions (try modal first, then main form)
    let checkboxes = document.querySelectorAll('input[name="modalPermissions"]:checked');
    if (checkboxes.length === 0) {
        checkboxes = document.querySelectorAll('input[name="permissions"]:checked');
    }
    const pages = Array.from(checkboxes).map(cb => cb.value);
    
    // Always include 'tasks' as it's mandatory
    if (!pages.includes('tasks')) {
        pages.push('tasks');
    }
    
    const permissionData = {
        pages: pages,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
        updatedBy: currentUser.id
    };
    
    database.ref('permissions/' + employeeId).set(permissionData).then(() => {
        // Reset both forms
        document.getElementById('permissionsForm')?.reset();
        document.getElementById('modalPermissionsForm')?.reset();
        closeModal('permissionsModal');
        showNotification('✅ Permissões salvas com sucesso!');
        loadPermissions();
    }).catch((error) => {
        showNotification('❌ Erro ao salvar permissões!');
        console.error(error);
    });
}

function deletePermissions(userId) {
    if (confirm('Tem certeza que deseja remover as permissões personalizadas deste funcionário?')) {
        database.ref('permissions/' + userId).remove().then(() => {
            showNotification('✅ Permissões removidas com sucesso!');
            loadPermissions();
        }).catch((error) => {
            showNotification('❌ Erro ao remover permissões!');
            console.error(error);
        });
    }
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
