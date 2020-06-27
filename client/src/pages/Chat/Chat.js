import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import moment from 'moment';
import cn from 'classnames';
import { actions as chatActions } from '../../ducks/chats';
import socket from "../../socket";
import secret from "../../utils/secret";

import styles from './chat.module.scss';

const Chat = ({ chat, addMessage }) => {
	const [message, setMessage] = useState("");

	if (!chat) return <Redirect to="/chats" />;

	const { username, messages = [], publicKey } = chat;

	const sendMessage = () => {
		socket.emit.messageSend({
			username,
			message: secret.encryptWith(message, publicKey),
		});
		addMessage({
			username,
			message: {
				createdAt: new Date(),
				author: "me",
				text: message,
			}
		});
		setMessage("");
	};

	return (
		<div>
			<Link to="/chats">Back</Link>
			<h2>{username}</h2>
			<div className={styles.messages}>
				{messages.map((msg, i) => <Message key={i} {...msg} />)}
			</div>
			<div className={styles.input}>
				<textarea
					className="textarea"
					rows={5}
					value={message}
					onChange={({ target: { value } }) => setMessage(value)}
				></textarea>
				<button className="button" onClick={sendMessage}>Send Message</button>
			</div>
		</div>
	);
};

const Message = ({ createdAt, author, text }) => (
	<div className={styles.message}>
		<span className={styles.date}>{moment(createdAt).format("HH:mm:ss")}</span>
		<div className={cn({ [styles.text]: true, [styles.me]: author === "me" })}>
			<p>{text}</p>
		</div>
	</div>
);

const mapStateToProps = ({ chats }, { match }) => ({
	chat: chats[match.params.username],
});

const mapDispatchToProps = (dispatch) => ({
	addMessage: (payload) => dispatch(chatActions.addMessage(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
