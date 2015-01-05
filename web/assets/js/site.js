var map = new L.Map('map');
map.setView([-27.4927, -58.8063], 12);

// https://github.com/mlevans/leaflet-hash
var hash = new L.Hash(map);

// https://github.com/leaflet-extras/leaflet-providers
L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

// https://github.com/domoritz/leaflet-locatecontrol
L.control.locate().addTo(map);

var icons = {
    clinic: {
	name: 'Clínica',
	amenity: 'clinic',
	iconName: 'hospital-o',
	markerColor: 'red'
    },
    pharmacy: {
	name: 'Farmacia',
	amenity: 'pharmacy',
	iconName: 'plus-square',
	markerColor: 'green'
    },
    fuel: {
	name: 'Estación de Servicio',
	amenity: 'fuel',
	iconName: 'car',
	markerColor: 'orange'
    },
    bar: {
	name: 'Bar',
	amenity: 'bar',
	iconName: 'glass',
	markerColor: 'blue'
    }
}

var iconLayer = new L.LayerGroup();
map.addLayer(iconLayer);

// https://github.com/kartenkarsten/leaflet-layer-overpass
function callback(data) {
    for(i=0; i < data.elements.length; i++) {
	e = data.elements[i];

	if (e.id in this.instance._ids) return;
	this.instance._ids[e.id] = true;

	var pos = new L.LatLng(e.lat, e.lon);
	console.debug(e.tags.amenity);
	var icon = icons[e.tags.amenity];
	var markerIcon  = L.AwesomeMarkers.icon({
	    icon: icon.iconName,
	    markerColor: icon.markerColor,
	    prefix: 'fa'
	});
	var marker = L.marker(pos, {icon: markerIcon})
	var markerPopup = '';
	for(tag in e.tags) {
	    markerPopup += Mustache.render(
		'<strong>{{name}}:</strong> {{value}}<br>',
		{name: tag, value: e.tags[tag]});
	}

	marker.bindPopup(markerPopup)
	marker.addTo(this.instance);
    }
}

function build_overpass_query() {
    amenity = [];
    $('#settings input:checked').each(function(i, element) {
	amenity.push(element.name);
    });

    // TODO: improve this regex
    amenity = amenity.join('|');
    amenity = '^' + amenity.replace('|', '$|^') + '$';    
}

function setting_changed() {
    // remove icons from current map
    iconLayer.clearLayers();
    build_overpass_query();
    show_overpass_layer();
}

function show_settings() {
    for(icon in icons) {
	var checkbox = Mustache.render(
	    '<input type="checkbox" checked="checked" name="{{icon}}" onclick="setting_changed()"> {{name}}<br>',
	    {icon: icon, name: icons[icon].name}
	)
	$('#settings').append(checkbox);
    }
}
show_settings();

var amenity = [];
build_overpass_query();

function show_overpass_layer() {
    var query = Mustache.render(
	"node(BBOX)['amenity'~'{{amenity}}'];out;",
	{amenity: amenity}
    );
    var opl = new L.OverPassLayer({
	query: query,
	callback: callback,
	minzoom: 15,
    });

    iconLayer.addLayer(opl);
}
show_overpass_layer();
