// START SET DEFAULTS
	// personal api keys
	var mapboxkey = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbG10dnA3NzY3OTZ0dmtwejN2ZnUycjYifQ.1W5oTOnWXQ9R1w8u3Oo1yA';
	var thuforkey = '4fc2613fe5d34ca697a03ea1dc8f0b2b';
	// map bounds
	var mapleft = '0.3000';
	var maptop = '50.8200';
	var mapright = '0.5350';
	var mapbottom = '50.8800';
	// map centre
	var maplat = '50.8430';
	var maplng = '0.4600';
	var mapzoom = '15';
	// map base layer
	var activeTileLayer = 'osmstd';
	// email for overpass .fr endpoint
	var email = 'info@bexhill-osm.org.uk'
	// leaflet icon image path
	L.Icon.Default.imagePath = 'assets/img/leaflet';
// END SET DEFAULTS

// swipe away sidebar
$(function(){
	$(".sidebar-content").on("swipeleft",function(event){
		if ($(window).width() >= 768) sidebar.close();
	});
});

// smooth scrolling to poi anchor
$(document).on('click', 'a[href*="#goto"]', function(e) {
    if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[id=' + this.hash.slice(1) +']');
        if (target.length) {
			console.log(target.offset().top);
            $('.sidebar-body').animate({
                scrollTop: target.offset().top - 50
            }, 1000);
            e.preventDefault();
        }
    }
});

// clear checkboxes if moving to another poi tab
$('.sidebar-tabs').click(function() {
	var acctab = $('.sidebar-pane.active').attr('id');
	if (acctab == 'shops' || acctab == 'amenities' || acctab == 'services' || acctab == 'leisure') clear_map();
	if (acctab == 'home') $('map').imageMapResize();
});

// don't scape HTML string in Mustache
Mustache.escape = function (text) { return text; }

// https://github.com/davidjbradshaw/image-map-resizer
$(document).ready(function() {
	// add small delay after load for sidebar to animate open
	setTimeout(function() {
		$('map').imageMapResize();
    }, 500);
});

// https://github.com/aratcliffe/Leaflet.contextmenu
var map = new L.map('map', {
	contextmenu: true,
	contextmenuWidth: 140,
	contextmenuItems: [{
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
function walkStart (e) {
	if ($(window).width() >= 768) sidebar.open('walking');
	routingControl.spliceWaypoints(0, 1, e.latlng);
}
function walkFinish (e) {
	if ($(window).width() >= 768) sidebar.open('walking');
	routingControl.spliceWaypoints(routingControl.getWaypoints().length - 1, 1, e.latlng);
}
function improveMap (e) {
	window.open("http://www.openstreetmap.org/note/new#map=" + map.getZoom() + "/" + e.latlng.lat + "/" + e.latlng.lng, "_blank")
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
		name: 'Transport Dark',
		url: 'https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=' + thuforkey,
		attribution: '<a href="http://thunderforest.com/maps/transport-dark/" target="_blank">ThunderForest</a>',
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
    },
    mbxsat: {
		name: 'MapBox Satellite',
		url: 'https://{s}.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=' + mapboxkey,
		attribution: '<a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: '19'
    }
};
var attribution = '&copy; <a href="http://openstreetmap.org/copyright" title="Copyright and License" target="_blank">OpenStreetMap contributors</a>';
var tileLayers = {};
var tileList = {name:[], keyname:[]};
for (tile in tileLayerData) {
    var tileAttribution;
	var tilemaxZoom = tileLayerData[tile].zoom;
    var subdomains = tileLayerData[tile].subdomains ? tileLayerData[tile].subdomains : 'abc';
    if (tileLayerData[tile].attribution) tileAttribution = tileLayerData[tile].attribution + ' | ' + attribution;
	else tileAttribution = attribution;
	tileLayers[tileLayerData[tile].name] = L.tileLayer(
		tileLayerData[tile].url,
		{maxNativeZoom: tilemaxZoom, maxZoom: 20, attribution: tileAttribution, subdomains: subdomains}
    )
	// create object array for getting map base layer name
	tileList['name'].push(tileLayerData[tile].name)
	tileList['keyname'].push(tile);
}
L.control.layers(tileLayers).addTo(map);

// get map base layer name on change
map.on('baselayerchange', function(e) {
  for (var x = 0; x < tileList.name.length; x++) {
	if (e.name == tileList.name[x]) activeTileLayer = tileList.keyname[x];
  }
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
    onLocationError: function(err) {
		alert('Sorry, there was an error while trying to locate you.');
    }
}).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
var poly;
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
		color: '#b05000',
		fill: false
	}
	).addTo(map);
	map.panTo(center);
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
		onClick:function(){
			var link = get_permalink();
			window.prompt('Copy permanent map link:', link);
		}
	}]
}).addTo(map);
// clear map button
L.easyButton({
	id:'btnclearmap',
	states:[{
		icon:'fa fa-trash',
		title:'Clear map',
		onClick:function(){
			if (map.hasLayer(poly)) { map.removeLayer(poly); }
			routingControl.setWaypoints([]);
			$("#accordion" ).accordion({active: false});
			clear_map();
		}
	}]
}).addTo(map);
// full reload on right click
$('#btnclearmap').bind("contextmenu",function(e){
	$(location).attr('href', window.location.pathname);
	return false;
});

