import {WebApi, JsNx} from '../libs/utils/Utils';
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
    
    /*isEditingMode(onSuccess){
        let data = {service: "isEditingMode"};
        this.post(this.gateway, data, onSuccess);
    }

    getEnrolledUserList(cmId, onSuccess){
        let data = {cmId: cmId, service: "getEnrolledUserList"};
        this.post(this.gateway, data, onSuccess);
    }

    getPages(cmId, onSuccess){
        let data = {cmId: cmId, service: "getPages"};
        this.post(this.gateway, data, onSuccess);
    }  
    
    getPageFormKit(cmId, pageId, onSuccess){
        let data = {cmId: cmId, pageId: pageId, service: "getPageFormKit"};
        this.post(this.gateway, data, onSuccess);
    }*/

    getImage360FormKit(cmId, onSuccess){
        let data = {cmId: cmId, service: "getImage360FormKit"};
        this.post(this.gateway, data, onSuccess);
    }

    getCmList(cmId, onSuccess){
        let data = {cmId: cmId, service: "getCmList"};
        this.post(this.gateway, data, onSuccess);
    }

    getResourceFormKit(resourceId, onSuccess){
        let data = {resourceId: resourceId, service: "getResourceFormKit"};
        this.post(this.gateway, data, onSuccess);
    }

    deleteResource(resourceId, onSuccess){
        let data = {resourceId: resourceId, service: "deleteResource"};
        this.post(this.gateway, data, onSuccess);
    }

    saveResource(data, onSuccess){
        let that = this;
        let onSuccessTmp = function(result){     
            onSuccess(result);
            if(result.success){
                that.notifyObservers('saveResource');
            }
        };

        let options = {data: data, service: "saveResource"};
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


    /*savePageSetup(data, onSuccess){
        let that = this;
        let onSuccessTmp = function(result){     
            onSuccess(result);
            if(result.success){
                that.notifyObservers('savePageSetup');
            }
        };

        let options = {data: data, service: "savePageSetup"};
        this.post(this.gateway, options, onSuccessTmp);
    }

    setDisplayType(cmId, value, onSuccess){
        let options = {cmId: cmId, value: value, service: "setDisplayType"};
        this.post(this.gateway, options, onSuccess);
    }

    switchPageSlot(cmId, from, to, onSuccess){
        let options = {cmId: cmId, from: from, to: to, service: "switchPageSlot"};
        this.post(this.gateway, options, onSuccess);
    }

    removePage(cmId, pageId, onSuccess){
        let that = this;
        let onSuccessTmp = function(result){     
            onSuccess(result);
            if(result.success){
                that.notifyObservers('removePage');
            }
        };

        let options = {cmId: cmId, pageId: pageId, service: "removePage"};
        this.post(this.gateway, options, onSuccessTmp);
    }

    getPageNav(cmId, onSuccess){
        let data = {cmId: cmId, service: "getPageNav"};
        this.post(this.gateway, data, onSuccess);
    }

    getPagesEvaluation(cmId, userId, onSuccess){
        let data = {cmId: cmId, userId: userId, service: "getPagesEvaluation"};
        this.post(this.gateway, data, onSuccess);
    }

    getPageEvaluation(cmId, userId, pageId, onSuccess){
        let data = {cmId: cmId, userId: userId, pageId: pageId, service: "getPageEvaluation"};
        this.post(this.gateway, data, onSuccess);
    }
    
    savePageEval(data, onSuccess){
        let that = this;
        let onSuccessTmp = function(result){     
            onSuccess(result);
            if(result.success){
                that.notifyObservers('savePageEval');
            }
        };

        let options = {data: data, service: "savePageEval"};
        this.post(this.gateway, options, onSuccessTmp);
    }

    getPageContent(cmId, pageId, filtered, countViews, onSuccess){
        let data = {cmId: cmId, pageId: pageId, filtered: filtered, countPageViews: countViews ? 1 : 0, service: "getPageContent"};
        this.post(this.gateway, data, onSuccess);
    }*/
};
