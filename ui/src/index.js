import React from "react";
import ReactDOM from "react-dom";

import "normalize.css";
import "reset-css";

import "./styles/styles.scss";

import ndapp from "ndapp";

class Application extends ndapp.Application {
	async run() {
		await super.run();

		require("./connection/IpcClient");

		const App = require("./components/App/App").default;

		ReactDOM.render(
			<App />,
			document.querySelector("#root")
		);
	}
};

ndapp({
	app: new Application(),
	enums: {
		MESSAGE_TYPES: require("../../app/constants/messageTypes")
	},
	constants: {
	},
	libs: {
		classnames: require("classnames")
	},
	tools: {
	},
	specials: {
	}
});
