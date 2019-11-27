import React, { Component } from "react";
import { Popup, Button, Header, Image, Modal } from "semantic-ui-react";
import NumericInput from "react-numeric-input";

var newStudAmt = 0;

class AddMoneyDialogue extends Component {
  state = { open: false };

  show = dimmer => () => this.setState({ dimmer, open: true });
  close = () => this.setState({ open: false });

  addStudBtn = event => {
    console.log("newstudent $$ is: ", newStudAmt);
    this.props.callbackAddMoney(newStudAmt);
    newStudAmt = 0;
    this.close();
  };

  myCallbackNum = dataFromChild => {
    newStudAmt = dataFromChild.value;
    console.log("amount is ", newStudAmt);
  };

  handleNumChange = value => {
    newStudAmt = value;
    console.log(newStudAmt);
  };

  render() {
    const { open, dimmer } = this.state;
    //onClick={(event) => { func1(); func2();}}
    //this.show(true)
    return (
      <div>
        <Button
          positive
          fluid
          className="ui labeled icon button"
          onClick={this.show(true)}
        >
          <i className="dollar icon" />
          Adjust Initial Balance
        </Button>
        {/*<Button onClick={this.show(true)}>Add New Student</Button>*/}

        <Modal
          size="mini"
          dimmer={dimmer}
          open={open}
          onClose={() => {
            newStudAmt = null;
            console.log(newStudAmt);
            this.close;
          }}
        >
          <Modal.Header>Add/Subtract to Student's Initial Balance</Modal.Header>
          <Modal.Content>
            {/*<Image wrapped size='medium' src='/assets/images/avatar/large/rachel.png' />*/}
            <Modal.Description>
              {/*<Header>Default Profile Image</Header>*/}
              <p>Money to add/subtract to Initial Balance:</p>
              <NumericInput
                onChange={this.handleNumChange}
                //value={0}
                //min={ 0 }
                size={6}
                step={5}
                placeholder="$"
                mobile={true}
                style={{
                  wrap: {
                    textAlign: "center",
                    width: "100%",
                    //background: '#E2E2E2',
                    boxShadow: "0 0 1px 1px #fff inset, 1px 1px 5px -1px #000",
                    padding: "2px 2.26ex 2px 2px",
                    borderRadius: "6px 3px 3px 6px",
                    fontSize: 32
                  },
                  textAlign: "center"
                }}
              />
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button
              color="red"
              onClick={() => {
                newStudAmt = 0;
                console.log(newStudAmt);
                this.close();
              }}
            >
              Cancel
            </Button>
            <Button
              positive
              icon="checkmark"
              labelPosition="right"
              content="Add"
              onClick={this.addStudBtn}
            />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default AddMoneyDialogue;
