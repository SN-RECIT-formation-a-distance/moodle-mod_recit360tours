
M.recit = M.recit || {};
M.recit.mod = M.recit.mod || {};
M.recit.mod.RecitPage = class{
    constructor(){
        this.iFrame = null;
        this.topNavbar = null;
        this.page = null;
        this.content = null;

        this.init = this.init.bind(this);
        this.getEditorContent = this.getEditorContent.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onSaveResult = this.onSaveResult.bind(this);

        this.init();
    }    

    init(){
        let that = this;

        this.topNavbar = document.getElementById("recitNavbarTop");
        this.page = document.getElementById("page");
        
        this.iFrame = document.getElementById("recitEditorHtml");
        
        if(this.iFrame === null){return;}
        
        this.iFrame.src = `${M.cfg.wwwroot}/lib/editor/atto/plugins/vvvebjs/editor/index.php?contextid=${M.cfg.contextid}&theme=${M.cfg.theme}&themerev=${M.cfg.themerev}`;
        this.iFrame.onload = function(event){
            //that.topNavbar.style.display = 'none';
            that.page.style.display = 'none';
        };

        this.content = document.getElementById("recitPageContent");

        window.getEditorContent = this.getEditorContent;
    
        window.onSave = this.onSave;
    }

    getEditorContent(){
        return this.content.innerHTML;
    }

    onSave(frameDocument){
        let html = frameDocument.body.outerHTML;

        recit.http.WebApi.instance().saveRecitPageContent(recit.utils.getQueryVariable("id"), html, (result) => this.onSaveResult(result, html));
    }

    onSaveResult(result, html){
        if(!result.success){
            alert(result.msg);
            console.log(result.msg);
            return;
        }
        
        this.content.innerHTML = html;

        let btnEditionMode = this.topNavbar.querySelector("#btnEditionMode");
        window.location.href = btnEditionMode.href; // close the editor
    }
}

M.recit.mod.RecitPage.instance = null;

document.addEventListener('DOMContentLoaded', function(){ 
    M.recit.mod.RecitPage.instance = new M.recit.mod.RecitPage(); 
    
}, false);

