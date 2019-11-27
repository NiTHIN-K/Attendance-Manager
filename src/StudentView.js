import React, { Component } from "react";
import {
  Popup,
  Button,
  Header,
  Image,
  Modal,
  Icon,
  List
} from "semantic-ui-react";
import Select from "react-select";
import "react-select/dist/react-select.css";
import fire from "./fire";
import StudentSearchField from "./StudentViewSelect";
import ConfirmRemove from "./PopupRemove";

import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";

import AddMoneyDialogue from "./AddMoneyDialogue";
import { isNullOrUndefined } from "util";

var VALUES = [];
var dates = [];
var dateStr = [];
var findStudName = { name: "", balance: "", initBalance: "" }; //student object is stored in this value

class StudentView extends Component {
  state = { open: false, setText: findStudName, attendDates: [] };

  show = dimmer => () => {
    this.setState({ dimmer, open: true });
    this.setState({ setText: { name: "", balance: "", initBalance: "" } });
    this.setState({ attendDates: [] });
  };
  close = () => this.setState({ open: false });

  selectStudent = dataFromChild => {
    var that = this;
    console.log("findname is ", dataFromChild);

    var studRef = fire.database().ref("/month");
    studRef.child(dataFromChild).once("value", function(groupSnap) {
      if (groupSnap.exists()) {
        console.log(
          groupSnap.val().name + " has " + groupSnap.val().balance + " balance "
        );
        findStudName = groupSnap.val(); //student object is stored in this value
        that.setState({ setText: findStudName });

        //----------------
        dates = [];
        dateStr = [];
        fire
          .database()
          .ref("dates")
          .once("value", function(snapshot) {
            snapshot.forEach(function(data) {
              if (data.val().includes(groupSnap.val().name)) {
                dateStr.push(data.key + "");
                console.log("PUSHING TO DATESTR: ", data.key);
              }
            });
            if (dateStr.length >= 2) {
              console.log(dateStr[i] + " vs " + dateStr[i + 1]);
              for (var i = 0; i < dateStr.length; i++) {
                var one = Number.parseInt((dateStr[i] + "").split(" ")[2], 10);
                var two = Number.parseInt(
                  (dateStr[i + 1] + "").split(" ")[2],
                  10
                );

                if (one > two) {
                  var temp = dateStr[i];
                  console.log(dateStr[i] + " vs " + dateStr[i + 1]);
                  dateStr[i] = dateStr[i + 1];
                  dateStr[i + 1] = temp;
                }
              }
            }
            for (var j = 0; j < dateStr.length; j++) {
              dates.push(<List.Item>{dateStr[j]}</List.Item>);
            }
            that.setState({ attendDates: dates });
          });
        //----------------
      }
    });
  };

  removeStudent = () => {
    console.log("REMOVE STUDENT");
    var that = this;
    if (that.state.setText.name != "") {
      console.log("removing");
      var studRef = fire.database().ref("/month");
      studRef.child(that.state.setText.name).remove();
      //var msgRef = fire.database().ref('/');
      var removeMsg = "Student " + that.state.setText.name + " removed.";
      var messageOnRld = { yes: true, msg: removeMsg };
      fire
        .database()
        .ref("/msg")
        .set(messageOnRld); //Confirmation Dialogue
      window.location.reload();
    } else {
      Alert.error("Select a student first", {
        timeout: 5000,
        position: "bottom",
        effect: "slide"
      });
    }
  };

  addMoney = amt => {
    var that = this;
    if (that.state.setText.name != "") {
      console.log("removing");
      var studRef = fire.database().ref("/month");
      studRef
        .child(that.state.setText.name)
        .child("initBalance")
        .set(that.state.setText.initBalance + amt);
      studRef
        .child(that.state.setText.name)
        .child("balance")
        .set(that.state.setText.initBalance + amt);
      var removeMsg =
        "$" +
        amt +
        " added to " +
        that.state.setText.name +
        "'s Initial Balance.";
      var messageOnRld = { yes: true, msg: removeMsg };
      fire
        .database()
        .ref("/msg")
        .set(messageOnRld); //Confirmation Dialogue
      window.location.reload();
    } else {
      Alert.error("Select a student first", {
        timeout: 5000,
        position: "bottom",
        effect: "slide"
      });
    }
  };

  render() {
    const { open, dimmer } = this.state;
    /*if(!this.state.attendDates.isNullOrUndefined){
      if(this.state.attendDates.length > 1){
        for(var i = 0; i< this.state.attendDates.length; i++)
        {
          if(this.state.attendDates[i].props.children.split(" ")[2].parseInt() < this.state.attendDates[i].props.children.split(" ")[2].parseInt()){
            //yeTAGA!!!
          };
        }
      }
    }*/
    return (
      <div>
        <Button
          icon
          /*labelPosition='left' size='tiny'*/ floated="right"
          onClick={this.show(true)}
        >
          <Icon name="search" size="large" /> <br />
          <br />
          View/Edit
          <br />
          Student
          <br />
          Details
          <br />
        </Button>

        <Modal dimmer={dimmer} open={open} onClose={this.close} closeIcon>
          <Modal.Header>Student Details</Modal.Header>
          <Modal.Content>
            <StudentSearchField callbackFromParent={this.selectStudent} />
            {/*ADSFAFSDAFSDASDF*/}
            <Modal.Description align="center">
              <Header align="center">{this.state.setText.name}</Header>
              {/*----------*/}
              <List horizontal>
                <List.Item>
                  <List.Content align="center">
                    <List.Header align="center">Initial Balance</List.Header>
                    {"$ " + this.state.setText.initBalance}
                  </List.Content>
                </List.Item>
                <List.Item>
                  <List.Content align="center">
                    <List.Header align="center">Current Balance</List.Header>
                    {"$ " + this.state.setText.balance}
                  </List.Content>
                </List.Item>
                <List.Item>
                  <List.Content align="center">
                    <List.Header align="center">Sessions</List.Header>
                    {(this.state.setText.initBalance -
                      this.state.setText.balance) /
                      5}
                  </List.Content>
                </List.Item>
              </List>
              {/*----------*/}
              <h3>Attendence </h3>
              <List bulleted>
                {this.state.attendDates}
                {/*-------------------Amove this to the top of render and fjdksfafsaldjk*/}
              </List>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <AddMoneyDialogue callbackAddMoney={this.addMoney} />
            <br />
            <ConfirmRemove callbackRemove={this.removeStudent} />
          </Modal.Actions>
          <br />
        </Modal>
      </div>
    );
  }
}

export default StudentView;

//-------------------------------------
