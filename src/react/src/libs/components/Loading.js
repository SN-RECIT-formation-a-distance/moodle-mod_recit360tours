import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { $glVars } from '../../common/common';

export class Loading extends Component{
    static defaultProps = {
        webApi: null,
        children: null
    };

    constructor(props){
        super(props);

        this.onAbort = this.onAbort.bind(this);

        this.domRef = React.createRef();

        this.state = {timeout: 0, elapsedTime: 0}
    }

    renderChildren() {        
        return React.Children.map(this.props.children, (child, index) => {
            if(child === null){ return (null); }

            return React.cloneElement(child, {
                className: "Img"
            });
        });
    }

    componentDidMount(){
        if(this.props.webApi === null){ return; }

        this.props.webApi.domVisualFeedback = this.domRef.current;

        const that = this;
        let intervalId = 0;
        const observer = new MutationObserver(() => {
            // Loader became visible
            if (window.getComputedStyle(that.domRef.current).display !== 'none') {

                let timeout = parseInt(that.domRef.current.dataset.timeout) || 0;

                if(timeout > 0){
                    that.setState({timeout: timeout, elapsedTime: timeout});
                }

                intervalId = window.setInterval(() => {
                    that.setState({elapsedTime: that.state.elapsedTime - 1});
                }, 1000);
            }
            else{
                window.clearTimeout(intervalId);
            }
        });

        observer.observe(this.domRef.current, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    render(){
        let main =
            <div ref={this.domRef} className="Loading">
                <div className='overlay'></div>
                <div className='content p-2 rounded'>
                    {this.renderChildren()}                    
                </div>
            </div>;

        /*<br/>
            <Button variant="link" className='text-white' style={{fontSize: '12px'}} onClick={this.onAbort}>Annuler la requête</Button>                            
        */

        return ReactDOM.createPortal(main, document.body);
    }

    onAbort(){
        $glVars.webApi.abort();
    }
}