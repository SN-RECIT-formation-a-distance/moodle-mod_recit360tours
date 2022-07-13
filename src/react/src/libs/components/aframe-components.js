require ("../a-frame/primitives/a-hotspot");
require ("../a-frame/components/hotspot");
require ("../a-frame/components/iframe");
require ("../a-frame/primitives/a-panorama");
require ("../a-frame/components/panorama");
require ("../a-frame/primitives/a-tour");
require ("../a-frame/components/tour");

import { Assets } from "../../common/assets";

export class Panorama {
    static Create(attributes){
        let el2 = document.createElement('a-panorama');
        el2.setAttribute('src', attributes.src);
        el2.id = attributes.id;
        return el2;
    }
}

export class AText {
    static Create(attributes, clickCb){
        
        let el1 = document.createElement('a-plane');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');

        AText.Edit(el1, attributes)
        return el1;
    }

    static Edit(el, attributes){
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.text) el.setAttribute('text', {value:attributes.text, color: attributes.color, align:'center', baseline: 'center'});
        if (attributes.backgroundColor) el.setAttribute('material', {color: attributes.backgroundColor, opacity: 0.7});
        if (attributes.key) el.setAttribute('data-key', attributes.key);
        //el.setAttribute('geometry', {primitive:'plane', width: '2', height: '2'})
        el.setAttribute('width', "2")
        el.setAttribute('scale', "0.5 0.5 0.5")
    }
}

export class AImage {
    static Create(attributes, clickCb){
        
        let el1 = document.createElement('a-image');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');
        el1.setAttribute('src', Assets.imageIcon);
        el1.setAttribute('scale', "0.5 0.5 0.5")

        AImage.Edit(el1, attributes)
        return el1;
    }

    static Edit(el, attributes){
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.fileUrl){
            if (!attributes.noOpen){
                el.setAttribute('open-page-img', 'url:'+attributes.fileUrl+';event:click');
            }
            el.setAttribute('filename', attributes.file)
        }
        if (attributes.key) el.setAttribute('data-key', attributes.key);
    }
}

export class ASound {
    static Create(attributes, clickCb){
        
        let el1 = document.createElement('a-sound');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');
        el1.setAttribute('positional', false)

        let el2 = document.createElement('a-image');
        el2.setAttribute('src', Assets.soundIcon);
        if (!attributes.noOpen) {
            el1.addEventListener('click', () => {
                if (el1.components.sound.isPlaying){
                    el1.components.sound.stopSound();
                }else{
                    el1.components.sound.playSound();
                }
            });
        }
        el2.setAttribute('scale', '0.3 0.3 0.3');
        el2.classList.add('clickable');
        el2.classList.add('draggable');
        el1.appendChild(el2)

        ASound.Edit(el1, attributes)
        return el1;
    }

    static Edit(el, attributes){
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.fileUrl){
            el.setAttribute('src', 'src: url('+attributes.fileUrl+')')
            el.setAttribute('filename', attributes.file)
        }
        if (attributes.autoplay){
            el.setAttribute('autoplay', 'true')
        }else{
            el.removeAttribute('autoplay')
        }
        if (attributes.loop){
            el.setAttribute('loop', 'true')
        }else{
            el.removeAttribute('loop')
        }
        if (attributes.key) el.setAttribute('data-key', attributes.key);
    }
}

export class AIframe {
    static Create(attributes, clickCb){
        
        let el1 = document.createElement('a-image');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');
        el1.setAttribute('src', Assets.videoIcon)

        AIframe.Edit(el1, attributes)
        return el1;
    }

    static Edit(el, attributes){
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.url){
            if (!attributes.noOpen){
                el.setAttribute('open-page-iframe', 'url:'+AVideo.FormatURL(attributes.url)+';event:click')
            }
            el.setAttribute('data-url', attributes.url)
        }
        if (attributes.name){
            el.setAttribute('hover-text', attributes.name)
        }
        if (attributes.key) el.setAttribute('data-key', attributes.key);
    }
}

export class AVideo {
    static Create(attributes, clickCb){
        let el1 = document.createElement('a-video');
        let el2 = document.createElement('video');
        el2.id = attributes.key;
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');

        el1.addEventListener("click", () => {
            if (!el2.paused){
                el2.currentTime = 0;
                el2.pause();
            }else{
                el2.play();
            }
        });

        document.querySelector('a-assets').appendChild(el2)
        el1.setAttribute('scale', '0.5 0.5 0.5');

        AVideo.Edit(el1, attributes)
        return el1;
    }

    static Edit(el, attributes){
        let vid = document.getElementById(attributes.key)
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.fileUrl){
            vid.setAttribute('src', attributes.fileUrl)
            el.setAttribute('src', '#'+attributes.key)
            el.setAttribute('filename', attributes.file)
        }
        if (attributes.autoplay){
            vid.setAttribute('autoplay', 'true')
        }else{
            vid.removeAttribute('autoplay')
        }
        if (attributes.loop){
            vid.setAttribute('loop', 'true')
        }else{
            vid.removeAttribute('loop')
        }
        if (attributes.key) el.setAttribute('data-key', attributes.key);
    }

    static FormatURL(url){
        if (url.includes('youtube')){
            let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            let match = url.match(regExp);

            if (match && match[2].length === 11){
            return "//www.youtube.com/embed/" + match[2];
            }
        }
        return url;
    }
}

export class Navigation {
    static Create(attributes, clickCb){
        let el1 = document.createElement('a-hotspot');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');
        el1.setAttribute('scale', '0.5 0.5 0.5');
        Navigation.Edit(el1, attributes)
        return el1;
    }

    static Edit(el, attributes){
        if (attributes.type) el.setAttribute('type', attributes.type);
        if (attributes.name){
            el.setAttribute('hotname', attributes.name);
            let btn = el.querySelector('a-gui-button');
            if (btn){
                btn.setAttribute('value', attributes.name);
            }
        }
        if (attributes.for) el.setAttribute('for', attributes.for);
        if (attributes.to) el.setAttribute('to', attributes.to);
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.rotationstart) el.setAttribute('rotationstart', attributes.rotationstart);
        if (attributes.key) el.setAttribute('data-key', attributes.key);
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
    }
}

export class aframeComponentFactory {
    static CreateComponent(attributes, cb){
        if (attributes.type == 'panorama'){
            return Panorama.Create(attributes, cb);
        }
        if (attributes.type == 'text'){
            return AText.Create(attributes, cb);
        }
        if (attributes.type == 'navigation'){
            return Navigation.Create(attributes, cb);
        }
        if (attributes.type == 'image'){
            return AImage.Create(attributes, cb);
        }
        if (attributes.type == 'sound'){
            return ASound.Create(attributes, cb);
        }
        if (attributes.type == 'video'){
            return AVideo.Create(attributes, cb);
        }
        if (attributes.type == 'iframe'){
            return AIframe.Create(attributes, cb);
        }
    }
}