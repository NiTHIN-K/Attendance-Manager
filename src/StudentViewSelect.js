import React from "react";
import createClass from "create-react-class";
import PropTypes from "prop-types";
import Select from "react-select";
import fire from "./fire";

var STUDENTS = [];

var StudentSearchField = createClass({
  value: "",
  displayName: "StatesField",
  propTypes: {
    label: PropTypes.string,
    searchable: PropTypes.bool
  },
  getDefaultProps() {
    return {
      label: "Student name:",
      searchable: true
    };
  },
  componentWillMount() {
    STUDENTS = [];
    fire
      .database()
      .ref("month")
      .once("value", function(snapshot) {
        snapshot.forEach(function(data) {
          var tempAttend = { label: data.val().name, value: data.val().name };
          STUDENTS.push(tempAttend);
        });
        //that.handleSelectChange(STUDENTS);	//for what is shown already for this date
      });
  },
  getInitialState() {
    return {
      disabled: false,
      searchable: this.props.searchable,
      clearable: true
    };
  },
  updateValue(newValue) {
    this.setState({
      selectValue: newValue
    });
    console.log("calling back " + newValue);
    this.props.callbackFromParent(newValue);
  },
  focusStateSelect() {
    this.refs.stateSelect.focus();
  },
  render() {
    var options = STUDENTS;
    return (
      <div className="section">
        <h3 className="section-heading">{this.props.label} </h3>
        <Select
          id="state-select"
          ref={ref => {
            this.select = ref;
          }}
          onBlurResetsInput={false}
          onSelectResetsInput={false}
          autoFocus
          options={options}
          simpleValue
          clearable={this.state.clearable}
          name="selected-state"
          disabled={this.state.disabled}
          value={this.state.selectValue}
          onChange={this.updateValue}
          rtl={this.state.rtl}
          searchable={this.state.searchable}
        />
      </div>
    );
  }
});

export default StudentSearchField;
