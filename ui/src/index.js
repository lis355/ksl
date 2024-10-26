import React from "react";
import ReactDOM from "react-dom/client";

import App from "./components/App.js";

import "normalize.css";
import "./index.scss";

import createMessageClient from "./logic/connection/createMessageClient.js";

const messageClient = createMessageClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<App messageClient={messageClient} />
	</React.StrictMode>
);
