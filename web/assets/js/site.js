// spinner
var spinner = 0;

// Don't scape HTML string in Mustache
Mustache.escape = function (text) { return text; }

// https://github.com/Leaflet/Leaflet
var map = new L.Map('map');
var iconLayer = new L.LayerGroup();
map.addLayer(iconLayer);

var attribution = 'Datos &#169; Colaboradores <a href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

var tileLayerData = {
    std: {
	name: 'Estándar (Mapnik)',
	url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    hot: {
	name: 'Equipo Humanitario',
	url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
	attribution: 'Teselas <a href="http://hot.openstreetmap.org/" target="_blank">Equipo Humanitario OpenStreetMap</a>'
    },
    osmfr: {
	name: 'OSM Francia',
	url: 'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
	attribution: 'Teselas <a href="http://openstreetmap.fr/" target="_blank">OpenStreetMap Francia</a>'
    },
    cycle: {
	name: 'Bicicleta',
	url: 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
	attribution: 'Teselas <a href="http://thunderforest.com/opencyclemap/" target="_blank">ThunderForest</a>'
    },
    transport: {
	name: 'Transporte Público',
	url: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
	attribution: 'Teselas <a href="http://thunderforest.com/transport/" target="_blank">ThunderForest</a>'
    },
    landscape: {
	name: 'Paisaje',
	url: 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
	attribution: 'Teselas <a href="http://thunderforest.com/landscape/" target="_blank">ThunderForest</a>'
    },
    outdoor: {
	name: 'Al Aire Libre',
	url: 'http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
	attribution: 'Teselas <a href="http://thunderforest.com/outdoors/" target="_blank">ThunderForest</a>'
    },
    lyrk: {
	name: 'Lyrk',
	url: 'http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=3d836013a4ab468f965bfd1328d89522',
	attribution: 'Teselas <a href="http://lyrk.de/" target="_blank">Lyrk</a>'
    },
    mapbox: {
	name: 'MapBox (Calles)',
	url: 'http://{s}.tiles.mapbox.com/v3/51114u9.kogin3jb/{z}/{x}/{y}.png',
	attribution: 'Teselas <a href="http://mapbox.com/" target="_blank">MapBox</a>'
    },
    mapquest: {
	name: 'MapQuest Open',
	url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
	attribution: 'Teselas <a href="http://mapquest.com/" target="_blank">MapQuest</a>',
	subdomains: '123'
    },
    mapsurfer: {
	name: 'OpenMapSurfer',
	url: 'http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}',
	attribution: 'Teselas <a href="http://giscience.uni-hd.de/" target="_blank">GIScience Research Group @ Heidelberg University</a>'
    }
};

var tileLayers = {};
for (tile in tileLayerData) {
    var tileAttribution;
    var subdomains = tileLayerData[tile].subdomains ? tileLayerData[tile].subdomains : 'abc';
    if (tileLayerData[tile].attribution) {
	tileAttribution = tileLayerData[tile].attribution + ' &mdash; ' + attribution;
    }
    else tileAttribution = attribution;

    tileLayers[tileLayerData[tile].name] = L.tileLayer(
	tileLayerData[tile].url,
	{attribution: tileAttribution, subdomains: subdomains}
    )
}

tileLayers['Estándar (Mapnik)'].addTo(map);
L.control.layers(tileLayers).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
var geocoder = L.Control.geocoder({
    position: 'topleft',
    placeholder: 'Buscar...',
    errorMessage: 'Ningún resultado',
    showResultIcons: true
}).addTo(map);

geocoder.markGeocode = function(result) {
    this._map.fitBounds(result.bbox);
    return this;
};


// https://github.com/Turbo87/sidebar-v2/
var sidebar = L.control.sidebar('sidebar').addTo(map);
$(document).ready(function () {
    // open #home sidebar-pane to show the available POIs
    sidebar.open('home');
});

// https://github.com/mlevans/leaflet-hash
var hash = new L.Hash(map);

// update the permalink when L.Hash changes the #hash
window.onhashchange = function() {
    update_permalink();
}


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

// https://github.com/makinacorpus/Leaflet.RestoreView
if (!map.restoreView()) {
    map.setView([-27.4927, -58.8063], 12);
}

var query = '';
show_pois_checkboxes();
build_overpass_query();

var uri = URI(window.location.href);
if (uri.hasQuery('pois')) {
    var selectedPois = uri.search(true).pois;
    if (!$.isArray(selectedPois)) {
	poi = selectedPois.replace('/', '');
	$('#pois input[data-key='+ poi + ']').attr('checked', true);
    }
    else {
	for (i = 0; i < selectedPois.length; i++) {
	    // the last poi has a "/" on it because leaflet-hash
	    poi = selectedPois[i].replace('/', '');
	    $('#pois input[data-key='+ poi + ']').attr('checked', true);
	}
    }
    setting_changed();
}
