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

        if (!ws.userName) {
            if (
                message === "Luiz Henrique Soares da Silva" ||
                message === "Caroline Anne Caldeira"
            ) {
                ws.userName = message;

                if (!nameArray.includes(message)) {
                    nameArray.push(message);
                }

                broadcast({
                    type: "user_join",
                    user: ws.userName,
                    users: nameArray
                });
            }

            console.log(nameArray.length);
            if (nameArray.length === 2) {
                broadcast({ type: "start_presentation", user: "", users: nameArray })

            }
            return;
        }


    });

    ws.on('close', () => {
        if (ws.userName) {
            const index = nameArray.indexOf(ws.userName);
            if (index !== -1) nameArray.splice(index, 1);

            broadcast({
                type: "user_leave",
                user: ws.userName,
                users: nameArray
            });
        }
    });

    ws.send(JSON.stringify({
        type: "welcome",
        users: nameArray
    }));
});

function broadcast(payload) {
    const msg = JSON.stringify(payload);

    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(msg);
        }
    });
}

console.log(`WebSocket rodando na porta ${PORT_WS}`);

liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 100);
});