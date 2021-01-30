import React from "react";

const { MESSAGE_TYPES } = app.enums;

class KeystrokeOption extends React.Component {
	render() {
		return (
			<div className={app.libs.classnames("keystroke-line keystroke-option", { "keystroke-line-selected": this.props.selected })} onMouseMove={this.props.handleMouseMove}>
				<div className="keystroke-option-icon" />
				<div className="keystroke-option-text-container">
					<p className="keystroke-option-caption">{this.props.caption}</p>
					<p className="keystroke-option-description">{this.props.description}</p>
				</div>
			</div>
		);
	}
}

class Keystroke extends React.Component {
	constructor() {
		super();

		this.handleKeyDown = this.handleKeyDown.bind(this);
	}

	state = {
		value: "",
		seletedIndex: 0
	}

	componentDidMount() {
		document.addEventListener("keydown", this.handleKeyDown);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.handleKeyDown);
	}

	handleKeyDown(event) {
		switch (event.key) {
			case "ArrowUp": this.selectPrevious(); break;
			case "ArrowDown": this.selectNext(); break;
			case "Enter": break;
			default: break;
		}
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

	handleInputChange(event) {
		const value = event.target.value;

		this.setState({ value });

		this.props.onInputChange && this.props.onInputChange(value);
	}

	render() {
		return (
			<div className="keystroke-container">
				<div className="keystroke-line">
					<input className="keystroke-input" value={this.state.value} onChange={this.handleInputChange.bind(this)} autoFocus spellCheck={false} />
				</div>
				{this.props.options.map((option, index) =>
					<KeystrokeOption
						key={index} caption={option.caption} description={option.description} selected={index === this.state.seletedIndex}
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

		window.ipcClient.on("message", this.handleMessage.bind(this));
	}

	state = {
		options: []
	}

	handleMessage(message, data) {
		console.log(message, data);
	}

	render() {
		return (
			<Keystroke options={this.state.options} onInputChange={value => {
				window.ipcClient.sendMessage(MESSAGE_TYPES.INPUT, value);

				const options = [];
				for (let i = 0; i < value.length; i++) {
					options.push({ caption: value.slice(0, i + 1), description: "Start app ..." });
				}

				this.setState({ options });
			}} />
		);
	}
};
