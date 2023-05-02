const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const http = require("http");
const { Server } = require("socket.io");

const { connect } = require('./helpers/dbConnect');

port = process.env.PORT;
chatPort = process.env.CHAT_PORT;

app.use(cors());                                    //Cors
app.use(express.static(__dirname + '/public'));     //Carpeta static

app.use(express.urlencoded({ extended: false }));   // Parse application/x-www-form-urlencoded
app.use(express.json());                             // Parse application/json

//Conexión
connect();

//Server socket
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    },
});

//Rutas
app.use('/api/users', require('./routers/routerUsers'));    //Users
app.use('/api/public', require('./routers/routerPublic'));    //Users

const socketController = require('./controllers/socketController')(io);


//404
app.use((req, res) => { res.status(404).send({ msg: `Ruta no encontrada: ${req.url}` }); });


//Listener
app.listen(port, () => console.log(`AppServer listenning on port ${port}...`));

server.listen(chatPort, () => console.log(`ChatServer listenning on port ${chatPort}...`));