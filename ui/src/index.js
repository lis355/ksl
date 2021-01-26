import React from "react";
import ReactDOM from "react-dom";

import "normalize.css";
import "reset-css";

import "./styles/styles.scss";

import App from "./components/App/App";

ReactDOM.render(
	<App />,
	document.querySelector("#root")
);
