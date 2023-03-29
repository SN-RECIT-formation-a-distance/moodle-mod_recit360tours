import { Assets } from "../../../common/assets";

AFRAME.registerComponent('hotspot', {
	schema: {
		for: { type: 'string' },
		to: { type: 'string' },
		type: { type: "string", default: "navigation" },
		html: { type: "string", default: " " },
		hotname: { type: 'string', default: "text" },
		rotationstart: { default: [0,0,0] },
		positioning: { type: 'boolean', default: false },
		src: { type: "string", default: "#image1" },
		mediaheight: { type: "int", default: 2 },
		mediawidth: { type: "int", default: 1 }
	},

	ensure: function(el, selector, name = selector, attrs = {}, innerHTML = "") {
		let _childEl, attr, val
		_childEl = el.querySelector(selector)
		if (!_childEl) {
		  _childEl = document.createElement(name)
		  el.appendChild(_childEl)
		  for (attr in attrs) {
			val = attrs[attr]
			_childEl.setAttribute(attr, val)
		  }
		  _childEl.innerHTML = innerHTML
		}
		return _childEl
	},

	init: function () {
		var text = this.data.hotname
		switch (this.data.type) {
			case "navigation":
				this.ensure(this.el, "a-image", "a-image", {
					'src': this.data.src,
					'class': 'clickable'
				})
				this.tour = document.querySelector('a-tour');

				this.el.addEventListener('click', this.handleClick.bind(this));
				break;
			case "image":
				this.ensure(this.el, "a-image", "a-image", {
					'class': 'a-image',
					'visible': false,
					'src': this.data.src,
					'position': "0 -1.5 0",
					'height': this.data.mediaheight,
					'width': this.data.mediawidth
				})
				this.ensure(this.el, "a-gui-flex-container", "a-gui-flex-container", {
					'class': 'a-gui-flex-container',
					'flex-direction': "row",
					'justify-content': "center",
					'align-items': "normal",
					'component-padding': "0.1",
					'opacity': "0.7",
					'width': "2",
					'height': "1"
				})
				var container = this.el.querySelector('a-gui-flex-container')
				this.ensure(container, ".a-gui-flex-container", "a-gui-button", {
					'class': 'a-gui-button',
					'base-depth': "0.1",
					'depth': "0.3",
					'gap': "0.1",
					'onclick': "",
					'key-code': "32",
					'value': "I",
					'font-size': "0.4",
					'margin': "0 0 0.05 0",
					'font-color': "white",
					'active-color': "dodgerblue",
					'hover-color': "#00008B",
					'border-color': "white",
					'focus-color': "black",
					'background-color': "#5f9ea0",
					'bevel': "true",
					'width': "0.75",
					'height': "0.75"
				}),

				this.media = this.el.querySelector('a-image');
				this.el.addEventListener('click', this.mediaClick.bind(this));
				break;
			case "video":
				this.ensure(this.el, "a-gui-flex-container", "a-gui-flex-container", {
					'class': 'a-gui-flex-container',
					'flex-direction': "row",
					'justify-content': "center",
					'align-items': "normal",
					'component-padding': "0.1",
					'opacity': "0.7",
					'width': "2",
					'height': "1"
				})
				var container = this.el.querySelector('a-gui-flex-container')
				this.ensure(container, ".a-gui-flex-container", "a-gui-button", {
					'class:': 'a-gui-button',
					'base-depth': "0.1",
					'depth': "0.3",
					'gap': "0.1",
					'onclick': "",
					'key-code': "32",
					'value': "V",
					'font-size': "0.4",
					'margin': "0 0 0.05 0",
					'font-color': "white",
					'active-color': "dodgerblue",
					'hover-color': "#00008B",
					'border-color': "white",
					'focus-color': "black",
					'background-color': "blue",
					'bevel': "true",
					'width': "0.75",
					'height': "0.75"
				}),
					this.ensure(this.el, "a-video", "a-video", {
						'class:': 'recitvideo',
						'src': "row",
						'justify-content': "center",
						'align-items': "normal",
						'component-padding': "0.1",
						'opacity': "0.7",
						'width': "2",
						'height': "1"
					})
				this.media = this.el.querySelector('a-video');
				this.el.addEventListener('click', this.mediaClick.bind(this));
				break;
			case "html":
				this.ensure(this.el, "a-gui-flex-container", "a-gui-flex-container", {
					'class:': 'a-gui-flex-container',
					'flex-direction': "row",
					'justify-content': "center",
					'align-items': "normal",
					'component-padding': "0.1",
					'opacity': "0.7",
					'width': "2",
					'height': "1"
				})
				var container = this.el.querySelector('a-gui-flex-container')
				this.ensure(container, ".a-gui-flex-container", "a-gui-button", {
					'class:': 'a-gui-button',
					'base-depth': "0.025",
					'depth': "0.1",
					'gap': "0.1",
					'onclick': "",
					'key-code': "32",
					'value': "Info",
					'font-size': "0.25",
					'margin': "0 0 0.05 0",
					'font-color': "black",
					'active-color': "red",
					'hover-color': "yellow",
					'border-color': "white",
					'focus-color': "black",
					'background-color': "blue",
					'bevel': "true",
					'width': "1.5",
					'height': "0.7"
				}),
					this.ensure(this.el, "htmlembedsph", "htmlembedsph", {
						'class:': 'a-gui-flex-container',
						'flex-direction': "row",
						'justify-content': "center",
						'align-items': "normal",
						'component-padding': "0.1",
						'opacity': "0.7",
						'width': "2",
						'height': "1"
					})
				this.media = document.querySelector('a-htmlembedsph');
				this.el.addEventListener('click', this.handleClick.bind(this));
				break;
		}



	},

	handleClick: function () {
		if (this.data.positioning || !this.data.to) return;
		var tour = this.tour.components['tour'];
		tour.loadSceneId(this.data.to, this.data.for);
		let cam = document.querySelector('a-camera');
		if (cam){
			cam.parentElement.setAttribute('rotation', {x: parseInt(this.data.rotationstart[0]), y: parseInt(this.data.rotationstart[1]), z: parseInt(this.data.rotationstart[2])})
		}
	},
	videoClick: function () {
		console.log("video is click")

	},
	mediaClick: function () {
		var visi = this.media.getAttribute('visible')
		if (visi == false) {
			this.media.setAttribute('visible', true)
		} else {
			this.media.setAttribute('visible', false) 
		}

	}
});


