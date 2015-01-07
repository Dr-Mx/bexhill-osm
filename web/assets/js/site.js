// spinner
var spinner = 0;

// Don't scape HTML string in Mustache
Mustache.escape = function (text) { return text; }

// https://github.com/Leaflet/Leaflet
var map = new L.Map('map');
map.setView([-27.4927, -58.8063], 12);

// https://github.com/Turbo87/sidebar-v2/
var sidebar = L.control.sidebar('sidebar').addTo(map);

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
L.control.locate({
    follow: false,
    setView: true,
    keepCurrentZoomLevel: true,
    showPopup: false,
    strings: {
	title: 'Muéstrame donde estoy',
	popup: 'Estás a {distance} metros aprox. de aquí',
	outsideMapBoundsMsg: 'No es posible ubicar tu posición en el mapa'
    },
    onLocationError: function(err) {
	alert('Disculpa. Hubo un error al intentar localizar tu ubicación.');
    }
}).addTo(map);

// https://github.com/ebrelsford/Leaflet.loading
var loadingControl = L.Control.loading({
    separate: true
});
map.addControl(loadingControl);

var pois = {
    bank: {
	name: 'Banco / Cajero',
	query: "[amenity~'bank|atm']",
	iconName: 'bank',
	markerColor: 'cadetblue',
	tagParser: bank_parser
    },

    'car_repair': {
	name: 'Gomería',
	query: '[shop=car_repair][car_repair=wheel_repair]',
	iconName: 'car',
	markerColor: 'red'
    },


    clinic: {
	name: 'Hospital / Clínica',
	query: "[amenity~'^clinic$|hospital']",
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
	name: 'Supermercado / Despensa',
	query: "[shop~'supermarket|convenience']",
	iconName: 'calculator',
	markerColor: 'blue'
    },

    viewpoint: {
	name: 'Atractivo Turístico',
	query: "[tourism~'viewpoint|museum|gallery|information|zoo']",
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
    if (spinner > 0) spinner -= 1;
    if (spinner == 0) $('#spinner').hide();

    for(i=0; i < data.elements.length; i++) {
	e = data.elements[i];

	if (e.id in this.instance._ids) return;
	this.instance._ids[e.id] = true;

	var pos = new L.LatLng(e.lat, e.lon);

	// TODO: improve this
	var type = ''
	if (e.tags.amenity) {
	    if (e.tags.amenity == 'atm') type = 'bank';
	    if (e.tags.amenity == 'hospital') type = 'clinic';
	    if (type == '' && e.tags.amenity in pois) type = e.tags.amenity;
	}
	console.debug(type);
	if (e.tags.tourism) {
	    if (e.tags.tourism in {
		'viewpoint': true,
		'museum': true,
		'information': true,
		'gallery': true,
		'zoo': true
	    }) type = 'viewpoint';
	}
	if (e.tags.shop) {
	    if (e.tags.shop == 'convenience') type = 'supermarket';
	    if (type == '' && e.tags.shop in pois) type = e.tags.shop;
	}
	var poi = pois[type];

	var markerIcon  = L.AwesomeMarkers.icon({
	    icon: poi.iconName,
	    markerColor: poi.markerColor,
	    prefix: 'fa'
	});
	var marker = L.marker(pos, {icon: markerIcon})
	var markerPopup = '\
            <ul class="nav nav-tabs" role="tablist" id="myTab">\
              <li role="presentation" class="active"><a href="#info" aria-controls="info" role="tab" data-toggle="tab">Info</a></li>\
              <li role="presentation"><a href="#raw" aria-controls="raw" role="tab" data-toggle="tab">Raw</a></li>\
            </ul>';

	if (poi.tagParser) {
	    markerPopup += poi.tagParser(e);
	}
	else {
	    for(tag in e.tags) {
		markerPopup += Mustache.render(
		    '<strong>{{name}}:</strong> {{value}}<br>',
		    {name: tag, value: e.tags[tag]});
	    }
	}
	marker.bindPopup(markerPopup)
	// TODO: use marker.getPopup().update() to update the layout
	// once the user clicks on "Raw"
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
	query += pois[element.dataset.key].query;
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
    for(poi in pois) {
	var checkbox = Mustache.render(
	    '<input type="checkbox" data-key="{{key}}" onclick="setting_changed()"> {{name}}<br>',
	    {key: poi, name: pois[poi].name}
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
