import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';

/**************************************************************************************
 *  il ne faut pas charger le bootstrap de base car il est déjà chargé dans le thème
 * //import 'bootstrap/dist/css/bootstrap.min.css';  
 **************************************************************************************/ 
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {VisualFeedback, Loading} from "./libs/components/Components";
import Utils, {UtilsMoodle} from "./libs/utils/Utils";
import {TeacherView, StudentView} from "./views/Views";
import {$glVars} from "./common/common";
import "./css/style.scss";

export * from "./common/i18n";
 
class App extends Component {
    static defaultProps = {
        tourId: 0
    };

    constructor(props) {
        super(props);

        this.onFeedback = this.onFeedback.bind(this);

        $glVars.urlParams = Utils.getUrlVars();
        $glVars.urlParams.id = parseInt($glVars.urlParams.id, 10) || 0;
        $glVars.urlParams.tourId = parseInt(props.tourId, 10)

        this.state = {mode: 't'};
    }

    componentDidMount(){
        $glVars.feedback.addObserver("App", this.onFeedback); 
    }

    componentWillUnmount(){
        $glVars.feedback.removeObserver("App");        
    }

    render() {       
        let main =
            <div>
                {this.state.mode  === 't' ? <TeacherView/> : <StudentView/>}
                {$glVars.feedback.msg.map((item, index) => {  
                    return (<VisualFeedback key={index} id={index} msg={item.msg} type={item.type} title={item.title} timeout={item.timeout}/>);                                    
                })}
                <Loading webApi={$glVars.webApi}><FontAwesomeIcon icon={faSpinner} spin/></Loading>
            </div>

        return (main);
    }

    onFeedback(){
        this.forceUpdate();
    }
}

document.addEventListener('DOMContentLoaded', function(){ 
    const domContainer = document.getElementById('mod_recit360tours');
    const root = createRoot(domContainer);
    root.render(<App tourId={domContainer.getAttribute('data-tour-id')}/>);
}, false);
