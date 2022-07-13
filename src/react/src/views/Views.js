import React, { Component } from 'react';
import { ButtonGroup, Button} from 'react-bootstrap';
import { faWrench} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EditImage360, ViewImage360 } from './Image360View';

class BtnModeEdition extends Component{
    static defaultProps = {
        variant: "",
        text: "",
        children: null
    };

    render(){
        return <div style={{display: "flex", justifyContent: "flex-end"}}>                    
                    {this.props.children}
                    <ButtonGroup>
                        <Button variant={this.props.variant} onClick={this.props.onClick}><FontAwesomeIcon icon={faWrench}/>{" " + this.props.text}</Button>
                    </ButtonGroup>
                </div>;
    }
}

export class TeacherView extends Component {
    constructor(props) {
        super(props);

        this.onModeEditionClick = this.onModeEditionClick.bind(this);

        this.state = {modeEdition: false};
    }

    render() {       
        let main =
            <div>
                {this.state.modeEdition ? 
                    <div>
                        <BtnModeEdition variant="danger" onClick={this.onModeEditionClick} text={"Désactiver le mode d'édition"}></BtnModeEdition>
                        <EditImage360/> 
                    </div>
                : 
                    <div>
                        <BtnModeEdition variant="warning" onClick={this.onModeEditionClick} text={"Activer le mode d'édition"}></BtnModeEdition>
                        <br/><br/>
                        <ViewImage360/> 
                    </div>
                }
            </div>;

        return (main);
    }

    onModeEditionClick(event){
      this.setState({modeEdition: !this.state.modeEdition});
    }
}

export class StudentView extends Component {
    constructor(props) {
        super(props);
    }

    render() {       
        let main = <ViewImage360 />;

        return (main);
    }
}