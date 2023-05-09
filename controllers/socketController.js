const { io } = require('../app');
const Chat = require('../models/chatsModel');
const { exists } = require('../models/usersModel');

const socketsConnected = [];
const chatRooms = [];

/** 
 * @author Pablo
 * @exports Object 
 * @module socketController
 */


/**
 * Definición del tipo Order
 * @typedef {Object} Order
 * @property {Array} command Los comandos a ejecutar (profiles / invites / chats / user / all)
 * @property {String} to A quien debe emitirse la orden (1 / -1 / all)
 * @property {String} [id] El ID del usuario al que enviar la orden o al que NO debe enviarse según
 * se requiera
 */


/**
* Devuelve el ID del socket.
* @method getSocketID
* @async
* @param {String} userID ID del usuario
* @returns {json} Devuelve OK y socketID, que es ID del socket
* @throws {json} Devuelve OK: false
*/
const getSocketID = (userID) => {

    const id = socketsConnected.find(soc => soc.userID == userID);

    if (!id)
        return { ok: false }

    return {
        ok: true,
        socketID: id.socketID
    }

};


/**
* Devuelve el ID del usuario.
* @method getUserID
* @async
* @param {String} socketID ID del socket
* @returns {json} Devuelve OK y userID
* @throws {json} Devuelve OK: false
*/
const getUserID = (socketID) => {

    const id = socketsConnected.find(soc => soc.socketID == socketID);

    if (!id)
        return { ok: false }

    if (!id.userID)
        return { ok: false }

    return {
        ok: true,
        userID: id.userID
    }

};



/**
* Devuelve el índice del socket
* @method getSocketIndex
* @async
* @param {String} socketID ID del socket
* @returns {json} Devuelve OK e Index
* @throws {json} Devuelve OK: false
*/
const getSocketIndex = (socketID) => {

    const index = socketsConnected.findIndex(soc => soc.socketID == socketID);

    if (index == -1)
        return { ok: false }

    return {
        ok: true,
        index
    }

};

/**
* Conjunto de métodos que procesan la información recibda a través del Chat Server
* @method socketController
* @requires module:app/io
*/
const socketController = () => {


    io.on("connection", (socket) => {


        /**
         * Evento de conexión
         */
        socket.on("connect", () => {

            const exists = getUserID(socket.id);

            if (exists.ok)
                return

            const ind = getSocketIndex(socket.id);

            if (ind != -1)
                return

            socketsConnected.push({
                socketID: socket.id,
                reconnect: 0,
                userID: ''
            })

            console.log('connect: socketsConnected', socketsConnected);
        });



        /**
         * Cuando un usuario se desloguea
         */
        socket.on("byeBye", () => {

            clearChatRooms(socket);
        });



        /**
         * El cliente envía una notificación con el id del usuario
         */
        socket.on("whoAmI", async (data) => {

            const ind = getSocketIndex(socket.id);

            if (ind.ok) {

                socketsConnected[ind.index].userID = data.userID;
                socketsConnected[ind.index].reconnect = 0;

                const userChats = await getChats(data.userID);

                if (userChats.ok) {

                    userChats.data.forEach(chat => {

                        socket.join(chat.name);
                        const exists = chatRooms.findIndex(cr => cr.name == chat.name);

                        if (exists == -1)
                            chatRooms.push({
                                name: chat.name,
                                sender: chat.sender,
                                receiver: chat.receiver
                            });

                    });

                    joinRooms();
                }

            } else
                console.log('error whoAmI');

        });



        /**
         * Se crea un nuevo chat room y se mete a los usuarios correspondientes dentro
         */
        socket.on("newChat", async (data) => {

            if (!data) {
                socket.emit('NoChatData', data);
                return
            }

            chatRooms.push({
                name: data.name,
                sender: data.sender,
                receiver: data.receiver
            });
            socket.join(data.name);

            const response = await createChat(data);

            const _id = response._id;

            socket.emit('chatID', {
                _id,
                sender: data.sender,
                receiver: data.receiver
            })
        });



        /**
         * Mensaje de chat recibido, se salva en la bd y se reenvía al destinatario
         */
        socket.on("msgTo", async (data) => {

            const response = await saveChat(data);

            socket.to(data.name).emit("msgFrom", data);
        });



        /**
         * El cliente se desconecta
         */
        socket.on("disconnect", () => {
            clearChatRooms(socket);
        });

    });


    /**
     * Llama la función que comprueba los sockets conectados cada 10 segundos
     */
    setInterval(() => {
        checkSockets();

    }, 10000);


};



