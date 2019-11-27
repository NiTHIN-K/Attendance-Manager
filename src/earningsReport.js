import React, { Component } from "react";
import {
  Popup,
  Button,
  Header,
  Image,
  Modal,
  Menu,
  Icon
} from "semantic-ui-react";
import fire from "./fire";

class EarningsModal extends Component {
  constructor(props) {
    console.log("CONSTRUCTOR FOR ENDVIEEWMODAL");
    super(props);
    this.state = { open: false, totalPayments: 0, totalDays: 0 };
    var that = this;
    fire
      .database()
      .ref("month")
      .once("value", function(msnapshot) {
        var totalPaymentsCount = 0;
        msnapshot.forEach(function(mdata) {
          totalPaymentsCount += mdata.val().initBalance;
        });
        that.setState({ totalPayments: totalPaymentsCount });
        fire
          .database()
          .ref("/totals")
          .child("totalIncome")
          .set(totalPaymentsCount); //save to db
      });

    fire
      .database()
      .ref("dates")
      .once("value", function(snapshot) {
        var totalDaysCount = 0;
        snapshot.forEach(function(data) {
          totalDaysCount++;
        });
        that.setState({ totalDays: totalDaysCount });
        fire
          .database()
          .ref("/totals")
          .child("totalSessions")
          .set(totalDaysCount); //save to db
      });
  }

  show = dimmer => () => this.setState({ dimmer, open: true });
  close = () => this.setState({ open: false });

  render() {
    const { open, dimmer } = this.state;

    return (
      <div>
        <Menu.Item onClick={this.show()} color={"blue"}>
          <Icon name="dollar" color="light blue" />
          <div style={{ color: "#3399ff" }}>
            {" "}
            <h3>Earnings</h3> <br />{" "}
          </div>
        </Menu.Item>

        <Modal dimmer={dimmer} open={open} onClose={this.close}>
          <Modal.Header icon="money">Earnings Report</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <h3> Total Income: </h3>
              <p>${this.state.totalPayments}</p>
              <h3> Rent: ({this.state.totalDays} classes)</h3>
              <p>${this.state.totalDays * 50}</p>
              <div align="center">
                <h2>
                  {" "}
                  Profit: $
                  {this.state.totalPayments - this.state.totalDays * 35}{" "}
                </h2>
              </div>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={this.close}>
              OK
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default EarningsModal;
