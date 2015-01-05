// https://github.com/Leaflet/Leaflet
var map = new L.Map('map');
map.setView([-27.4927, -58.8063], 12);

// https://github.com/mlevans/leaflet-hash
var hash = new L.Hash(map);

// https://github.com/leaflet-extras/leaflet-providers
L.tileLayer.provider(
    'OpenStreetMap.Mapnik',
    {
	attribution: 'Data: <a href="http://www.overpass-api.de/">OverpassAPI</a>/ODbL OpenStreetMap'
    }
).addTo(map);

// https://github.com/domoritz/leaflet-locatecontrol
L.control.locate().addTo(map);

var icons = {
    bank: {
	name: 'Banco',
	query: "[amenity~'bank|atm']",
	iconName: 'bank',
	markerColor: 'cadetblue'
    },

    'car_repair': {
	name: 'Gomería',
	query: '[shop=car_repair][car_repair=wheel_repair]',
	iconName: 'car',
	markerColor: 'red'
    },


    clinic: {
	name: 'Clínica',
	query: '[amenity=clinic]',
	iconName: 'hospital-o',
	markerColor: 'red'
    },
    pharmacy: {
	name: 'Farmacia',
	query: '[amenity=pharmacy]',
	iconName: 'plus-square',
	markerColor: 'green'
    },

    fuel: {
	name: 'Estación de Servicio',
	query: '[amenity=fuel]',
	iconName: 'car',
	markerColor: 'orange'
    },

    supermarket: {
	name: 'Supermercado',
	query: '[shop=supermarket]',
	iconName: 'calculator',
	markerColor: 'blue'
    },

    viewpoint: {
	name: 'Mirador',
	query: '[tourism=viewpoint]',
	iconName: 'star',
	markerColor: 'orange'
    },

    'camp_site': {
	name: 'Camping',
	query: '[tourism=camp_site]',
	iconName: 'fire',
	markerColor: 'green'
    },
    hotel: {
	name: 'Hotel',
	query: '[tourism=hotel]',
	iconName: 'building',
	markerColor: 'darkred'
    },
    hostel: {
	name: 'Hostel',
	query: '[tourism=hostel]',
	iconName: 'building',
	markerColor: 'darkred'
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

	// TODO: improve this
	var type;
	if (e.tags.amenity) {
	    if (e.tags.amenity == 'atm') type = 'bank';
	    else type = e.tags.amenity;
	}
	if (e.tags.tourism) type = e.tags.tourism;
	if (e.tags.shop) type = e.tags.shop;
	var icon = icons[type];

	var markerIcon  = L.AwesomeMarkers.icon({
	    icon: icon.iconName,
	    markerColor: icon.markerColor,
	    prefix: 'fa'
	});
	var marker = L.marker(pos, {icon: markerIcon})
	var markerPopup = '<h3>Etiquetas</h3>';
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
    // TODO: when a building matches a POI it's not shown in the map
    // because we need to filter by "way" instead of "node". In case,
    // we filter by "way" we need to get the lat/lon of the centre

    query = '(';
    $('#settings input:checked').each(function(i, element) {
	// http://overpass-turbo.eu/s/6QW
	query += "node(BBOX)";
	query += icons[element.dataset.key].query;
	query += ';';
    });
    query += ');out;';
    console.debug(query);
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
	    '<input type="checkbox" data-key="{{key}}" onclick="setting_changed()"> {{name}}<br>',
	    {key: icon, name: icons[icon].name}
	);
	$('#settings').append(checkbox);
    }
}
show_settings();

var query = '';
build_overpass_query();

function show_overpass_layer() {
    if(query == '' || query == '();out;') {
	console.debug('There is nothing selected to filter by.');
	return;
    }
    var opl = new L.OverPassLayer({
	query: query,
	callback: callback,
	minzoom: 14,
    });

    iconLayer.addLayer(opl);
}
show_overpass_layer();
