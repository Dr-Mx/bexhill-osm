// all main functions for site

// debug mode
var siteDebug = false;
// personal api keys
var mapboxKey = 'pk.eyJ1IjoiZHJteCIsImEiOiJjaXpweXh1N2UwMDEwMzJud2g1cnJncHA4In0.4b_hzRykSVaiAWlnb0s6XA';
var thuforKey = '4fc2613fe5d34ca697a03ea1dc8f0b2b';
// overpass layer options
var minOpZoom = ($(window).width() < 768) ? 14 : 15;
var email = 'info@bexhill-osm.org.uk';
// map area
var mapBounds = { lef: 0.3000, top: 50.8200, rig: 0.5350, bot: 50.8800 };
var mapBbox = [mapBounds.top, mapBounds.lef, mapBounds.bot, mapBounds.rig];
// map open location
var mapCentre = [50.8424, 0.4676], mapZoom = 15;
// map base layer
var defTileLayer = 'bosm', actTileLayer = defTileLayer;
// tab to open
var defTab = 'home', actTab = defTab;

// hack to get safari to scroll iframe
if (navigator.userAgent.indexOf('Safari') > -1) {
	$('#tour .sidebar-body').css('-webkit-overflow-scrolling', 'touch');
	$('#tour .sidebar-body').css('overflow', 'auto');
}

// swipe away sidebar on larger touch devices
$('.sidebar-content').on('swipeleft', function () {
	if ($(window).width() >= 768 && L.Browser.touch) sidebar.close();
});

// smooth scrolling to anchor
$(document).on('click', 'a[href*="#goto"]', function (e) {
	var target = $('[id=' + this.hash.slice(1) + ']');
	$('.sidebar-body').animate({ scrollTop: target.offset().top - 55 }, 1000);
	e.preventDefault();
});

$('.sidebar-tabs').click(function () {
	// get current sidebar-tab
	actTab = $('.sidebar-pane.active').attr('id');
	// resize links on minimap
	if (actTab === 'home') setTimeout(function () { $('map').imageMapResize(); }, 500);
	// hack to stop iframe freezing on firefox android
	else if (actTab === 'tour' && L.Browser.touch) $('#tourList').trigger('change');
});

var userCountry, areaOutline = '';
$(document).ready(function () {
	// clear loading elements
	$('#spinner').hide();
	$('#map').css('background', '#dedede');
	// https://github.com/davidjbradshaw/image-map-resizer
	// add delay after load for sidebar to animate open to create minimap
	setTimeout(function () { $('map').imageMapResize(); }, 500);
	// get users location so we don't have to show country code on phone numbers
	$.get('https://ipinfo.io', function (result) { userCountry = result.country; }, 'jsonp');
	map.on('popupopen', function (e) {
		// delay required when switching directly to another popup
		setTimeout(function () {
			// opening-hours accordion
			$('.popup-ohContainer').accordion({
				heightStyle: 'content',
				collapsible: true,
				active: false,
				animate: 100
			});
			// https://github.com/jfirebaugh/leaflet-osm
			// get and display the area outline through openstreetmap api (id is taken from the edit button attribute)
			if ($('.popup-edit').length) {
				$.ajax({
					url: 'http://www.openstreetmap.org/api/0.6/' + $('.popup-edit').attr('id').replace('_', '/') + '/full',
					dataType: 'xml',
					success: function (xml) {
						if (siteDebug) console.debug(xml);
						areaOutline = new L.OSM.DataLayer(xml).addTo(map);
					}
				});
			}
			// fhrs api for showing food hygiene ratings
			if ($('.popup-fhrs').length) {
				$.ajax({
					url: 'http://api.ratings.food.gov.uk/establishments/' + $('.popup-fhrs').text(),
					headers: { 'x-api-version': 2 },
					dataType: 'json',
					success: function (result) {
						$('.popup-fhrs').html('<img src="assets/img/fhrs/' + result.RatingKey + '.jpg">');
					}
				});
			}
			// wikimedia api for image attribution
			if ($('.popup-imgContainer').length) {
				var img = $('.popup-imgContainer a').attr('href');
				img = img.split('File:');
				$.ajax({
					url: 'http://commons.wikipedia.org/w/api.php',
					data: { action: 'query', prop: 'imageinfo', iiprop: 'extmetadata', titles: 'File:' + img[1], format: 'json' },
					dataType: 'jsonp',
					success: function (result) {
						var imgAttrib = result.query.pages[Object.keys(result.query.pages)[0]].imageinfo['0'].extmetadata;
						$('.popup-imgAttrib').html('&copy; ' + imgAttrib.Artist.value);
						$('.external.text').attr('target', '_blank');
						$('.external.text').attr('title', 'Artist');
						$('.popup-imgAttrib').append(' | <a href="' + imgAttrib.LicenseUrl.value + '" title="Licence" target="_blank">' + imgAttrib.LicenseShortName.value + '</a>');
					}
				});
			}
		}, 200);
		// fit popup on screen when image is fully loaded by triggering an autopan
		if ($('.popup-imgContainer').length) $('.popup-imgContainer a img').load(function () { setTimeout(function () {
			e.popup._adjustPan();
		}, 200); });
	});
	map.on('popupclose', function () {
		map.removeLayer(areaOutline);
	});
});

