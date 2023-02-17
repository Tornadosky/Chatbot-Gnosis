import React, {useState} from "react";
import './UserInput.css'

function UserInput(props) {
    /*
    Handle input text
    */
    const [inputText, setInputText] = useState("")

    function handleChange(e) {
        setInputText(e.target.value)
    }

    function handleSubmit() {
        props.onSubmitMessage(inputText);
        setInputText("");
    }

    return (
        <form onSubmit={(e) => {handleSubmit(); e.preventDefault()}} className="msger-inputarea">
            <input type="text" className="msger-input" value={inputText} onChange={handleChange}
                   placeholder="Enter your message..."/>
            <button type="button" className="msger-send-btn" onClick={handleSubmit}>Send</button>
        </form>
    )
}

export {UserInput}