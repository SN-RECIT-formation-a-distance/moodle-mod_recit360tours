require ("../a-frame/primitives/a-hotspot");
require ("../a-frame/components/hotspot");
require ("../a-frame/components/iframe");
require ("../a-frame/primitives/a-panorama");
require ("../a-frame/components/panorama");
require ("../a-frame/primitives/a-tour");
require ("../a-frame/components/tour");
require ("../a-frame/components/circle-progress");

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
    static Create(attributes, clickCb, noOpen){
        let el1 = document.createElement('a-image');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');
        
        if (attributes.hotspot){
            el1.setAttribute('src', Assets.textIcon);
            el1.setAttribute('scale', Assets.iconScale);
            let el = document.createElement('a-image');
            el1.append(el);
            el.setAttribute('visible', false);
            el.setAttribute('scale', '1.3 1.3 1.3')
            el.classList.add('clickable')
            el.visible = false;
            el.object3D.position.set(0, 0, 1);
            if (!noOpen){
                el1.addEventListener("click", (e) => {
                    if (el1.timeStamp && (e.timeStamp - el1.timeStamp) < 1000) return; //Needed because event is fired twice
                    el.setAttribute('visible', !el.visible);
                    el.visible = !el.visible;
                    el1.timeStamp = e.timeStamp;
                });
                el.addEventListener("click", (e) => {
                    if (el1.timeStamp && (e.timeStamp - el1.timeStamp) < 1000) return; //Needed because event is fired twice
                    el.setAttribute('visible', !el.visible);
                    el.visible = !el.visible;
                    el1.timeStamp = e.timeStamp;
                });
            }
        }

        AText.Edit(el1, attributes, noOpen)
        return el1;
    }

    static Edit(el, attributes, noOpen){
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.text) el.setAttribute('data-text', attributes.text);
        if (attributes.key) el.setAttribute('data-key', attributes.key);
        if (attributes.hotspot) el.setAttribute('data-hotspot', attributes.hotspot);
        let child = el.querySelector('a-image');

        if (!noOpen || !child){
            let img = el;
            if (child) img = child;//If it is a hotspot image is child
            if (attributes.image) img.setAttribute('src', attributes.image);
            if (attributes.width) img.setAttribute('width', attributes.width);
            if (attributes.height) img.setAttribute('height', attributes.height);
            img.setAttribute('opacity', '0.8');
        }
    }
}

export class AImage {
    static Create(attributes, clickCb, noOpen){
        
        let el1 = document.createElement('a-image');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');
        el1.setAttribute('src', Assets.imageIcon);
        el1.setAttribute('scale', Assets.iconScale)

        AImage.Edit(el1, attributes, noOpen)
        return el1;
    }

    static Edit(el, attributes, noOpen){
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.width) el.setAttribute('data-width', attributes.width);
        if (attributes.height) el.setAttribute('data-height', attributes.height);
        if (attributes.fileUrl){
            if (!noOpen){
                el.setAttribute('open-page-img', 'url:'+attributes.fileUrl+';event:click');
            }
            el.setAttribute('filename', attributes.file)
        }
        if (attributes.key) el.setAttribute('data-key', attributes.key);
    }
}

export class ASound {
    static sounds = [];
    static Create(attributes, clickCb, noOpen){
        
        let el1 = document.createElement('a-sound');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');
        el1.setAttribute('positional', false)

        let el2 = document.createElement('a-image');
        el2.setAttribute('src', Assets.soundIcon);
        if (!noOpen) {
            el1.addEventListener('click', (e) => {
                if (el1.timeStamp && (e.timeStamp - el1.timeStamp) < 1000) return; //Needed because event is fired twice
                if (el1.getAttribute('autoplay')){
                    el1.removeAttribute('autoplay')
                    el1.components.sound.playSound();
                    setTimeout(() => el1.components.sound.pauseSound(), 300);
                    return;
                }
                if (el1.components.sound.isPlaying && el1.timeStamp){
                    el1.components.sound.pauseSound();
                }else{
                    el1.components.sound.playSound();
                    ASound.sounds.push(el1.components.sound);
                }
                el1.timeStamp = e.timeStamp;
            });
        }
        el2.setAttribute('scale', Assets.iconScale);
        el2.classList.add('clickable');
        el2.classList.add('draggable');
        el1.appendChild(el2)

        ASound.Edit(el1, attributes, noOpen)
        return el1;
    }

