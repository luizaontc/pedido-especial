let ws;

console.log("GSAP version:", gsap.version);



function connectWS() {
    ws = new WebSocket(`ws://localhost:8080`);

    ws.onopen = () => console.log('Conectado!');
    ws.onmessage = (e) => {
        console.log('Servidor disse:', e.data)

        const message = e.data;

        if (message.includes("na sala")) {
            inserirMensagem(e.data);
        }
    };

    ws.onclose = () => {
        console.log('Desconectado. Tentando reconectar...');
        limparMensagens();
        setTimeout(connectWS, 2000);
    };

}

// connectWS();

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