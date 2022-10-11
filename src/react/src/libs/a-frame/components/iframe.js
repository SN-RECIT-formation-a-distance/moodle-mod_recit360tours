AFRAME.registerComponent('open-page-iframe', {
    schema: {
        event: { type: "string", default: "click" },
        url: { type: "string", default: "" }
    },
    init() {
        let data = this.data;
        let el = this.el;

        if (data.event && data.url) {
            el.addEventListener(data.event, this.openIframe.bind(this));
        }

        this.mountStyles();
    },

    mountStyles() {
        let styles = document.querySelector('#'+this.modalStyleSelector);

        if (styles === null) {
            let template = `<style id="${this.modalStyleSelector}">
            ${this.modalSelector}.page__modal {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 90vw;
                height: 90vh;
                max-width: 1500px;
                background-color: #fff;
                z-index: 1222;
            }
            ${this.modalSelector}.page__modal .page__modal-header {
                width: 100%;
                display: flex;
                flex-direction: row-reverse;
            }
            ${this.modalSelector}.page__modal iframe {
                width: 100%;
                height: 97%;
            }
            </style>`;
            document.body.insertAdjacentHTML('beforeend', template);
        }
    },
    getSceneEl() {
        return this.el.sceneEl;
    },
    openIframe() {
        this.usingVRMode = this.getSceneEl().is('vr-mode');

        this.getSceneEl().exitVR();
        let modal = this.mountHTML();
        modal.focus();
        document.body.style.overflow = 'hidden';
    },
    closeIframe() {
        this.clearGarbage();

        if (this.usingVRMode) {
            this.getSceneEl().enterVR();
        }

        this.getSceneEl().focus();
        document.body.style.overflow = '';
    },
    get modalSelector() {
        return '.a_open_page_iframe';
    },
    get modalStyleSelector() {
        return 'a_open_page_css';
    },
    clearGarbage() {
        document.querySelectorAll(this.modalSelector).forEach(item => item.remove());
    },
    mountHTML() {
        this.clearGarbage();

        let template = `<div class="a_open_page_iframe modal-backdrop fade show"> </div><div class="a_open_page_iframe page__modal p-1 p-md-3">
        <div class="page__modal-header">
            <button class="btn vrclose">retour à la VR</button>
        </div>
        <iframe src="${this.data.url}" frameborder="0" frameborder="0"></iframe>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', template);
        let modal = document.querySelector(this.modalSelector+'.page__modal');
        modal.querySelector('.vrclose').addEventListener('click', this.closeIframe.bind(this));

        return modal;
    },
});
AFRAME.registerComponent('open-page-img', {
    schema: {
        event: { type: "string", default: "click" },
        url: { type: "string", default: "" }
    },
    init() {
        let data = this.data;
        let el = this.el;

        if (data.event && data.url) {
            el.addEventListener(data.event, this.openIframe.bind(this));
        }

        this.mountStyles();
    },

    mountStyles() {
        let styles = document.querySelector('#'+this.modalStyleSelector);

        if (styles === null) {
            let template = `<style id="${this.modalStyleSelector}">
            ${this.modalSelector}.page__modal {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 1500px;
                height: 90%;
                background-color: #fff;
                padding: 10px;
                z-index: 1222;
            }
            ${this.modalSelector}.page__modal .page__modal-header {
                width: 100%;
                display: flex;
                flex-direction: row-reverse;
            }
            ${this.modalSelector}.page__modal img {
                width: 100%;
                height: auto;
            }
            ${this.modalSelector}.page__modal .mbody{
                overflow-y:auto;
                height:97%;
            }
            </style>`;
            document.body.insertAdjacentHTML('beforeend', template);
        }
    },
    getSceneEl() {
        return this.el.sceneEl;
    },
    openIframe() {
        this.usingVRMode = this.getSceneEl().is('vr-mode');

        this.getSceneEl().exitVR();
        let modal = this.mountHTML();
        modal.focus();
        document.body.style.overflow = 'hidden';
    },
    closeIframe() {
        this.clearGarbage();

        if (this.usingVRMode) {
            this.getSceneEl().enterVR();
        }

        this.getSceneEl().focus();
        document.body.style.overflow = '';
    },
    get modalSelector() {
        return '.a_open_page_img';
    },
    get modalStyleSelector() {
        return 'a_open_img_css';
    },
    clearGarbage() {
        document.querySelectorAll(this.modalSelector).forEach(item => item.remove());
    },
    mountHTML() {
        this.clearGarbage();

        let template = `<div class="a_open_page_img modal-backdrop fade show"> </div>
        <div class="a_open_page_img page__modal p-1 p-md-4">
        <div class="page__modal-header">
            <button class="btn vrclose">retour à la VR</button>
        </div>
        <div class="mbody">
            <img src="${this.data.url}"/>
        </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', template);
        let modal = document.querySelector(this.modalSelector+'.page__modal');
        modal.querySelector('.vrclose').addEventListener('click', this.closeIframe.bind(this));

        return modal;
    },
});