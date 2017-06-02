// all main functions for site

// debug mode
var siteDebug = false;
// personal api keys
var mapboxKey = 'pk.eyJ1IjoiZHJteCIsImEiOiJjaXpweXh1N2UwMDEwMzJud2g1cnJncHA4In0.4b_hzRykSVaiAWlnb0s6XA';
var thuforKey = '4fc2613fe5d34ca697a03ea1dc8f0b2b';
// overpass layer options
var minOpZoom = 14;
var email = 'info@bexhill-osm.org.uk';
// map area
var mapBounds = { bot: 50.8190, lef: 0.3770, top: 50.8790, rig: 0.5330 };
var mapBbox = [mapBounds.bot, mapBounds.lef, mapBounds.top, mapBounds.rig];
// map open location
var mapCentre = [50.8424, 0.4676];
var mapZoom = ($(window).width() < 768) ? 14 : 15;
// map base layer
var defBaseTileLayer = 'bosm', actBaseTileLayer = defBaseTileLayer;
// tab to open
var defTab = 'home', actTab = defTab;
// image size for popups
var imgSize = ($(window).width() < 1024) ? 256 : 320;

// hack to get safari to scroll iframe
if (window.ontouchstart !== undefined && navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
	$('#tour .sidebar-body').css('-webkit-overflow-scrolling', 'touch');
	$('#tour .sidebar-body').css('overflow', 'auto');
}

// swipe away sidebar on larger touch devices
$('.sidebar-content').on('swipeleft', function () {
	if ($(window).width() >= 768 && window.ontouchstart !== undefined) sidebar.close();
});

// smooth scrolling to anchor
$(document).on('click', 'a[href*="#goto"]', function (e) {
	var target = $('[id=' + this.hash.slice(1) + ']');
	$('.sidebar-body').animate({ scrollTop: target.offset().top - 55 }, 1000);
	e.preventDefault();
});

$('.sidebar-tabs').click(function () {
	// get current sidebar-tab
	actTab = ($('.sidebar.collapsed').length) ? 'none' : $('.sidebar-pane.active').attr('id');
	// resize links on minimap
	if (actTab === 'home') setTimeout(function () { $('map').imageMapResize(); }, 500);
	// hack to stop iframe freezing on firefox android
	else if (actTab === 'tour' && window.ontouchstart !== undefined) $('#tourList').trigger('change');
});
// no sidebar-tab
$('.sidebar-close').click(function () {	actTab = 'none'; });
// hide sidebar on smaller devices when minimap clicked
$('map').click(function () { if ($(window).width() < 768) sidebar.close(); });

var areaOutline = '';
$(document).ready(function () {
	// clear loading elements
	$('#spinner').hide();
	$('#map').css('background', '#e6e6e6');
	// attribution
	$('#home .sidebar-body').append('<p><img style="margin-bottom:-2px;" src="favicon-16x16.png"> <i class="comment">&copy; Bexhill-OSM 2016-' + new Date().getFullYear() + '</i></p>');
	// jquery ui tooltip
	if (window.ontouchstart === undefined) $('.sidebar-tabs').tooltip({ hide: false, show: false, track: true, position: { my: 'left+15 top+10' } });
	// https://github.com/davidjbradshaw/image-map-resizer
	// add delay after load for sidebar to animate open to create minimap
	setTimeout(function () { $('map').imageMapResize(); }, 500);
	map.on('popupopen', function (e) {
		// show directions button if user located within map
		if (lc._active && map.options.maxBounds.contains(lc._event.latlng)) $('.popup-direct').show();
		$('.popup-direct').click(function () { 
			var popupLatlng = {};
			popupLatlng.latlng = e.popup._latlng;
			walkHere(popupLatlng);
		});
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
				var nodeway = ($('.popup-edit').attr('id').split('_')[0] === 'node') ? '' : '/full';
				$.ajax({
					url: 'http://www.openstreetmap.org/api/0.6/' + $('.popup-edit').attr('id').replace('_', '/') + nodeway,
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
						$('.popup-fhrs').html('<img alt="' + result.RatingValue + '" src="assets/img/fhrs/' + result.RatingKey + '.jpg">');
					}
				});
			}
			// wikimedia api for image attribution
			if ($('.popup-imgContainer').html() && $('.popup-imgContainer').html().indexOf('wikimedia.org') !== -1) {
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
		if ($('.popup-imgContainer').length) $('.popup-imgContainer img').load(function () { setTimeout(function () {
			$('.popup-imgContainer img').attr('alt', 'Image of ' + $('.popup-header h3').text());
			e.popup._adjustPan();
		}, 200); });
	});
	map.on('popupclose', function () {
		map.removeLayer(areaOutline);
	});
});

