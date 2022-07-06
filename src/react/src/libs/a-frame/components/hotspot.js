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
					'src': "data:image/webp;base64,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",
					'hover-text': this.data.hotname,
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
	  value: {default: ''}
	},
  
	init: function () {
	  var data = this.data;
	  var el = this.el;
  
	  el.addEventListener('mouseenter', function () {
		let t = document.createElement('a-text')
		t.setAttribute('value', data);
		el.appendChild(t)
	  });
	  el.addEventListener('mouseleave', function () {
		let t = el.querySelector('a-text')
		if (t) t.remove()
	  });
	}
  });