AFRAME.registerComponent('tour', {
    init: function () {
      var panorama = Array.prototype.slice.call(this.el.querySelectorAll('a-panorama'));
      var panoramaid=[];
      panorama.forEach(function (element,index) {
        element.setAttribute('visible', 'false');
        element.setAttribute('position', '0 1000 0');
        panoramaid[element.getAttribute("id")] = element.getAttribute("id");
      })
      var start = panorama[0];
      if (start) this.loadSceneId(start.getAttribute('id'),null);
    },
  
    loadSceneId: function(to, for1) {
      this.loadImage(this.el.querySelector('a-panorama#' + to),this.el.querySelector('a-panorama#' + for1));
     
    },
  
    loadImage: function (to,for1) {
      if (!to) return;
    
      to.setAttribute('visible', 'true');
      to.setAttribute('position', '0 0 0');
      if (for1 == undefined){
        return;
      }else{
        for1.setAttribute('visible', 'false');
        for1.setAttribute('position', '0 1000 0');
        var camera = document.querySelector('a-camera');
        camera.setAttribute('rotation', to.getAttribute('rotation'));
      }
  },
  
  update: function (oldData) {
  },
});
  