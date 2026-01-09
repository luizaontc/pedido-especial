let ws;
connectWS();


function connectWS() {
    ws = new WebSocket(`ws://localhost:8080`);

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


async function iniciarApresentacao() {
    const overlay = document.getElementsByClassName("overlay")[0];
    overlay.style.display = "block";

    const contador = document.getElementById("contador");
    let valor = parseInt(contador.textContent, 10);

    const inputDivs = document.getElementsByClassName("input-divs")[0];
    const primeiraApresentacao = document.getElementsByClassName("primeira-apresentacao")[0];

    console.log(inputDivs);
    
    const intervalo = setInterval(() => {
        valor--;
        contador.textContent = valor;

        if (valor <= 0) {
            clearInterval(intervalo);
            overlay.style.display = "none";
            inputDivs.classList.add("sumir-div");
            primeiraApresentacao.classList.add("aparecer-div");
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