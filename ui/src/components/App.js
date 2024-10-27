import React from "react";
import classnames from "classnames";

// TODO refactor and use
// import MESSAGE_TYPES from "../../../common/enums/messageTypes.js";
const MESSAGE_TYPES = {
	UPDATE_SIZE: "UPDATE_SIZE",
	HIDE: "HIDE",
	EXECUTE: "EXECUTE",
	INPUT: "INPUT"
};

function getPngSrcDataFromBase64String(base64String) {
	return "data:image/png;base64," + base64String;
}

export default class App extends React.Component {
	constructor() {
		super();

		this.componentReference = React.createRef();

		this.selectOptionIndex = this.selectOptionIndex.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleMessage = this.handleMessageClientMessage.bind(this);
	}

	state = {
		input: "",
		tooltip: "",
		options: [],
		optionSeletedIndex: -1
	};

	componentDidMount() {
		document.addEventListener("keydown", this.handleKeyDown);

		this.props.messageClient.subscribeOnMessage(this.handleMessageClientMessage);

		this.sendMessageUpdateSize();
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.handleKeyDown);

		this.props.messageClient.unsubscribeOnMessage(this.handleMessageClientMessage);
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
				const input = this.state.input.trim();
				if (input) {
					this.sendMessage(MESSAGE_TYPES.EXECUTE, {
						input
					});
				}

				this.clearInputAndHide();
				break;

			case "Escape":
				this.clearInputAndHide();
				break;

			default:
				break;
		}
	}

	handleMessageClientMessage(message) {
	}

	handleInputChange(event) {
		const input = event.target.value.trimStart();
		if (input === this.state.input) return;

		this.setState({
			input,
			tooltip: "will be tooltip",
			optionSeletedIndex: -1
		}, () => {
			this.sendMessage(MESSAGE_TYPES.INPUT, {
				input: this.state.input
			});

			const options = [];
			for (let i = 0; i < this.state.input.length; i++) {
				options.push({
					caption: this.state.input.slice(0, i + 1),
					description: "Start app ...",
					icon: "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAOnSURBVFhHxVVLSJRRGL2boFVQ0RN6bYJeSkVB1PyjzvgYR0nJLIRCeltCBi0qoqjI1NRe9sBFiwJbtGzRrm2REARFEBW0KYreUZSlX/fc6Qzf3Lmmm2px5nuf8937/z9jKisro6qqqv7q6mr5l4BmOp2Omf8hTtjD38UCLtB2uJxfsyfIy2l/uJz2swsAICR0E33G9H2gZk8VrBE+r+EptLhewAfzoX5Yv98H++m7BbC1LvAUOqbPPj2jwXzd6pTs2xBzvuZiD323gC6yQVv66PFz2jbUlsnZpuXSf3SmDFwwIpeMq4VADnyGOYVUKpVDypg+oPsb1ySlt3mJPGidJkMXM6IauhccOAQ5YXMW0OQU00uwvqO+WK62FMrT9vF5gj7Qj1nyah/ILkDBENK2vqchkut758uLrrFBoeFAjoqKiqwoYljkTHl5ebaJRRQ4cHP/XHl7Okw+EvBIyEdLDcJQjE1ciHGIeCQMWTxqnSTd25c5PnJpLeYMfohQQ0gghJ/2tPeOTZeepiXSUJPI48EihK65G+CpWaQtKysLiml8Omvk1sE5snNdlEOOWcQEebUP694BBroJGM0CGs86xtmvY4E0rY1nF4AlL3zmkYNvmCwtLc0WtQ0JjQYvu8ZIX8s8x+Hz0gcMhJFIJpNuCYINV3Yvkmft44Iio4EWJa/WMBBmE5J6EZ3bWBOX3l0F8vD4RPeWh8RC0Nzk1Dl3A4TejovpmLaxJpIbe2fJq87Mtx4SJvQcfQL8bgE4ukhhPVxfFZczWwvl9oHJ8rHLyIeTRt62G3ndauSdtV9OGRkMLOPz+DCJRCKviTmgc8tSeXR8ijvpkP2HGzxv5EePke/28/t2JiP8yd7EuzYjb05Y22Hkc7ft+/1vSD6AohruHdCCuhnWXXEAbhmLn3aZgXOZZb7aZT7b23lvl3hy2Ehf8+wcMc0PHzl3A0BJSYkDYw6FxDXczVhgmedtY+Vay3zZWbdCEpYL8+QjqEMYPwFwAfghUY3HrRPk8q6FsqlmZXZOi9FnzFxxcbGz7hEgiQQtfcAXxEnvH5kqPdsKZH16VQ655uC8rusc/Zwb0IOMITpgX7w7h2ZI5+bFUpuK8oRgARIXFRVlOf4EzBgOE35DS/1yqUxmRCkACxHOwPdjWHLomDn6BkXdqIGcJtDQPdr6OS3q1wD3CDioC7rRr/t9OqdrnNHwa+4G/idMLBbrDxX+BeLx+F0TRVEMTqjhbwKaURTFfgHGyuzIK2IIFAAAAABJRU5ErkJggg==",
				});
			}

			this.setState({ options }, () => {
				this.sendMessageUpdateSize();
			});
		});
	}

	selectPrevious() {
		this.selectOptionIndex(this.state.optionSeletedIndex - 1 + this.state.options.length);
	}

	selectNext() {
		this.selectOptionIndex(this.state.optionSeletedIndex + 1);
	}

	selectOptionIndex(index) {
		this.setState({ optionSeletedIndex: index % this.state.options.length });
	}

	clearInputAndHide() {
		this.setState({
			input: "",
			tooltip: "",
			options: [],
			optionSeletedIndex: -1
		});

		this.sendMessage(MESSAGE_TYPES.HIDE);
	}

	sendMessage(messageType, data) {
		this.props.messageClient.sendMessage({
			message: messageType,
			...(data || {})
		});
	}

	sendMessageUpdateSize() {
		const rectangle = this.componentReference.current.getBoundingClientRect();

		this.sendMessage(MESSAGE_TYPES.UPDATE_SIZE, {
			width: rectangle.width,
			height: rectangle.height
		});
	}

	render() {
		return (
			<div className="flex-fill"
				ref={this.componentReference}
			>
				<Keystroke
					input={this.state.input}
					tooltip={this.state.tooltip}
					options={this.state.options}
					optionSeletedIndex={this.state.optionSeletedIndex}
					selectOptionIndex={this.selectOptionIndex}
					handleInputChange={this.handleInputChange}
				/>
			</div>
		);
	}
}

