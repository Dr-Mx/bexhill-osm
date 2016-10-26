// personal api keys
var mapboxKey = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbG10dnA3NzY3OTZ0dmtwejN2ZnUycjYifQ.1W5oTOnWXQ9R1w8u3Oo1yA';
var thuforKey = '4fc2613fe5d34ca697a03ea1dc8f0b2b';
// overpass layer options
var minOpZoom = 15, email = 'info@bexhill-osm.org.uk';
// map bounds
var mapLeft = 0.3000, mapTop = 50.8200, mapRight = 0.5350, mapBottom = 50.8800;
// map centre
var mapLat = 50.8424, mapLng = 0.4676, mapZoom = 15;
// map base layer
var actTileLayer = 'osmstd';
// tab to open
var actTab = 'home';

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
	// resize links on mini map
	if (actTab === 'home') setTimeout(function() { $('map').imageMapResize(); }, 500);
});

// don't escape HTML string in Mustache
Mustache.escape = function(text) { return text; };

// https://github.com/davidjbradshaw/image-map-resizer
$(document).ready(function() {
	// add small delay after load for sidebar to animate open
	setTimeout(function() {	$('map').imageMapResize(); }, 500);
	// set collapsible accordion for opening hours
	map.on('popupopen', function() {
		// delay required when switching popups immediately
		setTimeout(function() {
			$('#accordOh').accordion({
				heightStyle: 'content',
				collapsible: true,
				active: false,
				animate: 100
			});
		}, 250);
	});
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
		text: '<i class="fa fa-map-marker"></i>&nbsp; Add walk point',
		callback: walkPoint
	}, '-', {
		text: '<i class="fa fa-external-link"></i>&nbsp; Improve map',
		callback: improveMap
	}]
});
var geoMarker, rLookup = false;
function reverseLookup(e) {
	// get location, look up id on nominatim and pass it to overpass
	var geocoder = L.Control.Geocoder.nominatim();
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function(results) {
		geoMarker = results[0];
		if (geoMarker) {
			if (markerId) clear_map();
			rLookup = true;
			show_overpass_layer(geoMarker.properties.osm_type + '(' + geoMarker.properties.osm_id + ');');
		}
	});
}
function walkPoint(e) {
	if ($(window).width() >= 768) sidebar.open('walking');
	// drop a walk marker if one doesn't exist
	var wp = routingControl.getWaypoints();
	for(var i = 0; i < wp.length; i++){
		if(!wp[i].name){
			routingControl.spliceWaypoints(i, 1, e.latlng);
			return;
		}
	}
    routingControl.spliceWaypoints(wp.length, 0, e.latlng);
}
function improveMap(e) {
	// create a note on osm.org
	window.open('http://www.openstreetmap.org/note/new#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng, '_blank');
}

// https://github.com/Leaflet/Leaflet
var iconLayer = new L.LayerGroup();
map.addLayer(iconLayer);
// leaflet icon image path
L.Icon.Default.imagePath = 'assets/img/leaflet/';
var tileLayerData = {
	osmstd: {
		name: 'OpenStreetMap (standard)',
		url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		zoom: 19
	},
	osmfr: {
		name: 'OpenStreetMap (france)',
		url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
		attribution: '<a href="http://openstreetmap.fr/" target="_blank">OSM France</a>',
		zoom: 19
	},
	cycle: {
		name: 'OpenCycleMap',
		url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: '<a href="http://thunderforest.com/maps/opencyclemap/" target="_blank">ThunderForest</a>',
		zoom: 20
	},
	trnsprt: {
		name: 'Public Transport',
		url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: '<a href="http://thunderforest.com/maps/transport/" target="_blank">ThunderForest</a>',
		zoom: 20
	},
	matlas: {
		name: 'Mobile Atlas',
		url: 'https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: '<a href="http://thunderforest.com/maps/mobile-atlas/" target="_blank">ThunderForest</a>',
		zoom: 20
	},
	opnsrfr: {
		name: 'OpenMapSurfer',
		url: 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
		attribution: '<a href="http://giscience.uni-hd.de/" target="_blank">GIScience Heidelberg</a>',
		zoom: 19
	},
	antique: {
		name: 'Antique Style',
		url: 'https://{s}.tiles.mapbox.com/v4/lrqdo.me2bng9n/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: '<a href="https://laruchequiditoui.fr/" target="_blank">LRQDO</a>',
		zoom: 20
	},
	mbxstr: {
		name: 'Mapbox Streets',
		url: 'https://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: '<a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: 20
	},
	mbxoutdr: {
		name: 'Mapbox Outdoors',
		url: 'https://{s}.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: '<a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: 20
	}
};
var attribution = '&copy; <a href="http://openstreetmap.org/copyright" title="Copyright and License" target="_blank">OpenStreetMap contributors</a>';
var tileLayers = {};
var tileList = {name: [], keyname: []};
for (var tile in tileLayerData) {
	var tileAttribution;
	var tilemaxZoom = tileLayerData[tile].zoom;
	var subdomains = tileLayerData[tile].subdomains ? tileLayerData[tile].subdomains : 'abc';
	if (tileLayerData[tile].attribution) tileAttribution = tileLayerData[tile].attribution + ' | ' + attribution;
	else tileAttribution = attribution;
	tileLayers[tileLayerData[tile].name] = L.tileLayer(
		tileLayerData[tile].url, { maxNativeZoom: tilemaxZoom, maxZoom: 20, attribution: tileAttribution, subdomains: subdomains }
	);
	// create object array for all basemap layers
	tileList.name.push(tileLayerData[tile].name);
	tileList.keyname.push(tile);
}
L.control.layers(tileLayers).addTo(map);
L.control.scale({ metric: false, position: 'bottomright' }).addTo(map);

// get basemap layer name on change
map.on('baselayerchange', function(e) {
  for (var x = 0; x < tileList.name.length; x++) {
	if (e.name === tileList.name[x]) actTileLayer = tileList.keyname[x];
  }
});

// reverselookup only on high zoom level
map.on('zoomend', function() {
	if (map.getZoom() >= 18) map.contextmenu.setDisabled(0, false);
	else map.contextmenu.setDisabled(0, true);
});

// middle-mouse button reverselookup
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
			viewbox: mapLeft + ',' + mapTop + ',' + mapRight + ',' + mapBottom,
			extratags: 1,
			email: email
		}
	}),
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft',
	placeholder: 'Type address or place name...'
})
.on('markgeocode', function(e) {
	// pass nominatim address lookup to overpass
	if (markerId) clear_map();
	rLookup = true;
	geoMarker = e.geocode;
	if (map.getZoom() <= minOpZoom) map.setZoom(minOpZoom, { animate: false });
	map.flyTo(geoMarker.center);
	show_overpass_layer(geoMarker.properties.osm_type + '(' + geoMarker.properties.osm_id + ');');
	$(':input','.leaflet-control-geocoder-form').blur();
	$(':input','.leaflet-control-geocoder-form').val('');
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
			var selectedPois = [], walkCoords = [], openNow;
			var walkWayp = routingControl.getWaypoints();
			if (walkWayp[1].latLng !== null) {
				for (var c in walkWayp) {
					walkCoords[c] = Math.round(walkWayp[c].latLng.lat * 100000) / 100000 + '~' + Math.round(walkWayp[c].latLng.lng * 100000) / 100000;
				}
			}
			if ($('input.opennow').is(':checked')) openNow = 1;
			$('#pois' + actTab + ' input.poi-checkbox:checked').each(function(i, element) { selectedPois.push(element.dataset.key);	});
			// M = basemap, T = tab, O = opennow, P = grouped pois, I = single poi, W = walkpoints
			uri.query({ 'M': actTileLayer, 'T': actTab, 'O': openNow, 'P': selectedPois, 'I': markerId, 'W': walkCoords });
			window.prompt('Copy this link to share current map:', uri.href());
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
			// clear walk points, roll up suggested walks, clear poi marker layers
			routingControl.setWaypoints([]);
			$('#accordWk').accordion({ active: false });
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
var loadingControl = L.Control.loading({ separate: true });
map.addControl(loadingControl);

// https://github.com/perliedman/leaflet-routing-machine
var routingControl = L.Routing.control({
	units: 'imperial',
	collapsible: false,
	fitSelectedRoutes: false,
	reverseWaypoints: true,
	routeWhileDragging: true,
	router: new L.Routing.mapbox(mapboxKey, {
		profile: 'mapbox.walking',
		alternatives: false
	}),
	lineOptions: {
		styles: [{ color: 'darkgreen', opacity: 0.6, weight: 5 }]
	},
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: mapLeft + ',' + mapTop + ',' + mapRight + ',' + mapBottom
		}
	})
});
var routeBlock = routingControl.onAdd(map);	
document.getElementById('routingControl').appendChild(routeBlock);
// collapsible suggested walks
$('#accordWk').accordion({
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
	category[i] = { listLocation: pois[poi].tabName + '~' + poi, header: pois[poi].tabName + ' - ' + pois[poi].name };
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
				$('#pois' + actTab + ' input[id="' + catsplit[1] + '"]').parent().parent().parent().effect('highlight', {}, 3000);
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
var spinner = 0, markerId;
function callback(data) {
	// set marker popup dimensions on screensize
	var type, markerPopup, customOptions = ($(window).width() > 500) ? { maxWidth: 350, minWidth: 205 } : { maxWidth: 250, minWidth: 205, autoPanPaddingTopLeft: 30, className: 'popup-mobile' };
	if (spinner > 0) spinner -= 1;
	if (spinner === 0) $('#spinner').hide();
	for(i = 0; i < data.elements.length; i++) {
		var e = data.elements[i];
		if (e.id in this.instance._ids) continue;
		this.instance._ids[e.id] = true;
		var pos = (e.type === 'node') ? new L.LatLng(e.lat, e.lon) : new L.LatLng(e.center.lat, e.center.lon);
		type = undefined;
		if (e.tags.amenity) {
			if (!type) type = e.tags.amenity;
			// Group similar pois
			if (type === 'arts_centre') type = 'attraction';
			if (type === 'nightclub') type = 'bar';
			if (type === 'college') type = 'school';
			if (type === 'school' && e.tags.name === undefined) type = undefined;
			if (type === 'retirement_home') type = 'social_facility';
			if (type === 'post_office') type = 'post_box';
			// Hide non-public parking
			if (type === 'parking') {
				if (e.tags.access === 'private' || e.tags.access === 'permissive') type = undefined;
			}
			if (type === 'animal_boarding') type = 'animal_shelter';
		}
		if (e.tags.tourism) {
			if (!type) type = e.tags.tourism;
		}
		if (e.tags.historic) {
			if (!type) type = 'historic';
			if (type === 'manor') type = 'attraction';
		}
		if (e.tags.man_made) {
			if (!type) type = e.tags.man_made;
		}
		if (e.tags.shop) {
			if (!type) type = e.tags.shop;
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
			if (type === 'interior_decoration' || type === 'bathroom_furnishing' || type === 'kitchen') type = 'houseware';
		}
		if (e.tags.landuse) {
			if (!type) type = e.tags.landuse;
			// Hide non-public grounds
			if (type === 'recreation_ground') {
				if (e.tags.access === 'private') type = undefined;
			}
		}
		if (e.tags.leisure) {
			if (!type) type = e.tags.leisure;
			if (type === 'common') type = 'park';
			if (type === 'swimming_pool') {
				if (e.tags.access === 'private') type = undefined;
			}
		}
		if (e.tags.emergency) {
			if (!type) type = e.tags.emergency;
		}
		if (e.tags.office) {
			if (!type) type = e.tags.office;
			if (type === 'financial') type = 'accountant';
		}
		if (e.tags.healthcare) {
			if (!type) type = 'healthcare';
		}
		if (e.tags.listed_status) {
			if (!type || type === 'shelter' || type === 'company') type = 'listed_status';
		}
		var poi = pois[type];
		var iconName = poi ? poi.iconName : '000blank';
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
		// show a tooltip on mouse hover
		if (e.tags.name) marker.bindTooltip(e.tags.name, { direction: 'left', offset: [-15, -2] }).openTooltip();
		// check if already defined poi
		if (poi) {
			// create pop-up
			markerPopup = poi.tagParser ? poi.tagParser(e, poi.name) : generic_poi_parser(e, poi.name);
			// set width of popup on screensize
			// show pop-up
			marker.bindPopup(markerPopup, customOptions);
			// check if coming from reverselookup
			if (rLookup) {
				marker.addTo(this.instance).openPopup();
				markerId = e.type + '~' + e.id;
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
		else if (rLookup) {
			// use generic marker
			var name = e.tags.name ? e.tags.name : e.tags.building;
			if (!name || name === 'yes') name = '&hellip;';
			markerPopup = generic_poi_parser(e, name);
			marker.bindPopup(markerPopup, customOptions);
			marker.addTo(this.instance).openPopup();
			markerId = e.type + '~' + e.id;
			rLookup = false;
		}
	}
}

// clear poi marker layers
function clear_map() {
	$('input.poi-checkbox').prop('checked', false);
	setting_changed();
	spinner = 0;
	$('#spinner').hide();
}

function setting_changed(newcheckbox) {
	// limit number of selections
	if ($('input.poi-checkbox:checked').length <= 3) {
		// remove poi markers
		iconLayer.clearLayers();
		markerId = undefined;
		if ($('input.poi-checkbox:checked').length > 0) {
			//build overpass query
			var query = '(';
			$('#pois' + actTab + ' input.poi-checkbox:checked').each(function(i, element) {
				query += 'node' + pois[element.dataset.key].query + '(BBOX);';
				query += 'way' + pois[element.dataset.key].query + '(BBOX);';
			});
			query += ');';
			show_overpass_layer(query);
		}
		else {
			spinner = 0;
			$('#spinner').hide();
		}
	}
	else $('[data-key=' + newcheckbox + ']').prop('checked', false);
}

// build content for sidebar pois
function show_pois_checkboxes(tabName) {
	var i = 0;
	var content = '<div class="anchor"><a id="gototop' + tabName + '" href="#gotobot' + tabName + '">| <i class="fa fa-arrow-down"></i> |</a></div>';
	content += '<table style="width:100%;">';
	for (var poi in pois) {
		if (pois[poi].tabName === tabName) {
			if (i % 2 === 0) content += '<tr>';
			content += '<td style="overflow:hidden; white-space:nowrap;">';
			var checkbox = Mustache.render(
				'<div class="poi-checkbox"> \
					<label title="{{name}}"> \
						<img style="width:28px;" src="assets/img/icons/{{icon}}.png"></img> \
						<input type="checkbox" class="poi-checkbox" id="{{name}}" data-key="{{key}}" onclick="setting_changed(&#39;{{key}}&#39;)"><span>{{name}}</span> \
					</label> \
				</div>',
				{ key: poi, name: pois[poi].name, icon: pois[poi].iconName, tabname: pois[poi].tabName }
			);
			content += checkbox;
			content += '</td>';
			i++;
			if (i % 2 === 0) content += '</tr>';
		}
	}
	content += '</table>';
	content += '<div class="anchor"><a id="gotobot' + tabName + '" href="#gototop' + tabName + '">| <i class="fa fa-arrow-up"></i> |</a></div>';
	$('#pois' + tabName).append(content);
}
show_pois_checkboxes('shops');
show_pois_checkboxes('amenities');
show_pois_checkboxes('services');
show_pois_checkboxes('leisure');
show_pois_checkboxes('tourism');

// suggested walk waypoints
function suggwalk(walkname) {
	clear_map();
	if (walkname === 'tmt') {
		routingControl.setWaypoints([
			[50.84059, 0.49121],
			[50.83729, 0.47612],
			[50.83647, 0.46637],
			[50.83732, 0.46639]
		]);
		// show related information boards
		show_overpass_layer('(node["ref"~"^TMT"](BBOX));');
		map.flyTo([50.8385, 0.4787], 16);
	}
	else if (walkname === '1066') {
		routingControl.setWaypoints([
			[50.84522, 0.48044],
			[50.84972, 0.48419],
			[50.87800, 0.50009]
		]);
		map.flyTo([50.8551, 0.4527], 14);
	}
	else if (walkname === 'bc1') {
		routingControl.setWaypoints([
			[50.84125, 0.47717],
			[50.84515, 0.47961],
			[50.86230, 0.51823],
			[50.84808, 0.52014],
			[50.84056, 0.49142],
			[50.83792, 0.47660],
			[50.84093, 0.47718]
		]);
		map.flyTo([50.8526, 0.4526], 14);
	}
	else if (walkname === 'wwh') {
		routingControl.setWaypoints([
			[50.83567, 0.45892],
			[50.83701, 0.47363]
		]);
		map.flyTo([50.8364, 0.4664], 16);
	}
}

// https://github.com/medialize/URI.js
var uri = URI(window.location.href);
if (uri.hasQuery('M')) actTileLayer = uri.search(true).M;
if (uri.hasQuery('T')) actTab = uri.search(true).T;
if (uri.hasQuery('O')) $('input.opennow').prop('checked', uri.search(true).O);
if (uri.hasQuery('W')) {
	var walkCoords = uri.search(true).W;
	for (i = 0; i < walkCoords.length; i++) {
		walkCoords[i] = walkCoords[i].replace('~', ', ');
		routingControl.spliceWaypoints(i, 1, JSON.parse('[' + walkCoords[i] + ']'));
	}
}
if (uri.hasQuery('P')) {
	var poi = uri.search(true).P;
	if (!$.isArray(poi)) {
		$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').prop('checked', true);
	}
	else {
		for (i = 0; i < poi.length; i++) {
			$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').prop('checked', true);
		}
	}
	// highlight checkbox or hide sidebar for mobile users
	if ($(window).width() >= 768) {
		sidebar.open(actTab);
		$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').parent().parent().parent().effect('highlight', {}, 3000);
	}
	setting_changed();
}
if (uri.hasQuery('I')) {
	rLookup = true;
	markerId = uri.search(true).I;
	var splitId = markerId.split('~');
	show_overpass_layer(splitId[0] + '(' + splitId[1] + ');');
}
// if not returning from a permalink, give defaults
if (!uri.hasQuery('W') || !uri.hasQuery('P') || !uri.hasQuery('I')) {
	if (window.location.hash.indexOf('/') !== 3) map.setView([mapLat, mapLng], mapZoom);
	if ($(window).width() >= 768) sidebar.open(actTab);
}
tileLayers[tileLayerData[actTileLayer].name].addTo(map);
map.setMaxBounds([[mapTop, mapLeft], [mapBottom, mapRight]]);
	
function show_overpass_layer(query) {
	if (!query || query === '();') {
		console.log('There is nothing selected to filter by.');
		return;
	}
	var opl = new L.OverPassLayer({
		debug: false,
		minzoom: minOpZoom,
		query: query + 'out center;&contact=' + email, //contact info only for use with .fr endpoint
		endpoint: 'https://api.openstreetmap.fr/oapi/interpreter/',
		callback: callback,
		minZoomIndicatorOptions: {
			position: 'topright',
			minZoomMessage: 'Zoom in to load data'
		}
	});
	iconLayer.addLayer(opl);
}