// https://github.com/Turbo87/sidebar-v2/
var sidebar = $('#sidebar').sidebar();

// https://github.com/mlevans/leaflet-hash
var hash = new L.Hash(map);

// update the permalink when L.Hash changes the #hash
window.onhashchange = function() {
    update_permalink();
}

// https://github.com/ebrelsford/Leaflet.loading
var loadingControl = L.Control.loading({
    separate: true
});
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
	}),
});
var routeBlock = routingControl.onAdd(map);	
document.getElementById('routingControl').appendChild(routeBlock);
$( "#accordion" ).accordion({
	heightStyle: "content",
	collapsible: true,
	active: false
});

// https://github.com/pawelczak/EasyAutocomplete
var poitags = [];
var category = [];
var i = 0;
// get all tags
for (poi in pois) {
	poitags += '"' + pois[poi].tabName + "~" + poi + '": ' + JSON.stringify(pois[poi].tagKeyword) + ', ';
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
			var catsplit = catsplit.split(" - ");
			sidebar.open(catsplit[0]);
			$('#pois' + catsplit[0] + ' input[id="' + catsplit[1] + '"]').prop('checked', true);
			// Highlight checkbox or hide sidebar for mobile users
			if ($(window).width() >= 768) {
				$('#pois' + catsplit[0] + ' input[id="' + catsplit[1] + '"]').parent().parent().parent().effect("highlight", {}, 3000);
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
		category[0],
	]
};
// push categories into options array
for (var x = 1; x < category.length; x++) {
	options['categories'].push(category[x]);
}
$('#autocomplete').easyAutocomplete(options);
$('div.easy-autocomplete').removeAttr('style');

// https://github.com/kartenkarsten/leaflet-layer-overpass
var spinner = 0;
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

		var type = ''
		if (e.tags.amenity) {
			if (type == '') type = e.tags.amenity;
			// Group similar pois
			if (type == 'arts_centre') type = 'attraction';
			if (type == 'nightclub') type = 'bar';
			if (type == 'college') type = 'school';
			if (type == 'retirement_home') type = 'social_facility';
			if (type == 'post_office') type = 'post_box';
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
			if (type == 'laundry') type = 'dry_cleaning';
			if (type == 'garden_centre') type = 'florist';
			if (type == 'tyres') type = 'car_repair';
			if (type == 'hearing_aids') type = 'mobility';
			if (type == 'interior_decoration') type = 'houseware';
			if (type == 'bathroom_furnishing') type = 'houseware';
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
			if (type == 'shelter') type = 'listed_status';
			if (type == 'company') type = 'listed_status';
		}

		var poi = pois[type];
		// Skip this undefined icon
		if (!poi) {
			if (type != null) console.log('Skipping undefined icon: "' + type + '"');
			continue;
		}
		var markerIcon  = L.icon({
			iconUrl: 'assets/img/icons/' + poi.iconName + '.png',
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
		})
		// show a label next to the icon on mouse hover
		if (e.tags.name) {
			marker.bindLabel(
				e.tags.name,
				{direction: 'auto', offset: [27, -32]}
			);
		}
		if (poi.tagParser) var markerPopup = poi.tagParser(e, poi.name);
		else var markerPopup = generic_poi_parser(e, poi.name);
		// set width of popup on screensize
		if ($(window).width() > 500) var customOptions  = { 'maxWidth': '350', }
		else var customOptions = { 'maxWidth': '250', }
		marker.bindPopup(markerPopup, customOptions);
		// display only open facilities on opennow checkbox
		if ($('input.opennow').is(':checked')) {
			if (state == true) marker.addTo(this.instance);
		}
		else marker.addTo(this.instance);
	}
}

