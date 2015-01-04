var map = new L.Map('map');
map.setView([-27.4927, -58.8063], 12);

// https://github.com/mlevans/leaflet-hash
var hash = new L.Hash(map);

// https://github.com/leaflet-extras/leaflet-providers
L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

// https://github.com/domoritz/leaflet-locatecontrol
L.control.locate().addTo(map);

// https://github.com/kartenkarsten/leaflet-layer-overpass
function callback(data) {
    for(i=0; i < data.elements.length; i++) {
	e = data.elements[i];

	if (e.id in this.instance._ids) return;
	this.instance._ids[e.id] = true;

	var pos = new L.LatLng(e.lat, e.lon);
	var popup = this.instance._poiInfo(e.tags);
	var icon  = L.AwesomeMarkers.icon({
	    icon: 'hospital-o',
	    markerColor: 'red',
	    prefix: 'fa'
	});
	var marker = L.marker(pos, {icon: icon})

	// TODO: add popup here

	marker.addTo(this.instance);
    }
}


var opl = new L.OverPassLayer({
  query: "node(BBOX)[amenity=clinic];out;",
  callback: callback,
  minzoom: 14,
});

map.addLayer(opl);