    static Edit(el, attributes, noOpen){
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.fileUrl){
            el.setAttribute('src', 'src: url('+attributes.fileUrl+')')
            el.setAttribute('filename', attributes.file)
        }
        if (attributes.autoplay){
            if (!noOpen) el.setAttribute('autoplay', 'true')
            el.setAttribute('data-autoplay', 'true');
            el.timeStamp = 0;//Reset sound event
        }else{
            el.removeAttribute('autoplay')
            el.removeAttribute('data-autoplay')
        }
        if (attributes.loop){
            el.setAttribute('loop', 'true')
        }else{
            el.removeAttribute('loop')
        }
        if (attributes.key) el.setAttribute('data-key', attributes.key);
    }

    static stopAllSounds(){
        for (let s of ASound.sounds){
            s.stopSound();
        }
        ASound.sounds = [];
    }
}

export class AIframe {
    static Create(attributes, clickCb, noOpen){
        
        let el1 = document.createElement('a-image');
        if (clickCb){
            el1.addEventListener("click", clickCb);
        }
        el1.classList.add('clickable');
        el1.classList.add('draggable');
        el1.setAttribute('scale', Assets.iconScale);
        el1.setAttribute('src', Assets.videoIcon)

        AIframe.Edit(el1, attributes, noOpen)
        return el1;
    }

    static Edit(el, attributes, noOpen){
        if (attributes.position) el.object3D.position.set(attributes.position.x, attributes.position.y, attributes.position.z);
        if (attributes.rotation) el.setAttribute('rotation', {x:attributes.rotation.x, y:attributes.rotation.y, z:attributes.rotation.z});
        if (attributes.completion) el.setAttribute('data-completion', attributes.completion);
        if (attributes.name){
            el.setAttribute('hover-text', {value:attributes.name})
        }
        if (attributes.activity){
            el.setAttribute('data-activity', attributes.activity)
        }
        if (attributes.url){
            if (!noOpen){
                if (attributes.external){
                    el.setAttribute('open-page-external', 'url:'+AVideo.FormatURL(attributes.url)+';event:click');
                    el.setAttribute('hover-text', {value:'[En cliquant sur ce bouton, vous quitterez la VR]',size:'small'})
                }else{
                    el.setAttribute('open-page-iframe', 'url:'+AVideo.FormatURL(attributes.url)+';event:click');
                }
            }
            el.setAttribute('data-url', attributes.url)
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
        el1.setAttribute('scale', Assets.iconScale);

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
        el1.setAttribute('scale', Assets.iconScale);
        el1.setAttribute('src', Assets.hotspotIcon);
        Navigation.Edit(el1, attributes)
        return el1;
    }

    static Edit(el, attributes){
        if (attributes.type) el.setAttribute('type', attributes.type);
        if (attributes.name){
            el.setAttribute('hotname', attributes.name);
            el.setAttribute('hover-text', {value:attributes.name});
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
    static CreateComponent(attributes, cb, noOpen){
        if (attributes.type == 'panorama'){
            return Panorama.Create(attributes, cb);
        }
        if (attributes.type == 'text'){
            return AText.Create(attributes, cb, noOpen);
        }
        if (attributes.type == 'navigation'){
            return Navigation.Create(attributes, cb);
        }
        if (attributes.type == 'image'){
            return AImage.Create(attributes, cb, noOpen);
        }
        if (attributes.type == 'sound'){
            return ASound.Create(attributes, cb, noOpen);
        }
        if (attributes.type == 'video'){
            return AVideo.Create(attributes, cb);
        }
        if (attributes.type == 'iframe'){
            return AIframe.Create(attributes, cb, noOpen);
        }
    }
}