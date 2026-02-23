# 📋 Sistema de Tarefas em Tempo Real

Sistema completo para gerenciamento de tarefas entre gerente e funcionárias usando **Firebase Realtime Database**.

## ✨ Funcionalidades

- 🔄 **Sincronização em tempo real** - As tarefas aparecem instantaneamente em todos os dispositivos
- 👥 **Múltiplos usuários** - Gerente pode atribuir tarefas para diferentes funcionárias
- 📱 **Interface responsiva** - Funciona perfeitamente em computadores, tablets e celulares
- 🔔 **Notificações visuais** - Feedback visual para todas as ações
- ⌨️ **Atalhos de teclado** - Ctrl+Enter para enviar, Esc para voltar
- 🌐 **Offline detection** - Detecta quando há problemas de conexão

## 🚀 Configuração Rápida

### 1. Criar Projeto Firebase

1. Acesse [Console do Firebase](https://console.firebase.google.com/)
2. Clique em **"Adicionar Projeto"** e dê um nome (ex: "SistemaTrabalho")
3. No menu lateral, vá em **Criação > Realtime Database**
4. Clique em **"Criar Banco de Dados"**
5. Escolha o local e em **"Regras"** selecione **"Modo de Teste"**
6. Em **Configurações do Projeto > Geral**, clique no ícone `</>` para registrar um App Web
7. Copie o objeto `firebaseConfig`

### 2. Configurar o Sistema

1. Abra o arquivo `script.js`
2. Substitua as configurações do Firebase:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

### 3. Usar o Sistema

1. Abra `index.html` no navegador
2. Escolha o perfil: **Gerente** ou **Funcionária**
3. **Gerente**: Pode criar e atribuir tarefas
4. **Funcionária**: Digita seu nome e vê apenas suas tarefas

## 📁 Estrutura dos Arquivos

```
Lista/
├── index.html          # Interface principal do sistema
├── script.js           # Lógica do Firebase e funcionalidades
└── README.md           # Este arquivo de instruções
```

## 👥 Perfis de Usuário

### 👩‍💼 Gerente
- ✅ Visualiza todas as tarefas
- ✅ Cria novas tarefas
- ✅ Atribui tarefas para funcionárias específicas
- ✅ Conclui tarefas

### 👩‍💻 Funcionária
- ✅ Visualiza apenas suas tarefas
- ✅ Conclui suas tarefas
- ❌ Não pode criar tarefas

## 🎯 Como Testar

1. Abra o sistema em duas abas/janelas diferentes
2. Na primeira, acesse como **Gerente**
3. Na segunda, acesse como **Funcionária** e digite um nome (ex: "Ana")
4. Crie uma tarefa como gerente e veja aparecer instantaneamente na outra aba!

## 🔧 Personalização

### Adicionar Novas Funcionárias

No arquivo `index.html`, localize o select de destinatários:

```html
<select id="task-destinatario" required>
    <option value="">Selecione uma funcionária</option>
    <option value="Ana">Ana</option>
    <option value="Beatriz">Beatriz</option>
    <!-- Adicione novas opções aqui -->
    <option value="NovaFuncionaria">Nova Funcionária</option>
</select>
```

### Mudar Cores e Estilos

O CSS está embutido no `index.html`. Você pode modificar:
- Cores principais: procure por `linear-gradient`
- Cores dos botões: `.btn-gerente`, `.btn-funcionaria`
- Layout responsivo: media queries no final do CSS

## 🌐 Deploy Gratuito

Para colocar o sistema online:

### Opção 1: GitHub Pages
1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Em Settings > Pages, ative o GitHub Pages
4. Seu site ficará disponível em `https://seu-usuario.github.io/seu-repositorio`

### Opção 2: Netlify
1. Acesse [Netlify](https://netlify.com)
2. Arraste a pasta do projeto para a área de upload
3. Site publicado instantaneamente com URL aleatória

## 🔒 Segurança

**Importante**: O sistema está configurado em "Modo de Teste" que permite leitura/escrita pública por 30 dias. Para produção, configure as regras do Firebase:

```javascript
{
  "rules": {
    "tarefas": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 🐛 Solução de Problemas

### Tarefas não aparecem
- Verifique se as configurações do Firebase estão corretas
- Confirme que o databaseURL está correto
- Verifique o console do navegador por erros

### Erro de permissão
- Verifique as regras do Realtime Database
- Confirme que está em "Modo de Teste" para testes

### Conexão lenta
- Verifique sua conexão com a internet
- O sistema funciona offline mas só sincroniza quando voltar online

## 📞 Suporte

Se precisar de ajuda:
1. Verifique o console do navegador (F12)
2. Confirme as configurações do Firebase
3. Teste com diferentes navegadores

---

**Desenvolvido com ❤️ usando Firebase Realtime Database**
