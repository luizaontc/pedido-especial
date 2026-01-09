import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const nameArray = [];

// servir frontend
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// websocket
wss.on("connection", (ws) => {
    console.log("Cliente conectado");
    console.log(nameArray);

    ws.on("message", (data) => {
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

                console.log(nameArray.length);

                if (nameArray.length === 2) {
                    broadcast({
                        type: "start_presentation",
                        user: "",
                        users: nameArray
                    });
                }
            }

            return;
        }
    });

    ws.on("close", () => {
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

// broadcast helper
function broadcast(payload) {
    const msg = JSON.stringify(payload);

    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(msg);
        }
    });
}

// inicia tudo (HTTP + WS)
server.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT);
});
