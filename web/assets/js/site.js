// spinner
var spinner = 0;

// Don't scape HTML string in Mustache
Mustache.escape = function (text) { return text; }

// https://github.com/Leaflet/Leaflet
var map = new L.Map('map');
var iconLayer = new L.LayerGroup();
map.addLayer(iconLayer);

var attribution = 'Data: &copy; Contributors <a href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

var tileLayerData = {
    std: {
		name: 'OpenStreetMap (standard)',
		url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		zoom: '19'
	},
    osmfr: {
		name: 'OpenStreetMap (france)',
		url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
		attribution: 'Tiles: <a href="http://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
		zoom: '19'
    },
    cycle: {
		name: 'Cycle Map',
		url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
		attribution: 'Tiles: <a href="http://thunderforest.com/opencyclemap/" target="_blank">ThunderForest</a>',
		zoom: '19'
    },
    transport: {
		name: 'Transport Map',
		url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
		attribution: 'Tiles: <a href="http://thunderforest.com/transport/" target="_blank">ThunderForest</a>',
		zoom: '19'
    },
    landscape: {
		name: 'Landscape',
		url: 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
		attribution: 'Tiles: <a href="http://thunderforest.com/landscape/" target="_blank">ThunderForest</a>',
		zoom: '19'
    },
    outdoor: {
		name: 'Outdoors',
		url: 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
		attribution: 'Tiles: <a href="http://thunderforest.com/outdoors/" target="_blank">ThunderForest</a>',
		zoom: '19'
    },
    lyrk: {
		name: 'OpenMapSurfer',
		url: 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
		attribution: 'Tiles: <a href="http://giscience.uni-hd.de/" target="_blank">GIScience Heidelberg</a>',
		zoom: '19'
    },
    mapboxsat: {
		name: 'MapBox (satellite)',
		url: 'https://{s}.tiles.mapbox.com/v3/51114u9.kogin3jb/{z}/{x}/{y}.png',
		attribution: 'Tiles: <a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: '19'
    },
    mapbox: {
		name: 'Mapbox',
		url: 'https://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbG10dnA3NzY3OTZ0dmtwejN2ZnUycjYifQ.1W5oTOnWXQ9R1w8u3Oo1yA',
		attribution: 'Tiles: <a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: '19'
    }
};

var tileLayers = {};
for (tile in tileLayerData) {
    var tileAttribution;
	var tilemaxZoom = tileLayerData[tile].zoom;
    var subdomains = tileLayerData[tile].subdomains ? tileLayerData[tile].subdomains : 'abc';
    if (tileLayerData[tile].attribution) {
		tileAttribution = tileLayerData[tile].attribution + ' | ' + attribution;
    }
	else tileAttribution = attribution;
		tileLayers[tileLayerData[tile].name] = L.tileLayer(
		tileLayerData[tile].url,
		{maxNativeZoom: tilemaxZoom, maxZoom: 20, attribution: tileAttribution, subdomains: subdomains}
    )
}
tileLayers['OpenStreetMap (standard)'].addTo(map);
L.control.layers(tileLayers).addTo(map);

// https://github.com/cliffcloud/Leaflet.EasyButton
// Check if POI selected then get permalink
L.easyButton({
	states:[{
		icon:'fa-link',
		title:'Get map link',
		onClick:function(){
			var link = get_permalink();
			if (link.indexOf('&pois') >= 0) {
				window.prompt('Copy permanent map link:', link);
			}
			else alert('Please select a POI');
		}
	}]
}).addTo(map);
// Clear map of all info layers
L.easyButton({
	states:[{
		icon:'fa-trash-o',
		title:'Clear map',
		onClick:function(){
			if (map.hasLayer(poly)) { map.removeLayer(poly); }
			clear_map();
		}
	}]
}).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
var poly;
L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: '0.3000,50.8200,0.5250,50.8800'
		}
	}),
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft'
})
.on('markgeocode', function(e) {
	var bbox = e.geocode.bbox;
	var center = e.geocode.center;
	if (map.hasLayer(poly)) { map.removeLayer(poly); }
	poly = L.polygon([
		bbox.getSouthEast(),
		bbox.getNorthEast(),
		bbox.getNorthWest(),
		bbox.getSouthWest()
	],
	{
		color: '#b05301',
		fill: false
	}
	).addTo(map);
	map.panTo(center);
})
.addTo(map);

