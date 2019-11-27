//popup confirming removal of student
import React, { Component } from "react";
import ReactConfirmAlert, { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { Button, Confirm, Icon } from "semantic-ui-react";

class ConfirmRemove extends React.Component {
  state = {
    showDialog: false //change back to false
  };

  handleClick = () => {
    this.setState({ showDialog: true });
  };
  handleConfirm = () => {
    //this.setState({ open: false });
    this.props.callbackRemove(); //MAYBE WORKS
  };

  render() {
    return (
      <div>
        <Button
          negative
          className="ui labeled icon button"
          fluid
          onClick={this.handleClick}
        >
          <Icon name="remove" />
          Delete Student
        </Button>

        {this.state.showDialog && (
          <ReactConfirmAlert
            title="Delete Student?"
            message="Are you sure you want to delete this student?"
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => this.props.callbackRemove()}
            onCancel={() => this.setState({ showDialog: false })}
          />
        )}
      </div>
    );
  }
}

export default ConfirmRemove;
