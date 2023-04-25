const express = require('express');
const app = express();
require('dotenv').config();
const { connect } = require('./helpers/dbConnect');

port = process.env.PORT;

app.use(express.static(__dirname + '/public'));     //Carpeta static

app.use(express.urlencoded({ extended: false }));   // Parse application/x-www-form-urlencoded
app.use(express.json());                             // Parse application/json

//Conexión
connect();

//Rutas
app.use('/api/users', require('./routers/routerUsers'));    //Users


//404
app.use((req, res) => { res.status(404).send({ msg: `Ruta no encontrada: ${req.url}` }); });


//Listener
app.listen(port, () => console.log(`Server listenning on port ${port}...`));