// personal api keys
var mapboxkey = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbG10dnA3NzY3OTZ0dmtwejN2ZnUycjYifQ.1W5oTOnWXQ9R1w8u3Oo1yA';
var thuforkey = '4fc2613fe5d34ca697a03ea1dc8f0b2b';
// email for overpass .fr endpoint
var email = 'info@bexhill-osm.org.uk';
// map bounds
var mapleft = '0.3000', maptop = '50.8200', mapright = '0.5350', mapbottom = '50.8800';
// map centre
var maplat = '50.8424', maplng = '0.4676', mapzoom = '15';
// map base layer
var activeTileLayer = 'osmstd';
// tab to open
var actTab = 'home';
// leaflet icon image path
L.Icon.Default.imagePath = 'assets/img/leaflet/';

// swipe away sidebar on larger touch devices
$(function() {
	$('.sidebar-content').on('swipeleft', function() {
		if ($(window).width() >= 768 && (L.Browser.touch)) sidebar.close();
	});
});

// smooth scrolling to poi anchor
$(document).on('click', 'a[href*="#goto"]', function(e) {
	if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
		var target = $(this.hash);
		target = target.length ? target : $('[id=' + this.hash.slice(1) + ']');
		if (target.length) {
			$('.sidebar-body').animate({ scrollTop: target.offset().top - 55 }, 1000);
			e.preventDefault();
		}
	}
});

$('.sidebar-tabs').click(function() {
	// clear checkboxes if moving to another poi tab
	if (actTab !== $('.sidebar-pane.active').attr('id')) {
		actTab = $('.sidebar-pane.active').attr('id');
		if (actTab === 'shops' || actTab === 'amenities' || actTab === 'services' || actTab === 'leisure') clear_map();
	}
	if (actTab === 'home') setTimeout(function() { $('map').imageMapResize(); }, 500);
});

// don't escape HTML string in Mustache
Mustache.escape = function(text) { return text; };

// https://github.com/davidjbradshaw/image-map-resizer
$(document).ready(function() {
	// add small delay after load for sidebar to animate open
	setTimeout(function() {	$('map').imageMapResize(); }, 500);
});

