import React, { Component } from "react";
import {
  Sidebar,
  Segment,
  Button,
  Menu,
  Image,
  Icon,
  Header
} from "semantic-ui-react";
import AppContent from "./AppContent";
import { StickyContainer, Sticky } from "react-sticky";
import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";
import EarningsModal from "./earningsReport";

import fire from "./fire";
import StudentView from "./StudentView";
import ReactConfirmAlert, { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

var classList = [];
var initialValue;

var divStyle = {
  marginTop: "15px",
  marginLeft: "20px",
  marginRight: "20px"
};

var fullScreen = {
  height: "100%" /** IE 6 */
  //min-height: "100%"
};

class App extends Component {
  constructor(props) {
    super(props);
    document.title = "Attendance Manager";
    this.state = {
      showDialog: false
    };
    //this.setState({showDialog:false});
    //var that = this
    this.updateValues();

    var msgRef = fire.database().ref("/");
    msgRef.child("msg").once("value", function(groupSnap) {
      if (groupSnap.exists()) {
        //console.log( groupSnap.val().yes + ' has ' + groupSnap.val().msg + ' chips ' );
        if (groupSnap.val().yes) {
          Alert.success(groupSnap.val().msg, {
            timeout: 5000,
            position: "bottom",
            effect: "slide"
          });
          msgRef.child("msg").remove();
        }
        //msgRef.child('msg').remove();
      }
    });
    this.state = { visible: false, menuList: classList };
  }

  resethandleClick = () => {
    this.setState({ showDialog: true });
  };
  resethandleConfirm = () => {
    this.setState({ open: false });
    //this.props.callbackReset();
  };

  closeIfOpen = () => {
    //this.updateValues();
    this.setState({ visible: false });
  };

  updateValues = () => {
    console.log("UPDATEVALUES1");
    fire
      .database()
      .ref("month")
      .once("value", function(msnapshot) {
        msnapshot.forEach(function(mdata) {
          var sessionCount = 0;
          //
          fire
            .database()
            .ref("dates")
            .once("value", function(snapshot) {
              snapshot.forEach(function(data) {
                var arrayOfNames = data.val().split(",");
                if (arrayOfNames.includes(mdata.val().name)) {
                  sessionCount++;
                }
              });
              var initBalanceToBeMinused = mdata.val().initBalance;
              mdata.ref
                .child("balance")
                .set(initBalanceToBeMinused - 5 * sessionCount);
            });
          //
        });
      });
    var that = this;
    fire
      .database()
      .ref("month")
      .once("value", function(snapshot) {
        classList = [];
        snapshot.forEach(function(data) {
          initialValue = data.val();
          classList.push(initialValue);
        });
        that.setState({ menuList: classList });
      });
  };

  toggleVisibility = () => {
    this.updateValues();
    this.setState({ visible: !this.state.visible });
  };

  resetAll = () => {
    var that = this;
    var dbRef = fire.database().ref("/");
    dbRef.once("value", function(groupSnap) {
      if (groupSnap.exists()) {
        //var str = JSON.stringify(groupSnap.val());
        //var res = str.replace("\"month\":", "\r\n\r\nStudent Data:\r\n");
        //var res2 = res.replace("},\"", "},\r\n");
        that.downloadContent(
          "Monthly Report.txt",
          JSON.stringify(groupSnap.val())
        ); //TODO change back to res2
      }

      var dateRef = fire.database().ref("/dates");
      dateRef.remove();

      fire
        .database()
        .ref("month")
        .once("value", function(snapshot) {
          //reset the values
          snapshot.forEach(function(data) {
            data.ref.child("balance").set(0);
            data.ref.child("initBalance").set(0);
          });
        });
      var addMsg = "All Balances and Attendence cleared";
      var messageOnRld = { yes: true, msg: addMsg };
      fire
        .database()
        .ref("/msg")
        .set(messageOnRld); //CHANGE PUSH BACK TO SET
      //window.setTimeout(window.location.reload(), 2000);
    });
  };

  downloadContent(name, content) {
    var atag = document.createElement("a");
    var file = new Blob([content], { type: "text/plain" });
    atag.href = URL.createObjectURL(file);
    atag.download = name;
    atag.click();
  }

  render() {
    //console.log(classList);
    var indents = [];
    for (var i = 0; i < this.state.menuList.length; i++) {
      indents.push(
        <Menu.Item aligned="center" className="indent" key={i}>
          <strong>{this.state.menuList[i].name}</strong>
          <br />
          Initial $: {classList[i].initBalance}
          <br />
          Current $: {classList[i].balance}
        </Menu.Item>
      );
    }
    const { visible } = this.state;
    return (
      <div
        onClick={() => {
          if (this.state.visible) {
            this.setState({ visible: false });
            console.log("onClick for close sidebar");
          }
        }}
      >
        {this.state.showDialog && (
          <ReactConfirmAlert //confirmation dialogue for resetting at month end
            title="Export & Reset Month?"
            message="This will export all data, and reset all balances. Continue?"
            confirmLabel="Yes"
            cancelLabel="Cancel"
            onConfirm={() => this.resetAll()}
            onCancel={() => this.setState({ showDialog: false })}
          />
        )}
        <Sidebar.Pusher onBlur={this.closeIfOpen}>
          <div>
            <div style={divStyle} className="rowC">
              <StudentView />
              <button
                floated="left"
                className="ui labeled icon button"
                onClick={this.toggleVisibility}
              >
                <i className="list layout icon" />
                View Current Roster
              </button>
            </div>
            <Sidebar
              as={Menu}
              animation="overlay"
              width="thin"
              visible={visible}
              icon="labeled"
              vertical
              inverted
            >
              {<EarningsModal />}

              {indents}
              <Menu.Item
                color="yellow"
                onClick={() => {
                  this.resethandleClick();
                }}
              >
                <Icon color="yellow" name="refresh" />
                <strong style={{ color: "yellow" }}>Export & Reset</strong>
              </Menu.Item>
            </Sidebar>
            <AppContent callbackUpdateVals={this.updateValues} />{" "}
            {/*-----------*/}
          </div>
        </Sidebar.Pusher>
      </div>
    );
  }
}

export default App; //enhanceWithClickOutside(App)
