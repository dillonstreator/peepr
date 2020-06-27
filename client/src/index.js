import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./assets/scss/global.scss";
import "toastr/build/toastr.min.css"
import 'jquery'
import * as serviceWorker from "./serviceWorker";
import toastr from 'toastr';

toastr.options = {
    positionClass: "toast-bottom-right"
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