// https://github.com/aratcliffe/Leaflet.contextmenu
var map = new L.map('map', {
	contextmenu: true,
	contextmenuItems: [{
		text: '<i class="fa fa-search fa-fw"></i> <span class="contextmenu-lookup"></span>',
		index: 0,
		callback: reverseLookup
	}, {
		text: '<i class="fa fa-crosshairs fa-fw"></i> Centre map here',
		callback: centreMap
	}, {
		text: '<i class="fa fa-map-marker fa-fw"></i> Add walk point here',
		callback: walkPoint
	}, '-', {
		text: '<i class="fa fa-sticky-note-o fa-fw"></i> Leave a note here',
		callback: improveMap
	}]
});
// set reverselookup levels
map.on('zoomend', function () {
	var contextLookup = [];
	if (map.getZoom() <= 14) contextLookup = ['', true];
	else if (map.getZoom() === 15) contextLookup = [' area', false];
	else if (map.getZoom() <= 17) contextLookup = [' street', false];
	else if (map.getZoom() >= 18) contextLookup = [' place', false];
	$('.contextmenu-lookup').html('Lookup' + contextLookup[0]);
	map.contextmenu.setDisabled(0, contextLookup[1]);
});
// middle-mouse button reverselookup on map layer
map.on('mouseup', function (e) {
	if (e.originalEvent.button === 1 && e.originalEvent.target.id === 'map' && map.getZoom() >= 15) reverseLookup(e);
});
var geoMarker, rLookup = false;
function reverseLookup (e) {
	// get location, look up id on nominatim and pass it to overpass
	var geocoder = L.Control.Geocoder.nominatim();
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function (results) {
		geoMarker = results[0];
		if (geoMarker) {
			if (siteDebug) console.debug(geoMarker);
			clear_map();
			rLookup = true;
			show_overpass_layer(geoMarker.properties.osm_type + '(' + geoMarker.properties.osm_id + ')(' + mapBbox + ');');
		}
	});
}
function centreMap (e) {
	map.panTo(e.latlng);
}
function walkPoint (e) {
	if ($(window).width() >= 768 && actTab !== 'walking') $('a[href="#walking"]').click();
	// drop a walk marker if one doesn't exist
	var wp = routingControl.getWaypoints();
	for (var c in wp) {
		if(!wp[c].name){
			routingControl.spliceWaypoints(c, 1, e.latlng);
			return;
		}
	}
	routingControl.spliceWaypoints(wp.length, 0, e.latlng);
}
function improveMap (e) {
	// create a note on osm.org
	window.open('https://www.openstreetmap.org/note/new#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng, '_blank');
}

// minimap click
function minimap(latlng, zoom) {
	if ($(window).width() < 768) sidebar.close();
	map.flyTo(latlng, zoom);
}


// navigation controls for historic tour
$('#tourNext').click(function () {
	if ($('#tourList option:selected').next().is(':enabled')) {
		$('#tourList option:selected').next().prop('selected', 'selected');
		$('#tourList').trigger('change');
	}
});
$('#tour').on('swipeleft', function () {
	if ($(window).width() < 768 && L.Browser.touch) $('#tourNext').trigger('click');
});
$('#tourPrev').click(function () {
	if ($('#tourList option:selected').prev().is(':enabled')) {
		$('#tourList option:selected').prev().prop('selected', 'selected');
		$('#tourList').trigger('change');
	}
});
$('#tour').on('swiperight', function () {
	if ($(window).width() < 768 && L.Browser.touch) $('#tourPrev').trigger('click');
});
$('#tourList').change(function () {
	$('#tourFrame').attr('src', 'tour/tour' + $(this).val() + '.html');
});

// https://github.com/Leaflet/Leaflet
var iconLayer = new L.LayerGroup();
map.addLayer(iconLayer);
// leaflet icon image path
L.Icon.Default.imagePath = 'assets/img/leaflet/';
// bing satellite layer
L.TileLayer.QuadKeyTileLayer = L.TileLayer.extend({
	getTileUrl: function (tilePoint) {
		return L.Util.template(this._url, {
			s: this._getSubdomain(tilePoint),
			q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
		});
	},
	_quadKey: function (x, y, z) {
		var quadKey = [];
		for (var i = z; i > 0; i--) {
			var digit = '0';
			var mask = 1 << (i - 1);
			if ((x & mask) !== 0) {
				digit++;
			}
			if ((y & mask) !== 0) {
				digit++;
				digit++;
			}
			quadKey.push(digit);
		}
		return quadKey.join('');
	}
});
// baselayers
var tileBaseLayer = {
	bosm: {
		name: 'Bexhill-OSM',
		url: 'https://{s}.tiles.mapbox.com/v4/drmx.fa383e0e/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: '<a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: 20
	},
	osmstd: {
		name: 'OpenStreetMap (standard)',
		url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		zoom: 19
	},
	osmhot: {
		name: 'OpenStreetMap (humanitarian)',
		url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
		zoom: 19
	},
	antique: {
		name: 'Antique',
		url: 'https://{s}.tiles.mapbox.com/v4/lrqdo.me2bng9n/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: '<a href="https://laruchequiditoui.fr/" target="_blank">LRQDO</a>',
		zoom: 20
	},
	mbxoutdr: {
		name: 'Mapbox Outdoors',
		url: 'https://{s}.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: '<a href="http://mapbox.com/" target="_blank">MapBox</a>',
		zoom: 20
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
	}
};
var attribution = '&copy; <a href="http://openstreetmap.org/copyright" title="Copyright and License" target="_blank">OpenStreetMap contributors</a>';
var tileBaseLayers = {}, tileOverlay = {}, imageOverlay = {};
var tileList = {name: [], keyname: []};
for (var tile in tileBaseLayer) {
	var subdomains = tileBaseLayer[tile].subdomains ? tileBaseLayer[tile].subdomains : 'abc';
	var tileAttribution = (tileBaseLayer[tile].attribution) ? tileBaseLayer[tile].attribution + ' | ' + attribution : attribution;
	tileBaseLayers[tileBaseLayer[tile].name] = L.tileLayer(tileBaseLayer[tile].url, { maxNativeZoom: tileBaseLayer[tile].zoom, maxZoom: 20, attribution: tileAttribution, subdomains: subdomains });
	// create object array for all basemap layers
	tileList.name.push(tileBaseLayer[tile].name);
	tileList.keyname.push(tile);
}
// overlays
tileOverlay.Hillshading = L.tileLayer('https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png', {
	maxNativeZoom: 15,
	maxZoom: 20
});
tileOverlay['Bing Satellite Overlay'] = new L.TileLayer.QuadKeyTileLayer('http://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z', {
	opacity: '0.5',
	subdomains: '0123',
	maxNativeZoom: 19,
	maxZoom: 20,
	attribution: '<a href="http://maps.bing.com/" target="_blank">Microsoft Bing</a>'
});
L.control.layers(tileBaseLayers, tileOverlay).addTo(map);
L.control.scale({ metric: false, position: 'bottomright' }).addTo(map);

// xmas overlay
if ((new Date().getMonth() === 10 && new Date().getDate() >= 15) || new Date().getMonth() === 11) {
	// new town
	L.imageOverlay('assets/img/xmas-tree.png', [[50.84090, 0.47320], [50.84055, 0.47370]], { opacity: 0.9 }).addTo(map);
	L.imageOverlay('assets/img/xmas-lights.png', [[50.84037, 0.47415], [50.83800, 0.46980]], { opacity: 0.9 }).addTo(map);
	// little common
	L.imageOverlay('assets/img/xmas-tree.png', [[50.84545, 0.43400], [50.84510, 0.43350]], { opacity: 0.9 }).addTo(map);
}

// get basemap layer name on change
map.on('baselayerchange', function (e) {
	for (var c in tileList.name) {
		if (e.name === tileList.name[c]) actTileLayer = tileList.keyname[c];
	}
});

// https://github.com/domoritz/leaflet-locatecontrol
L.control.locate({
	icon: 'fa fa-location-arrow',
	setView: true,
	flyTo: true,
	keepCurrentZoomLevel: true,
	metric: false,
	strings: {
		title: 'Locate me',
		popup: 'Located within {distance} {unit}.',
		outsideMapBoundsMsg: 'You appear to be located outside the Bexhill area.\nCome visit! :)'
	},
	onLocationError: function () {
		alert('Sorry, there was an error while trying to locate you.');
	}
}).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: [mapBounds.lef, mapBounds.top, mapBounds.rig, mapBounds.bot],
			email: email
		}
	}),
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft',
	placeholder: 'Type address or place name...'
})
.on('markgeocode', function (e) {
	// pass nominatim address lookup to overpass
	clear_map();
	rLookup = true;
	geoMarker = e.geocode;
	if (siteDebug) console.debug(geoMarker);
	if (map.getZoom() <= minOpZoom) map.setZoom(minOpZoom, { animate: false });
	show_overpass_layer(geoMarker.properties.osm_type + '(' + geoMarker.properties.osm_id + ')(' + mapBbox + ');');
	$('.leaflet-control-geocoder-form :input').blur();
})
.addTo(map);
$('.leaflet-control-geocoder-icon').attr('title','Find address');

