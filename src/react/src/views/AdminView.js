import React, { Component } from 'react';
import {ButtonToolbar, ButtonGroup, Button, Form, Col, DropdownButton, Dropdown, Modal, Nav, Card, Pagination, Row} from 'react-bootstrap';
import {faArrowLeft, faArrowRight, faPencilAlt, faPlusCircle, faWrench, faTrashAlt, faBars, faTv, faEye, faAngleRight, faGripVertical, faPen} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ComboBox, FeedbackCtrl, DataGrid} from '../libs/components/Components';
import {JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';
import { PageView } from './StudentView';
import { EditImage360, ViewImage360} from './Image360View';

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
        this.onSelectUser = this.onSelectUser.bind(this);

        this.state = {modeEdition: true, selectedUserId: 0};
    }

    /*componentDidMount(){
        let that = this;

        let callback = function(result){
            if(!result.success){
                FeedbackCtrl.instance.showError($glVars.i18n.appName, result.msg);
                return;
            }
            that.setState({modeEdition: result.data});
        }

        $glVars.webApi.isEditingMode(callback);
    }*/

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
                        <ViewImage360/> 
                    </div>
                }
            </div>;
            /*<GroupUserSelect onSelectUser={this.onSelectUser}/>
                        <PageEvaluationView userId={this.state.selectedUserId}/>*/

        return (main);
    }

    onModeEditionClick(event){
      this.setState({modeEdition: !this.state.modeEdition, selectedUserId: 0});
    }

    onSelectUser(userId){
        this.setState({selectedUserId: userId});
    }
}


class GroupUserSelect extends Component{
    static defaultProps = {
        onSelectUser: null
    };

    constructor(props){
        super(props);

        this.onSelectGroup = this.onSelectGroup.bind(this);
        this.onSelectUser = this.onSelectUser.bind(this);
        this.onPrevious = this.onPrevious.bind(this);
        this.onNext = this.onNext.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);

        this.state = {selectedUserIndex: -1, selectedGroupId: -1, groupList:[], userList: []};
    }

    componentDidMount(){
        this.getData();
    }
    
    getData(){
        $glVars.webApi.getEnrolledUserList($glVars.urlParams.id, this.getDataResult);
    }

    getDataResult(result){
        if(!result.success){
            FeedbackCtrl.instance.showError($glVars.i18n.appName, result.msg);
            return;
        }
        
        let groupList = [];
        let userList = [];
        for(let group of result.data){
            groupList.push({text: group[0].groupName, value: group[0].groupId, data: group});
            for(let user of group){
                if(JsNx.getItem(userList, "value", user.userId, null) === null){
                    userList.push({text: user.userName, value: user.userId, data: user});
                }
            }
        }

        groupList.sort((a, b) => { return ('' + a.text).localeCompare(b.text);})
        userList.sort((a, b) => { return ('' + a.text).localeCompare(b.text);})

        if(!$glVars.urlParams.loaded){
            this.setState(
                {groupList: groupList, userList: userList, selectedUserIndex: JsNx.getItemIndex(userList, 'value', $glVars.urlParams.userId)}, 
                () => this.props.onSelectUser($glVars.urlParams.userId)
            );
        }
        else{
            this.setState({groupList: groupList, userList: userList});
        }
    }

    render(){
        let userList = this.state.userList;
        let selectedGroupId = this.state.selectedGroupId;

        if(selectedGroupId > 0){
            userList = this.state.userList.filter(function(item){
                return (item.data.groupId.toString() === selectedGroupId.toString());
            })
        }

        let value = ""; 
            
        if(JsNx.exists(userList, this.state.selectedUserIndex)){
            value = userList[this.state.selectedUserIndex].value;
        }

        let main =
            <div>
                <Row>
                    <Col sm={6}>
                        <Form.Group as={Col}>
                            <Form.Label>Sélectionnez le groupe:</Form.Label>
                            <ComboBox placeholder={"Sélectionnez votre option"} options={this.state.groupList} onChange={this.onSelectGroup} value={this.state.selectedGroupId}/>
                        </Form.Group>
                    </Col>
                    {this.props.onSelectUser !== null && 
                        <Col sm={6}>
                            <Row>
                                <Col sm={12}>
                                    <Form.Group  as={Col}>
                                        <Form.Label>Sélectionnez l'utilisateur:</Form.Label>
                                        <ComboBox placeholder={"Sélectionnez votre option"} options={userList} onChange={this.onSelectUser} value={value} style={{float: "left", width: "90%"}}/>
                                        <ButtonGroup style={{display: "flex"}}>
                                            <Button variant="link" onClick={() => this.onPrevious(userList)} disabled={(this.state.selectedUserIndex <= -1)}><FontAwesomeIcon icon={faArrowLeft}/></Button>
                                            <Button variant="link" onClick={() => this.onNext(userList)} disabled={(userList.length <= (this.state.selectedUserIndex + 1))}><FontAwesomeIcon icon={faArrowRight}/></Button>
                                        </ButtonGroup>
                                    </Form.Group>
                                    
                                </Col>
                            </Row>
                        </Col>       
                    }        
                </Row>
            </div>;

        return (main);
    }

    onSelectGroup(event){
        this.setState({selectedGroupId: event.target.value, selectedUserIndex: -1});
    }

    onSelectUser(event){
        let userId = parseInt(event.target.value, 10) || 0;
        this.setState({selectedUserIndex: event.target.index}, () => this.props.onSelectUser(userId));
    }

    onPrevious(userList){
        let newIndex = this.state.selectedUserIndex - 1;
        let value = (newIndex < 0 ? 0 : userList[newIndex].value);
        this.setState({selectedUserIndex: newIndex}, this.props.onSelectUser(parseInt(value, 10)));
    }

    onNext(userList){
        let newIndex = this.state.selectedUserIndex + 1;
        let value = userList[newIndex].value;
        this.setState({selectedUserIndex: newIndex}, this.props.onSelectUser(parseInt(value, 10)));
    }
}

