import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { createLogger } from "redux-logger";
import chatsReducer from "./ducks/chats";
import userReducer from "./ducks/user";
import uiReducer from "./ducks/ui";

const configureStore = (initialState = {}) => {
	const reducer = combineReducers({
		chats: chatsReducer,
		user: userReducer,
		ui: uiReducer,
	});

	const logger = createLogger({ collapsed: () => true });

	const middleware = process.env.NODE_ENV === "production" ? [] : [logger];

	const composeEnhancers =
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

	return {
		...createStore(
			reducer,
			initialState,
			composeEnhancers(applyMiddleware(...middleware))
		),
	};
};

const store = configureStore();

export default store;
