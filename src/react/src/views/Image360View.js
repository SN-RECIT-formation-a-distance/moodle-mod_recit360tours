import React, { Component } from 'react';
import {ButtonToolbar, ButtonGroup, Button, Form, Col, Alert } from 'react-bootstrap';
import {faArrowLeft, faPencilAlt, faParagraph, faPlus, faTrashAlt, faArrowsAlt, faImage, faMusic, faExternalLinkAlt, faMapMarker, faMapMarked, faSave, faTimes} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ToggleButtons, Modal, BtnUpload, DataGrid} from '../libs/components/Components';
import {ComboBoxPlus} from '../libs/components/ComboBoxPlus';
import {$glVars} from '../common/common';
import { JsNx } from '../libs/utils/Utils';
import 'aframe';
import 'aframe-gui';
import { aframeComponentFactory, AIframe, AImage, ASound, AText, AVideo, Navigation, Panorama } from '../libs/components/aframe-components';

export class ViewImage360 extends Component{
    static defaultProps = {
    };

    constructor(props){
        super(props);

        this.initScene = this.initScene.bind(this);
        this.onSaveObjectViewResult = this.onSaveObjectViewResult.bind(this);

        this.state = {data: null, ready: false};

        this.sceneRef = null;
        this.bufferCreation = [];
    }

    componentDidMount(){
        this.getData(); 
    }

    componentDidUpdate(prevProps, prevState){
        this.initScene();
    }

    initScene(){
        if(this.state.ready){ return; }

        if(this.sceneRef === null){
            this.sceneRef = document.getElementById("image360");
        }
        
        if(this.sceneRef === null){ return;}
        if(this.state.data === null){ return;}
       
        while(this.bufferCreation.length > 0){
            let sc = this.bufferCreation.shift();
            this.createSceneFromObjects(sc);
        }

        if(this.bufferCreation.length > 0){
            window.setTimeout(this.initScene, 100);
            return;
        }
      
        if(!this.sceneRef.components){
            window.setTimeout(this.initScene, 100);
            return;
        }

        if(!this.sceneRef.components.tour){
            window.setTimeout(this.initScene, 100);
            return;
        }

        this.sceneRef.components.tour.init();

        if(this.state.data.lastScene && this.state.data.lastScene.sceneid){
            let scene = `pano${this.state.data.lastScene.sceneid}`;
            let scenefrom = document.querySelectorAll('a-panorama')[0]?.id
            if (this.state.data.lastScene.type == 'navigation'){
                let obj = JSON.parse(this.state.data.lastScene.object);
                if (obj){
                    scene = obj.to;
                }
            }
            this.sceneRef.components.tour.loadSceneId(scene, scenefrom);
        }

        this.setState({ready: true});
    }

    getData(){
        $glVars.webApi.get360Tour($glVars.urlParams.tourId, this.getDataResult.bind(this));        
    }