function geocoderLink() {
	if ($(window).width() < 768) sidebar.close();
	$('.leaflet-control-geocoder-icon').click();
}
function donateLink() {
	$('a[href="#information"]').click();
	$('#information .sidebar-body').scrollTop(0);
	$('a[href="#gotodonate"]').click();
}

// https://github.com/cliffcloud/Leaflet.EasyButton
// permalink button
L.easyButton({
	id: 'btnPermalink',
	states: [{
		icon: 'fa fa-link',
		title: 'Get map link',
		onClick: function () {
			var uri = URI(window.location.href);
			var selectedPois = '', walkCoords = '', tourPage, openNow;
			var walkWayp = routingControl.getWaypoints();
			if (actTab === defTab) actTab = undefined;
			if (actTileLayer === defTileLayer) actTileLayer = undefined;
			if (walkWayp[1].latLng !== null) {
				for (var c in walkWayp) {
					walkCoords += Math.round(walkWayp[c].latLng.lat * 100000) / 100000 + 'x' + Math.round(walkWayp[c].latLng.lng * 100000) / 100000 + '_';
				}
			}
			walkCoords = walkCoords ? walkCoords.slice(0, -1) : undefined;
			if (actTab === 'tour' && $('#tourList option:selected').val() > 0) tourPage = $('#tourList option:selected').val();
			if ($('.opennow input').is(':checked')) openNow = 1;
			$('#pois input.poi-checkbox:checked').each(function (i, element) { selectedPois += element.dataset.key + '-'; });
			selectedPois = selectedPois ? selectedPois.slice(0, -1) : undefined;
			// M = basemap, T = tab, U = tour page, O = opennow, P = grouped pois, I = single poi, W = walkpoints
			uri.query({ 'M': actTileLayer, 'T': actTab, 'U': tourPage, 'O': openNow, 'P': selectedPois, 'I': markerId, 'W': walkCoords });
			window.prompt('Copy this link to share current map:', uri.href());
		}
	}]
}).addTo(map);
// clear map button
L.easyButton({
	id: 'btnClearmap',
	states: [{
		icon: 'fa fa-trash',
		title: 'Clear map',
		onClick: function () {
			// clear overlay, clear walk points, collapse suggested walks, clear poi marker layers
			map.removeLayer(imageOverlay);
			routingControl.setWaypoints([]);
			$('#walkContainer').accordion({ active: false });
			clear_map();
		}
	}]
}).addTo(map);
// full reload on right click
$('#btnClearmap').bind('contextmenu',function () {
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
	routeWhileDragging: false,
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
			viewbox: [mapBounds.lef, mapBounds.top, mapBounds.rig, mapBounds.bot]
		}
	})
});
var routeBlock = routingControl.onAdd(map);
document.getElementById('routingControl').appendChild(routeBlock);
// collapsible suggested walks
$('#walkContainer').accordion({
	heightStyle: 'content',
	collapsible: true,
	active: false
});

