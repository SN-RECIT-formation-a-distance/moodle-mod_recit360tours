// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This atto plugin allows to generate code for filter autolink and integrate them to your text.
 *
 * @package    atto_recitautolink
 * @copyright  2019 RECIT
 * @license    {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */
import React, { Component } from 'react';
import Select from 'react-select'

export class ComboBoxPlus extends Component {
    static defaultProps = {        
        onChange: null,    
        value: "",
        name: "",
        disabled: false,
        multiple: false,
        required: false,
        data: {},
        size: 1,
        placeholder: "",
        options: [],
        style: null,
        selectedIndex: -1
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.state = {value: this.props.value};
    }
    
    render() {     
        //  spread attributes <div {...this.props}>    
        let spreadAttr = {required: this.props.required, disabled: this.props.disabled, size: this.props.size, style: this.props.style, options: this.props.options};
        if (this.props.multiple){
            spreadAttr.isMulti = true;
        }

        let main = 
            <Select {...spreadAttr} onChange={this.onChange} defaultValue={this.props.value} placeholder={this.props.placeholder}>
            </Select>;            
        return (main);
    }   
    
    onChange(event){
        let value = event.value || "";
        let text = event.label;
        this.setState({value:value});

        this.props.onChange({target:{name: this.props.name, value: value, text: text, data: this.props.data}});
    }   
}
