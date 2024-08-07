import {WebApi, JsNx} from '../libs/utils/Utils';
import { $glVars } from './common';
import { Options } from './Options';

export class AppWebApi extends WebApi
{    
    constructor(){
        super(Options.getGateway());
                
        this.http.useCORS = true;
        this.sid = 0;
        this.observers = [];
        this.http.timeout = 30000; // 30 secs
    }

    addObserver(id, update, observables){
        this.observers.push({id:id, update:update, observables: observables});
    }

    removeObserver(id){
        JsNx.removeItem(this.observers, "id", id);
    }

    notifyObservers(observable){
        for(let o of this.observers){
            if(o.observables.includes(observable)){
                o.update();
            }
        }
    }

    get360Tour(tourId, onSuccess){
        let data = {tourId: tourId, service: "get360Tour"};
        this.post(this.gateway, data, onSuccess);
    }

    getTourCompletion(tourId, onSuccess){
        let data = {tourId: tourId, service: "getTourCompletion"};
        this.post(this.gateway, data, onSuccess);
    }

    getImage360FormKit(tourId, onSuccess){
        let data = {tourId: tourId, service: "getImage360FormKit"};
        this.post(this.gateway, data, onSuccess);
    }

    getCmList(cmId, onSuccess){
        let data = {cmId: cmId, service: "getCmList"};
        this.post(this.gateway, data, onSuccess);
    }

    getSceneFormKit(resourceId, onSuccess){
        let data = {resourceId: resourceId, service: "getSceneFormKit"};
        this.post(this.gateway, data, onSuccess);
    }

    deleteScene(resourceId, onSuccess){
        let data = {resourceId: resourceId, cmId: $glVars.urlParams.id, service: "deleteScene"};
        this.post(this.gateway, data, onSuccess);
    }

    deleteObject(objectId, onSuccess){
        let data = {objectId: objectId, cmId: $glVars.urlParams.id, service: "deleteObject"};
        this.post(this.gateway, data, onSuccess);
    }

    saveObjectView(objectId, cmId, onSuccess){
        let data = {objectId: objectId, cmId: cmId, service: "saveObjectView"};
        this.post(this.gateway, data, onSuccess);
    }

    saveObject(object, onSuccess){
        let data = {data: object, service: "saveObject"};
        this.post(this.gateway, data, onSuccess);
    }

    saveScene(data, onSuccess){
        let that = this;
        let onSuccessTmp = function(result){     
            onSuccess(result);
            if(result.success){
                that.notifyObservers('saveResource');
            }
        };

        let options = {data: data, service: "saveScene"};
        this.post(this.gateway, options, onSuccessTmp);
    }

    saveFile(data, onSuccess){
        let options = {data: data, service: "saveFile"};
        this.post(this.gateway, options, onSuccess);
    }

    deleteFile(data, onSuccess){
        let options = {data: data, service: "deleteFile"};
        this.post(this.gateway, options, onSuccess);
    }
};