class Keystroke extends React.Component {
	render() {
		return (
			<div className="keystroke-container flex-fill flex flex-vertical">
				<div className="keystroke-line flex-fill flex">
					<div className="keystroke-line-container flex-fill flex">
						<input
							className="keystroke-input flex-fill"
							autoFocus
							spellCheck={false}
							value={this.props.input}
							onChange={this.props.handleInputChange}
						/>
						<p className="keystroke-input-result-tooltip">
							<i>{this.props.tooltip}</i>
						</p>
					</div>
				</div>
				{this.props.options.map((option, index) =>
					<KeystrokeOption key={index}
						caption={option.caption}
						description={option.description}
						icon={option.icon}

						selected={index === this.props.optionSeletedIndex}
						handleMouseMove={() => this.props.selectOptionIndex(index)}
					/>
				)}
			</div>
		);
	}
}

class KeystrokeOption extends React.Component {
	render() {
		return (
			<div className={classnames("keystroke-line flex-fill flex keystroke-option", { "keystroke-line-selected": this.props.selected })}
				onMouseMove={this.props.handleMouseMove}
			>
				{this.props.icon &&
					<div className="keystroke-option-icon">
						<img src={getPngSrcDataFromBase64String(this.props.icon)} alt="" />
					</div>
				}
				<div className="keystroke-option-text-container flex flex-vertical flex-vertical-items-center">
					<p className="keystroke-option-caption">{this.props.caption}</p>
					<p className="keystroke-option-description">{this.props.description}</p>
				</div>
			</div>
		);
	}
}
