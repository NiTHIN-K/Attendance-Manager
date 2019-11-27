import React from "react";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";

export default class DatePickerTry extends React.Component {
  constructor(props) {
    super(props);
    this.handleDayChange(new Date());
    this.handleDayChange = this.handleDayChange.bind(this);
    this.state = {
      selectedDay: new Date(),
      isDisabled: false
    };
  }
  handleDayChange(selectedDay, modifiers) {
    this.setState({
      selectedDay
      // isDisabled: modifiers.disabled === true,
    });
    this.props.onSelectDate(selectedDay);
  }

  render() {
    const { selectedDay, isDisabled } = this.state;
    return (
      <div>
        <DayPickerInput
          inputProps={{ readOnly: true }}
          value={selectedDay}
          onDayChange={this.handleDayChange}
          dayPickerProps={{
            selectedDays: selectedDay
            // disabledDays: {
            //   daysOfWeek: [0,2,4,5],
            // },
          }}
        />
      </div>
    );
  }
}
