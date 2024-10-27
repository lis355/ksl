import React from "react";
import ReactDOM from "react-dom/client";

import "normalize.css";
import "./index.scss";

import App from "./components/App.js";
import getMessageClient from "./logic/connection/getMessageClient.js";

window.isDevelopment = process.env.NODE_ENV === "development";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<App messageClient={getMessageClient()} />
	</React.StrictMode>
);