function populate_tabs() {
	var poitags = [], category = [], categoryList = [], c = 0, t;
	// get all keywords
	for (var poi in pois) {
		poitags += '"' + pois[poi].catName + '~' + poi + '": ' + JSON.stringify(pois[poi].tagKeyword) + ', ';
		category[c] = { listLocation: pois[poi].catName + '~' + poi, header: '<img src="assets/img/icons/' + pois[poi].iconName + '.png">' + pois[poi].catName + ' - ' + pois[poi].name };
		if (categoryList.indexOf(pois[poi].catName) === -1) categoryList.push(pois[poi].catName);
		c++;
	}
	// clean up and covert to array
	poitags = poitags.substring(0, poitags.length - 2);
	poitags = JSON.parse('{' + poitags + '}');
	// https://github.com/pawelczak/EasyAutocomplete
	var options = {
		data: poitags,
		minCharNumber: 3,
		list: {
			maxNumberOfElements: 10,
			match: { enabled: true },
			onChooseEvent: function () {
				// find selected items category, split it to get checkbox, then display
				var z = ($('#autocomplete').getSelectedItemIndex());
				var catSplit = (document.getElementsByClassName('eac-category')[z].innerText);
				catSplit = catSplit.split(' - ');
				clear_map();
				$('a[href="#pois"]').click();
				$('#pois input[id="' + catSplit[1] + '"]').prop('checked', true);
				// scroll to checkbox
				if ($(window).width() >= 768) {
					$('#pois .sidebar-body').scrollTop(0);
					$('#pois .sidebar-body').scrollTop($('#pois input[id="' + catSplit[1] + '"]').position().top - 50);
				}
				setting_changed();
				$('#autocomplete').val('');
			}
		},
		categories: []
	};
	// push categories into options array
	for (c in category) { options.categories.push(category[c]); }
	$('#autocomplete').easyAutocomplete(options);
	$('div.easy-autocomplete').removeAttr('style');
	// create checkbox tables using poi categories
	var checkboxContent = '<p>';
	for (c in categoryList) { checkboxContent += '<a href="#goto' + categoryList[c] + '">' + categoryList[c] + '</a><br>'; }
	checkboxContent += '<p>';
	for (c in categoryList) {
		t = 0;
		checkboxContent += '<div id="goto' + categoryList[c] + '"><hr><h3>' + categoryList[c] + '</h3></div>';
		checkboxContent += '<table style="width:100%;">';
		for (poi in pois) {
			if (pois[poi].catName === categoryList[c]) {
				if (t % 2 === 0) checkboxContent += '<tr>';
				checkboxContent += L.Util.template(
					'<td><div class="poi-checkbox">' +
						'<label title="{name}">' +
							'<img src="assets/img/icons/{icon}.png"></img>' +
							'<input type="checkbox" class="poi-checkbox" id="{name}" data-key="{key}" onclick="setting_changed(&#39;{key}&#39;)"><span>{name}</span>' +
						'</label>' +
					'</div></td>',
					{ key: poi, name: pois[poi].name, icon: pois[poi].iconName }
				);
				t++;
				if (t % 2 === 0) checkboxContent += '</tr>';
			}
		}
		checkboxContent += '</table>';
		checkboxContent += '<div class="anchor"><a href="#gototoppois" title="Back to top">| <i class="fa fa-arrow-up"></i> |</a></div>';
	}
	$('#pois .sidebar-body').append(checkboxContent);
}
populate_tabs();

