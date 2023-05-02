
const usersConnected = [];

module.exports = (io) => {
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