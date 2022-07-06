AFRAME.registerPrimitive('a-panorama', {
  defaultComponents: {
    type: {},
    panorama: {},
    rotation:{},
  },
  mappings: {
    type:'panorama.type',
    src: 'panorama.src',
    rotation: 'panorama.rotation'
  
  }
});

