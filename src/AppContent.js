import React from "react";
import createClass from "create-react-class";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";
import fire from "./fire";  // Refers to firebase configuration, not included in repo
import {
  Sidebar,
  Segment,
  Button,
  Menu,
  Image,
  Icon,
  Header
} from "semantic-ui-react";
import AddStudentDialogue from "./AddStudentDialogue";
import "semantic-ui-css/semantic.min.css";
import DatePickerTry from "./datePicker";

import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";

var divStyle = {
  padding: "20px"
};

var VALUES = [];
var initialValue;
var inputDate;
var isUnique = true;
var selectedDay;

var AppContent = createClass({
  displayName: "MultiSelectField",
  propTypes: {
    label: PropTypes.string
  },

  componentWillMount() {},

  componentDidMount() {},

  updateValues() {
    var that = this;
    console.log("UPDATEVALUES 2");
    fire
      .database()
      .ref("month")
      .once("value", function(msnapshot) {
        msnapshot.forEach(function(mdata) {
          var sessionCount = 0;
          var arrayOfNames = [];
          fire
            .database()
            .ref("dates")
            .once("value", function(snapshot) {
              snapshot.forEach(function(data) {
                arrayOfNames = data.val().split(",");
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
  },

  getInitialState() {
    var that = this;

    fire
      .database()
      .ref("month")
      .once("value", function(snapshot) {
        snapshot.forEach(function(data) {
          var usrDates = data.val().dates;
          if (usrDates != null) {
            console.log("user's dates ", usrDates);
            for (var key in usrDates) {
              if (usrDates.hasOwnProperty(key)) {
                if (usrDates[key] === inputDate) {
                  var tempAttend = {
                    label: data.val().name,
                    value: data.val().name
                  };
                }
              }
            }
          }
          //this.setState({initialValue : initialValue});
          //var tempStud = { label: initialValue.name, value: initialValue.name }
          //VALUES.push(tempStud);
        });
        //that.handleSelectChange(ATTENDANCE);//TODO change back
        //that.handleSelectChange(VALUES);	//for what is shown already for this date
      });
    return {
      numStudents: 0,
      clearable: false
      //value: []// left off
    };
  },

  handleSelectChange(value) {
    //console.log('HANDLESELECTCHANGE', value);
    var result = [];
    result = value.toString().split(",");

    if (true) {
      //if(selectedDay == 1 || selectedDay == 3 || selectedDay == 6){
      var dateRef = fire.database().ref("dates");
      dateRef.child(inputDate).set(value);
      if (value == "") {
        console.log("nothing found in date attendence clearing...");
        dateRef.child(inputDate).remove();
      }
    }
    var num = result.length;
    console.log(result);
    if (result[0] == [""]) {
      this.setState({ numStudents: 0 });
    } else {
      this.setState({ numStudents: num });
    }
    this.updateValues();
    this.setState({ value });
    this.props.callbackUpdateVals();
  },

  handleDateChange(newDate) {
    //this is for getting the list
    var that = this;
    //console.log('day:', newDate.getDay());
    inputDate = newDate.toDateString();
    selectedDay = newDate.getDay();
    var matchingDateFound = false;
    if (true) {
      //if(selectedDay == 1 || selectedDay == 3 || selectedDay == 6){
      fire
        .database()
        .ref("dates")
        .once("value", function(snapshot) {
          var iterator = 0;
          snapshot.forEach(function(data) {
            //console.log('checking ', inputDate, 'vs', Object.keys(snapshot.val())[iterator]);
            if (Object.keys(snapshot.val())[iterator] == inputDate) {
              matchingDateFound = true;
              //console.log('students for this day', data.val());
              //ATTENDANCE = data.val().split(',');
              that.handleSelectChange(data.val());
            }
            iterator++;
          });
          if (!matchingDateFound) {
            that.handleSelectChange([]);
          }
        });
    } else {
    }
  },

  addStudent(nname, amt) {
    var newStudent = { name: nname, initBalance: amt, balance: amt };

    fire
      .database()
      .ref("month")
      .once("value", function(snapshot) {
        snapshot.forEach(function(data) {
          initialValue = data.val();
          console.log(initialValue);
          if (initialValue.name == nname) {
            console.log("duplicate  found");
            isUnique = false;
          }
        });
        var amtCheck = amt;
        if (nname == null || amt == null || nname == "" /*|| amt == ''*/) {
          isUnique = false;
          console.log("USINQUE WAS FALSE name amt", nname, amt);
        }
        if (nname.includes(",")) {
          isUnique = false;
        }
        if (isUnique) {
          var monthRef = fire.database().ref("month");
          monthRef.child(nname).set(newStudent);
          var addMsg = "New student " + nname + " added!";
          var messageOnRld = { yes: true, msg: addMsg };
          fire
            .database()
            .ref("/msg")
            .set(messageOnRld);
          window.location.reload();
        } else {
          isUnique = true;
          Alert.error("Name is already taken, or field left blank", {
            timeout: 5000,
            position: "bottom",
            effect: "slide"
          });
          console.log("Name error");
        }
      });
  },

  render() {
    fire
      .database()
      .ref("month")
      .once("value", function(snapshot) {
        snapshot.forEach(function(data) {
          var tempAttend = { label: data.val().name, value: data.val().name };
          var isDupe = false;
          for (var key in VALUES) {
            if (VALUES.hasOwnProperty(key)) {
              if (VALUES[key].value === tempAttend.label) {
                isDupe = true;
                //var tempAttend = { label: data.val().name, value: data.val().name }
                //console.log('name', data.val().name);
                //ATTENDANCE.push(tempAttend);
              }
            }
          }
          if (!isDupe) {
            VALUES.push(tempAttend);
            //console.log(VALUES)
          }
        });
        //that.handleSelectChange(VALUES);	//for what is shown already for this date
      });

    const { value } = this.state;
    const options = VALUES;
    return (
      <div className="section" style={divStyle}>
        <AddStudentDialogue callbackFromParent={this.addStudent} />
        <h3 className="section-heading">
          {this.props.label}Attendance for: {this.state.numStudents}
        </h3>
        <h2>
          <DatePickerTry onSelectDate={this.handleDateChange} />{" "}
        </h2>
        <h3>
          <Select
            //closeOnSelect={!stayOpen}
            multi
            clearable={this.state.clearable}
            onChange={this.handleSelectChange}
            options={options}
            placeholder="Select attending students..."
            removeSelected={this.state.removeSelected}
            simpleValue
            value={value}
          />
        </h3>

        <Alert stack={false} />
        {/* <Button positive fluid onClick={() => { window.location.reload(); }}>Submit</Button> */}
        {/* <Button positive onClick = {console.log('click')}>Positive Button</Button>			 */}
      </div>
    );
  }
});

export default AppContent;
