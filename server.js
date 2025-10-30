import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'frontend'));

const app = express();

const nameArray = [];

app.use(connectLiveReload());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT_HTTP = 5000;

app.listen(PORT_HTTP, () => {
    console.log(`App rodando na porta ${PORT_HTTP}!`);
});

const PORT_WS = 8080;
const wss = new WebSocketServer({ port: PORT_WS });

wss.on('connection', (ws) => {
    console.log('Cliente conectado');
    console.log(nameArray);

    ws.on('message', (data) => {
        const message = data.toString();

        if ((message === "Luiz Henrique Soares da Silva" ||
            message === "Caroline Anne Caldeira"
        ) && !nameArray.includes(message)) {
            if (!ws.userName) {
                ws.userName = message;
                if (!nameArray.includes(message)) {
                    nameArray.push(message);
                    console.log('Usuários conectados:', nameArray);
                }

                wss.clients.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        client.send(`${ws.userName} entrou na sala.`);
                    }
                });
                return;
            }

            nameArray.push(message);
            console.log(nameArray);
        }

        ws.send(`Servidor recebeu: ${data}`);
    });

    ws.on('close', () => {
        if (ws.userName) {
            const index = nameArray.indexOf(ws.userName);
            if (index !== -1) nameArray.splice(index, 1);

            console.log(`${ws.userName} saiu`);
            console.log('Usuários conectados:', nameArray);

            wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    client.send(`${ws.userName} saiu da sala.`);
                }
            });
        }
    });

    ws.on('error', (error) => {
        console.error('Erro no WebSocket:', error);
    });

    ws.send('Bem-vindo ao servidor WebSocket!');
});

console.log(`WebSocket rodando na porta ${PORT_WS}`);

liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 100);
});