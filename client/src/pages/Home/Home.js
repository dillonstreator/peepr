import React from 'react';
import { Link } from 'react-router-dom';

export default () => {

    return (
        <div>
            <section>
                <h1>Peepr</h1>
                <p>Peepr is built to provide the upmost privacy in digital text communicaton by generating public/private key pairs in the browser.</p>
            </section>
            <section>
                <h3>How it works</h3>
                <p>When a chat is initiated, public keys are exchanged for use in encrypting messages.</p>
                <p>A random username is assigned at each session for exchange with your chat recipient.</p>
            </section>
            <Link className="button" to="/chats">Start Chatting</Link>
        </div>
    )
}