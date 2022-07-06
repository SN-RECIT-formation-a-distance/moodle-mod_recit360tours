

import React, { Component } from 'react';
import { faCloudUploadAlt} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class BtnUpload extends Component {
    static defaultProps = {
        onChange: null,
        accept: "",
        id: "",
        size: "",
        title: ""
    };

    constructor(props){
        super(props);
        this.id = props.id;
        if (props.id.length == 0){
            this.id = 'element-'+Date.now();
        }
        this.state = {fileName: ''};
    }

    render() {       
        let main =
                <label htmlFor={this.id} className={`btn btn-primary ${this.props.size}`} title={this.props.title} style={{margin: 0}}>
                    <FontAwesomeIcon icon={faCloudUploadAlt}/> {this.state.fileName}
                    <input id={this.id} style={{display: "none"}} type="file" name={this.props.name} onChange={(e) => this.onChange(e)} accept={this.props.accept}/>
                </label>

        return (main);
    }

    onChange(e){
        this.props.onChange(e);
        this.setState({ fileName:e.target.files[0].name});
    }
}