/**
 * Comprobación de sockets
 */
const checkSockets = () => {

    io.sockets.sockets.forEach(soc => {

        const user = getUserID(soc.id);

        if (!user.ok) {
            const ind = getSocketIndex(soc.id);

            if (ind.ok) {
                socketsConnected[ind.index].reconnect += 1;


                if (socketsConnected[ind.index].reconnect >= 3) {
                    soc.disconnect();

                } else {
                    soc.emit('whoAreYou');
                }


            } else {
                socketsConnected.push({
                    socketID: soc.id,
                    reconnect: 0,
                    userID: ''
                });


                soc.emit('whoAreYou');
            }
        }
    });

    joinRooms();
}



/**
 * Mete a los usuarios correspondientes dentro de los chat rooms que corresponda
 */
const joinRooms = () => {

    io.sockets.sockets.forEach(soc => {

        const user = getUserID(soc.id);

        if (user.ok) {

            chatRooms.forEach(cr => {

                if (cr.sender == user.userID || cr.receiver == user.userID)
                    soc.join(cr.name);


            });
        }

    });
};



/**
 * Limpiar los chatrooms
 * @param {Object} socket 
 */
const clearChatRooms = (socket) => {

    const user = getUserID(socket.id);

    const erase = [];
    chatRooms.forEach((cr, ind) => {

        if (cr.name.includes(user.userID)) {

            socket.leave(cr.name);

            const otherUser = cr.name.replace(user.userID, '').replace('-', '');
            if (cr.name.includes(otherUser)) {

                const isConnected = getSocketID(otherUser);
                if (isConnected.ok)
                    erase.push(ind)

            }

        }
    });

    for (let i = erase.length - 1; i >= 0; i--) {
        chatRooms.splice(erase[i], 1);
    };

    socketsConnected.map(soc => soc.socketID == socket.id ? soc.userID = '' : soc.userID);

};



/**
 * 
 * @param {json} data El objeto para crear un chat nuevo, debe incluir: sender, receiver, que son los IDs
 * correspondientes de los participantes, y name: el nombre del chat room
 * @returns {json} Con la información del chat creado en la bd
 * @throws {json} Error
 */
const createChat = async (data) => {

    try {

        let _id;
        const exists = await Chat.findOne({
            $or: [
                { "sender": data.sender, "receiver": data.receiver },
                { "sender": data.receiver, "receiver": data.sender }
            ]
        });

        if (exists)
            _id = exists._id;

        else {
            const newChat = new Chat({
                sender: data.sender,
                receiver: data.receiver,
                name: data.name
            });

            const chat = await newChat.save();
            if (!chat)
                return {
                    ok: false,
                    msg: 'Error al crear chat',
                    newChat
                }

            _id = chat._id;
        }

        execute({
            to: '1',
            command: ['chats'],
            id: data.receiver
        });

        return {
            ok: true,
            msg: 'Chat creado con éxito',
            _id
        };

    } catch (e) {
        if (!e.toString().includes('E11000'))
            console.log('createChat error:', e);

        return {
            ok: false,
            msg: 'createChat: Ha habido un fallo al crear el chat.',
            error: e
        };

    };
};



/**
* Devuelve todos los chats del usuario.
* @method getChats
* @async
* @param {String} _id El id del usuario.
* @returns {json} Devuelve OK, msg y data, que es un array con los chats
* @throws {json} Devuelve el error
*/
const getChats = async (_id) => {

    try {

        const chats = await Chat.find({
            $or: [
                { "sender": _id },
                { "receiver": _id }
            ]
        });

        if (chats.length == 0)
            return {
                ok: true,
                msg: 'No hay chats en la bbdd.',
                data: []
            };

        return {
            ok: true,
            msg: 'Chats recuperadas con éxito',
            data: chats
        };

    } catch (e) {
        console.log('getChats error:', e);

        return {
            ok: false,
            msg: 'Error getChats: fallo al intentar recuperar todos los chats',
            error: e
        };

    };
};


