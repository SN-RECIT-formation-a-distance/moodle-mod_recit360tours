import React, { Component } from 'react';
import { Modal as ModalBS } from 'react-bootstrap';

export class Modal extends Component{
    static defaultProps = {        
        title: "",
        body: null,
        footer: null,
        onClose: null,
        size: 'xl' //sm, lg, xl
    };

    render(){
        let main = 
            <>
                <ModalBS show={true} onHide={this.props.onClose} backdrop="static" keyboard={false}  size={this.props.size}>
                    <ModalBS.Header closeButton>
                        <ModalBS.Title>{this.props.title}</ModalBS.Title>
                    </ModalBS.Header>
                    <ModalBS.Body>{this.props.body}</ModalBS.Body>
                    <ModalBS.Footer>{this.props.footer}</ModalBS.Footer>
                </ModalBS>
        </>;

        return main;
    }
}