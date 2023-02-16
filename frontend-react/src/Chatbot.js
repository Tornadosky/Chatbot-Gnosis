import React, {useEffect, useState} from "react";
import './Chatbot.css';

import {Header} from "./Header";
import {UserInput} from "./UserInput";
import {MessageArea} from "./MessageArea";

import {io} from "socket.io-client";
const socket = io();

function Chatbot() {
    /*
      Handle messages
     */
    window.onload = () => {
        document.getElementsByClassName("msger-send-btn")[0].focus()
    }
    const [messages, setMessages] = useState([{
        text: "Hello! Welcome to Pizzeria \"Recko\". I am \"Gnosis\" Chatbot and I will help you to make an order.\nDo you want to have a look at our pizza list?",
        position: "left",
        name:"GnosisAI"
    }]);

    useEffect(() => {
        // if last message is a non-empty question, ask the server
        let lastMessage = messages[messages.length - 1]
        if (lastMessage.text !== "" && lastMessage.position === "right") {
            socket.emit('question', lastMessage.text);
        }

        //handle server responses
        socket.on("answer", (data) => {
            setMessages([...messages, {text: data, position: "left", name: "GnosisAI"}])
        });

    }, [messages]);

    function onSubmitMessage(inputText) {
        if (inputText !== "")
            setMessages([...messages, {text: inputText, position: "right", name: "Andreas"}])
    }

    return (
        <section className="msger">
            <Header />
            <MessageArea messages={messages} />
            <UserInput onSubmitMessage={onSubmitMessage} />
        </section>
    );
}

export default Chatbot;