// https://github.com/aratcliffe/Leaflet.contextmenu
var map = new L.map('map', {
	contextmenu: true,
	contextmenuWidth: 120,
	contextmenuItems: [{
		text: '<i class="fa fa-search"></i>&nbsp; Lookup',
		callback: reverseLookup,
		index: 0
	}, '-', {
		text: '<i class="fa fa-map-marker"></i>&nbsp; Start walk',
		callback: walkStart
	}, {
		text: '<i class="fa fa-map-marker"></i>&nbsp; End walk',
		callback: walkFinish
	}, '-', {
		text: '<i class="fa fa-external-link"></i>&nbsp; Improve map',
		callback: improveMap
	}]
});
var query = '';
var geoMarker;
var rLookup = false;
function reverseLookup(e) {
	var geocoder = L.Control.Geocoder.nominatim();
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function(results) {
		geoMarker = results[0];
		if (geoMarker) {
			rLookup = true;
			var bbox = geoMarker.properties.boundingbox;
			query = 'way(' + geoMarker.properties.osm_id + ')(' + bbox[0] + ',' + bbox[2] + ',' + bbox[1] + ',' + bbox[3] + ');out center;';
			show_overpass_layer();
		}
	});
}
function walkStart(e) {
	if ($(window).width() >= 768) sidebar.open('walking');
	routingControl.spliceWaypoints(0, 1, e.latlng);
}
function walkFinish(e) {
	if ($(window).width() >= 768) sidebar.open('walking');
	routingControl.spliceWaypoints(routingControl.getWaypoints().length - 1, 1, e.latlng);
}
function improveMap(e) {
	window.open('http://www.openstreetmap.org/note/new#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng, '_blank');
}

// https://github.com/Leaflet/Leaflet
var iconLayer = new L.LayerGroup();
map.addLayer(iconLayer);
var tileLayerData = {
	osmstd: {
		name: 'OpenStreetMap (standard)',
		url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		zoom: '19'
	},
	osmfr: {
		name: 'OpenStreetMap (france)',
		url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
		attribution: '<a href="http://openstreetmap.fr/" target="_blank">OSM France</a>',
		zoom: '19'
	},
	cycle: {
		name: 'OpenCycleMap',
		url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + thuforkey,
		attribution: '<a href="http://thunderforest.com/maps/opencyclemap/" target="_blank">ThunderForest</a>',
		zoom: '20'
	},
	trnsprt: {
		name: 'Public Transport',
		url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + thuforkey,
		attribution: '<a href="http://thunderforest.com/maps/transport/" target="_blank">ThunderForest</a>',
		zoom: '20'
	},
	matlas: {
		name: 'Mobile Atlas',
		url: 'https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=' + thuforkey,
		attribution: '<a href="http://thunderforest.com/maps/mobile-atlas/" target="_blank">ThunderForest</a>',
		zoom: '20'
	},
	opnsrfr: {
		name: 'OpenMapSurfer',
		url: 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
		attribution: '<a href="http://giscience.uni-hd.de/" target="_blank">GIScience Heidelberg</a>',
		zoom: '19'
	},
	antique: {
		name: 'Antique Style',
		url: 'https://{s}.tiles.mapbox.com/v4/lrqdo.me2bng9n/{z}/{x}/{y}.png?access_token=' + mapboxkey,
		attribution: '<a href="https://laruchequiditoui.fr/" target="_blank">LRQDO</a>',
		zoom: '20'
	},
	mbxstr: {
		name: 'Mapbox Streets',
		url: 'https://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + mapboxkey,
		attribution: '<a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: '20'
	},
	mbxoutdr: {
		name: 'Mapbox Outdoors',
		url: 'https://{s}.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + mapboxkey,
		attribution: '<a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: '20'
	}
};
var attribution = '&copy; <a href="http://openstreetmap.org/copyright" title="Copyright and License" target="_blank">OpenStreetMap contributors</a>';
var tileLayers = {};
var tileList = {name:[], keyname:[]};
for (var tile in tileLayerData) {
	var tileAttribution;
	var tilemaxZoom = tileLayerData[tile].zoom;
	var subdomains = tileLayerData[tile].subdomains ? tileLayerData[tile].subdomains : 'abc';
	if (tileLayerData[tile].attribution) tileAttribution = tileLayerData[tile].attribution + ' | ' + attribution;
	else tileAttribution = attribution;
	tileLayers[tileLayerData[tile].name] = L.tileLayer(
		tileLayerData[tile].url,
		{maxNativeZoom: tilemaxZoom, maxZoom: 20, attribution: tileAttribution, subdomains: subdomains}
	);
	// create object array for getting map base layer name
	tileList.name.push(tileLayerData[tile].name);
	tileList.keyname.push(tile);
}
L.control.layers(tileLayers).addTo(map);
L.control.scale({metric:false, position:'bottomright'}).addTo(map);

// get basemap layer name on change
map.on('baselayerchange', function(e) {
  for (var x = 0; x < tileList.name.length; x++) {
	if (e.name == tileList.name[x]) activeTileLayer = tileList.keyname[x];
  }
});

// allow reverselookup only on high zoom level
map.on('zoomend', function() {
	if (map.getZoom() >= 18) map.contextmenu.setDisabled(0, false);
	else map.contextmenu.setDisabled(0, true);
});

// allow middle-mouse button reverselookup
map.on('mouseup', function(e) {
	if (e.originalEvent.button === 1 && map.getZoom() >= 18) reverseLookup(e);
});

// https://github.com/domoritz/leaflet-locatecontrol
L.control.locate({
	icon: 'fa fa-location-arrow',
	setView: true,
	keepCurrentZoomLevel: true,
	showPopup: false,
	strings: {
		title: 'Locate me',
		popup: 'You are within {distance} {unit} from this point',
		outsideMapBoundsMsg: 'You appear to be located outside Bexhill.  Come visit!'
	},
	onLocationError: function() {
		alert('Sorry, there was an error while trying to locate you.');
	}
}).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: mapleft + ',' + maptop + ',' + mapright + ',' + mapbottom
		}
	}),
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft'
})
.on('markgeocode', function(e) {
	rLookup = true;
	geoMarker = e.geocode;
	var osm_id = geoMarker.properties.osm_id;
	if (geoMarker.properties.osm_type === 'node') query = 'node' + '(' + osm_id + ');' + 'out center;';
	if (geoMarker.properties.osm_type === 'way') query = 'way' + '(' + osm_id + ');' + 'out center;';
	show_overpass_layer();
	map.panTo(geoMarker.center);
})
.addTo(map);
$('.leaflet-control-geocoder-icon').attr('title','Find address');