// https://github.com/aratcliffe/Leaflet.contextmenu
var map = new L.map('map', {
	maxBounds: L.latLngBounds([mapBounds.bot, mapBounds.lef], [mapBounds.top, mapBounds.rig]).pad(0.1),
	maxBoundsViscosity: 1.0,
	bounceAtZoomLimits: false,
	contextmenu: true,
	contextmenuItems: [{
		text: '<i class="fa fa-search fa-fw"></i> <span class="contextmenu-query"></span>',
		index: 0,
		callback: reverseQuery
	}, {
		text: '<i class="fa fa-location-arrow fa-fw"></i> Walk to here',
		index: 1,
		callback: walkHere
	}, {
		text: '<i class="fa fa-compass fa-fw"></i> Add a walk point',
		index: 2,
		callback: walkPoint
	}, {
		text: '<i class="fa fa-crosshairs fa-fw"></i> Centre map here',
		index: 3,
		callback: centreMap
	}, '-', {
		text: '<i class="fa fa-sticky-note-o fa-fw"></i> Leave a note here',
		index: 4,
		callback: improveMap
	}]
});
map.on('contextmenu.show', function () {
	// set reverseQuery levels
	var contextQuery = [];
	if (map.getZoom() <= 14) contextQuery = ['', true];
	else if (map.getZoom() === 15) contextQuery = [' area', false];
	else if (map.getZoom() <= 17) contextQuery = [' street', false];
	else if (map.getZoom() >= 18) contextQuery = [' place', false];
	$('.contextmenu-query').html('Query' + contextQuery[0]);
	map.contextmenu.setDisabled(0, contextQuery[1]);
	// show walkHere if user located within map
	if (lc._active && map.options.maxBounds.contains(lc._event.latlng) && map.getZoom() >= 14) $('.leaflet-contextmenu-item').eq(1).show();
	else $('.leaflet-contextmenu-item').eq(1).hide();
});
// middle-mouse button reverseQuery on map layer
map.on('mouseup', function (e) {
	if (e.originalEvent.button === 1 && e.originalEvent.target.id === 'map' && map.getZoom() >= 15) reverseQuery(e);
});
var geoMarker, rQuery = false;
function reverseQuery (e) {
	// get location, look up id on nominatim and pass it to overpass
	$('#spinner').show();
	var geocoder = L.Control.Geocoder.nominatim();
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function (results) {
		geoMarker = results[0];
		if (geoMarker) {
			if (siteDebug) console.debug(geoMarker);
			clear_map();
			rQuery = true;
			show_overpass_layer(geoMarker.properties.osm_type + '(' + geoMarker.properties.osm_id + ')(' + mapBbox + ');');
		}
	});
}
function walkPoint (e) {
	if ($(window).width() >= 768 && actTab !== 'walking' && actTab !== 'none') $('a[href="#walking"]').click();
	// drop a walk marker if one doesn't exist
	var wp = routingControl.getWaypoints();
	for (var c in wp) {
		if (!wp[c].name) {
			routingControl.spliceWaypoints(c, 1, e.latlng);
			return;
		}
	}
	routingControl.spliceWaypoints(wp.length, 0, e.latlng);
}
function walkHere (e) {
	if ($(window).width() >= 768 && actTab !== 'walking' && actTab !== 'none') $('a[href="#walking"]').click();
	routingControl.setWaypoints([
		[lc._event.latlng.lat, lc._event.latlng.lng],
		[e.latlng.lat, e.latlng.lng]
	]);
}
function centreMap (e) {
	map.panTo(e.latlng);
}
function improveMap (e) {
	// create a note on osm.org
	window.open('https://www.openstreetmap.org/note/new#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng, '_blank');
}

// navigation controls for historic tour
$('#tourNext').click(function () {
	if ($('#tourList option:selected').next().is(':enabled')) {
		$('#tourList option:selected').next().prop('selected', 'selected');
		$('#tourList').trigger('change');
	}
});
$('#tour').on('swipeleft', function () {
	if ($(window).width() < 768 && window.ontouchstart !== undefined) $('#tourNext').trigger('click');
});
$('#tourPrev').click(function () {
	if ($('#tourList option:selected').prev().is(':enabled')) {
		$('#tourList option:selected').prev().prop('selected', 'selected');
		$('#tourList').trigger('change');
	}
});
$('#tour').on('swiperight', function () {
	if ($(window).width() < 768 && window.ontouchstart !== undefined) $('#tourPrev').trigger('click');
});
$('#tourList').change(function () {
	var tourNum = $(this).val();
	if (tourNum.length === 1) tourNum = '0' + tourNum;
	$('#tourFrame').attr('src', 'tour/tour' + tourNum + '/index.html');
});

// https://github.com/Leaflet/Leaflet
var iconLayer = new L.LayerGroup();
var imageOverlay = new L.LayerGroup();
map.addLayer(iconLayer);
map.addLayer(imageOverlay);
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
		maxNativeZoom: 20
	},
	osmstd: {
		name: 'OpenStreetMap (standard)',
		url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		maxNativeZoom: 19
	},
	osmhot: {
		name: 'OpenStreetMap (humanitarian)',
		url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
		maxNativeZoom: 19
	},
	antique: {
		name: 'Pirate',
		url: 'https://{s}.tiles.mapbox.com/v4/lrqdo.me2bng9n/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: '<a href="https://github.com/ajashton/pirate-map" target="_blank">AJ Ashton</a>',
		maxNativeZoom: 20
	},
	mbxoutdr: {
		name: 'Mapbox Outdoors',
		url: 'https://{s}.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: '<a href="http://mapbox.com/" target="_blank">MapBox</a>',
		maxNativeZoom: 20
	},
	cycle: {
		name: 'OpenCycleMap',
		url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: '<a href="http://thunderforest.com/maps/opencyclemap/" target="_blank">ThunderForest</a>',
		maxNativeZoom: 20
	},
	trnsprt: {
		name: 'Public Transport',
		url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: '<a href="http://thunderforest.com/maps/transport/" target="_blank">ThunderForest</a>',
		maxNativeZoom: 20
	},
	matlas: {
		name: 'Mobile Atlas',
		url: 'https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: '<a href="http://thunderforest.com/maps/mobile-atlas/" target="_blank">ThunderForest</a>',
		maxNativeZoom: 20
	}
};
var attribution = '&copy; <a href="http://openstreetmap.org/copyright" title="Copyright and License" target="_blank">OpenStreetMap contributors</a>';
var tileBaseLayers = {}, tileOverlayLayers = {};
var baseTileList = {name: [], keyname: []};
for (var tile in tileBaseLayer) {
	var subdomains = tileBaseLayer[tile].subdomains ? tileBaseLayer[tile].subdomains : 'abc';
	var tileAttribution = (tileBaseLayer[tile].attribution) ? tileBaseLayer[tile].attribution + ' | ' + attribution : attribution;
	tileBaseLayers[tileBaseLayer[tile].name] = L.tileLayer(tileBaseLayer[tile].url, { maxNativeZoom: tileBaseLayer[tile].maxNativeZoom, maxZoom: 20, attribution: tileAttribution, subdomains: subdomains });
	// create object array for all basemap layers
	baseTileList.name.push(tileBaseLayer[tile].name);
	baseTileList.keyname.push(tile);
}
// overlays
var tileOverlayLayer = {
	hshade: {
		name: 'Hillshading',
		url: 'https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
		maxNativeZoom: 15
	},
	bing: {
		name: 'Bing Satellite',
		url: 'http://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
		opacity: 0.5,
		subdomains: '0123',
		maxNativeZoom: 19,
		attribution: '<a href="http://maps.bing.com/" target="_blank">Microsoft Bing</a>',
		quadkey: true
	},
	os1955: {
		name: 'Ordinance Survey, 1955',
		url: 'assets/maptiles/os1955/{z}/{x}/{y}.png',
		opacity: 0.7,
		minNativeZoom: 13,
		minZoom: 12,
		maxNativeZoom: 15,
		maxZoom: 20,
		attribution: 'Contains OS data © Crown copyright and database right (' + new Date().getFullYear() + ')'
	}/*,
	bombmap: {
		name: 'Observer Bomb Map, 1944',
		url: 'assets/maptiles/bombmap/{z}/{x}/{y}.png',
		minNativeZoom: 13,
		minZoom: 12,
		maxNativeZoom: 15,
		maxZoom: 20,
	}*/
};
for (var tile in tileOverlayLayer) {
	var subdomains = tileOverlayLayer[tile].subdomains ? tileOverlayLayer[tile].subdomains : 'abc';
	var opacity = tileOverlayLayer[tile].opacity ? tileOverlayLayer[tile].opacity : 1;
	var options = { maxNativeZoom: tileOverlayLayer[tile].maxNativeZoom, maxZoom: 20, attribution: tileOverlayLayer[tile].attribution, subdomains: subdomains, opacity: opacity };
	if (tileOverlayLayer[tile].quadkey) tileOverlayLayers[tileOverlayLayer[tile].name] = new L.TileLayer.QuadKeyTileLayer(tileOverlayLayer[tile].url, options);
	else tileOverlayLayers[tileOverlayLayer[tile].name] = L.tileLayer(tileOverlayLayer[tile].url, options);
}
L.control.layers(tileBaseLayers, tileOverlayLayers).addTo(map);
L.control.scale({ metric: false, position: 'bottomright' }).addTo(map);

