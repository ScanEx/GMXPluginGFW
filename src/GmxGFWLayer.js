/** GeoMixer virtual layer
*/
(function (){

var GeoMixerGFWLayer = L.GFWLayerWithSlider.extend({
    initFromDescription: function(layerDescription) {
        this._gmxProperties = layerDescription.properties;
        return this;
    },
    getGmxProperties: function() {
        return this._gmxProperties;
    }
});

L.gmx.addLayerClass('GFW', GeoMixerGFWLayer);
 
})();