AFRAME.registerComponent('hover-text', {
	schema: {
	  value: {default: ''},
	  size: {default: ''}
	},
  
	init: function () {
	  var that = this;
	  var el = this.el;
  
	  el.addEventListener('mouseenter', function () {
		let t = document.createElement('a-entity');
		t.classList.add('a-text')
		t.setAttribute('text', {value: that.data.value, color: '#fff', align:'center', baseline: 'center', font: Assets.CustomFont, fontImage: Assets.CustomFontImage, negate: 'false'});
		if (that.data.size == 'small'){
			t.setAttribute('scale', '3 3 3');
			t.setAttribute('position', '0 0.5 0');
		}else{
			t.setAttribute('scale', '5 5 5');
			t.setAttribute('position', '0 -0.6 0');
		}
		el.appendChild(t)
	  });
	  el.addEventListener('mouseleave', function () {
		let t = el.querySelector('.a-text')
		if (t) t.remove()
	  });
	},

	update(oldData){
	}
});
AFRAME.registerComponent('data-completed', {
	schema: {
	  value: {default: ''},
	},
  
	init: function () {
	  var el = this.el;
	  var img = el.querySelector('a-image');
	  if (!img && el.tagName == "A-IMAGE"){
		img = el;
	  }
	  if (img){
		var url = img.getAttribute('src');
		
		if (this.data == 1){
			url = url.replace('.png', '2.png');
			img.setAttribute('src', url);
			
		}
	  }
	},
});