// https://github.com/cliffcloud/Leaflet.EasyButton
// permalink button
L.easyButton({
	id:'btnpermalink',
	states:[{
		icon:'fa fa-link',
		title:'Get map link',
		onClick:function() {
			var uri = URI(window.location.href);
			var selectedPois = [];
			var opennow;
			if ($('input.opennow').is(':checked')) opennow = 1;
			$('#pois' + actTab + ' input.poi-checkbox:checked').each(function(i, element) { selectedPois.push(element.dataset.key);	});
			// M = basemap, T = tab, O = opennow, P = pois
			uri.query({ 'M': activeTileLayer, 'T': actTab, 'O': opennow, 'P': selectedPois });
			window.prompt('Copy permanent map link:', uri.href());
		}
	}]
}).addTo(map);
// clear map button
L.easyButton({
	id:'btnclearmap',
	states:[{
		icon:'fa fa-trash',
		title:'Clear map',
		onClick:function() {
			routingControl.setWaypoints([]);
			$('#accordion').accordion({active: false});
			clear_map();
		}
	}]
}).addTo(map);
// full reload on right click
$('#btnclearmap').bind('contextmenu',function() {
	$(location).attr('href', window.location.pathname);
	return false;
});

// https://github.com/Turbo87/sidebar-v2/
var sidebar = $('#sidebar').sidebar();

// https://github.com/mlevans/leaflet-hash
new L.Hash(map);

// https://github.com/ebrelsford/Leaflet.loading
var loadingControl = L.Control.loading({separate: true});
map.addControl(loadingControl);

// https://github.com/perliedman/leaflet-routing-machine
var routingControl = L.Routing.control({
	units: 'imperial',
	collapsible: false,
	fitSelectedRoutes: 'smart',
	reverseWaypoints: true,
	router: new L.Routing.mapbox(mapboxkey, {
		profile: 'mapbox.walking',
		alternatives: false
	}),
	lineOptions: {
		styles: [{color: 'blue', opacity: 0.4, weight: 5}]
	},
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: mapleft + ',' + maptop + ',' + mapright + ',' + mapbottom
		}
	})
});
var routeBlock = routingControl.onAdd(map);	
document.getElementById('routingControl').appendChild(routeBlock);
$('#accordion').accordion({
	heightStyle: 'content',
	collapsible: true,
	active: false
});

