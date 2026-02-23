// 1. Cole aqui as configurações que você copiou do Firebase
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

// 2. Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
console.log("✅ Firebase inicializado com sucesso!");

let usuarioAtual = "";
let perfilAtual = "";

function definirPerfil(perfil) {
    perfilAtual = perfil;
    
    if (perfil === 'gerente') {
        usuarioAtual = 'gerente';
        document.getElementById('area-gerente').classList.remove('hidden');
        document.getElementById('user-info').textContent = '👩‍💼 Você está logado como GERENTE';
    } else {
        // Pede o nome da funcionária
        const nome = prompt("Qual seu nome? (Ex: Ana, Beatriz, Carla ou Daniela)");
        if (!nome) {
            alert("Por favor, digite seu nome para continuar.");
            return;
        }
        usuarioAtual = nome;
        document.getElementById('area-gerente').classList.add('hidden');
        document.getElementById('user-info').textContent = `👩‍💻 Você está logada como ${nome.toUpperCase()}`;
    }
    
    // Esconde o seletor de perfil e mostra o conteúdo principal
    document.getElementById('perfil-selector').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    
    // Começa a "escutar" o banco de dados
    ouvirTarefas();
}

// 3. Função para a Gerente salvar no Banco de Dados
function criarTarefa() {
    const desc = document.getElementById('task-desc').value.trim();
    const para = document.getElementById('task-destinatario').value;

    if (!desc) {
        alert("Digite a descrição da tarefa!");
        return;
    }

    if (!para) {
        alert("Selecione uma destinatária!");
        return;
    }

    // "push" cria um novo item no banco com um ID único
    database.ref('tarefas').push({
        desc: desc,
        para: para,
        status: "Pendente",
        criadoEm: firebase.database.ServerValue.TIMESTAMP,
        criadoPor: usuarioAtual
    });

    // Limpa o formulário
    document.getElementById('task-desc').value = "";
    document.getElementById('task-destinatario').value = "";
    
    // Mostra confirmação
    mostrarNotificacao("✅ Tarefa enviada com sucesso!");
}

// 4. Função que atualiza a tela automaticamente quando algo muda no banco
function ouvirTarefas() {
    const lista = document.getElementById('lista-tarefas');
    
    database.ref('tarefas').on('value', (snapshot) => {
        lista.innerHTML = "";
        const dados = snapshot.val();
        
        if (!dados || Object.keys(dados).length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 2C7.89 2 7 2.89 7 4V20C7 21.11 7.89 22 9 22H15C16.11 22 17 21.11 17 20V4C17 2.89 16.11 2 15 2H9M9 4H15V20H9V4M10 6V8H14V6H10M10 10V12H14V10H10Z"/>
                    </svg>
                    <p>Nenhuma tarefa encontrada</p>
                    <p style="font-size: 14px; margin-top: 10px;">As tarefas aparecerão aqui em tempo real</p>
                </div>
            `;
            return;
        }
        
        // Converte o objeto em array e ordena por data de criação (mais recente primeiro)
        const tarefasArray = Object.entries(dados).map(([id, tarefa]) => ({
            id,
            ...tarefa
        })).sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));
        
        let temTarefas = false;
        
        for (let tarefa of tarefasArray) {
            // Filtro: Gerente vê tudo, funcionária vê só o dela
            if (perfilAtual === 'gerente' || tarefa.para === usuarioAtual) {
                temTarefas = true;
                const li = document.createElement('li');
                
                // Formata a data de criação
                let dataFormatada = '';
                if (tarefa.criadoEm) {
                    const data = new Date(tarefa.criadoEm);
                    dataFormatada = data.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                
                li.innerHTML = `
                    <span>
                        <strong>${tarefa.para}:</strong> ${tarefa.desc}
                        ${dataFormatada ? `<br><small style="color: #666; font-size: 12px;">📅 ${dataFormatada}</small>` : ''}
                    </span>
                    <button onclick="concluirTarefa('${tarefa.id}')" style="width:80px; margin:0">✅ Ok</button>
                `;
                lista.appendChild(li);
            }
        }
        
        if (!temTarefas) {
            lista.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 2C7.89 2 7 2.89 7 4V20C7 21.11 7.89 22 9 22H15C16.11 22 17 21.11 17 20V4C17 2.89 16.11 2 15 2H9M9 4H15V20H9V4M10 6V8H14V6H10M10 10V12H14V10H10Z"/>
                    </svg>
                    <p>Nenhuma tarefa encontrada para você</p>
                    <p style="font-size: 14px; margin-top: 10px;">As tarefas aparecerão aqui em tempo real</p>
                </div>
            `;
        }
    }, (error) => {
        console.error("Erro ao carregar tarefas:", error);
        mostrarNotificacao("❌ Erro ao carregar tarefas. Verifique sua conexão.");
    });
}

function concluirTarefa(id) {
    if (confirm("Tem certeza que deseja concluir esta tarefa?")) {
        // Remove a tarefa no Firebase
        database.ref('tarefas/' + id).remove()
            .then(() => {
                mostrarNotificacao("✅ Tarefa concluída com sucesso!");
            })
            .catch((error) => {
                console.error("Erro ao concluir tarefa:", error);
                mostrarNotificacao("❌ Erro ao concluir tarefa. Tente novamente.");
            });
    }
}

function mostrarNotificacao(mensagem) {
    // Remove notificação anterior se existir
    const notificacaoAntiga = document.getElementById('notificacao-temp');
    if (notificacaoAntiga) {
        notificacaoAntiga.remove();
    }
    
    // Cria nova notificação
    const notificacao = document.createElement('div');
    notificacao.id = 'notificacao-temp';
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notificacao.textContent = mensagem;
    
    // Adiciona animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notificacao);
    
    // Remove a notificação após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.remove();
            }
        }, 300);
    }, 3000);
}

// Adiciona atalhos de teclado
document.addEventListener('keydown', (event) => {
    // Ctrl + Enter para enviar tarefa (quando no formulário)
    if (event.ctrlKey && event.key === 'Enter') {
        const taskDesc = document.getElementById('task-desc');
        if (taskDesc && document.activeElement === taskDesc) {
            criarTarefa();
        }
    }
    
    // Esc para voltar ao seletor de perfil
    if (event.key === 'Escape') {
        if (!document.getElementById('perfil-selector').classList.contains('hidden')) {
            return;
        }
        
        if (confirm('Deseja voltar à tela de seleção de perfil?')) {
            document.getElementById('perfil-selector').classList.remove('hidden');
            document.getElementById('main-content').classList.add('hidden');
            usuarioAtual = '';
            perfilAtual = '';
        }
    }
});

// Trata erros de conexão com Firebase
window.addEventListener('online', () => {
    mostrarNotificacao("🌐 Conexão restaurada!");
});

window.addEventListener('offline', () => {
    mostrarNotificacao("📵 Sem conexão com a internet!");
});