    getDataResult(result){         
        if(result.success){
            this.bufferCreation = JsNx.copy(result.data.sceneList, 1);
            this.setState({data: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render(){
        if(this.state.data === null){ return null; }

        let main = null;

        if(this.state.data.sceneList.length === 0){
            main =  <div className='alert alert-warning h3'>Aucune scène n'a été créée. Commencez par activer le mode édition et ajoutez une scène.</div>;
        }
        else{
            main = 
                <div style={{height:'600px'}}>
                    <a-scene embedded cursor="rayOrigin: mouse" raycaster="objects: .clickable,[gui-interactable]">
                        <a-assets>
                        </a-assets>
                        <a-tour id="image360">
                            <a-entity laser-controls raycaster="objects: .clickable,[gui-interactable]; far: 5">
                                <a-camera wasd-controls-enabled="false"></a-camera>
                            </a-entity>
                        </a-tour>
                    </a-scene>
                </div>
        }

        return main;
    }

    createSceneFromObjects(sc){
        let el2 = Panorama.Create({src: sc.objects.srcUrl, id: sc.elid})
        this.sceneRef.appendChild(el2);
        
        if (sc.objects.children){
            for (let obj of sc.objects.children){
                let el = aframeComponentFactory.CreateComponent(obj, (e) => this.onElementClick(obj, e));

                el2.appendChild(el);
            }
        }
    }

    onElementClick(obj){
        if (obj.completion){
            $glVars.webApi.saveObjectView(obj.id, $glVars.urlParams.id, this.onSaveObjectViewResult);
        }
    }

    onSaveObjectViewResult(result){         
        if(!result.success){
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }
}

class ObjectList extends Component{
    static defaultProps = {
        objects: []
    }

    render(){
        if (!this.props.objects.children) return null;
        let main =
                    <div className='mt-5'>
                        <span className='h3 bold'>{"Objets dans la scène"}</span>
                        <DataGrid orderBy={true}>
                            <DataGrid.Header>
                                <DataGrid.Header.Row>
                                    <DataGrid.Header.Cell>{"#"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell >{"Type"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 80}}></DataGrid.Header.Cell>
                                </DataGrid.Header.Row>
                            </DataGrid.Header>
                            <DataGrid.Body>
                                {this.props.objects.children.map((item, index) => {
                                    if (item.object) item = item.object; //Newly added objects are encapsuled in object
                         
                                        let row = 
                                            <DataGrid.Body.Row key={index}>
                                                <DataGrid.Body.Cell>{item.key}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell>{item.type} {item.name ? ' ('+item.name+')' : ''}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell style={{textAlign: 'center'}}>
                                                    <ButtonGroup size="sm">
                                                        <Button onClick={() => this.props.onEdit(item.type, document.querySelector('[data-key='+item.key+']'))} title="Modifier" variant="outline-primary"><FontAwesomeIcon icon={faPencilAlt}/></Button>
                                                        <Button onClick={() => this.props.onDelete(document.querySelector('[data-key='+item.key+']'))} title="Supprimer" variant="outline-primary"><FontAwesomeIcon icon={faTrashAlt}/></Button>
                                                    </ButtonGroup>
                                                </DataGrid.Body.Cell>
                                            </DataGrid.Body.Row>
                                        return (row);                                    
                                    }
                                )}
                            </DataGrid.Body>
                        </DataGrid>
                    </div>
                  

        return (main);
    }
    
}

export class EditImage360 extends Component{
    static defaultProps = {
    };

    constructor(props){
        super(props);

        this.onClose = this.onClose.bind(this);

        this.state = {cmId: $glVars.urlParams.id, data: null, pageId: -1, editor: -1};
    }

    render(){
        let main =
            <div>
                <ModalImage360Editor pageId={this.state.editor} onClose={this.onClose}/>
                {this.state.pageId >= 0 && this.state.displayType == 4 && <ModalImage360Form pageId={this.state.pageId} onClose={this.onClose}/>}
            </div> 

        return (main);
    }

    onClose(){
        this.setState({pageId: -1, editor: -1});
    }
}

export class ModalImage360Editor extends Component
{

    constructor(props){
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onEdit = this.onEdit.bind(this);
        
        this.state = {dataProvider: [],  resourceId: -1};
    }

    componentDidMount(){
        $glVars.webApi.addObserver("ModalImage360Editor", this.getData, ['saveResource']);
        this.getData();             
    }

    componentWillUnmount(){
        $glVars.webApi.removeObserver("ModalImage360Editor");
    }

    getData(){
        $glVars.webApi.getImage360FormKit($glVars.urlParams.tourId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render(){
        if(this.state.dataProvider === null){return null;}

        let main =
                (this.state.resourceId === -1 ?
                    <div>
                        <span className='h3 bold d-flex align-items-center'>{"Ajouter une scène"}<Button className='rounded-circle ml-2' variant='outline-primary' onClick={this.onAdd}><FontAwesomeIcon icon={faPlus}/></Button></span>
                        <div className='d-flex'>
                            {this.state.dataProvider.map((item, index) => {
                                let ret = 
                                    <div key={index} className='card m-3' style={{maxWidth: "200px"}}>
                                        <img className='card-img-top' src={item.objects.srcUrl}/>
                                        <div className="card-body">
                                            <h5 className="card-title">{item.name}</h5>
                                            <br/>
                                            <div className='d-flex justify-content-center mt-3'>
                                                <div className="btn-group" style={{position: "absolute", bottom: "1rem"}}>
                                                    <Button className='rounded-circle ml-2' variant='outline-primary' onClick={() => this.onEdit(item.id)} title="Modifer la scène"><FontAwesomeIcon icon={faPencilAlt}/></Button>
                                                    <Button className='rounded-circle ml-2' variant='outline-primary' onClick={() => this.onDelete(item.id)} title="Supprimer la scène"><FontAwesomeIcon icon={faTrashAlt}/></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                return (ret);                                    
                            })}
                        </div>
                    </div>
                    :
                    <ResourceForm resourceId={this.state.resourceId} resourceList={this.state.dataProvider} onClose={this.onClose}/>
                );

        return (main);
    }

    onEdit(resourceId){
        this.setState({resourceId: resourceId});
    }

    onDelete(resourceId){
        if (confirm("Êtes-vous sûr de vouloir supprimer cette scène?")){
            $glVars.webApi.deleteScene(resourceId, (result) => {
                if(result.success){
                    this.getData()
                }
                else{
                    $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
                }
            });
        }
    }

    onAdd(){
        this.setState({resourceId: 0});
    }

    onClose(){
        this.setState({resourceId: -1});
    }
}

class ResourceForm extends Component
{
    static defaultProps = {        
        resourceId: 0,
        resourceList: [],
        onClose: null
    };

    constructor(props){
        super(props);

        this.onDataChange = this.onDataChange.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSave = this.onSave.bind(this);
        this.addChildrenToScene = this.addChildrenToScene.bind(this);
        this.onEditChildren = this.onEditChildren.bind(this);
        this.onDeleteChildren = this.onDeleteChildren.bind(this);
        this.onSaveResult = this.onSaveResult.bind(this);
        this.onClose = this.onClose.bind(this);
        
        this.state = {data: null, formValidated: false, popup: false};

        this.formRef = React.createRef();
        this.image360Form = new Image360Form();
        if (this.props.resourceId === 0){
            this.state.popup = true;
        }
    }

    componentDidMount(){
        this.getData(); 
    }

    getData(){
        $glVars.webApi.getSceneFormKit(this.props.resourceId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            result.data.tourId = $glVars.urlParams.tourId;
            result.data.cmId = $glVars.urlParams.id;
            this.setState({data: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render(){
        if(this.state.data === null){return null;}

        let data = this.state.data;
    
        let body =
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
                            <Form.Label>Scène de départ</Form.Label>
                            <ToggleButtons name="startscene" type="radio" defaultValue={[data.startscene]} onChange={this.onDataChange} 
                                    options={[
                                        {value: 1, text:"Oui"},
                                        {value: 0, text:"Non"}
                                    ]}/>
                        </Form.Group>
                    </Form.Row>
                    
                    {this.props.resourceId === 0 &&
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label>{"Image 360"}</Form.Label><br/>
                                <BtnUpload type="file" required name='image' accept="image/jpeg,.mp4" onChange={(e) => this.onFileChange(e)}/>
                                <br/>
                                {this.state.data.image && 
                                    <div className='d-flex justify-content-center'>
                                        <img src={this.state.data.image.content} style={{maxWidth: "50%"}}/>
                                    </div>
                                }
                            </Form.Group>
                        </Form.Row>
                    }
                </Form>                

            </div>;

        let footer = <ButtonGroup style={{display: "flex", justifyContent: "center"}}>
                    <Button variant="secondary" onClick={this.onClose}><FontAwesomeIcon icon={faTimes}/>{" Annuler"}</Button>
                    <Button variant="success" onClick={this.onSubmit}><FontAwesomeIcon icon={faSave}/>{" Enregistrer"}</Button>
                </ButtonGroup>;

        let main =
                <div>
                    {this.state.popup && <Modal width='50%' title={'Ressource Image 360'} body={body} footer={footer} onClose={() => this.setState({popup:false})} />}
                    <div className="mb-4 d-flex align-items-center" >
                        <Button variant="outline-primary" className="rounded-circle mr-2" onClick={this.props.onClose} title="Revenir"><FontAwesomeIcon icon={faArrowLeft}/></Button>
                        <br/>
                        <span className='m-0 h2'>Modification de la scène <u>{data.name}</u></span>
                        <Button variant="outline-primary" className="rounded-circle ml-2" onClick={() => this.setState({popup:true})} title="Modifier"><FontAwesomeIcon icon={faPencilAlt}/></Button>
                    </div>
                    {this.props.resourceId > 0 && <Image360Form data={data} onAddChildren={this.addChildrenToScene} onEditChildren={this.onEditChildren} onDeleteChildren={this.onDeleteChildren} resourceList={this.props.resourceList}/>}
                </div>;

        return main;
    }

    onClose(){
        this.props.onClose();
    }

    onDataChange(event){
        let data = this.state.data;
        if (event.target.type == 'checkbox'){
            data[event.target.name] = data[event.target.name] == 0 ? 1 : 0;
        }else{
            data[event.target.name] = event.target.value;
        }
        this.setState({data: data})
    }

    onFileChange(event){
        let data = this.state.data;
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = () => {
            data.type = 'file';
            data[event.target.name] = {content:reader.result, fileName:event.target.files[0].name};
            this.setState({data: data})
        };
    }

    onSubmit(e){
        if (e) e.preventDefault();
        let data = this.state.data;

        if (typeof data.startscene == 'undefined'){
            data.startscene = 0;
        }

        if (this.formRef.current.checkValidity() === false) {
            this.setState({formValidated: true, data:data});            
        }
        else{
            this.setState({formValidated: true, data:data}, this.onSave);
        }
    }

    onSave(){
        $glVars.webApi.saveScene(this.state.data, this.onSaveResult);
    }

    createSceneObject(dataToAdd){
        let obj = {}
        obj.id = 0;
        if (dataToAdd.id) obj.id = dataToAdd.id;
        obj.sceneId = this.state.data.id;
        obj.object = dataToAdd;
        obj.completion = dataToAdd.completion;
        obj.type = dataToAdd.type;
        return obj;
    }

    addChildrenToScene(dataToAdd){
        let data = this.state.data;

       /* if (typeof data.objects.children == 'undefined'){
            data.objects.children = [];
        }*/

        let obj = this.createSceneObject(dataToAdd);
        let that = this;
        $glVars.webApi.saveObject(obj, (result) => {
            if(!result.success){
                $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
                return;
            }

            obj.id = result.id;
            data.objects.children.push(obj);
            that.setState({data:data});
        });
    }

    onEditChildren(key, dataToEdit){
        let data = this.state.data;
        for (let i in data.objects.children){
            if (data.objects.children[i].key == key){
                for (let k in dataToEdit){
                    data.objects.children[i][k] = dataToEdit[k];
                }

                let obj = this.createSceneObject(data.objects.children[i]);
                $glVars.webApi.saveObject(obj, (result) => {
                    if(!result.success){
                        $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
                        return;
                    }
                });
                break;
            }
        }
        
        this.setState({data:data});
    }
    
    onDeleteChildren(key){
        let data = this.state.data;
        for (let i in data.objects.children){
            if (data.objects.children[i].key == key){
                if (data.objects.children[i].file){
                    data.objects.children[i].cmId = $glVars.urlParams.id;
                    $glVars.webApi.deleteFile(data.objects.children[i], (result) => {
                        if(!result.success){
                            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
                            return;
                        }
                    });
                }
                $glVars.webApi.deleteObject(data.objects.children[i].id, (result) => {
                    if(!result.success){
                        $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
                        return;
                    }
                });
                data.objects.children.splice(i, 1)
                break;
            }
        }
        this.setState({data:data});
    }

    onSaveResult(result){
        if(result.success){
            if (this.state.formValidated){
                this.onClose();
                this.setState({formValidated: false}); 
            }
            $glVars.feedback.showInfo($glVars.i18n.tags.appName, $glVars.i18n.tags.msgSuccess, 3);
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appName, result.msg);
        }
    }
}

class Image360Form extends Component{
    static defaultProps = {  
        data: {},
        onAddChildren: null,
        onEditChildren: null,
        onDeleteChildren: null,
        resourceList: []
    };

    constructor(props){
        super(props);

        this.onAction = this.onAction.bind(this);
        this.onImage360Callback = this.onImage360Callback.bind(this);
        this.onImage360Click = this.onImage360Click.bind(this);
        this.onMoveElement = this.onMoveElement.bind(this);
        this.onEditElement = this.onEditElement.bind(this);
        this.onSaveElement = this.onSaveElement.bind(this);

        this.state = {selectedElement: null, data: {imgUrl: "", action: {type: '', step: 0}, extra: null}, moving: false};

        this.image360 = new Image360(this.onImage360Callback, this.onImage360Click, this.onMouseMove.bind(this));
    }

    componentDidMount(){
        let data = this.state.data;
        data.objects = this.props.data.objects;
        this.setState({data: data});
        document.addEventListener('keypress', this.onKeyPress.bind(this))
    }

    render(){

        let alert = "";
        let alert_bg = "alert alert-primary";

        if (this.state.moving){
            alert = "<b>Déplacement d'un objet</b><br/><br/>Veuillez utiliser <b>la souris</b> en cliquant où l'objet est désiré.<br/><br/>Appuyez sur <b>ENTER</b> pour confirmer.";
            alert_bg = "alert alert-warning";
        }else if (this.state.data.action.step == 2){
            alert_bg = "alert alert-warning";
            alert = "<b>Ajout d'un objet</b><br/><br/>Veuillez cliquez à la position souhaité dans la scène pour ajouter l'objet.";
        }else{
            alert = "Vous pouvez ajouter un objet en appuyant sur un bouton ci-dessus.<br/><br/>Vous pouvez aussi modifier ou supprimer un objet en appuyant dessus dans la scène.";
        }
        // <Button variant={(this.state.data.action.type === 'video' ? 'warning' : 'primary')} onClick={() => this.onAction('video', 1)} title="Vidéo"><FontAwesomeIcon icon={faVideo}/></Button>
        let main =
            <div>
                <hr/> 

                <ButtonToolbar className='mb-2'>
                    <ButtonGroup size='lg'>
                        <Button variant={(this.state.data.action.type === 'text' ? 'warning' : 'primary')} onClick={() => this.onAction('text', 1)} title="Texte"><FontAwesomeIcon icon={faParagraph}/></Button>  
                        <Button variant={(this.state.data.action.type === 'navigation' ? 'warning' : 'primary')} onClick={() => this.onAction('navigation', 1)} title="Lien vers une scène"><FontAwesomeIcon icon={faMapMarker}/></Button>
                        <Button variant={(this.state.data.action.type === 'image' ? 'warning' : 'primary')} onClick={() => this.onAction('image', 1)} title="Image"><FontAwesomeIcon icon={faImage}/></Button>
                        <Button variant={(this.state.data.action.type === 'sound' ? 'warning' : 'primary')} onClick={() => this.onAction('sound', 1)} title="Son"><FontAwesomeIcon icon={faMusic}/></Button>
                        <Button variant={(this.state.data.action.type === 'iframe' ? 'warning' : 'primary')} onClick={() => this.onAction('iframe', 1)} title="Hotspot iframe"><FontAwesomeIcon icon={faExternalLinkAlt}/></Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <div className={"alert "+alert_bg} role="alert" dangerouslySetInnerHTML={{__html:alert}}></div>

                <div style={{height:'600px'}}>
                    {this.image360.render(this.state.data, this.props.data)}
                </div>
                <ObjectList objects={this.props.data.objects} onEdit={this.onEditElement} onDelete={(el) => this.deleteElement(el)}/>

                {this.state.data.action.step === 1 && <ModalElementForm type={this.state.data.action.type} exclude={this.props.data.id} data={this.state.data.extra} onSave={this.onSaveElement.bind(this)} resourceList={this.props.resourceList} onMove={this.onMoveElement} onClose={() => this.onAction('')} onDelete={() => this.onDeleteElement()} />}
            </div>;

        return main;
    }

    onAction(value, step){
        if (this.state.moving) return;
        let data = this.state.data;
        data.action = {type: value, step: step};
        data.extra = {elementId: 0, type: value};

        if (value == 'sound' || value == 'video'){
            data.extra.loop = false;
            data.extra.autoplay = false;
        }

        this.setState({data: data});
    }

    onImage360Callback(event, dataAdded){
        this.onAction('');
        this.props.onAddChildren(dataAdded);
        this.image360.deleteSphere();
    }

    onDeleteElement(){
        let tmp = this.state.data;
        if(tmp.extra && tmp.extra.el){
            this.deleteElement(tmp.extra.el)
        }
    }

    deleteElement(el){
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément?')) return;
        this.props.onDeleteChildren(el.getAttribute('data-key'))
        el.remove();
        this.onAction('');
    }

    onMoveElement(){
        let tmp = this.state.data;
        if(tmp.extra && tmp.extra.el){
          //  tmp.extra.el.setAttribute('wasd-controls', "acceleration:10");
            this.image360.toggleCameraControls(false);
            this.image360.addSphere();
            tmp.action = 'moving'
            this.setState({moving: true, data: tmp});
        }
    }

    onMouseMove(event){
        if (!this.state.moving) return;

        let tmp = this.state.data;
        if (!tmp) return;
        let point = event.detail.intersection.point;
        let campos = document.getElementById('acamera').getAttribute('position');
        tmp.extra.el.object3D.position.set(point.x, point.y, point.z);
        tmp.extra.el.object3D.lookAt(campos.x, campos.y, campos.z);
    }

    onKeyPress(e){//done moving
        if (e.keyCode != 13) return;
        if (!this.state.moving) return;
        e.preventDefault();

        let tmp = this.state.data;
        tmp.extra.el.removeAttribute('wasd-controls');
        this.image360.toggleCameraControls(true);
        this.setState({moving: false});
        this.image360.deleteSphere();
        
        let pos = tmp.extra.el.getAttribute('position');
        let rot = tmp.extra.el.getAttribute('rotation');
        let dataToEdit = {position: {x: pos.x, y: pos.y, z: pos.z}, rotation: {x: rot.x, y: rot.y, z: rot.z}};
        this.props.onEditChildren(tmp.extra.el.getAttribute('data-key'), dataToEdit);
    }

    onImage360Click(type, event){
        //if(event instanceof CustomEvent){
            let tmp = this.state.data;
            if (tmp.action && (this.state.moving || tmp.action.step == 2)) return;
            tmp.action = {type:type, step: 1};
            tmp.elementId = event.target.getAttribute('data-key');
            if (type == 'text'){
                tmp.extra = {text: event.target.getAttribute('text').value, el: event.target};
            }
            if (type == 'navigation'){
                tmp.extra = {name: event.currentTarget.getAttribute('hotname'),rotationstart: event.currentTarget.getAttribute('rotationstart')?.split(','), el: event.currentTarget};
            }
            if (type == 'image'){
                tmp.extra = {file: event.currentTarget.getAttribute('filename'), el: event.currentTarget};
            }
            if (type == 'video'){
                tmp.extra = {file: event.currentTarget.getAttribute('filename'), loop: event.currentTarget.getAttribute('loop') == 'true', autoplay: event.currentTarget.getAttribute('autoplay') == 'true', el: event.currentTarget};
            }
            if (type == 'sound'){
                tmp.extra = {file: event.currentTarget.getAttribute('filename'), loop: event.currentTarget.getAttribute('loop') == 'true', autoplay: event.currentTarget.getAttribute('autoplay') == 'true', el: event.currentTarget};
            }
            if (type == 'iframe'){
                tmp.extra = {url: event.currentTarget.getAttribute('data-url'), name: event.currentTarget.getAttribute('hover-text'), el: event.currentTarget};
            }

            //Valid for all
            tmp.extra.completion = parseInt(event.currentTarget.getAttribute('data-completion')) ? 1 :0;
            this.setState({data: tmp});
        //}
    }

    onEditElement(type, el){
        let event = {};
        event.currentTarget = el;
        event.target = el;
        this.onImage360Click(type, event);
    }

    onSaveElement(data){
        let tmp = this.state.data;
        let dataToEdit = null;
        let editingElement = false;
        if(tmp.extra && tmp.extra.el){
            editingElement = tmp.extra.el;
        }

        if (typeof data.file == 'object'){ //Save file and wait for url then callback
            data.cmId = $glVars.urlParams.id;
            $glVars.webApi.saveFile(data, (d) => {
                if (!d.success){
                    alert(d.msg);
                    return;
                }
                this.onSaveElement(d.data)
            });
            return;
        }
        
        if (data.type == 'text'){
            dataToEdit = {text: data.text, completion: data.completion};
            if(tmp.extra && tmp.extra.el){
                AText.Edit(tmp.extra.el, dataToEdit);
            }
            tmp.extra = dataToEdit;
        }
        if (data.type == 'navigation'){
            dataToEdit = {completion: data.completion};
            if (data.name){
                dataToEdit.name = data.name;
            }
            if (data.rotationstart){
                dataToEdit.rotationstart = data.rotationstart;
            }
            if (data.res){
                dataToEdit.to = data.res.elid;
            }
            if(tmp.extra && tmp.extra.el){
                Navigation.Edit(tmp.extra.el, dataToEdit);
            }
            if (data.res){
                tmp.extra = {imgUrl: data.res.objects.srcUrl, to: data.res.elid, name: data.name, rotationstart: data.rotationstart, completion: data.completion};
            }
        }
        if (data.type == 'iframe'){
            dataToEdit = {name: data.name, url: data.url, completion: data.completion};
            if(tmp.extra && tmp.extra.el){
                AIframe.Edit(tmp.extra.el, dataToEdit, true);
            }
            if (data.res){
                tmp.extra = dataToEdit;
            }
        }
        if (data.type == 'image'){
            dataToEdit = {completion: data.completion};
            if (data.file){
                dataToEdit.file = data.file;
                dataToEdit.fileUrl = data.fileUrl;
            }
            if(tmp.extra && tmp.extra.el){
                AImage.Edit(tmp.extra.el, dataToEdit, true);
            }
            tmp.extra = dataToEdit;
        }
        if (data.type == 'sound'){
            dataToEdit = {loop: data.loop, autoplay: data.autoplay, completion: data.completion};
            if (data.file){
                dataToEdit.file = data.file;
                dataToEdit.fileUrl = data.fileUrl;
            }
            if(tmp.extra && tmp.extra.el){
                ASound.Edit(tmp.extra.el, dataToEdit);
            }
            tmp.extra = dataToEdit;
        }
        if (data.type == 'video'){
            dataToEdit = {loop: data.loop, autoplay: data.autoplay, completion: data.completion};
            if (data.file){
                dataToEdit.file = data.file;
                dataToEdit.fileUrl = data.fileUrl;
            }
            if(tmp.extra && tmp.extra.el){
                AVideo.Edit(tmp.extra.el, dataToEdit);
            }
            tmp.extra = dataToEdit;
        }

        if(editingElement){
            this.props.onEditChildren(editingElement.getAttribute('data-key'), dataToEdit)
            this.onAction('');
        }else{
            tmp.action.step = 2;
            this.setState({data: tmp});
            this.image360.addSphere();
        }
    }
}

class Image360
{
    constructor(callback, onElementClick, onMouseMove){
        this.init = this.init.bind(this);
        this.onSceneClick = this.onSceneClick.bind(this);
        this.callback = callback;
        this.onElementClick = onElementClick;
        this.onMouseMove = onMouseMove;
        
        this.state = {init: false, sceneRef: null, data: null};
    }

    render(data, scene){
        this.init();

        if(!data.objects){ return null; }
        if(data.objects.srcUrl.length === 0){ return null; }
        
        this.state.data = data;
        this.state.scene = scene;

        let main =
            <a-scene embedded cursor="rayOrigin: mouse" raycaster="objects: .clickable,[gui-interactable]">
            <a-assets>
            </a-assets>
                <a-tour id="image360">
                    <a-camera id="acamera" wasd-controls-enabled="false">
                    </a-camera>
                </a-tour>
            </a-scene>;
                        

        return main;
    }

    init(){
        if(this.state.init){ return; }

        if(this.state.sceneRef === null){ 
            this.state.sceneRef = document.getElementById("image360");
            setTimeout(this.init, 300);
            return;
        }

        this.state.sceneRef.addEventListener('click', this.onSceneClick);
        this.state.sceneRef.addEventListener('click', this.onMouseMove)
        this.state.init = true;
        this.createSceneFromObjects(this.state.data.objects, this.state.sceneRef, this.state.scene);
    }

    addSphere(){
        let sphere = document.createElement('a-sphere');
        sphere.id = 'sphere'
        sphere.classList.add('clickable');
        sphere.setAttribute('material', 'side: back')
        sphere.setAttribute('radius', '2')
        sphere.setAttribute('visible', 'false')
        document.getElementById('acamera').append(sphere);
        
        let rotationhelper = document.createElement('a-sphere');
        rotationhelper.id = 'rotationhelper';
        rotationhelper.setAttribute('material', 'side: back')
        rotationhelper.setAttribute('radius', '0.1')
        rotationhelper.setAttribute('visible', 'false')
        document.getElementById('image360').append(rotationhelper);
    }

    deleteSphere(){
        let el = document.getElementById('sphere');
        if (el){
            el.remove();
        }
        el = document.getElementById('rotationhelper');
        if (el){
            el.remove();
        }
    }

    toggleCameraControls(toggle){
        //document.getElementById('acamera').setAttribute("wasd-controls-enabled", toggle);
        if (toggle){
            //document.documentElement.style.overflow = '';
            document.querySelector('.a-canvas').style.cursor = '';
        }else{
          //  document.documentElement.style.overflow = 'hidden';
            document.querySelector('.a-canvas').style.cursor = 'move';
        }
    }

    createSceneFromObjects(objects, scene, sc){
        let el2 = Panorama.Create({src: objects.srcUrl, id: sc.elid})
        scene.appendChild(el2);
        this.editingPanorama = el2;

        if (objects.children){
            for (let obj of objects.children){
                let el = aframeComponentFactory.CreateComponent(obj, (e) => this.onElementClick(obj.type, e), true);
                el2.appendChild(el);
            }
        }
        this.state.sceneRef.components.tour.init();
    }

    onSceneClick(event){
        if (!event.detail || !event.detail.intersection){ return;}

        if (this.state.data.action.step != 2) return;
        let point = event.detail.intersection.point;
        let helper = document.getElementById('rotationhelper');
        let campos = document.getElementById('acamera').getAttribute('position');
        helper.object3D.position.set(point.x, point.y, point.z);
        helper.object3D.lookAt(campos.x, campos.y, campos.z);

        let rot = helper.getAttribute('rotation');
        
        let el1 = null
        let data = null
        let commonData = {position: {x: point.x, y: point.y, z: point.z}, rotation: {x: rot.x, y: rot.y, z: 0}, completion: this.state.data.extra.completion, key: 'element-'+Date.now()};

        switch(this.state.data.action.type){
            case 'text':
                data = {type: 'text', backgroundColor: '#ffffff', color: '#000', fontSize: '20px', text: this.state.data.extra.text, ...commonData};
                el1 = AText.Create(data, (e) => this.onElementClick(data.type, e));
                break;
            case 'navigation':
                data = {type: 'navigation', name: this.state.data.extra.name, for: this.state.scene.elid, rotationstart: this.state.data.extra.rotationstart, to: this.state.data.extra.to, ...commonData};
                el1 = Navigation.Create(data, (e) => this.onElementClick(data.type, e));
                break;
            case 'iframe':
                data = {type: 'iframe', name: this.state.data.extra.name, url: this.state.data.extra.url, ...commonData};
                el1 = AIframe.Create(data, (e) => this.onElementClick(data.type, e));
                break;
            case 'image':
                data = {type: 'image', file: this.state.data.extra.file, fileUrl: this.state.data.extra.fileUrl, ...commonData};
                el1 = AImage.Create(data, (e) => this.onElementClick(data.type, e), true);
                break;
            case 'sound':
                data = {type: 'sound', file: this.state.data.extra.file, fileUrl: this.state.data.extra.fileUrl, loop: this.state.data.extra.loop, autoplay: this.state.data.extra.autoplay, ...commonData};
                el1 = ASound.Create(data, (e) => this.onElementClick(data.type, e));
                break;
            case 'video':
                data = {type: 'video', file: this.state.data.extra.file, fileUrl: this.state.data.extra.fileUrl, loop: this.state.data.extra.loop, autoplay: this.state.data.extra.autoplay, ...commonData};
                el1 = AVideo.Create(data, (e) => this.onElementClick(data.type, e), true);
                break;
            default:
                return;
        }
        this.callback(event, data);
        this.editingPanorama.appendChild(el1);
    }
}

class ModalElementForm extends Component
{
    static defaultProps = {        
        data: {},
        type: '',
        onClose: null,
        onSave: null,
        onDelete: null,
        onMove: null,
        exclude: null,
    };

    constructor(props){
        super(props);

        this.onDataChange = this.onDataChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onClose = this.onClose.bind(this);

        this.MAX_UPLOAD_SIZE = 50;
        
        this.state = {data: props.data, formValidated: false, changed: false, selectRotationPopup: false, activityList: []};
        if (!this.state.data.name) this.state.data.name = '';
        if (!this.state.data.text) this.state.data.text = '';
        if (!this.state.data.url) this.state.data.url = '';
        if (!this.state.data.completion) this.state.data.completion = 0;
        this.state.data.type = props.type

        this.formRef = React.createRef();
    }

    componentDidMount(){
         
        $glVars.webApi.getCmList($glVars.urlParams.id, (result) => {
            if(result.error){
                alert(result.error);
                return;
            }

            let list = [];
            let modnameToExclude = ['label']; //Exclude label because it's not an activity
            for (let e of result.data){
                if (modnameToExclude.includes(e.modname)) continue;
                list.push({value: e.url, label: e.name + " [" + e.modname + "]"});
            }
            this.setState({activityList: list});
        });
    }

    render(){
        let body = this.getBody()
            
        let footer = <div style={{width:'100%'}}>
            {this.state.data.elementId != 0 && <Button variant="danger" onClick={this.props.onDelete}><FontAwesomeIcon icon={faTrashAlt}/>{" Supprimer cet élément"}</Button>}
            {this.state.data.elementId != 0 && <Button variant="secondary" onClick={this.props.onMove}><FontAwesomeIcon icon={faArrowsAlt}/>{" Déplacer cet élément"}</Button>}
            <ButtonGroup style={{display: "flex", float: "right"}}>
                <Button variant="secondary" onClick={this.onClose}><FontAwesomeIcon icon={faTimes}/>{" Annuler"}</Button>
                <Button variant="success" onClick={this.onSubmit} disabled={!this.state.changed}><FontAwesomeIcon icon={faSave}/>{" Enregistrer"}</Button>
            </ButtonGroup></div>;

        return this.state.selectRotationPopup ? <ModalRotationSelector data={this.state.data.res} onSave={(rot) => this.onSelectRotation(rot)} onClose={() => this.setState({selectRotationPopup: false})}/> : <Modal width="50%" title={this.state.data.elementId != 0 ? 'Modifier élément' : 'Créer élément'} body={body} footer={footer} onClose={this.onClose} />;
    }
    
    getBody(){
        let body = null;
        switch (this.props.type){
            case 'text':
                body =
                <Form noValidate onSubmit={this.onSubmit} validated={this.state.formValidated} ref={this.formRef}>
                    <Alert variant='primary'>{"Ceci va créer une zone de texte dans la scène."}</Alert>
                    <Form.Row>
                        <Form.Group as={Col}>
                            <Form.Label>{"Texte"}</Form.Label>
                            <Form.Control as="textarea" required value={this.state.data.text} name="text" onChange={this.onDataChange} rows={7}/>
                        </Form.Group>
                    </Form.Row>
                </Form>;
                break;
            case 'navigation':
                body = 
                <div>
                <Alert variant='primary'>{"Ceci va créer un bouton qui redirigera vers un autre scène lorsque cliqué."}</Alert>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>{$glVars.i18n.tags.name}</Form.Label>
                        <Form.Control type="text" required value={this.state.data.name} name="name" onChange={this.onDataChange}/>
                    </Form.Group>
                </Form.Row>
                    <div className='d-flex' style={{flexWrap: 'wrap'}}>
                        {this.props.resourceList.map((item, index) => {
                            let style = {textAlign: "center"};
        
                            if(this.state.data.res_index === index){
                                style.backgroundColor = "#e3f2ff";
                            }
                            if (this.props.exclude == item.id){
                                return null;
                            }
        
                            let ret = 
                                <div key={index} className='m-2 p-1' style={style}>
                                    <Button className='mt-2' variant='link' onClick={() => this.onSelectItem('res', index)} style={{maxWidth: "220px"}}>
                                        <img className='d-flex' style={{maxWidth: "200px", maxHeight: "200px"}} src={item.objects.srcUrl}/>
                                        {item.name}
                                    </Button>
                                </div>
                            return (ret);
                        })}
                    </div>
                    
                    <div>
                        <Button variant="primary" onClick={() => this.onSelectRotation(false)} disabled={!this.state.data.res}><FontAwesomeIcon icon={faMapMarked}/>{" Sélectionner rotation de départ"}</Button>

                        {this.state.data.rotationstart &&
                            <div className='alert alert-warning'>
                                <strong>Rotation souhaité :</strong> {"(" + JsNx.toFixed(this.state.data.rotationstart[0], 2) + ', ' + JsNx.toFixed(this.state.data.rotationstart[1], 2) + ', ' + JsNx.toFixed(this.state.data.rotationstart[2], 2) + ")"}
                            </div>
                        }
                    </div>
                    
                    <br/>
                </div>;
                
                break;
            case 'iframe':
                body = 
                <div>
                <Alert variant='primary'>{"Ceci va créer un bouton qui va ouvrir un popup avec la page choisi lorsque cliqué."}</Alert>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>{$glVars.i18n.tags.name}</Form.Label>
                        <Form.Control type="text" required value={this.state.data.name} name="name" onChange={this.onDataChange}/>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>Activité</Form.Label>
                        <ComboBoxPlus options={this.state.activityList} name="activity" onChange={(e) => this.onDataChange(e)}/>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>URL</Form.Label>
                        <Form.Control type="text" required value={this.state.data.url} name="url" onChange={this.onDataChange}/>
                    </Form.Group>
                </Form.Row>
                </div>;
                break;
            case 'image':
                body =
                <Form noValidate onSubmit={this.onSubmit} validated={this.state.formValidated} ref={this.formRef}>
                    <Alert variant='primary'>{"Ceci va créer une image dans la scène."}</Alert>
                    <Form.Row>
                        <Form.Group as={Col}>
                            <Form.Label>{"Fichier"}</Form.Label><br/>
                            {(!this.state.data.file || this.state.data.file.length == 0 || this.state.data.file.fileName) && <BtnUpload type="file" accept="image/jpeg,image/png" className='ml-1' required name='file' onChange={(e) => this.onFileChange(e)}/>}
                            {this.state.data.file && this.state.data.file.length > 0 && <span className='ml-1'>{this.state.data.file}</span>}
                        </Form.Group>
                    </Form.Row>
                </Form>;
                break;
            case 'sound':
            case 'video':
                body = 
                <div>
                    <Alert variant='warning'>{`La taille maximum du fichier est de ${this.MAX_UPLOAD_SIZE} MB.`}</Alert>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>Fichier</Form.Label><br/>
                        {(this.state.data.file == undefined || this.state.data.file.length == 0 || this.state.data.file.fileName) && <BtnUpload type="file" accept=".mp3,.mp4,.mkv,.avi" className='ml-1' required name='file' onChange={(e) => this.onFileChange(e)}/>}
                        {this.state.data.file && this.state.data.file.length > 0 && <span className='ml-1'>{this.state.data.file}</span>}
                    </Form.Group>
                </Form.Row>
                    <Form.Row>
                        <Form.Group as={Col}>
                            <Form.Label>Jouer en boucle</Form.Label>
                            <ToggleButtons name="loop" type="radio" defaultValue={[this.state.data.loop]} onChange={this.onDataChange} 
                                    options={[
                                        {value: true, text:"Oui"},
                                        {value: false, text:"Non"}
                                    ]}/>
                        </Form.Group>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group as={Col}>
                            <Form.Label>Jouer automatiquement quand la page se charge</Form.Label>
                            <ToggleButtons name="autoplay" type="radio" defaultValue={[this.state.data.autoplay]} onChange={this.onDataChange} 
                                    options={[
                                        {value: true, text:"Oui"},
                                        {value: false, text:"Non"}
                                    ]}/>
                        </Form.Group>
                    </Form.Row>
                </div>;
                break;
            default:
                return;
            
        }

        let appendToAll = 
        <Form.Row key="2">
            <Form.Group as={Col}>
                <Form.Label>Completion</Form.Label>
                <ToggleButtons name="completion" type="radio" defaultValue={[this.state.data.completion]} onChange={this.onDataChange} 
                        options={[
                            {value: 1, text:"Oui"},
                            {value: 0, text:"Non"}
                        ]}/>
            </Form.Group>
        </Form.Row>;

        return [<div key="1">{body}</div>,appendToAll];
    }

    onClose(){
        this.props.onClose();
    }

    onDataChange(event){
        let data = this.state.data;
        if (typeof event.target.checked != 'undefined' && event.target.type == 'checkbox'){
            data[event.target.name] = event.target.checked;
        }else{
            data[event.target.name] = event.target.value;
        }

        if (event.target.name == 'activity'){
            data.url = event.target.value;
        }
        this.setState({data: data, changed: true})
    }

    onSelectRotation(rot){
        if (rot){
            let data = this.state.data;
            data['rotationstart'] = rot;
            this.setState({data: data, changed: true, selectRotationPopup: false});
        }else{
            this.setState({selectRotationPopup: true});
        }
    }

    onSelectItem(name, index){
        let data = this.state.data;
        data[name] = this.props.resourceList[index];
        data[name+'_index'] = index;
        this.setState({data: data, changed: true})
    }

    onFileChange(event){
        let data = this.state.data;
        let reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = () => {
            if (event.target.files[0].size / 1024 / 1024 > this.MAX_UPLOAD_SIZE){
                alert('Le fichier est trop gros.')
                return
            }
            data[event.target.name] = {content:reader.result, fileName:event.target.files[0].name};
            this.setState({data: data, changed: true})
        };
    }

    onSubmit(e){
        if (e){
            e.preventDefault();
        }

        let data = this.state.data;

        if (this.formRef.current && this.formRef.current.checkValidity() === false) {
            this.setState({formValidated: true, data:data});            
        }
        else{
            this.setState({formValidated: true, data:data}, () => this.props.onSave(data));
        }
    }
}

class ModalRotationSelector extends Component
{
    static defaultProps = {        
        data: {},
        onClose: null,
        onSave: null,
    };

    constructor(props){
        super(props);
    }

    render(){
        let body = <div style={{height:'400px',marginBottom:'55px'}}>
            <div className='alert alert-warning'>Veuillez placer la vue à la rotation souhaité.</div>
            <a-scene embedded cursor="rayOrigin: mouse" raycaster="objects: .clickable,[gui-interactable]">
                <a-assets>
                </a-assets>
                <a-camera wasd-controls-enabled="false" id="acamera2"></a-camera>
                <a-sky src={this.props.data.objects.srcUrl}/>
            </a-scene>
        </div>
            
        let footer = <div style={{width:'100%'}}>
            <ButtonGroup style={{display: "flex",  float: "right"}}>
                <Button variant="secondary" onClick={this.props.onClose}><FontAwesomeIcon icon={faTimes}/>{" Annuler"}</Button>
                <Button variant="success" onClick={() =>this.onSave()}><FontAwesomeIcon icon={faSave}/>{" Enregistrer"}</Button>
            </ButtonGroup></div>;

        return <Modal width="50%" title={'Selectionner la rotation de départ'} body={body} footer={footer} onClose={this.onClose} />;
    }

    onSave(){
        let cam = document.getElementById('acamera2').getAttribute('rotation');
        let rot = [cam.x, cam.y, cam.z]
        this.props.onSave(rot)
    }
}