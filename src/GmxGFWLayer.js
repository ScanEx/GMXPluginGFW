/** GeoMixer virtual layer
*/
(function (){

var defineClass = function() {
    var GeoMixerGFWLayer = L.GFWLayerWithSlider.extend({
		options: {
			// pane: 'tilePane',
			yearBegin: 2001,
			yearEnd: 2016
		},
        initFromDescription: function(layerDescription) {
            this._gmxProperties = layerDescription.properties;
            return this;
        },
        getGmxProperties: function() {
            return this._gmxProperties;
        }
    });
    L.gmx.addLayerClass('GFW', GeoMixerGFWLayer);
    return GeoMixerGFWLayer;
}

if (window.gmxCore) {
    gmxCore.addModule('GFWVirtualLayer', function() {
        return {
            layerClass: defineClass()
        }
    }, {
        init: function(module, path) {
			gmxCore.loadCSS(path + 'gmxPluginGfw.css');
        }
    });
} else {
    defineClass();
}
 
})();
