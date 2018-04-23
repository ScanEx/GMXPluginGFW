﻿/** Leaflet control for years interval selection
 * Requires jQuery and Handlebars
*/
L.GFWSlider = L.Control.extend({
    includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
    _setYears: function(yearBegin, yearEnd) {
        this.options.yearBegin = yearBegin;
        this.options.yearEnd = yearEnd;
        this.fire('yearschange', {yearBegin: yearBegin, yearEnd: yearEnd});
    },
    _gmxTimelineShift: function(ev) {
		if (ev.id === 'gmxTimeline' && ev.control) {
			var control = ev.control;
			if (ev.type === 'gmxcontroladd') {
				control.on('statechanged', this._setShift, this);
				L.DomUtil.addClass(this._container, 'marginBottom145');
			} else {
				control.off('statechanged', this._setShift, this);
				L.DomUtil.removeClass(this._container, 'marginBottom20');
				L.DomUtil.removeClass(this._container, 'marginBottom145');
			}
		}
    },
    _setShift: function(state) {
		var isVisible = state.isVisible || state.isVisible === undefined;
		L.DomUtil.removeClass(this._container, 'marginBottom' + (isVisible ? '20' : '145'));
		L.DomUtil.addClass(this._container, 'marginBottom' + (isVisible ? '145' : '20'));
    },
    onAdd: function(map) {
		var container = this._container || this._createCont();

		var stop = L.DomEvent.stopPropagation;
			L.DomEvent
				.on(container, 'contextmenu', stop)
				.on(container, 'touchstart', stop)
				.on(container, 'mousedown', stop);

		map
			.on('gmxcontrolremove', this._gmxTimelineShift, this)
			.on('gmxcontroladd', this._gmxTimelineShift, this);

		if (map.gmxControlsManager) {
			var gmxTimeline = map.gmxControlsManager.get('gmxTimeline');
			if (gmxTimeline) {
				setTimeout(function() {
					this._setShift(gmxTimeline.saveState());
				}.bind(this), 0);
			}
		}

        return container;
    },

    onRemove: function(map) {
		map
			.off('gmxcontrolremove', this._gmxTimelineShift, this)
			.off('gmxcontroladd', this._gmxTimelineShift, this);
    },
    _createCont: function() {
        var template = Handlebars.compile(
            '<div class = "gfw-slider">' + 
                '<div class = "gfw-slider-container"></div>' +
                '<div class = "gfw-slider-labels">' +
                    '{{#labels}}' +
                        '<div class = "gfw-label-item">{{.}}</div>' +
                    '{{/labels}}' +
                '</div>' +
            '</div>'
        );

        var labels = [];
        for (var year = this.options.yearBegin; year <= this.options.yearEnd; year++) {
            labels.push(year);
        }

        var ui = this._ui = $(template({
            labels: labels
        }));

        ui.find('.gfw-slider-container').slider({
            min: this.options.yearBegin,
            max: this.options.yearEnd,
            values: [this.options.yearBegin, this.options.yearEnd],
            range: true,
            change: function(event, ui) {
                this._setYears(ui.values[0], ui.values[1]);
            }.bind(this)
        });
        return ui[0];
    },

    saveState: function() {
        return {
            version: '1.0.0',
            yearBegin: this.options.yearBegin,
            yearEnd: this.options.yearEnd
        }
    },

    loadState: function(data) {
        if (this._ui) {
            this._ui.find('.gfw-slider-container').slider('option', 'values', [data.yearBegin, data.yearEnd]);
        } else {
            this._setYears(data.yearBegin, data.yearEnd);
        }
    }
});
