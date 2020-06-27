import React, { Suspense } from "react";
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import store from './store';

import styles from "./app.module.scss";

const Chats = React.lazy(() => import('./pages/Chats/Chats'));
const ChatsLazy = (props) => (<Suspense fallback={<div>Loading...</div>}><Chats {...props} /></Suspense>)

const Chat = React.lazy(() => import('./pages/Chat/Chat'));
const ChatLazy = (props) => (<Suspense fallback={<div>Loading...</div>}><Chat {...props} /></Suspense>)

function App() {
	return (
		<div className={styles.App}>
			<Provider store={store}>
				<Router>
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/chats" component={ChatsLazy} />
						<Route path="/chats/:username" component={ChatLazy} />
					</Switch>
				</Router>
			</Provider>
		</div>
	);
}

export default App;