/**
 * Almacena en la base de datos el mensaje recibido
 * @param {Object} data Debe contener sender y receiver: que son los respectivos IDs de los participantes
 * del chat, _id: es el ID del chat, msg: el mensaje a enviar y msgSender: quién ha enviado el mensaje
 * @returns {json}
 */
const saveChat = async (data) => {

    try {
        // console.log('data', data)
        const { sender, receiver, _id, msg, date, msgSender } = data;

        let response;
        if (_id)
            response = await Chat.findByIdAndUpdate(_id,
                { $push: { chat: { sender, receiver, msg, date, msgSender } } }, { new: true });

        else
            response = await Chat.findOneAndUpdate({ name: data.name },
                { $push: { chat: { sender, receiver, msg, date, msgSender } } }, { new: true });

        if (!response) {
            const newChat = new Chat({
                sender,
                receiver,
                name: data.name
            });

            const chat = await newChat.save();
            if (!chat)
                return {
                    ok: false,
                    response: chat
                }

            const rspUpd = await Chat.findByIdAndUpdate(chat._id,
                { $push: { chat: { sender, receiver, msg, date, msgSender } } }, { new: true });
            if (!rspUpd)
                return {
                    ok: false,
                    response: rspUpd
                }

            execute({
                to: '1',
                command: ['chats'],
                id: receiver
            });
        }


        return {
            ok: true,
            msg: 'Chat actualizado con éxito',
            // response
        };

    } catch (e) {
        if (!e.toString().includes('E11000'))
            console.log('saveChat error:', e);

        return {
            ok: false,
            msg: 'saveChat: Ha habido un fallo al guardar el chat.',
            error: e
        };

    };


}


/**
* Ejecuta una acción en todos los sockets conectados, en todos menos el que ha enviado la información o
también en uno en concrecto. (ENDPOINT)
* @method executeEP
* @param {Object} req Es el requerimiento que proviene de las rutas, en el 
body debe tener 'order' que son las instrucciones a ejectuar, es de tipo Order.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, to, order e id <optional>
* @throws {json} Devuelve el error
*/
const executeEP = ({ body }, res) => {

    const order = body;

    if (order.to == 'all') {

        io.emit('execute', order)

    } else if (order.to == '-1') {

        const list = socketsConnected.filter(user => user.userID != order.id);

        list.forEach(soc => {
            io.to(soc.socketID).emit('execute', order)
        });

    } else if (order.to == '1') {

        const response = getSocketID(body.id);

        if (!response.ok)
            res.status(500).json({
                ok: false,
                response
            })

        io.to(response.socketID).emit('execute', order)
    }

    res.status(200).json({
        ok: true,
        to: order.to,
        order: order.command,
        id: order.id
    });

};


/**
* Ejecuta una acción en todos los sockets conectados, en todos menos el que ha enviado la información o
también en uno en concrecto.
* @method execute
* @param {Object} req Es el requerimiento que proviene de las rutas, en el 
body debe tener 'order' que son las instrucciones a ejectuar, es de tipo Order.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, to, order e id <optional>
* @throws {json} Devuelve el error
*/
const execute = (order) => {

    if (order.to == 'all') {

        io.emit('execute', order)

    } else if (order.to == '-1') {

        const list = socketsConnected.filter(user => user.userID != order.id);
        console.log('order', order)
        console.log('list complete', socketsConnected);
        console.log('list', list)

        list.forEach(soc => {
            io.to(soc.socketID).emit('execute', order)
        });

    } else if (order.to == '1') {

        const response = getSocketID(order.id);

        if (!response.ok)
            return response

        io.to(response.socketID).emit('execute', order)
    }


    return {
        ok: true,
        to: order.to,
        order: order.command,
        id: order.id
    };

};



const getInternalData = async (req, res) => {

    const rooms = [];

    io.sockets.sockets.forEach(soc => {

        rooms.push({ sockedID: soc.id });
        const newRooms = [];
        soc.rooms.forEach(r => newRooms.push(r));
        rooms[rooms.length - 1].rooms = newRooms;

    });

    return res.status(200).json({ socketsConnected, chatRooms, rooms });

}

module.exports = {
    getInternalData,
    socketController,
    saveChat,
    createChat,
    execute,
    executeEP
}