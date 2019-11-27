import React, { Component } from "react";
import { Input, Button } from "semantic-ui-react";

class NewStudPrompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.props.callbackFromParent(this.state.value);
  }

  /*handleSubmit(event) {
	  //alert('A name was submitted: ' + this.state.value);
	  event.preventDefault();
	}*/

  render() {
    return (
      <div>
        {/*<label>*/}
        <Input
          placeholder="Name"
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
          onBlur={this.handleChange}
          style={{ width: "100%" }}
        />
        {/*</label>*/}
      </div>
    );
  }
}

export default NewStudPrompt;
