import React from "react";
import './Message.css'

function Message(props) {

    return (
        <div className="msger-chat">
            <li className={"msg appeared " + props.position}>
                <div className="avatar"/>
                <div className="msg-bubble">
                    <div className="msg-info">
                        <div className="msg-info-name">{props.name}</div>
                    </div>

                    <div className="text">{props.text.split("\n").map((t,key) => {
                        return <p className="a" key={key}>{t}</p>;
                    })}
                    </div>
                </div>
            </li>
        </div>
    )
}

export {Message}