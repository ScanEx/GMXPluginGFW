/** GeoMixer plugin
*/
(function (){
if (!window.gmxCore) {
    return
}

var publicInterface = {
    pluginName: 'GFW Plugin'
};

gmxCore.addModule('GFWPlugin', publicInterface, {
    init: function(module, path) {
        return gmxCore.loadModule('GFWVirtualLayer', path + 'GmxGFWLayer.js');
    }
});

})();
