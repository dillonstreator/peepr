import React from 'react';
import { Link } from 'react-router-dom';

export default () => {

    return (
        <div>
            <h1>Home page...</h1>
            <Link to="/chats">Chats</Link>
        </div>
    )
}