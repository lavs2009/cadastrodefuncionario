// Variável global para armazenar a instância do banco de dados
let dbInstance = null;

// Inicializa o banco de dados
const request = indexedDB.open("FuncionariosDB", 1);

request.onupgradeneeded = function (event) {
    let db = event.target.result;
    let store = db.createObjectStore("funcionarios", { keyPath: "id", autoIncrement: true });
    store.createIndex("nome", "nome", { unique: false });
    store.createIndex("cpf", "cpf", { unique: true });
    store.createIndex("email", "email", { unique: true });
    store.createIndex("telefone", "telefone", { unique: true });
    store.createIndex("cargo", "cargo", { unique: false });
};

request.onsuccess = function (event) {
    console.log("Banco de dados carregado com sucesso!");
    dbInstance = event.target.result; // armazena a instância do banco
    listarFuncionarios(); // Chama a função após o banco estar disponível
};

request.onerror = function (event) {
    console.error("Erro ao abrir o IndexedDB:", event.target.error);
};

// Função auxiliar para verificar se o banco de dados foi carregado corretamente
function verificarDB() {
    if (!dbInstance) {
        console.error("O banco de dados não foi carregado corretamente.");
        return null;
    }
    return dbInstance;
}

// Captura o evento de envio do formulário
document.querySelector(".add_names").addEventListener("submit", function (event) {
    event.preventDefault();
    let funcionario = {
        nome: document.querySelector("#nome").value,
        cpf: document.querySelector("#cpf").value,
        email: document.querySelector("#email").value,
        telefone: document.querySelector("#telefone").value,
        data_nascimento: document.querySelector("#data_nascimento").value,
        cargo: document.querySelector("#cargo").value
    };

    adicionarFuncionario(funcionario);
});

// Função para listar funcionários
function listarFuncionarios() {
    let db = verificarDB();
    if (!db) {
        mostrarFeedback("Erro ao carregar banco de dados!", "error");
        return;
    }

    let transaction = db.transaction("funcionarios", "readonly");
    let store = transaction.objectStore("funcionarios");

    let listaFuncionarios = document.querySelector(".your_dates");
    listaFuncionarios.innerHTML = "";

    let cursorRequest = store.openCursor();
    cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let funcionario = cursor.value;
            listaFuncionarios.innerHTML += `<p>ID: ${funcionario.id} - Nome: ${funcionario.nome} - CPF: ${funcionario.cpf}</p>`;
            cursor.continue();
        } else {
            mostrarFeedback("Lista de funcionários carregada com sucesso!", "success");
        }
    };

    cursorRequest.onerror = function (event) {
        console.error("Erro ao listar funcionários:", event.target.error);
        mostrarFeedback("Erro ao listar funcionários!", "error");
    };
}

// Função para adicionar funcionário
function adicionarFuncionario(funcionario) {
    let db = verificarDB();
    if (!db) return;

    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let addRequest = store.add(funcionario);
    addRequest.onsuccess = function () {
        console.log("Funcionário adicionado com sucesso!");
        mostrarFeedback("Funcionário cadastrado com sucesso!", "success");
        listarFuncionarios();
    };

    addRequest.onerror = function (event) {
        console.error("Erro ao adicionar funcionário:", event.target.error);
        mostrarFeedback("Erro ao cadastrar funcionário!", "error");
    };
}

// Função para atualizar funcionário
function atualizarFuncionario(id, novosDados) {
    let db = verificarDB();
    if (!db) return;

    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let getRequest = store.get(id);
    getRequest.onsuccess = function () {
        let funcionario = getRequest.result;
        if (funcionario) {
            Object.assign(funcionario, novosDados);
            let updateRequest = store.put(funcionario);
            updateRequest.onsuccess = function () {
                console.log("Funcionário atualizado com sucesso!");
                mostrarFeedback("Dados atualizados com sucesso!", "success");
                listarFuncionarios();
            };

            updateRequest.onerror = function (event) {
                console.error("Erro ao atualizar funcionário:", event.target.error);
                mostrarFeedback("Erro ao atualizar funcionário!", "error");
            };
        }
    };

    getRequest.onerror = function (event) {
        console.error("Erro ao obter funcionário para atualização:", event.target.error);
        mostrarFeedback("Erro ao carregar funcionário para atualização!", "error");
    };
}

// Função para deletar funcionário
function deletarFuncionario(id) {
    let db = verificarDB();
    if (!db) return;

    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let deleteRequest = store.delete(id);
    deleteRequest.onsuccess = function () {
        console.log("Funcionário deletado com sucesso!");
        mostrarFeedback("Funcionário removido com sucesso!", "success");
        listarFuncionarios();
    };

    deleteRequest.onerror = function (event) {
        console.error("Erro ao deletar funcionário:", event.target.error);
        mostrarFeedback("Erro ao remover funcionário!", "error");
    };
}

// Mostrar feedback visual
function mostrarFeedback(mensagem, tipo) {
    let feedback = document.getElementById("feedback-msg");
    feedback.textContent = mensagem;
    feedback.className = `feedback ${tipo}`;
    feedback.style.display = "block";

    setTimeout(() => {
        feedback.style.display = "none";
    }, 3000);
}

// Chamada inicial para listar funcionários ao carregar a página
window.onload = listarFuncionarios;