// https://github.com/pawelczak/EasyAutocomplete
var poitags = [];
var category = [];
var i = 0;
// get all tags
for (var poi in pois) {
	poitags += '"' + pois[poi].tabName + '~' + poi + '": ' + JSON.stringify(pois[poi].tagKeyword) + ', ';
	category[i] = {listLocation: pois[poi].tabName + '~' + poi, header: pois[poi].tabName + ' - ' + pois[poi].name};
	i++;
}
// clean up and covert to array
poitags = poitags.substring(0, poitags.length - 2);
poitags = JSON.parse('{ ' + poitags + '}');
// options for autocomplete
var options = {
	data: poitags,
	minCharNumber: 3,
	list: {
		maxNumberOfElements: 10,
		onChooseEvent: function() {
			// Find selected items category, split it to get checkbox, then display
			var z = ($('#autocomplete').getSelectedItemIndex());
			var catsplit = (document.getElementsByClassName('eac-category')[z].innerText);
			catsplit = catsplit.split(' - ');
			actTab = catsplit[0];
			sidebar.open(actTab);
			$('#pois' + actTab + ' input[id="' + catsplit[1] + '"]').prop('checked', true);
			// Highlight checkbox or hide sidebar for mobile users
			if ($(window).width() >= 768) {
				$('#pois' + actTab + ' input[id="' + catsplit[1] + '"]').parent().parent().parent().effect("highlight", {}, 3000);
			}
			else sidebar.close();
			setting_changed();
			$('#autocomplete').val('');
	},
	match: {
		enabled: true
		}
	},
	categories: [
		category[0]
	]
};
// push categories into options array
for (var x = 1; x < category.length; x++) { options.categories.push(category[x]); }
$('#autocomplete').easyAutocomplete(options);
$('div.easy-autocomplete').removeAttr('style');

// https://github.com/kartenkarsten/leaflet-layer-overpass
var spinner = 0;
function callback(data) {
	if (spinner > 0) spinner -= 1;
	if (spinner === 0) $('#spinner').hide();
	for(i=0; i < data.elements.length; i++) {
		e = data.elements[i];
		if (e.id in this.instance._ids) return;
		this.instance._ids[e.id] = true;
		var pos = (e.type == 'node') ? new L.LatLng(e.lat, e.lon) : new L.LatLng(e.center.lat, e.center.lon);
		var type = '';
		if (e.tags.amenity) {
			if (type === '') type = e.tags.amenity;
			// Group similar pois
			if (type === 'arts_centre') type = 'attraction';
			if (type === 'nightclub') type = 'bar';
			if (type === 'college') type = 'school';
			if (type === 'retirement_home') type = 'social_facility';
			if (type === 'post_office') type = 'post_box';
			// Hide non-public parking
			if (type == 'parking') {
				if (e.tags.access === 'private') type = '';
				if (e.tags.access === 'permissive') type = '';
			}
			if (type === 'animal_boarding') type = 'animal_shelter';
		}
		if (e.tags.man_made) {
			if (type === '') type = e.tags.man_made;
		}
		if (e.tags.tourism) {
			if (type === '') type = e.tags.tourism;
		}
		if (e.tags.historic) {
			if (type === '') type = 'historic';
			if (type === 'manor') type = 'attraction';
		}
		if (e.tags.shop) {
			if (type === '') type = e.tags.shop;
			// Group similar pois
			if (type === 'deli') type = 'butcher';
			if (type === 'e-cigarette') type = 'tobacco';
			if (type === 'hardware') type = 'doityourself';
			if (type === 'boutique') type = 'clothes';
			if (type === 'window_blind') type = 'curtain';
			if (type === 'laundry') type = 'dry_cleaning';
			if (type === 'garden_centre') type = 'florist';
			if (type === 'tyres') type = 'car_repair';
			if (type === 'hearing_aids') type = 'mobility';
			if (type === 'interior_decoration') type = 'houseware';
			if (type === 'bathroom_furnishing') type = 'houseware';
			if (type === 'kitchen') type = 'houseware';
		}
		if (e.tags.landuse) {
			if (type === '') type = e.tags.landuse;
			// Hide non-public grounds
			if (type === 'recreation_ground') {
				if (e.tags.access == 'private') type = '';
			}
		}
		if (e.tags.leisure) {
			if (type === '') type = e.tags.leisure;
			if (type === 'common') type = 'park';
			if (type === 'swimming_pool') {
				if (e.tags.access == 'private') type = '';
			}
		}
		if (e.tags.emergency) {
			if (type === '') type = e.tags.emergency;
		}
		if (e.tags.office) {
			if (type === '') type = e.tags.office;
			if (type === 'financial') type = 'accountant';
		}
		if (e.tags.healthcare) {
			if (type === '') type = 'healthcare';
		}
		if (e.tags.listed_status) {
			if (type === '') type = 'listed_status';
			if (type === 'shelter') type = 'listed_status';
			if (type === 'company') type = 'listed_status';
		}
		var iconName = '000blank';
		var poi = pois[type];
		if (poi) iconName = poi.iconName;
		var markerIcon  = L.icon({
			iconUrl: 'assets/img/icons/' + iconName + '.png',
			iconSize: [32, 37],
			iconAnchor: [18.5, 35],
			shadowUrl: 'assets/img/icons/000shadow.png',
			shadowAnchor: [17, 27],
			popupAnchor: [0, -27]
		});
		var marker = L.marker(pos, {
			icon: markerIcon,
			keyboard: false,
			riseOnHover: true
		});
		// set width of popup on screensize
		var customOptions = { maxWidth: 250 };
		if ($(window).width() > 500) customOptions = { maxWidth: 350 };
		// check if already defined poi
		if (poi) {
			// show a tooltip on mouse hover
			if (e.tags.name) marker.bindTooltip(e.tags.name, {direction: 'left', offset: [-15, -2]}).openTooltip();
			// show pop-up
			var markerPopup = generic_poi_parser(e, poi.name);
			if (poi.tagParser) markerPopup = poi.tagParser(e, poi.name);
			marker.bindPopup(markerPopup, customOptions);
			// check if coming from reverselookup
			if (rLookup) {
				marker.addTo(this.instance).openPopup();
				rLookup = false;
			}
			else {
				// display only open facilities on opennow checkbox
				if ($('input.opennow').is(':checked')) {
					if (state) marker.addTo(this.instance);
				}
				else marker.addTo(this.instance);
			}
		}
		// use geomarker
		else if (rLookup) {
			marker.bindPopup(geoMarker.html, customOptions);
			marker.addTo(this.instance).openPopup();
			rLookup = false;
		}
	}
}

