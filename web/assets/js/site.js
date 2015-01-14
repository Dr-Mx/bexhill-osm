// spinner
var spinner = 0;

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
	attribution: 'Teselas <a href="http://giscience.uni-hd.de/" target="_blank">GIScience Research Group</a>'
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
    onLocationError: function(err) {alert('Disculpa. Hubo un error al intentar localizar tu ubicación.');}
}).addTo(map);

// https://github.com/ebrelsford/Leaflet.loading
var loadingControl = L.Control.loading({
    separate: true
});
map.addControl(loadingControl);


var icons = {
    bar: {
	name: 'Bar',
	query: '[amenity=bar]',
	iconName: 'bar_coktail'
    },

    pub: {
	name: 'Pub',
	query: '[amenity=pub]',
	iconName: 'bar'
    },

    restaurant: {
	name: 'Restaurante',
	query: '[amenity=restaurant]',
	iconName: 'restaurant'
    },

    fast_food: {
	name: 'Comida Rápida',
	query: '[amenity=fast_food]',
	iconName: 'fastfood'
    },

    bank: {
	name: 'Banco',
	query: '[amenity=bank]',
	iconName: 'bank'
    },

    atm: {
	name: 'Cajero',
	query: '[amenity=atm]',
	iconName: 'atm-2'
    },

    fuel: {
	name: 'Estación de Servicio',
	query: '[amenity=fuel]',
	iconName: 'fillingstation'
    },

    wheel_repair: {
	name: 'Gomería',
	query: '[shop=car_repair][car_repair=wheel_repair]',
	iconName: 'tires'
    },

    clinic: {
	name: 'Clínica',
	query: '[amenity=clinic]',
	iconName: 'medicine'
    },

    hospital: {
	name: 'Hospital',
	query: '[amenity=hospital]',
	iconName: 'hospital-building'
    },

    pharmacy: {
	name: 'Farmacia',
	query: '[amenity=pharmacy]',
	iconName: 'drugstore'
    },

    supermarket: {
	name: 'Supermercado',
	query: '[shop=supermarket]',
	iconName: 'supermarket'
    },

    convenience: {
	name: 'Despensa',
	query: '[shop=convenience]',
	iconName: 'conveniencestore'
    },

    gallery: {
	name: 'Galería de Arte',
	query: '[tourism=gallery]',
	iconName: 'museum_art'
    },

    museum: {
	name: 'Museo',
	query: '[tourism=museum]',
	iconName: 'museum_crafts'
    },

    viewpoint: {
	name: 'Mirador',
	query: '[tourism=viewpoint]',
	iconName: 'sight-2'
    },

    'camp_site': {
	name: 'Camping',
	query: '[tourism=camp_site]',
	iconName: 'camping-2'
    },

    hotel: {
	name: 'Hotel',
	query: '[tourism=hotel]',
	iconName: 'hotel_0star'
    },

    hostel: {
	name: 'Hostel',
	query: '[tourism=hostel]',
	iconName: 'youthhostel'
    },

    info_tourism: {
	name: 'Información Turística',
	query: '[tourism=information]',
	iconName: 'information'
    },

    zoo: {
	name: 'Zoológico',
	query: '[tourism=zoo]',
	iconName: 'zoo'
    }
}

// https://github.com/kartenkarsten/leaflet-layer-overpass
function callback(data) {
    if (spinner > 0) spinner -= 1;
    if (spinner == 0) $('#spinner').hide();

    for(i=0; i < data.elements.length; i++) {
	e = data.elements[i];

	if (e.id in this.instance._ids) return;
	this.instance._ids[e.id] = true;

	var pos = (e.type == 'node') ?
	    new L.LatLng(e.lat, e.lon) :
	    new L.LatLng(e.center.lat, e.center.lon);

	// TODO: improve this
	var type = ''
	if (e.tags.amenity) {
	    if (type == '') type = e.tags.amenity;
	}
	if (e.tags.tourism) {
	    if (type == '') type = e.tags.tourism;
	}
	if (e.tags.shop) {
	    if (e.tags.car_repair == 'wheel_repair') type = 'wheel_repair';
	    if (type == '') type = e.tags.shop;
	}
	var icon = icons[type];

	// skip this undefined icon
	if (!icon) {
	    console.info('Skipping undefined icon: "' + type + '"');
	    continue;
	}

	var markerIcon  = L.icon({
	    iconUrl: 'assets/img/icons/' + icon.iconName + '.png',
	    iconSize: [32, 37],
	    iconAnchor: [18.5, 35],
	    popupAnchor: [0, -27]
	});
	var marker = L.marker(pos, {icon: markerIcon})
	var markerPopup = '<h3>Etiquetas</h3>';
	for(tag in e.tags) {
	    markerPopup += Mustache.render(
		'<strong>{{name}}:</strong> {{value}}<br>',
		{name: tag, value: e.tags[tag]}
	    );
	}

	marker.bindPopup(markerPopup);
	marker.addTo(this.instance);
    }
}

function build_overpass_query() {
    query = '(';
    $('#pois input:checked').each(function(i, element) {
	query += 'node(BBOX)' + icons[element.dataset.key].query + ';';
	query += 'way(BBOX)' + icons[element.dataset.key].query + ';';
	query += 'relation(BBOX)' + icons[element.dataset.key].query + ';';
    });
    query += ');out center;';
}

function setting_changed() {
    // remove icons from current map
    iconLayer.clearLayers();
    build_overpass_query();
    show_overpass_layer();
    update_permalink();
}

function show_pois_checkboxes() {
    // build the content for the "Home" sidebar pane
    var i = 0;
    var content = '';
    content += '<table>';
    for (icon in icons) {
	if (i % 2 == 0) content += '<tr>';
	content += '<td>';
	var checkbox = Mustache.render(
	    '<div class="poi-checkbox"> \
		<label> \
		    <img src="assets/img/icons/{{icon}}.png"></img> \
		    <input type="checkbox" data-key="{{key}}" onclick="setting_changed()"><span>{{name}}</span> \
		</label> \
	    </div>',
	    {key: icon, name: icons[icon].name, icon: icons[icon].iconName}
	);
	content += checkbox;
	content += '</td>';
	i++;
	if (i % 2 == 0) content += '</tr>';
    }
    content += '</table>';
    $('#pois').append(content);
}
show_pois_checkboxes();

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

// https://github.com/makinacorpus/Leaflet.RestoreView
if (!map.restoreView()) {
    map.setView([-27.4927, -58.8063], 12);
}

var query = '';
build_overpass_query();

function show_overpass_layer() {
    if (query == '' || query == '();out center;') {
	console.debug('There is nothing selected to filter by.');
	return;
    }
    var opl = new L.OverPassLayer({
	query: query,
	callback: callback,
	minzoom: 14
    });

    iconLayer.addLayer(opl);
}

function get_permalink() {
    var uri = URI(window.location.href);
    var selectedPois = [];
    $('#pois input:checked').each(function(i, element) {
	selectedPois.push(element.dataset.key);
    });

    uri.query({'pois': selectedPois, 'norestoreview': true});
    return uri.href();
}

function update_permalink() {
    var link = get_permalink();
    $('#permalink').attr('href', link);
}