function build_overpass_query() {
	var acttab = $('.sidebar-pane.active').attr('id');
    query = '(';
    $('#pois' + acttab + ' input.poi-checkbox:checked').each(function(i, element) {
		query += 'node' + pois[element.dataset.key].query + '(BBOX);';	
		query += 'way' + pois[element.dataset.key].query + '(BBOX);';
    });
    query += ');out center;';
}

// clear layers
function clear_map() {
	$('input.poi-checkbox').prop("checked", false);
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
			build_overpass_query();
			show_overpass_layer();
		}
		else {
			spinner = 0;
			$('#spinner').hide();
		}
		update_permalink();
	}
	else $('[data-key=' + newcheckbox + ']').prop('checked', false);
}

function show_pois_checkboxes(tabName) {
    // build the content for the sidebar pane
	var i = 0;
    var content = '';
	content += '<div class="anchor"><a id="gototop' + tabName + '" href="#gotobot' + tabName + '">| <span class="fa fa-arrow-down"></span> |</a></div>'
    content += '<table style="width:100%">';
	for (poi in pois) {
		if (pois[poi].tabName == tabName) {
			if (i % 2 == 0) content += '<tr>';
			content += '<td style="overflow:hidden; white-space:nowrap">';
			var checkbox = Mustache.render(
				'<div class="poi-checkbox"> \
					<label> \
						<img src="assets/img/icons/{{icon}}.png"></img> \
						<input type="checkbox" class="poi-checkbox" id="{{name}}" data-key="{{key}}" onclick="setting_changed(&#39;{{key}}&#39;)"><span>{{name}}</span> \
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
	content += '<div class="anchor"><a id="gotobot' + tabName + '" href="#gototop' + tabName + '">| <span class="fa fa-arrow-up"></span> |</a></div>'
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
if (uri.hasQuery('O')) {
	if (uri.search(true).O == 1) $('input.opennow').prop("checked", true);
	else $('input.opennow').prop("checked", false);
}
if (uri.hasQuery('P')) {
	var selectedPois = uri.search(true).P;
	if (!$.isArray(selectedPois)) {
		// the last poi has a "/" on it because leaflet-hash
		poi = selectedPois.replace('/', '');
		$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').prop('checked', true);
	}
	else {
		for (i = 0; i < selectedPois.length; i++) {
			// the last poi has a "/" on it because leaflet-hash
			poi = selectedPois[i].replace('/', '');
			$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').prop('checked', true);
		}
	}
	sidebar.open(uri.search(true).T);
	// highlight checkbox or hide sidebar for mobile users
	if ($(window).width() >= 768) {
		$('#pois' + uri.search(true).T + ' input[data-key=' + poi + ']').parent().parent().parent().effect("highlight", {}, 3000);
	}
	else sidebar.close();
    setting_changed();
}
else {
	// if not returning from a hash, give defaults
	if (window.location.href.indexOf('#') == -1) map.setView([maplat, maplng], mapzoom);
	if (uri.hasQuery('T')) {
		sidebar.open(uri.search(true).T);
	}
	else sidebar.open('home');
}
tileLayers[tileLayerData[activeTileLayer].name].addTo(map);
map.setMaxBounds([[maptop,mapleft], [mapbottom,mapright]]);
	
var query = '';
function show_overpass_layer() {
    if (query == '' || query == '();out center;') {
		console.log('There is nothing selected to filter by.');
		return;
    }
    var opl = new L.OverPassLayer({
		debug: false,
		minzoom: 15,
		query: query + '&contact=' + email, //contact info only for use with .fr endpoint
		endpoint: "http://api.openstreetmap.fr/oapi/interpreter/",
		callback: callback,
		minZoomIndicatorOptions: {
			position: 'topright',
			minZoomMessageNoLayer: "No layer assigned",
			minZoomMessage: "Zoom in to load data"
		}
    });
    iconLayer.addLayer(opl);
}

function get_permalink() {
    var uri = URI(window.location.href);
	var acttab = $('.sidebar-pane.active').attr('id');
    var selectedPois = [];
	if ($('input.opennow').is(':checked')) var opennow = 1;
	else var opennow = 0;
    $('#pois' + acttab + ' input.poi-checkbox:checked').each(function(i, element) {
		selectedPois.push(element.dataset.key);
    });
	// M = basemap, T = tab, O = opennow, P = pois
    uri.query({'M': activeTileLayer, 'T': acttab, 'O': opennow, 'P': selectedPois });
    return uri.href();
}

function update_permalink() {
    var link = get_permalink();
    $('#permalink').attr('href', link);
}