let ws;
let intervalo = null;
connectWS();


function connectWS() {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    ws = new WebSocket(`${protocol}://${location.host}`);

    ws.onopen = () => console.log('Conectado!');

    ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);

        console.log(e);

        if (msg.type === "welcome") {
            renderUsuarios(msg.users);
        }

        if (msg.type === "user_join") {
            inserirMensagem(`${msg.user} entrou na sala`);
            renderUsuarios(msg.users);
        }

        if (msg.type === "user_leave") {
            inserirMensagem(`${msg.user} saiu da sala`);
            renderUsuarios(msg.users);
            reiniciarTudo();
        }

        if (msg.type === "start_presentation") {
            iniciarApresentacao();
        }
    };

    ws.onclose = () => {
        limparMensagens();
        setTimeout(connectWS, 2000);
    };
}

function reiniciarTudo() {
    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }

    const inputDivs = document.getElementsByClassName("input-divs")[0];
    const primeiraApresentacao = document.getElementsByClassName("primeira-apresentacao")[0];
    const overlay = document.getElementsByClassName("overlay")[0];
    const contador = document.getElementById("contador");

    contador.textContent = "3"; // ou valor inicial
    overlay.style.display = "none";

    inputDivs.classList.remove("sumir-div");
    inputDivs.style.display = "flex";

    primeiraApresentacao.classList.remove("aparecer-div");
    primeiraApresentacao.style.display = "none";
}

function iniciarApresentacao() {
    reiniciarTudo(); // garante estado limpo

    const overlay = document.getElementsByClassName("overlay")[0];
    const contador = document.getElementById("contador");
    const inputDivs = document.getElementsByClassName("input-divs")[0];
    const primeiraApresentacao = document.getElementsByClassName("primeira-apresentacao")[0];

    overlay.style.display = "block";

    let valor = parseInt(contador.textContent, 10);

    intervalo = setInterval(() => {
        valor--;
        contador.textContent = valor;

        if (valor <= 0) {
            clearInterval(intervalo);
            intervalo = null;

            overlay.style.display = "none";

            inputDivs.classList.add("sumir-div");
            setTimeout(() => {
                inputDivs.style.display = "none";
                primeiraApresentacao.classList.add("aparecer-div");
                primeiraApresentacao.style.display = "flex";
            }, 500);
        }
    }, 1000);
}

function renderUsuarios(users) {
    const container = document.getElementById('resposta-ws');
    container.innerHTML = '';

    users.forEach(u => {
        const li = document.createElement('li');
        li.textContent = u;
        container.appendChild(li);
    });
}

document.getElementById('entrar').addEventListener('click', () => {
    const nome = document.getElementById('nome').value.trim();

    if (!nome) {
        alert('Digite um nome primeiro!');
        return;
    }
    console.log('Estado:', ws.readyState);

    ws.send(nome);
});

document.getElementById('fechar').addEventListener('click', () => {
    ws.close();
});

function inserirMensagem(data) {
    const respostaWs = document.getElementById('resposta-ws');

    const p = document.createElement('p');
    p.textContent = data;

    respostaWs.appendChild(p);

    respostaWs.scrollTop = respostaWs.scrollHeight;
    respostaWs.style.display = 'flex';
}

function limparMensagens() {
    const respostaWs = document.getElementById('resposta-ws');

    respostaWs.innerHTML = '';

    respostaWs.style.display = 'none';
}
