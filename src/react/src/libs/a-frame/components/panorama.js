AFRAME.registerComponent('panorama', {
	schema: {
		type: { type: 'string', default: 'image' },
		rotation: { type: 'vec3', default: {x: 0, y: 0, z: 0} },
		src: { type: 'string' }
	},
	init: function () {
		switch (this.data.type) {
			case 'image':
				this.sky = document.createElement('a-sky');
				this.sky.setAttribute('src', this.data.src);
				this.sky.setAttribute('rotation', this.data.rotation);
				this.el.appendChild(this.sky);

				break;
			case 'video':
				this.sky = document.createElement('a-videosphere');
				this.sky.setAttribute('src', this.data.src);
				this.sky.setAttribute('rotation', this.data.rotation);
				this.el.appendChild(this.sky);
				break;
		}
		this.onClick = this.onClick.bind(this);

	},
	play: function () {
		switch (this.data.type) {
			case 'image':

				break;
			case 'video':
				window.addEventListener('click', this.onClick);
				break;
			default:

				break;

		}

	},
	pause: function () {
		switch (this.data.type) {
			case 'image':

				break;
			case 'video':
				window.removeEventListener('click', this.onClick);
				break;
			default:

				break;

		}

	},
	onClick: function (evt) {

		var video = this.el.querySelector('a-videosphere');

		if (!video) { return; }
		video = video.components.material.material.map.image;
		video.play();
	}
});