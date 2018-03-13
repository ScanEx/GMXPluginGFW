/** GeoMixer virtual layer
*/
(function (){

var defineClass = function() {
    var GeoMixerGFWLayer = L.GFWLayerWithSlider.extend({
		options: {
			// pane: 'tilePane',
			yearBegin: 2001,
			yearEnd: 2017
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
            if (!L.GFWLayerWithSlider) {
                gmxCore.loadCSS(path + 'L.GFWSlider.css');
                // return $.when(
                    // gmxCore.loadScript(path + 'L.GFWLayer.js'),
                    // gmxCore.loadScript(path + 'L.GFWSlider.js')
                // );
            }
        }
        
    });
} else {
    defineClass();
}
 
})();
