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
 * @property {String} command La orden a ejecutar (reload_profiles / reload_invites / reload_user / 
 * reload_chats / reload_all)
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



        socket.on("connect", () => {

            const exists = getUserID(socket.id);
            console.log('connect exists', exists)
            if (exists.ok)
                return

            const ind = getSocketIndex(socket.id);
            console.log('connect ind', ind)
            if (ind != -1)
                return

            socketsConnected.push({
                socketID: socket.id,
                reconnect: 0,
                userID: ''
            })

            console.log('connect: socketsConnected', socketsConnected)
        });




        socket.on("byeBye", () => {

            clearChatRooms(socket);

            // socketsConnected.map(soc => soc.socketID == socket.id ? soc.userID = '' : soc.userID)

            // console.log('User logout:', socketsConnected)
        });




        socket.on("whoAmI", async (data) => {

            // console.log('wboAmI: data', data)
            // const ind = socketsConnected.findIndex(user => user.socketID == socket.id)
            const ind = getSocketIndex(socket.id);
            // console.log('wboAmI: ind', ind);

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




        socket.on("newChat", async (data) => {
            console.log('newChat: data', data)

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
            // console.log(`SocketID: ${socket.id} joined room: ${data.name}`);

            const response = await createChat(data);
            console.log('create response', response)
            socket.emit('chatID', {
                _id: response._id,
                sender: data.sender,
                receiver: data.receiver
            })
        });



        socket.on("msgTo", async (data) => {

            console.log('msgTo mensaje', data)
            const response = await saveChat(data);

            console.log('msgTo response', response)
            socket.to(data.name).emit("msgFrom", data);
        });




        socket.on("disconnect", () => {
            // console.log('disconnect: ', socket.id)

            clearChatRooms(socket);
        });


        checkSockets();

    });


};




const checkSockets = () => {

    io.sockets.sockets.forEach(soc => {

        const user = getUserID(soc.id);
        // console.log('checkSockets user', user)

        if (!user.ok) {
            const ind = getSocketIndex(soc.id);
            // console.log('checkSockets, ind', ind, socketsConnected)
            if (ind.ok) {
                socketsConnected[ind.index].reconnect += 1;


                if (socketsConnected[ind.index].reconnect >= 3) {
                    soc.disconnect();
                    // console.log('soc disconnected:', soc.id)

                } else
                    soc.emit('whoAreYou');

            } else {
                socketsConnected.push({
                    socketID: soc.id,
                    reconnect: 0,
                    userID: ''
                });

                soc.emit('whoAreYou');
            }
        } //else {

        //     chatRooms.forEach(cr => {
        //         if (cr.sender == user.userID || cr.receiver == user.userID)
        //             soc.join(cr.name);

        //     });
        // }

        // console.log('socket room', soc.id, soc.rooms)
    });

    joinRooms();
    // }

}


const joinRooms = () => {
    // console.log('joinRooms: chatRooms', chatRooms);
    io.sockets.sockets.forEach(soc => {

        const user = getUserID(soc.id);
        // console.log('joinRooms user', user)

        if (user.ok) {

            chatRooms.forEach(cr => {
                // console.log('cr.sender == user.userID', cr.sender == user.userID);
                // console.log('cr.receiver == user.userID', cr.receiver == user.userID);

                if (cr.sender == user.userID || cr.receiver == user.userID) {
                    soc.join(cr.name);
                    // console.log('join', soc.rooms)
                }

            });
        }

    });
};


const clearChatRooms = (socket) => {

    const user = getUserID(socket.id);

    const erase = [];
    chatRooms.forEach((cr, ind) => {

        if (cr.name.includes(user.userID)) {

            socket.leave(cr.name);
            // console.log('socket leaving:', cr.name)

            const otherUser = cr.name.replace(user.userID, '').replace('-', '');
            if (cr.name.includes(otherUser)) {

                const isConnected = getSocketID(otherUser);
                if (isConnected.ok)
                    erase.push(ind)

            }

        }
    });
    // console.log('erase', erase)

    for (let i = erase.length - 1; i >= 0; i--) {
        chatRooms.splice(erase[i], 1);
    };

    socketsConnected.map(soc => soc.socketID == socket.id ? soc.userID = '' : soc.userID);


};




const createChat = async (data) => {

    try {

        let _id;
        const exists = await Chat.findOne({
            $or: [
                { "sender": data.sender, "receiver": data.receiver },
                { "sender": data.receiver, "receiver": data.sender }
            ]
        });

        console.log('yaExiste', exists)
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
            command: 'reload_chats',
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
        console.log('data', data)
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
                command: 'reload_chats',
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

        console.log('e.tostring', e.toString.contains('e11000'))

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