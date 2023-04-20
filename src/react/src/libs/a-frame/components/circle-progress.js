AFRAME.registerComponent('circle-progress', {
    schema: {
        height: {type: 'number', default: 0.5 },
        loaded: {type: 'number', default: 0.5 },
        fontSize: {type: 'number', default: 0.2},
        fontFamily: {type: 'string', default: ''},
        fontColor: {type: 'string', default: '#c6c6c6'},
        backgroundColor: {type: 'string', default: '#fff'},
        activeColor: {type: 'string', default: '#ff0000'},
    },
    init: function() {

        var data = this.data;
        var el = this.el;
        var guiItem = {height: data.height};

        //fallback for old font-sizing
        if(data.fontSize > 20) { // 150/1000
          var newSize = data.fontSize/750;
          data.fontSize = newSize;        
        }

        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);
        el.setAttribute('material', `shader: flat; transparent: true; opacity: 1; side:back; color:${data.backgroundColor};`);

        var loaderContainer = document.createElement("a-entity");
        loaderContainer.setAttribute('geometry', `primitive: cylinder; radius: ${(guiItem.height/2.5)}; height: 0.02;`);
        loaderContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.backgroundColor}`);
        loaderContainer.setAttribute('rotation', '90 0 0');
        loaderContainer.setAttribute('position', '0 0 0.01');
        el.appendChild(loaderContainer);

        // var countLoaded = document.createElement("a-entity");
        // countLoaded.setAttribute('geometry', `primitive: plane; width: ${guiItem.height/1.5}; height: ${guiItem.height/1.5};`);
        // countLoaded.setAttribute('material', `shader: flat; transparent: true; opacity: 1; side:front;`);
        // countLoaded.setAttribute('position', '0 0 0.022');
        // countLoaded.id = "loader_ring_count";
        // el.appendChild(countLoaded);

        var loaderRing = document.createElement("a-ring");
        loaderRing.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor}`);
        loaderRing.setAttribute('radius-inner', `${guiItem.height/3}`);
        loaderRing.setAttribute('radius-outer', `${guiItem.height/2}`);
        loaderRing.setAttribute('theta-start', '90');
        loaderRing.setAttribute('theta-length', `${data.loaded*-360}`);
        loaderRing.setAttribute('rotation', '0 0 0');
        loaderRing.setAttribute('position', '-0.03 0 0.03');
        loaderRing.id = "loader_ring";
        el.appendChild(loaderRing);
        this.loaderRing = loaderRing;

        this.setText(data.loaded);


    },
    play: function () {
    },
    update: function (oldData) {
        var data = this.data;
        var el = this.el;

        if(this.textEntity){

            var oldEntity = this.textEntity;
            oldEntity.remove();

            this.setText(this.data.loaded);
            this.loaderRing.setAttribute('theta-length', `${data.loaded*-360}`);
   
        }else{
            console.log("no textEntity!");   
        }        
    },
    setText: function (newLoaded) {
        var textEntity = document.createElement("a-entity");
        this.textEntity = textEntity;
        textEntity.setAttribute('text', `value: ${Math.round(newLoaded*100)}%; 
                                                align:center; 
                                                anchor:center; 
                                                baseline:center;
                                                color:${this.data.fontColor};
                                                font:${this.data.fontFamily};
                                                `);
        textEntity.setAttribute('position', '0 0 0.05');
        textEntity.setAttribute('scale', '3 3 3');
        this.el.appendChild(textEntity);
    }
});

AFRAME.registerPrimitive( 'a-circle-progress', {
    defaultComponents: {
        'circle-progress': { }
    },
    mappings: {
        'loaded': 'circle-progress.loaded',
        'height': 'circle-progress.height',
        'font-size': 'circle-progress.fontSize',
        'font-family': 'circle-progress.fontFamily',
        'font-color': 'circle-progress.fontColor',
        'background-color': 'circle-progress.backgroundColor',
        'active-color': 'circle-progress.activeColor'
    }
});