// clear layers
function clear_map() {
	$('input.poi-checkbox').prop('checked', false);
	setting_changed();
	spinner = 0;
	$('#spinner').hide();
}

function setting_changed(newcheckbox) {
	// limit number of selections
	if ($('input.poi-checkbox:checked').length <= 3) {
		// remove pois from current map
		iconLayer.clearLayers();
		if ($('input.poi-checkbox:checked').length > 0) {
			//build overpass query
			query = '(';
			$('#pois' + actTab + ' input.poi-checkbox:checked').each(function(i, element) {
				query += 'node' + pois[element.dataset.key].query + '(BBOX);';
				query += 'way' + pois[element.dataset.key].query + '(BBOX);';
			});
			query += ');out center;';
			show_overpass_layer();
		}
		else {
			spinner = 0;
			$('#spinner').hide();
		}
	}
	else $('[data-key=' + newcheckbox + ']').prop('checked', false);
}

function show_pois_checkboxes(tabName) {
	// build the content for the sidebar pane
	var i = 0;
	var content = '<div class="anchor"><a id="gototop' + tabName + '" href="#gotobot' + tabName + '">| <span class="fa fa-arrow-down"></span> |</a></div>';
	content += '<table style="width:100%">';
	for (var poi in pois) {
		if (pois[poi].tabName == tabName) {
			if (i % 2 === 0) content += '<tr>';
			content += '<td style="overflow:hidden; white-space:nowrap">';
			var checkbox = Mustache.render(
				'<div class="poi-checkbox"> \
					<label title="{{name}}"> \
						<img style="width:28px" src="assets/img/icons/{{icon}}.png"></img> \
						<input type="checkbox" class="poi-checkbox" id="{{name}}" data-key="{{key}}" onclick="setting_changed(&#39;{{key}}&#39;)"><span>{{name}}</span> \
					</label> \
				</div>',
				{key: poi, name: pois[poi].name, icon: pois[poi].iconName, tabname: pois[poi].tabName}
			);
			content += checkbox;
			content += '</td>';
			i++;
			if (i % 2 === 0) content += '</tr>';
		}
	}
	content += '</table>';
	content += '<div class="anchor"><a id="gotobot' + tabName + '" href="#gototop' + tabName + '">| <span class="fa fa-arrow-up"></span> |</a></div>';
	$('#pois' + tabName).append(content);
}
show_pois_checkboxes('shops');
show_pois_checkboxes('amenities');
show_pois_checkboxes('services');
show_pois_checkboxes('leisure');
show_pois_checkboxes('tourism');

