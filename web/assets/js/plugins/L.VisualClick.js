L.Map.VisualClick = L.Handler.extend({
	_makeVisualIcon: function () {
		return L.divIcon({
			className: "leaflet-visualclick-icon",
			iconSize: [0, 0],
			clickable: false
		});
	},
	_visualIcon: null,
	_onClick: function (e) {
		var map = this._map;
		var latlng = e.latlng;
		var marker = L.marker(latlng, {
			pane: 'shadowPane',
			icon: this._visualIcon,
			interactive: false
		}).addTo(map);
		window.setTimeout(function () { if (map) marker.remove(); }.bind(this), map.options.visualClick.removeTimeout || 500);
		return true;
	},
	addHooks: function () {
		if (this._visualIcon === null) this._visualIcon = this._makeVisualIcon();
		this._map.on(this._map.options.visualClickEvents, this._onClick, this);
	},
	removeHooks: function () {
		this._map.off(this._map.options.visualClickEvents, this._onClick, this);
	},
});
L.Map.mergeOptions({
	visualClick: L.Browser.any3d ? true : false,
	visualClickEvents: 'visualclick',
});
L.Map.addInitHook('addHandler', 'visualClick', L.Map.VisualClick);