// https://github.com/Turbo87/sidebar-v2/
var sidebar = L.control.sidebar('sidebar').addTo(map);

// https://github.com/mlevans/leaflet-hash
var hash = new L.Hash(map);

// update the permalink when L.Hash changes the #hash
window.onhashchange = function() {
    update_permalink();
}

// https://github.com/domoritz/leaflet-locatecontrol
L.control.locate({
    setView: true,
    keepCurrentZoomLevel: true,
    showPopup: false,
    strings: {
		title: 'Locate me',
		popup: 'You are within {distance} {unit} from this point',
		outsideMapBoundsMsg: 'You appear to be located outside Bexhill.  Come visit!'
    },
    onLocationError: function(err) {
		alert('Sorry, there was an error while trying to locate you.');
    }
}).addTo(map);

// https://github.com/ebrelsford/Leaflet.loading
var loadingControl = L.Control.loading({
    separate: true
});
map.addControl(loadingControl);

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
			// Group similar pois
			if (type == 'arts_centre') type = 'attraction';
			if (type == 'nightclub') type = 'bar';
			if (type == 'college') type = 'school';
			if (type == 'retirement_home') type = 'social_facility';
			// Hide non-public parking
			if (type == 'parking') {
				if (e.tags.access == 'private') type = '';
				if (e.tags.access == 'customers') type = '';
				if (e.tags.access == 'permissive') type = '';
			}
		}
		if (e.tags.tourism) {
			if (type == '') type = e.tags.tourism;
		}
		if (e.tags.historic) {
			if (type == '') type = 'historic';
			if (type == 'manor') type = 'attraction';
		}
		if (e.tags.shop) {
			if (type == '') type = e.tags.shop;
			// Group similar pois
			if (type == 'e-cigarette') type = 'tobacco';
			if (type == 'hardware') type = 'doityourself';
			if (type == 'window_blind') type = 'curtain';
			if (type == 'hairdresser') type = 'beauty';
			if (type == 'laundry') type = 'dry_cleaning';
			if (type == 'garden_centre') type = 'florist';
			if (type == 'tyres') type = 'car_repair';
		}
		if (e.tags.landuse) {
			if (type == '') type = e.tags.landuse;
			// Hide non-public grounds
			if (type == 'recreation_ground') {
				if (e.tags.access == 'private') type = '';
			}
		}
		if (e.tags.leisure) {
			if (type == '') type = e.tags.leisure;
			if (type == 'common') type = 'park';
			if (type == 'swimming_pool') {
				if (e.tags.access == 'private') type = '';
			}
		}
		if (e.tags.emergency) {
			if (type == '') type = e.tags.emergency;
		}
		if (e.tags.office) {
			if (type == '') type = e.tags.office;
			if (type == 'financial') type = 'accountant';
		}
		if (e.tags.healthcare) {
			if (type == '') type = 'healthcare';
		}
		if (e.tags.listed_status) {
			if (type == '') type = 'listed_status';
		}

		var poi = pois[type];
		// Skip this undefined icon
		if (!poi) {
			console.log('Skipping undefined icon: "' + type + '"');
			continue;
		}
		//console.log(pois[type]);
		var markerIcon  = L.icon({
			iconUrl: 'assets/img/icons/' + poi.iconName + '.png',
			iconSize: [32, 37],
			iconAnchor: [18.5, 35],
			popupAnchor: [0, -27]
		});
		var marker = L.marker(pos, {
			icon: markerIcon,
			keyboard: false
		})

		// show a label next to the icon on mouse hover
		if (e.tags.name) {
			marker.bindLabel(
				e.tags.name,
				{direction: 'auto', offset: [27, -32]}
			);
		}

		if (poi.tagParser) var markerPopup = poi.tagParser(e);
		else var markerPopup = generic_poi_parser(e, poi.name);
		var customOptions =
			{
			'maxWidth': '350',
			}
		marker.bindPopup(markerPopup, customOptions);
		marker.addTo(this.instance);
	}
}