// suggested walk waypoints
function suggwalk(walkname) {
	if (walkname == 'tmt') {
		routingControl.setWaypoints([
			L.latLng(50.84055, 0.49145),
			L.latLng(50.83729, 0.47612),
			L.latLng(50.83647, 0.46641),
			L.latLng(50.83730, 0.46616)
		]);
	}
	else if (walkname == '1066') {
		routingControl.setWaypoints([
			L.latLng(50.84522, 0.48044),
			L.latLng(50.84972, 0.48419),
			L.latLng(50.87800, 0.50009)
		]);
	}
	else if (walkname == 'bc1') {
		routingControl.setWaypoints([
			L.latLng(50.84125, 0.47717),
			L.latLng(50.84515, 0.47961),
			L.latLng(50.86230, 0.51823),
			L.latLng(50.84808, 0.52014),
			L.latLng(50.84056, 0.49142),
			L.latLng(50.83792, 0.47660),
			L.latLng(50.84093, 0.47718)
		]);
	}
	else if (walkname == 'wwh') {
		routingControl.setWaypoints([
			L.latLng(50.83567, 0.45892),
			L.latLng(50.83701, 0.47363)
		]);
	}
}
function walkinfo() {
	sidebar.open('leisure');
	$('#poisleisure input[id="Information"]').prop('checked', true);
	setting_changed();
	sidebar.open('walking');
}

// https://github.com/medialize/URI.js
var uri = URI(window.location.href);
if (uri.hasQuery('M')) activeTileLayer = uri.search(true).M;
if (uri.hasQuery('O')) $('input.opennow').prop('checked', uri.search(true).O);
if (uri.hasQuery('P')) {
	var selectedPois = uri.search(true).P;
	if (!$.isArray(selectedPois)) {
		// the last poi has a '/' on it because leaflet-hash
		poi = selectedPois.replace('/', '');
		$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').prop('checked', true);
	}
	else {
		for (i = 0; i < selectedPois.length; i++) {
			// the last poi has a '/' on it because leaflet-hash
			poi = selectedPois[i].replace('/', '');
			$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').prop('checked', true);
		}
	}
	actTab = uri.search(true).T;
	// highlight checkbox or hide sidebar for mobile users
	if ($(window).width() >= 768) {
		$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').parent().parent().parent().effect('highlight', {}, 3000);
		sidebar.open(actTab);
	}
	setting_changed();
}
else {
	// if not returning from a  permalink, give defaults
	if (window.location.hash.indexOf('/') !== 3) map.setView([maplat, maplng], mapzoom);
	if (uri.hasQuery('T')) actTab = uri.search(true).T;
	if ($(window).width() >= 768) sidebar.open(actTab);
}
tileLayers[tileLayerData[activeTileLayer].name].addTo(map);
map.setMaxBounds([[maptop,mapleft], [mapbottom,mapright]]);
	
function show_overpass_layer() {
	if (query === '' || query === '();out center;') {
		console.log('There is nothing selected to filter by.');
		return;
	}
	var opl = new L.OverPassLayer({
		debug: false,
		minzoom: 15,
		query: query + '&contact=' + email, //contact info only for use with .fr endpoint
		endpoint: 'https://api.openstreetmap.fr/oapi/interpreter/',
		callback: callback,
		minZoomIndicatorOptions: {
			position: 'topright',
			minZoomMessageNoLayer: 'No layer assigned',
			minZoomMessage: 'Zoom in to load data'
		}
	});
	iconLayer.addLayer(opl);
}