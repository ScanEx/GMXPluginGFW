/** GeoMixer plugin
*/
(function (){
 
var publicInterface = {
    pluginName: 'GFW Plugin'
}

gmxCore.addModule('GFWPlugin', publicInterface, {
    css: 'L.GFWSlider.css',
    init: function(module, path) {
        return $.when(
            gmxCore.loadScript(path + 'L.GFWLayer.js'),
            gmxCore.loadScript(path + 'L.GFWSlider.js')
        ).then(function() {
            return gmxCore.loadScript(path + 'GmxGFWLayer.js');
        });
    }
});

})();