function build_overpass_query() {
	var acttab = $('.sidebar-pane.active').attr('id');
    query = '(';
    $('#pois' + acttab + ' input:checked').each(function(i, element) {
		query += 'node' + pois[element.dataset.key].query + '(BBOX);';	
		query += 'way' + pois[element.dataset.key].query + '(BBOX);';
    });
    query += ');out center;';
	//console.log(query);
}

function clear_map() {
	$('input:checkbox').prop("checked", false);
	setting_changed();
}

function setting_changed(newcheckbox) {
	// limit number of selections
	if ($('input:checkbox:checked').length <= 3) {
		// remove pois from current map
		iconLayer.clearLayers();
		if ($('input:checkbox:checked').length > 0) {
			build_overpass_query();
			show_overpass_layer();
		}
		update_permalink();
	}
	else $('[data-key=' + newcheckbox + ']').prop('checked', false);
}

function show_pois_checkboxes(tabName) {
    // build the content for the sidebar pane
	var i = 0;
    var content = '';
    content += '<table style="width:100%">';
	for (poi in pois) {
		if (pois[poi].tabName == tabName) {
			if (i % 2 == 0) content += '<tr>';
			content += '<td style="overflow:hidden; white-space:nowrap">';
			var checkbox = Mustache.render(
				'<div class="poi-checkbox"> \
					<label> \
						<img src="assets/img/icons/{{icon}}.png"></img> \
						<input type="checkbox" name="{{name}}" data-key="{{key}}" onclick="setting_changed(&#39;{{key}}&#39;)"><span>{{name}}</span> \
					</label> \
				</div>',
				{key: poi, name: pois[poi].name, icon: pois[poi].iconName, tabname: pois[poi].tabName}
			);
			content += checkbox;
			content += '</td>';
			i++;
			if (i % 2 == 0) content += '</tr>';
		}
    }
    content += '</table>';
    $('#pois' + tabName).append(content);
}
show_pois_checkboxes('shops');
show_pois_checkboxes('amenities');
show_pois_checkboxes('services');
show_pois_checkboxes('leisure');
show_pois_checkboxes('tourism');

var uri = URI(window.location.href);
if (uri.hasQuery('pois')) {
	var selectedPois = uri.search(true).pois;
	if (!$.isArray(selectedPois)) {
			// the last poi has a "/" on it because leaflet-hash
			poi = selectedPois.replace('/', '');
			$('#pois' + uri.search(true).tab + ' input[data-key=' + poi + ']').prop('checked', true);
		}
	else {
		for (i = 0; i < selectedPois.length; i++) {
			// the last poi has a "/" on it because leaflet-hash
			poi = selectedPois[i].replace('/', '');
			$('#pois' + uri.search(true).tab + ' input[data-key=' + poi + ']').prop('checked', true);
		}
	}
	sidebar.open(uri.search(true).tab);
	// Highlight checkbox or hide sidebar for mobile users
	if ($(window).width() > 768) {
		$('#pois' + uri.search(true).tab + ' input[data-key=' + poi + ']').parent().parent().parent().effect("highlight", {}, 3000);
	}
	else sidebar.close();
    setting_changed();
}
else {
	map.setView([50.840, 0.468], 16);
	sidebar.open('home');
}
map.setMaxBounds([[50.82,0.3], [50.88,0.525]]);

var query = '';
function show_overpass_layer() {
    if (query == '' || query == '();out center;') {
		console.log('There is nothing selected to filter by.');
		return;
    }
    var opl = new L.OverPassLayer({
		query: query,
		callback: callback,
		minzoom: 15
    });
    iconLayer.addLayer(opl);
}

function get_permalink() {
    var uri = URI(window.location.href);
    var selectedPois = [];
	var acttab = $('.sidebar-pane.active').attr('id');
    $('#pois' + acttab + ' input:checked').each(function(i, element) {
		selectedPois.push(element.dataset.key);
    });
    uri.query({'tab': acttab, 'pois': selectedPois});
    return uri.href();
}

function update_permalink() {
    var link = get_permalink();
    $('#permalink').attr('href', link);
}