// xmas overlay
if ((new Date().getMonth() === 10 && new Date().getDate() >= 15) || new Date().getMonth() === 11) {
	// new town
	L.imageOverlay('assets/img/xmas-tree.png', [[50.84090, 0.47320], [50.84055, 0.47370]], { opacity: 0.9 }).addTo(map);
	L.imageOverlay('assets/img/xmas-lights.png', [[50.84037, 0.47415], [50.83800, 0.46980]], { opacity: 0.9 }).addTo(map);
	// little common
	L.imageOverlay('assets/img/xmas-tree.png', [[50.84545, 0.43400], [50.84510, 0.43350]], { opacity: 0.9 }).addTo(map);
}

// get layer name on change
map.on('baselayerchange', function (e) {
	for (var c in baseTileList.name) {
		if (e.name === baseTileList.name[c]) actBaseTileLayer = baseTileList.keyname[c];
	}
});


// https://github.com/domoritz/leaflet-locatecontrol
var lc = L.control.locate({
	icon: 'fa fa-location-arrow',
	setView: true,
	flyTo: true,
	keepCurrentZoomLevel: true,
	metric: false,
	showPopup: false,
	strings: {
		title: 'Locate'
	},
	locateOptions: {
		enableHighAccuracy: true
	},
	onLocationError: function () {
		alert('Sorry, there was an error while trying to locate you.');
	},
	onLocationOutsideMapBounds: function () {
		alert('You appear to be located outside the Bexhill area.\nCome visit! :)');
		lc.stop();
	}
}).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
var geocode = L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: [mapBounds.lef, mapBounds.bot, mapBounds.rig, mapBounds.top],
			email: email
		}
	}),
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft',
	placeholder: 'Type address or place name...'
})
.on('markgeocode', function (e) {
	// pass nominatim address query to overpass
	clear_map();
	rQuery = true;
	geoMarker = e.geocode;
	if (siteDebug) console.debug(geoMarker);
	if (map.getZoom() <= minOpZoom) map.setZoom(minOpZoom, { animate: false });
	show_overpass_layer(geoMarker.properties.osm_type + '(' + geoMarker.properties.osm_id + ')(' + mapBbox + ');');
	$('.leaflet-control-geocoder-form input').blur();
})
.addTo(map);
$('.leaflet-control-geocoder-icon').attr('title','Address search');

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
		icon: 'fa fa-share-square-o',
		title: 'Share',
		onClick: function () {
			var uri = URI(window.location.href);
			var selectedPois = '', walkCoords = '', tourPage;
			var walkWayp = routingControl.getWaypoints();
			if (actTab === defTab) actTab = undefined;
			if (actBaseTileLayer === defBaseTileLayer) actBaseTileLayer = undefined;
			if (walkWayp[0].latLng && walkWayp[1].latLng) {
				for (var c in walkWayp) {
					walkCoords += Math.round(walkWayp[c].latLng.lat * 100000) / 100000 + 'x' + Math.round(walkWayp[c].latLng.lng * 100000) / 100000 + '_';
				}
			}
			else if (walkWayp[0].latLng) walkCoords = Math.round(walkWayp[0].latLng.lat * 100000) / 100000 + 'x' + Math.round(walkWayp[0].latLng.lng * 100000) / 100000 + '_';
			walkCoords = walkCoords ? walkCoords.slice(0, -1) : undefined;
			if (actTab === 'tour' && $('#tourList option:selected').val() > 0) tourPage = $('#tourList option:selected').val();
			$('.poi-icons input.poi-checkbox:checked').each(function (i, element) { selectedPois += element.dataset.key + '-'; });
			selectedPois = selectedPois ? selectedPois.slice(0, -1) : undefined;
			// M = basemap, T = tab, U = tour frame, G = image layer, P = grouped pois, I = single poi, W = walkpoints
			uri.query({ 'M': actBaseTileLayer, 'T': actTab, 'U': tourPage, 'G': imgLayer, 'P': selectedPois, 'I': markerId, 'W': walkCoords });
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
			// clear walk points, collapse suggested walks, clear poi marker layers
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
			viewbox: [mapBounds.lef, mapBounds.bot, mapBounds.rig, mapBounds.top]
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
				// find selected items category and split it to get checkbox, then display
				var catSplit = $('.eac-category')[$('#autocomplete').getSelectedItemIndex()].textContent.split(' - ');
				clear_map();
				$('a[href="#pois"]').click();
				$('.poi-icons input[id="' + catSplit[1] + '"]').prop('checked', true);
				// scroll to checkbox
				if ($(window).width() >= 768) {
					$('.poi-icons').scrollTop(0);
					$('.poi-icons').scrollTop($('.poi-icons input[id="' + catSplit[1] + '"]').parent().position().top - 50);
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
		checkboxContent += '<table>';
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
	$('.poi-icons').append(checkboxContent);
}
populate_tabs();

// if user presses ENTER instead of selecting a category, do an address search with the value
$('#autocomplete').keydown(function (e) { if (e.keyCode == $.ui.keyCode.ENTER && $('#autocomplete').val() && !$('#eac-container-autocomplete ul').is(':visible')) $(this).trigger('enterKey'); });
$('#autocomplete').bind('enterKey', function (e) {
	if ($(window).width() < 768) sidebar.close();
	$('.leaflet-control-geocoder-icon').click();
	$('.leaflet-control-geocoder-form input').val($(this).val());
	geocode._geocode();
});
$('#autocomplete').on('focus', function () {
	$(this).select();
});

// clear poi marker and overlay layers
function clear_map() {
	imageOverlay.clearLayers();
	imgLayer = undefined;
	$('input.poi-checkbox').prop('checked', false);
	setting_changed();
	spinner = 0;
	$('#spinner').hide();
}

function setting_changed(newcheckbox) {
	// limit number of active checkboxes
	if ($('input.poi-checkbox:checked').length <= 3) {
		// remove old poi markers and results
		iconLayer.clearLayers();
		$('.poi-results').css('height', '');
		$('.poi-icons').css('height', '');
		$('.poi-results-list').html('');
		poiList = [];
		markerId = undefined;
		if ($('input.poi-checkbox:checked').length > 0) {
			//build overpass query
			var query = '(';
			$('.poi-icons input.poi-checkbox:checked').each(function (i, element) {
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
	if ($(this).prop('checked') === true) $(this).parent().css('background-color', 'rgba(255,255,255,0.6)');
	else $(this).parent().css('background-color', '');
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
				[50.85676, 0.47898],
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
// M = basemap, T = tab, U = tour frame, G = image layer, P = grouped pois, I = single poi, Q = geocode query, W = walkpoints
var uri = URI(window.location.href);
if (uri.hasQuery('M')) actBaseTileLayer = uri.search(true).M;
if (uri.hasQuery('T')) actTab = uri.search(true).T;
if (uri.hasQuery('U')) {
		$('#tourList').val(uri.search(true).U);
		$('#tourList').trigger('change');
}
if (uri.hasQuery('G')) tour(uri.search(true).G);
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
		$('.poi-icons input[data-key=' + selectedPois + ']').prop('checked', true);
		// scroll to checkbox
		if (actTab !== 'none') {
			sidebar.open(actTab);
			$('.poi-icons').scrollTop(0);
			// add delay after load for sidebar to animate open, allows for scroll position
			setTimeout(function () {
				$('.poi-icons').scrollTop($('.poi-icons input[data-key="' + selectedPois + '"]').parent().position().top - 50);
			}, 500);
		}
	}
	else {
		for (var c in selectedPois) {
			// the last poi has a "/" on it because leaflet-hash
			var multiplePois = selectedPois[c].replace('/', '');
			$('.poi-icons input[data-key=' + multiplePois + ']').prop('checked', true);
			if (actTab !== 'none') sidebar.open(actTab);
		}
	}
	setting_changed();
}
else if (uri.hasQuery('I')) {
	rQuery = true;
	markerId = uri.search(true).I;
	var splitId = markerId.split('_');
	show_overpass_layer(splitId[0] + '(' + splitId[1] + ')(' + mapBbox + ');');
}
else if (uri.hasQuery('Q')) {
	$('.leaflet-control-geocoder-icon').click();
	$('.leaflet-control-geocoder-form input').val(uri.search(true).Q);
	geocode._geocode();
}
// if not returning from a permalink, give defaults
if (!uri.hasQuery('W') || !uri.hasQuery('P') || !uri.hasQuery('I')) {
	if (window.location.hash.indexOf('/') !== 3) map.setView(mapCentre, mapZoom);
	if (($(window).width() >= 768 || actTab !== 'home') && actTab !== 'none') sidebar.open(actTab);
}

// https://github.com/enginkizil/FeedEk
// show latest edits via rss feed
(function ($) {
	$.fn.FeedEk = function (opt) {
		var id = '#' + $(this).attr('id'), s = '', ti, tiUser;
		$(id).empty();
		// use dates as a 1 hour cachebuster
		var YQLstr = 'SELECT channel.item FROM feednormalizer WHERE output="rss_2.0" AND url="' + opt.FeedUrl + '&rnd=' + new Date().getDate() + '' + new Date().getHours() + '" LIMIT ' + 4;
		$.ajax({
			url: 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(YQLstr) + '&format=json&diagnostics=false',
			dataType: 'json',
			success: function (data) {
				$(id).empty();
				if (!(data.query.results.rss instanceof Array)) {
					data.query.results.rss = [data.query.results.rss];
				}
				$.each(data.query.results.rss, function (e, itm) {
					ti = itm.channel.item.title.split('changeset: ');
					tiUser = ti[0].split('User ')[1].split(' has uploaded')[0];
					s += '<li><a href="' + itm.channel.item.link + '" target="_blank" title="View changeset on OpenStreetMap"><i>' + ti[1].substring(1, ti[1].length - 1) + '</i></a>';
					s += ' - <a href="https://www.openstreetmap.org/user/' + tiUser + '" target="_blank" title="View user on OpenStreetMap">' + tiUser + '</a>';
					s += ' - ' + date_parser(itm.channel.item.date.split('T')[0], 'short') + '</span></li>';
				});
				$(id).append('Latest map edits:<ul>' + s + '</ul><p><hr>');
			}
		});
	};
})(jQuery);
$('#feedRss').FeedEk({ FeedUrl: 'http://simon04.dev.openstreetmap.org/whodidit/scripts/rss.php?bbox=' + mapBounds.lef + ',' + mapBounds.bot + ',' + mapBounds.rig + ',' + mapBounds.top });

tileBaseLayers[tileBaseLayer[actBaseTileLayer].name].addTo(map);
