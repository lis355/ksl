import React from "react";
import classnames from "classnames";

const MESSAGE_TYPES = Object.freeze({
	UPDATE_SIZE: 1,
	HIDE: 2,
	EXECUTE: 3,
	INPUT: 4
});

function getPngSrcDataFromBase64String(base64String) {
	return "data:image/png;base64," + base64String;
}

class KeystrokeOption extends React.Component {
	render() {
		return (
			<div className={classnames("keystroke-line keystroke-option", { "keystroke-line-selected": this.props.selected })}
				onMouseMove={this.props.handleMouseMove}
			>
				{this.props.icon &&
					<div className="keystroke-option-icon">
						<img src={getPngSrcDataFromBase64String(this.props.icon)} alt="" />
					</div>
				}
				<div className="keystroke-option-text-container">
					<p className="keystroke-option-caption">{this.props.caption}</p>
					<p className="keystroke-option-description">{this.props.description}</p>
				</div>
			</div>
		);
	}
}

class Keystroke extends React.Component {
	state = {
		value: "",
		seletedIndex: 0
	};

	handleInputChange(event) {
		const value = event.target.value.trimStart();
		if (value === this.state.value) return;

		this.setState({ value }, () => {
			this.props.onInputChange && this.props.onInputChange(value);
		});
	}

	selectPrevious() {
		this.setState({ seletedIndex: (this.state.seletedIndex - 1 + this.props.options.length) % this.props.options.length });
	}

	selectNext() {
		this.setState({ seletedIndex: (this.state.seletedIndex + 1) % this.props.options.length });
	}

	selectIndex(index) {
		this.setState({ seletedIndex: index });
	}

	render() {
		return (
			<div className="keystroke-container">
				<div className="keystroke-line">
					<input
						className="keystroke-input"
						autoFocus
						spellCheck={false}
						value={this.state.value}
						onChange={this.handleInputChange.bind(this)}
					/>
				</div>
				{this.props.options.map((option, index) =>
					<KeystrokeOption
						key={index} {...option} selected={index === this.state.seletedIndex}
						handleMouseMove={() => this.selectIndex(index)}
					/>
				)}
			</div>
		);
	}
}

export default class App extends React.Component {
	constructor() {
		super();

		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleMessage = this.handleMessage.bind(this);
	}

	state = {
		options: []
	};

	componentDidMount() {
		document.addEventListener("keydown", this.handleKeyDown);

		this.props.messageClient.on("message", this.handleMessage);

		this.sendMessageUpdateSize();
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.handleKeyDown);

		this.props.messageClient.off("message", this.handleMessage);
	}

	componentDidUpdate() {
		this.sendMessageUpdateSize();
	}

	handleKeyDown(event) {
		switch (event.key) {
			case "ArrowUp":
				this.selectPrevious();
				event.preventDefault();
				break;

			case "Tab":
			case "ArrowDown":
				this.selectNext();
				event.preventDefault();
				break;

			case "Enter":
				const input = this.state.value.trim();
				if (input) window.ipcClient.sendMessage(MESSAGE_TYPES.EXECUTE, input);

				window.ipcClient.sendMessage(MESSAGE_TYPES.HIDE);
				break;

			case "Escape":
				window.ipcClient.sendMessage(MESSAGE_TYPES.HIDE);
				break;

			default:
				break;
		}
	}

	handleMessage(message, data) {
		console.log(message, data);
	}

	sendMessageUpdateSize() {
		const element = document.querySelector(".keystroke-container");

		this.props.messageClient.sendMessage(MESSAGE_TYPES.UPDATE_SIZE, {
			width: element.clientWidth + 5 * 2,
			height: element.clientHeight + 5 * 2
		});
	}

	render() {
		return (
			<Keystroke
				options={this.state.options}
				onInputChange={value => {
					this.props.messageClient.sendMessage(MESSAGE_TYPES.INPUT, value);

					// const options = [];
					// for (let i = 0; i < value.length; i++) {
					// 	options.push({
					// 		caption: value.slice(0, i + 1),
					// 		icon: "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAOnSURBVFhHxVVLSJRRGL2boFVQ0RN6bYJeSkVB1PyjzvgYR0nJLIRCeltCBi0qoqjI1NRe9sBFiwJbtGzRrm2REARFEBW0KYreUZSlX/fc6Qzf3Lmmm2px5nuf8937/z9jKisro6qqqv7q6mr5l4BmOp2Omf8hTtjD38UCLtB2uJxfsyfIy2l/uJz2swsAICR0E33G9H2gZk8VrBE+r+EptLhewAfzoX5Yv98H++m7BbC1LvAUOqbPPj2jwXzd6pTs2xBzvuZiD323gC6yQVv66PFz2jbUlsnZpuXSf3SmDFwwIpeMq4VADnyGOYVUKpVDypg+oPsb1ySlt3mJPGidJkMXM6IauhccOAQ5YXMW0OQU00uwvqO+WK62FMrT9vF5gj7Qj1nyah/ILkDBENK2vqchkut758uLrrFBoeFAjoqKiqwoYljkTHl5ebaJRRQ4cHP/XHl7Okw+EvBIyEdLDcJQjE1ciHGIeCQMWTxqnSTd25c5PnJpLeYMfohQQ0gghJ/2tPeOTZeepiXSUJPI48EihK65G+CpWaQtKysLiml8Omvk1sE5snNdlEOOWcQEebUP694BBroJGM0CGs86xtmvY4E0rY1nF4AlL3zmkYNvmCwtLc0WtQ0JjQYvu8ZIX8s8x+Hz0gcMhJFIJpNuCYINV3Yvkmft44Iio4EWJa/WMBBmE5J6EZ3bWBOX3l0F8vD4RPeWh8RC0Nzk1Dl3A4TejovpmLaxJpIbe2fJq87Mtx4SJvQcfQL8bgE4ukhhPVxfFZczWwvl9oHJ8rHLyIeTRt62G3ndauSdtV9OGRkMLOPz+DCJRCKviTmgc8tSeXR8ijvpkP2HGzxv5EePke/28/t2JiP8yd7EuzYjb05Y22Hkc7ft+/1vSD6AohruHdCCuhnWXXEAbhmLn3aZgXOZZb7aZT7b23lvl3hy2Ehf8+wcMc0PHzl3A0BJSYkDYw6FxDXczVhgmedtY+Vay3zZWbdCEpYL8+QjqEMYPwFwAfghUY3HrRPk8q6FsqlmZXZOi9FnzFxxcbGz7hEgiQQtfcAXxEnvH5kqPdsKZH16VQ655uC8rusc/Zwb0IOMITpgX7w7h2ZI5+bFUpuK8oRgARIXFRVlOf4EzBgOE35DS/1yqUxmRCkACxHOwPdjWHLomDn6BkXdqIGcJtDQPdr6OS3q1wD3CDioC7rRr/t9OqdrnNHwa+4G/idMLBbrDxX+BeLx+F0TRVEMTqjhbwKaURTFfgHGyuzIK2IIFAAAAABJRU5ErkJggg==",
					// 		description: "Start app ..."
					// 	});
					// }

					// this.setState({ options });
				}}
			/>
		);
	}
};
