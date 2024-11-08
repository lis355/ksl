import _ from "lodash";
import classnames from "classnames";
import Enum from "@lis355/enumjs";
import React from "react";

import AsyncQueue from "../tools/AsyncQueue.js";

const MESSAGE_TYPES = new Enum([
	"UPDATE_SIZE",
	"HIDE",
	"EXECUTE",
	"INPUT",
	"CLEAR",
	"QUERY_OPTION"
]);

function getPngSrcDataFromBase64String(base64String) {
	return "data:image/png;base64," + base64String;
}

const MESSAGE_INPUT_DEBOUNCE_DELAY_IN_MILLISECONDS = 200;

export default class App extends React.Component {
	constructor() {
		super();

		this.handleQueryOptionAsyncQueue = new AsyncQueue();

		this.componentReference = React.createRef();

		this.selectOptionIndex = this.selectOptionIndex.bind(this);
		this.executeSelectedOptionAndHide = this.executeSelectedOptionAndHide.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleMessageClientMessage = this.handleMessageClientMessage.bind(this);

		this.sendMesageInput = _.debounce(this.sendMesageInput, MESSAGE_INPUT_DEBOUNCE_DELAY_IN_MILLISECONDS);
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
				this.executeSelectedOptionAndHide();

				break;

			case "Escape":
				this.clearInputAndHide();

				break;

			default:
				break;
		}
	}

	handleMessageClientMessage(message) {
		switch (message.message) {
			case MESSAGE_TYPES.CLEAR:
				this.clearInput();

				document.querySelector("input.keystroke-input").focus();
				break;

			case MESSAGE_TYPES.QUERY_OPTION:
				this.handleQueryOption(message, _.omit(message, ["message"]));
				break;

			default:
				break;
		}
	}

	handleInputChange(event) {
		const input = event.target.value.trimStart();
		if (input === this.state.input) return;

		this.setState({
			input,
			tooltip: "",
			options: [],
			optionSeletedIndex: -1
		}, () => {
			this.sendMesageInput();
		});
	}

	handleQueryOption(queryOption) {
		this.handleQueryOptionAsyncQueue.push(async () => new Promise(resolve => {
			const options = Array.from(this.state.options);
			let optionSeletedIndex = this.state.optionSeletedIndex;

			options.push(queryOption);

			if (options.length === 1) optionSeletedIndex = 0;

			this.setState({
				options,
				optionSeletedIndex
			}, () => {
				this.sendMessageUpdateSize();

				return resolve();
			});
		}));
	}

	selectPrevious() {
		this.selectOptionIndex(this.state.optionSeletedIndex - 1 + this.state.options.length);
	}

	selectNext() {
		this.selectOptionIndex(this.state.optionSeletedIndex + 1);
	}

	selectOptionIndex(index) {
		index = index % this.state.options.length;
		if (index === this.state.optionSeletedIndex) return;

		this.setState({
			optionSeletedIndex: index % this.state.options.length
		});
	}

	executeSelectedOptionAndHide() {
		if (this.state.optionSeletedIndex >= 0) this.sendMessage(MESSAGE_TYPES.EXECUTE, _.pick(this.state.options[this.state.optionSeletedIndex], "query", "text", "pluginId"));

		this.clearInputAndHide();
	}

	clearInput() {
		this.setState({
			input: "",
			tooltip: "",
			options: [],
			optionSeletedIndex: -1
		});
	}

	clearInputAndHide() {
		this.clearInput();

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

	sendMesageInput() {
		const input = this.state.input.trim();

		if (input) {
			this.sendMessage(MESSAGE_TYPES.INPUT, {
				input
			});
		}
	}

	render() {
		// console.log("App.render", this.state);

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
					executeSelectedOptionAndHide={this.executeSelectedOptionAndHide}
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
				{this.props.options.map((queryOption, index) =>
					<KeystrokeOption key={index}
						caption={queryOption.text}
						description={_.get(queryOption, "meta.description")}
						icon={_.get(queryOption, "meta.icon")}

						selected={index === this.props.optionSeletedIndex}
						handleMouseMove={() => this.props.selectOptionIndex(index)}
						handleMouseUp={() => this.props.executeSelectedOptionAndHide()}
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
				onMouseUp={this.props.handleMouseUp}
			>
				{this.props.icon &&
					<div className="keystroke-option-icon">
						<img src={getPngSrcDataFromBase64String(this.props.icon)} alt="" />
					</div>
				}
				<div className="keystroke-option-text-container flex flex-vertical flex-vertical-items-center">
					<p className="keystroke-option-caption">{this.props.caption}</p>
					{this.props.description &&
						<p className="keystroke-option-description">{this.props.description}</p>
					}
				</div>
			</div>
		);
	}
}