class ModalPageEvalForm extends Component{
    static defaultProps = {        
        pageId: 0,
        userId: 0,
        onClose: null,
    };

    constructor(props){
        super(props);

        this.onDataChange = this.onDataChange.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onSaveResult = this.onSaveResult.bind(this);
        this.prepareNewState = this.prepareNewState.bind(this);
        this.onClose = this.onClose.bind(this);
        
        this.state = {data: null,  formValidated: false};

        this.formRef = React.createRef();
    }

    componentDidMount(){
        this.getData();             
    }  

    componentWillUnmount(){
     
    }

    render(){
        if(this.state.data === null) return null;

        let data = this.state.data;
    
        let main =
            <Modal show={true} onHide={() => this.props.onClose()} backdrop="static" size="sm" >
                <Modal.Header closeButton>
                    <Modal.Title>{`Page: ${data.name}`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>                          
                    <Form noValidate validated={this.state.formValidated} onSubmit={this.onSubmit} ref={this.formRef}>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label>{$glVars.i18n.tags.grade}</Form.Label>
                                <Form.Control type="number" required value={data.grade} name="grade" onChange={this.onDataChange} step="0.1"/>
                            </Form.Group>
                        </Form.Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonGroup>
                        <Button variant="secondary" onClick={this.onClose}>{"Annuler"}</Button>
                        <Button variant="success"  onClick={this.onSubmit}>{"Enregistrer"}</Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>;       

        return (main);
    }

    onClose(){
        this.props.onClose();
    }

    onDataChange(event){
        let data = this.state.data;
        data[event.target.name] = event.target.value;
        this.setState({data: data})
    }

    getData(){
        $glVars.webApi.getPageEvaluation($glVars.urlParams.id, this.props.userId, this.props.pageId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState(this.prepareNewState(result.data));
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    prepareNewState(data, dropdownLists){
        data = data || null;
        dropdownLists = dropdownLists || null;
        let result = {data: null, dropdownLists: {}};
        
        if(data !== null){
            result.data = data;
        }

        return result;
    }

    onSubmit(e){
        if (e) e.preventDefault();
        let data = this.state.data;

        if (this.formRef.current.checkValidity() === false) {
            this.setState({formValidated: true, data:data});            
        }
        else{
            this.setState({formValidated: true, data:data}, this.onSave);
        }
    };

    onSave(){
        let data = JsNx.clone(this.state.data);
        $glVars.webApi.savePageEval(data, this.onSaveResult);
    }

    onSaveResult(result){
        if(result.success){
            let that = this;
            /*this.setState(this.prepareNewState(result.data), () => {
                that.onClose();
            });*/
            that.onClose();

            $glVars.feedback.showInfo($glVars.i18n.tags.appName, $glVars.i18n.tags.msgSuccess, 3);
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appName, result.msg);
        }
    }
}

class PageEvaluationView extends Component{
    static defaultProps = {
        userId: 0
    };

    constructor(props){
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onClose = this.onClose.bind(this);

        this.state = {dataProvider: [], pageEval: null, cmId: $glVars.urlParams.id};
    }
    
    componentDidMount(){
        $glVars.webApi.addObserver("PageEvaluationView", this.getData, ['savePageEval']);        
        this.getData();
    }

    componentWillUnmount(){
        $glVars.webApi.removeObserver("PageEvaluationView");
    }

    componentDidUpdate(prevProps) {
        if(isNaN(prevProps.userId)){ return;}

        // Typical usage (don't forget to compare props):
        if (this.props.userId !== prevProps.userId) {
            this.getData();
        }
    }

    getData(){
        if(this.props.userId === 0){
            this.setState({dataProvider: []});
            return;
        }
        
        $glVars.webApi.getPagesEvaluation(this.state.cmId, this.props.userId, this.getDataResult);
    }

    getDataResult(result){
        if(!result.success){
            FeedbackCtrl.instance.showError($glVars.i18n.appName, result.msg);
            return;
        }

        // If the user is trying to load automatically some note by URL
        /*if(!$glVars.urlParams.loaded){
            let item = null;
            for(let activity of result.data){
                for(let note of activity){
                    if((note.ccCmId === $glVars.urlParams.ccCmId) && (note.cmId === $glVars.urlParams.cmId)){
                        item = note;
                    }
                }
            }

            $glVars.urlParams.loaded = true;

            this.setState({dataProvider: result.data}, () => this.onEdit(item));
        }
        else{
            this.setState({dataProvider: result.data});
        }*/
        this.setState({dataProvider: result.data});
    }

    render(){
        if(this.state.dataProvider.length === 0) return null;

        let main = 
            <div>  
                <br/><br/>
                <DataGrid orderBy={true}>
                    <DataGrid.Header>
                        <DataGrid.Header.Row>
                            <DataGrid.Header.Cell style={{width: 80}}>{"#"}</DataGrid.Header.Cell>
                            <DataGrid.Header.Cell >{$glVars.i18n.tags.name}</DataGrid.Header.Cell>
                            <DataGrid.Header.Cell  style={{width: 120}}>{$glVars.i18n.tags.grade}</DataGrid.Header.Cell>
                            <DataGrid.Header.Cell  style={{width: 120}}>{$glVars.i18n.tags.nbViews}</DataGrid.Header.Cell>
                            <DataGrid.Header.Cell style={{width: 220}}>{$glVars.i18n.tags.firstView}</DataGrid.Header.Cell>
                            <DataGrid.Header.Cell style={{width: 220}}>{$glVars.i18n.tags.lastView}</DataGrid.Header.Cell>
                            <DataGrid.Header.Cell  style={{width: 55}}></DataGrid.Header.Cell>
                        </DataGrid.Header.Row>
                    </DataGrid.Header>
                    <DataGrid.Body>
                        {this.state.dataProvider.map((item, index) => {
                                let row = 
                                    <DataGrid.Body.Row key={index} onDbClick={() => this.onEdit(item)}>
                                        <DataGrid.Body.Cell>{item.slot}</DataGrid.Body.Cell>
                                        <DataGrid.Body.Cell>{item.name}</DataGrid.Body.Cell>
                                        <DataGrid.Body.Cell>{item.grade}</DataGrid.Body.Cell>
                                        <DataGrid.Body.Cell>{item.nbViews}</DataGrid.Body.Cell>
                                        <DataGrid.Body.Cell>{item.timeFirstView}</DataGrid.Body.Cell>
                                        <DataGrid.Body.Cell>{item.timeLastView}</DataGrid.Body.Cell>
                                        <DataGrid.Body.Cell>
                                            <ButtonGroup size='sm'>
                                                <Button onClick={() => this.onEdit(item)} title=" Modifier"><FontAwesomeIcon icon={faPencilAlt}/></Button>
                                            </ButtonGroup>
                                        </DataGrid.Body.Cell>
                                    </DataGrid.Body.Row>
                                return (row);                                    
                            }
                        )}
                    </DataGrid.Body>
                </DataGrid>
                
                {this.state.pageEval !== null && 
                        <ModalPageEvalForm userId={this.props.userId} pageId={this.state.pageEval.pageId} onClose={this.onClose} />}
            </div>;

        return (main);
    }

    onEdit(item){
        if(item.pageViewId === 0){
            alert('Objet non existant');
            return;
        }
        this.setState({pageEval: item});
    }

    onClose(){
        this.setState({pageEval: null});
    }
}

class ModalPageForm extends Component
{
    static defaultProps = {        
        pageId: 0,
        onClose: null,
    };

    constructor(props){
        super(props);

        this.onDataChange = this.onDataChange.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onSaveResult = this.onSaveResult.bind(this);
        this.prepareNewState = this.prepareNewState.bind(this);
        this.onClose = this.onClose.bind(this);
        
        this.state = {data: null,  formValidated: false};

        this.formRef = React.createRef();
        this.editorRef = React.createRef();
        this.editorDec = new recit.components.EditorDecorator('recit_activity_editor_container_1');
    }

    componentDidMount(){
        this.getData();             
    }  

    componentWillUnmount(){
        this.editorDec.close();
        this.editorDec.dom.style.display = 'none';
        document.body.appendChild(this.editorDec.dom);
    }

    render(){
        if(this.state.data === null){return null;}

        let data = this.state.data;
    
        let main =
            <div>
                <div>
                    <h3 className="text-center">{`Page: ${data.name}`}</h3>
                </div>
                <div> 
                    <Form noValidate onSubmit={this.onSubmit} validated={this.state.formValidated} ref={this.formRef}>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label>{$glVars.i18n.tags.name}</Form.Label>
                                <Form.Control type="text" required value={data.name} name="name" onChange={this.onDataChange}/>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <div ref={this.editorRef}></div>
                            </Form.Group>
                        </Form.Row>
                    </Form>
                </div>
                <div >
                    <ButtonGroup style={{display: "flex", justifyContent: "center"}}>
                        <Button variant="secondary" onClick={this.onClose}>{"Annuler"}</Button>
                        <Button variant="success"  onClick={this.onSubmit}>{"Enregistrer"}</Button>
                    </ButtonGroup>
                </div>
            </div>;       

        return (main);
    }
    
    updateEditor(instance, ref, value){
        if(ref.current !== null){
            instance.show();        
            instance.setValue(value);       
            if(!ref.current.hasChildNodes()){
                ref.current.appendChild(instance.dom);   
            }
        }
    }

    componentDidUpdate(){
        if(this.state.data === null){ return;}
        this.updateEditor(this.editorDec, this.editorRef, this.state.data.content.text);
    }

    onClose(){
        this.props.onClose();
    }

    onDataChange(event){
        let data = this.state.data;
        data[event.target.name] = event.target.value;
        this.setState({data: data})
    }

    getData(){
        if(this.props.pageId < 0){return;}
        $glVars.webApi.getPageFormKit($glVars.urlParams.id, this.props.pageId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState(this.prepareNewState(result.data.data));
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    prepareNewState(data, dropdownLists){
        data = data || null;
        dropdownLists = dropdownLists || null;
        let result = {data: null, dropdownLists: {}};
        
        if(data !== null){
            result.data = data;
        }

        return result;
    }

    onSubmit(e){
        if (e) e.preventDefault();
        let data = this.state.data;
        data.content = this.editorDec.getValue();

        if (this.formRef.current.checkValidity() === false) {
            this.setState({formValidated: true, data:data});            
        }
        else{
            this.setState({formValidated: true, data:data}, this.onSave);
        }
    };

    onSave(){
        let data = JsNx.clone(this.state.data);
        $glVars.webApi.savePageSetup(data, this.onSaveResult);
    }

    onSaveResult(result){
        if(result.success){
            let that = this;
            this.setState(this.prepareNewState(result.data), () => {
                that.onClose();
            });

            $glVars.feedback.showInfo($glVars.i18n.tags.appName, $glVars.i18n.tags.msgSuccess, 3);
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appName, result.msg);
        }
    }
}

class EditionMode extends Component{
    static defaultProps = {
    };

    constructor(props){
        super(props);

        this.getData = this.getData.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onDragRow = this.onDragRow.bind(this);
        this.onDropRow = this.onDropRow.bind(this);

        this.state = {cmId: $glVars.urlParams.id, data: null, pageId: -1, pageList: [], preview: false, editor: -1, draggingItem: null};
    }

    componentDidMount(){
        $glVars.webApi.addObserver("EditionMode", this.getData, ['savePageSetup', 'removePage']);
        this.getData();
    }

    componentWillUnmount(){
        $glVars.webApi.removeObserver("EditionMode");
    }

    getData(){
        let that = this;

        let callback = function(result){
            if(!result.success){
                FeedbackCtrl.instance.showError($glVars.i18n.appName, result.msg);
                return;
            }
            that.setState({displayType: JsNx.get(JsNx.at(result.data, 0, null), 'displayType', 1), pageList: result.data});
        }

        $glVars.webApi.getPages(this.state.cmId, callback);
    }

    render(){
        let main =
            <div>
                <ButtonToolbar>
                    <ButtonGroup className="mr-2">
                        <Button variant="outline-primary" onClick={this.onAdd}><FontAwesomeIcon icon={faPlusCircle}/>{" Ajouter une nouvelle page"}</Button>
                    </ButtonGroup>

                    <ButtonGroup toggle={true} className="mr-2">
                        <Button variant={this.checkVariantDisplayType(1)} onClick={() => this.onSetDisplayType(1)}><FontAwesomeIcon icon={faTv}/>{` ${$glVars.i18n.tags.tab}`}</Button>
                        <Button variant={this.checkVariantDisplayType(2)} onClick={() => this.onSetDisplayType(2)}><FontAwesomeIcon icon={faTv}/>{` ${$glVars.i18n.tags.toc}`}</Button>
                        <Button variant={this.checkVariantDisplayType(3)} onClick={() => this.onSetDisplayType(3)}><FontAwesomeIcon icon={faTv}/>{` ${$glVars.i18n.tags.pagination}`}</Button>
                    </ButtonGroup>

                    <ButtonGroup toggle={true} className="mr-2">
                        <Button variant={(this.state.preview ? 'warning' : 'outline-primary')} onClick={() => this.setState({preview: !this.state.preview})}><FontAwesomeIcon icon={faEye}/>{` ${$glVars.i18n.tags.preview}`}</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <br/><br/>

               {this.state.pageId == -1 && this.state.editor == -1 && <> {this.state.preview ?
                    <PageView displayType={this.state.displayType} countViews={false}/>
                    :
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell style={{width: 40}}></DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{width: 80}}>{"#"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell>{$glVars.i18n.tags.name}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{width: 220}}>{$glVars.i18n.tags.lastUpdate}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell  style={{width: 95}}></DataGrid.Header.Cell>
                            </DataGrid.Header.Row>
                        </DataGrid.Header>
                        <DataGrid.Body>
                            {this.state.pageList.map((item, index) => {                            
                                    let row = 
                                        <DataGrid.Body.RowDraggable key={index} data={item} onDbClick={() => this.onEdit(item.pageId)} onDrag={this.onDragRow} onDrop={this.onDropRow}>
                                            <DataGrid.Body.Cell><FontAwesomeIcon icon={faGripVertical} title="Déplacer l'item"/></DataGrid.Body.Cell>
                                            <DataGrid.Body.Cell>{item.slot}</DataGrid.Body.Cell>
                                            <DataGrid.Body.Cell>{item.name}</DataGrid.Body.Cell>
                                            <DataGrid.Body.Cell>{item.timeModified}</DataGrid.Body.Cell>
                                            <DataGrid.Body.Cell>
                                                <ButtonGroup  size='sm' className="mr-2">
                                                    <Button variant="primary" onClick={() => this.onEdit(item.pageId)} title="Modifier"><FontAwesomeIcon icon={faPencilAlt}/> </Button>
                                                    <Button variant="primary" onClick={() => this.onRemove(item)} title="Supprimer"><FontAwesomeIcon icon={faTrashAlt}/> </Button>
                                                    {this.state.displayType == 4 && <Button variant="primary" onClick={() => this.setState({editor:item.pageId})} title="Modifier scene"><FontAwesomeIcon icon={faPencilAlt}/> scene</Button>}
                                                </ButtonGroup>
                                            </DataGrid.Body.Cell>
                                        </DataGrid.Body.RowDraggable>
                                    return (row);
                                }
                            )}
                        </DataGrid.Body>
                    </DataGrid>
                } </>}
                {this.state.pageId >= 0 && this.state.displayType != 4 && <ModalPageForm pageId={this.state.pageId} onClose={this.onClose}/>}
                {this.state.pageId >= 0 && this.state.displayType == 4 && <ModalImage360Form pageId={this.state.pageId} onClose={this.onClose}/>}
                {this.state.editor >= 0 && this.state.displayType == 4 && <ModalImage360Editor pageId={this.state.editor} onClose={this.onClose}/>}
            </div> 

        return (main);
    }

    checkVariantDisplayType(value){
        return (this.state.displayType === value ? "primary" : "outline-primary");
    }

    onSetDisplayType(value){
        let that = this;

        let callback = function(result){
            if(!result.success){
                FeedbackCtrl.instance.showError($glVars.i18n.appName, result.msg);
                return;
            }
            that.setState({displayType: result.data});
        }

        $glVars.webApi.setDisplayType($glVars.urlParams.id, value, callback);
    }

    onAdd(){
        this.setState({pageId: 0});
    }

    onEdit(pageId){
        this.setState({pageId: pageId});
    }

    onClose(){
        this.setState({pageId: -1, editor: -1});
    }

    onRemove(item){
        let callback = function(result){
            if(result.success){
                $glVars.feedback.showInfo($glVars.i18n.tags.appName, $glVars.i18n.tags.msgSuccess, 3);
            }
            else{
                $glVars.feedback.showError($glVars.i18n.tags.appName, result.msg);
            }
        }

        if(window.confirm(`${$glVars.i18n.tags.msgConfirmDeletion}\n\n${$glVars.i18n.tags.msgRemovePage}`)){
            $glVars.webApi.removePage(item.cmId, item.pageId, callback);
        }
    }

    onDragRow(item, index){
        this.setState({draggingItem: item});
    }

    onDropRow(item, index){
        let that = this;
        let callback = function(result){
            if(!result.success){
                $glVars.feedback.showError($glVars.i18n.tags.appName, result.msg);
                return;
                
            }
            
            that.getData();
        }
        $glVars.webApi.switchPageSlot(this.state.cmId, this.state.draggingItem.pageId, item.pageId, callback);
    }
}