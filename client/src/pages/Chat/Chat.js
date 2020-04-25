import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import socket from "../../socket";
import secret from "../../utils/secret";

const Chat = ({ chat }) => {
	const [message, setMessage] = useState("");

    if (!chat) return <Redirect to="/chats" />;
    
	const { username, messages = [], publicKey } = chat;

	const sendMessage = () => {
		socket.emit.messageSend({
			username,
			message: secret.encryptWith(message, publicKey),
		});
		setMessage("");
	};

	return (
		<div>
			<Link to="/chats">Back</Link>
			<h2>{username}</h2>
            {messages.map((msg, i) => <p key={i}>{msg}</p>)}
            <textarea
                className="textarea"
                value={message}
                onChange={({ target: { value } }) => setMessage(value)}
            ></textarea>
            <button className="button" onClick={sendMessage}>Send message</button>
		</div>
	);
};

const mapStateToProps = ({ chats }, { match }) => ({
	chat: chats[match.params.username],
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
