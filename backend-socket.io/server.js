/*
 * Import packages
 */

const isKeywordMode = false;
const operate = require("./bot-brains-luis");
const variants = require("./bot-data/variants-luis.json")
const port = process.env.PORT || 8080

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

server.listen(port, () => {
    console.log("connected to port " + port);
});

app.use(express.static('public'));

const socketMap = new Map();

io.on("connection", (socket) => {
    console.log(`connect ${socket.id}`);

    // create different global variables if multiple users try to interact
    socketMap.set(socket.id, [[], [variants.startMsg], ""])

    socket.on("disconnect", (reason) => {
        console.log(`disconnect ${socket.id} due to ${reason}`);
        socketMap.delete(socket.id)
    });

    socket.on("question", (data) => {
        console.log("received question: " + data)
        if (isKeywordMode) {
            const answer = operate(data);
            socket.emit("answer", answer);
        }
        else {
            operate(data, socketMap.get(socket.id)[0], socketMap.get(socket.id)[1], socketMap.get(socket.id)[2])
                .then((answer) => {
                    socket.emit("answer", answer);
                })
        }
    });
});
