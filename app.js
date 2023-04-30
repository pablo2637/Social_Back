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


//Chat server
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on("send_message", (data) => {
        console.log('mensaje', data)
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});


//404
app.use((req, res) => { res.status(404).send({ msg: `Ruta no encontrada: ${req.url}` }); });


//Listener
app.listen(port, () => console.log(`AppServer listenning on port ${port}...`));

server.listen(chatPort, () => console.log(`ChatServer listenning on port ${chatPort}...`))