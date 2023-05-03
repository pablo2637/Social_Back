const { io } = require('../app');

const usersConnected = [];


const getSocketID = (userID) => {

    const id = usersConnected.find(soc => soc.userID == userID);
    console.log('id', id)
    if (!id)
        return { ok: false }

    return {
        ok: true,
        socketID: id.socketID
    }

};


const socketController = () => {

    io.on("connection", (socket) => {

        usersConnected.push({
            socketID: socket.id,
            userID: ''
        })


        socket.on("byeBye", () => {

            usersConnected.map(user => user.socketID == socket.id ? user.userID = '' : user.userID)

            console.log('User logout', usersConnected)
        });


        socket.on("whoAmI", (data) => {

            const ind = usersConnected.findIndex(user => user.socketID == socket.id)

            if (ind != -1)
                usersConnected[ind].userID = data.userID;

            console.log('New user connected:', usersConnected)

        });


        socket.on("join_room", (data) => {
            socket.join(data);
            console.log(`User with ID: ${socket.id} joined room: ${data}`);
        });


        socket.on("send_message", (data) => {
            console.log('mensaje', data)
            socket.to(data.room).emit("receive_message", data);
        });


        socket.on("disconnect", () => {
            console.log('disco', socket.id)
            const ind = usersConnected.findIndex(user => user.socketID == socket.id)

            if (ind != -1)
                usersConnected.splice(ind, 1);
        });

    });

};



const executeEP = ({ body }, res) => {

    const order = body;

    if (order.to == 'all') {

        io.emit('execute', order)

    } else if (order.to == '-1') {

        const list = usersConnected.filter(user => user.userID != order.id);

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

const execute = (order) => {

    if (order.to == 'all') {

        io.emit('execute', order)

    } else if (order.to == '-1') {

        const list = usersConnected.filter(user => user.userID != order.id);
        console.log('order', order)
        console.log('list complete', usersConnected);
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

module.exports = {
    socketController,
    execute,
    executeEP
}