// clear poi marker layers
function clear_map() {
	$('input.poi-checkbox').prop('checked', false);
	setting_changed();
	spinner = 0;
	$('#spinner').hide();
}

function setting_changed(newcheckbox) {
	// limit number of active checkboxes
	if ($('input.poi-checkbox:checked').length <= 3) {
		// remove old poi markers
		iconLayer.clearLayers();
		markerId = undefined;
		if ($('input.poi-checkbox:checked').length > 0) {
			if ($(window).width() < 768) sidebar.close();
			//build overpass query
			var query = '(';
			$('#pois input.poi-checkbox:checked').each(function (i, element) {
				query += 'node' + pois[element.dataset.key].query + '(screenBbox);';
				query += 'way' + pois[element.dataset.key].query + '(screenBbox);';
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
	$('input.poi-checkbox').trigger('change');
}
// checkbox highlight
$('input.poi-checkbox').change(function () {
	if ($(this).prop('checked') === true) $(this).parent().parent().parent().css('background-color', 'rgba(255,255,255,0.6)');
	else $(this).parent().parent().parent().css('background-color', '');
});

// suggested walk waypoints
function suggWalk(walkName) {
	clear_map();
	switch(walkName) {
		case 'wwh':
			routingControl.setWaypoints([
				[50.83567, 0.45892],
				[50.83701, 0.47363]
			]);
			map.flyTo([50.8364, 0.4664], 16);
			break;
		case 'tmt':
			routingControl.setWaypoints([
				[50.84059, 0.49121],
				[50.83729, 0.47612],
				[50.83647, 0.46637],
				[50.83732, 0.46639]
			]);
			// show related information boards
			show_overpass_layer('(node["ref"~"^TMT"](screenBbox));');
			map.flyTo([50.8385, 0.4787], 16);
			break;
		case 'greenway':
			routingControl.setWaypoints([
				[50.85676, 0.47896],
				[50.87008, 0.52089]
			]);
			map.flyTo([50.8632, 0.4938], 15);
			break;
		case '1066':
			routingControl.setWaypoints([
				[50.84522, 0.48044],
				[50.84972, 0.48419],
				[50.87800, 0.50009]
			]);
			map.flyTo([50.8504, 0.4840], 15);
			break;
		case 'bc1':
			routingControl.setWaypoints([
				[50.84125, 0.47717],
				[50.84515, 0.47961],
				[50.86230, 0.51823],
				[50.84808, 0.52014],
				[50.84056, 0.49142],
				[50.83792, 0.47660],
				[50.84093, 0.47718]
			]);
			map.flyTo([50.8474, 0.4874], 14);
			break;
	}
}

// https://github.com/medialize/URI.js
// M = basemap, T = tab, U = tour page, O = opennow, P = grouped pois, I = single poi, W = walkpoints
var uri = URI(window.location.href);
if (uri.hasQuery('M')) actTileLayer = uri.search(true).M;
if (uri.hasQuery('T')) actTab = uri.search(true).T;
if (uri.hasQuery('U')) {
		$('#tourList').val(uri.search(true).U);
		$('#tourList').trigger('change');
}
if (uri.hasQuery('O')) $('.opennow input').prop('checked', uri.search(true).O);
if (uri.hasQuery('W')) {
	var walkCoords = uri.search(true).W;
	walkCoords = walkCoords.split('_');
	for (var c in walkCoords) {
		walkCoords[c] = walkCoords[c].replace('x', ', ');
		routingControl.spliceWaypoints(c, 1, JSON.parse('[' + walkCoords[c] + ']'));
	}
}
if (uri.hasQuery('P')) {
	var selectedPois = uri.search(true).P;
	if (selectedPois.indexOf('-') > -1) selectedPois = selectedPois.split('-');
	if (!$.isArray(selectedPois)) {
		$('#pois input[data-key=' + selectedPois + ']').prop('checked', true);
		// open tab when not on mobile, scroll to checkbox
		if ($(window).width() >= 768) {
			sidebar.open(actTab);
			$('#pois .sidebar-body').scrollTop(0);
			// add delay after load for sidebar to animate open to allow for scroll position
			setTimeout(function () {
				$('#pois .sidebar-body').scrollTop($('#pois input[data-key="' + selectedPois + '"]').position().top - 50);
			}, 500);
		}
	}
	else {
		for (var c in selectedPois) {
			// the last poi has a "/" on it because leaflet-hash
			var multiplePois = selectedPois[c].replace('/', '');
			$('#pois input[data-key=' + multiplePois + ']').prop('checked', true);
			// open tab when not on mobile
			if ($(window).width() >= 768) sidebar.open(actTab);
		}
	}
	setting_changed();
}
else if (uri.hasQuery('I')) {
	rLookup = true;
	markerId = uri.search(true).I;
	var splitId = markerId.split('_');
	show_overpass_layer(splitId[0] + '(' + splitId[1] + ')(' + mapBbox + ');');
}
// if not returning from a permalink, give defaults
if (!uri.hasQuery('W') || !uri.hasQuery('P') || !uri.hasQuery('I')) {
	if (window.location.hash.indexOf('/') !== 3) map.setView(mapCentre, mapZoom);
	if ($(window).width() >= 768 || actTab === 'tour') sidebar.open(actTab);
}

tileBaseLayers[tileBaseLayer[actTileLayer].name].addTo(map);
map.setMaxBounds([[mapBounds.top, mapBounds.lef], [mapBounds.bot, mapBounds.rig]]);
