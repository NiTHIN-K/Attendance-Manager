import React, { Component } from 'react'
import { Popup, Button, Header, Image, Modal } from 'semantic-ui-react'
import NewStudPrompt from './inputName'

import NumericInput from 'react-numeric-input';


var newStudName;
var newStudAmt = 0;

class AddStudentDialogue extends Component {
  state = { open: false }

  show = dimmer => () => this.setState({ dimmer, open: true })
  close = () => this.setState({ open: false })
  
  addStudBtn = (event) => {
    console.log('newstudent $$ is: ', newStudAmt);
    this.props.callbackFromParent(newStudName, newStudAmt);
    newStudAmt = 0;
    newStudName = null;
    this.close()
  }

  myCallback = (dataFromChild) => {
    newStudName = dataFromChild;
    console.log('newname is ',  newStudName);
  }

  myCallbackNum = (dataFromChild) => {
    newStudAmt = dataFromChild.value;
    console.log('amount is ',  newStudAmt);

  }

  handleNumChange = (value) => {
    newStudAmt = value;
    console.log(newStudAmt);
  }

  render() {
    const { open, dimmer } = this.state
//onClick={(event) => { func1(); func2();}}
//this.show(true)
    return (
      <div>
        <button className="ui labeled icon button" onClick={this.show(true)}>
            <i className="plus icon"></i>
                Add New Student&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </button>
        {/*<Button onClick={this.show(true)}>Add New Student</Button>*/}

        <Modal size='mini' dimmer={dimmer} open={open} onClose={()=>{ newStudName, newStudAmt = null; console.log(newStudName, newStudAmt); this.close }}>
          <Modal.Header>Add new student</Modal.Header>
          <Modal.Content>
            {/*<Image wrapped size='medium' src='/assets/images/avatar/large/rachel.png' />*/}
            <Modal.Description>
              {/*<Header>Default Profile Image</Header>*/}
              <p>Enter Name, Initial Balance:</p>
              <NewStudPrompt callbackFromParent={this.myCallback}/>
              <NumericInput
              onChange={this.handleNumChange}
              //value={0}
              min={ 0 }
              size={6}
              step={5}
              placeholder='$'
              mobile={true}
              style={{
                  wrap: {
                    textAlign: 'center',
                    width : '100%',
                      //background: '#E2E2E2',
                      boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
                      padding: '2px 2.26ex 2px 2px',
                      borderRadius: '6px 3px 3px 6px',
                      fontSize: 32
                  }, textAlign: 'center'   }}/>
             </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color='red' onClick={()=>{ newStudName = null; newStudAmt = 0 ;console.log(newStudName, newStudAmt); this.close(); }}>Cancel</Button>
            <Button positive icon='checkmark' labelPosition='right' content="Add" onClick={this.addStudBtn} />
          </Modal.Actions>
        </Modal>
      </div>
    )
  }
}

export default AddStudentDialogue
