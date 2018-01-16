// all main functions for site

// personal api keys
var mapboxKey = 'pk.eyJ1IjoiZHJteCIsImEiOiJjajZ6N2hkd3EyYzcxMndvMzRuaWJoanR0In0.TTK2rUFxYO1WYDOtNsNC4w';
var thuforKey = '4fc2613fe5d34ca697a03ea1dc8f0b2b';
// overpass layer options
var maxOpResults = 500;
var minOpZoom = 15;
var email = 'info@bexhill-osm.org.uk';
// map area
var mapBounds = { south: 50.8020, west: 0.3770, north: 50.8790, east: 0.5330 };
var LBounds = L.latLngBounds([mapBounds.south, mapBounds.west], [mapBounds.north, mapBounds.east]);
// map open location
var mapCentre = [50.8424, 0.4676];
var mapZoom = ($(window).width() < 768) ? 14 : 15;
// map layers
var defBaseTileLayer = 'osmstd', actBaseTileLayer = defBaseTileLayer, actOverlayLayer;
// tab to open
var defTab = 'home', actTab = defTab;
// image size for popups
var imgSize = ($(window).width() < 1024) ? 256 : 310;

// hack to get safari to scroll tour iframe
if (window.ontouchstart !== undefined && navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
	$('#tour .sidebar-body')
		.css('-webkit-overflow-scrolling', 'touch')
		.css('overflow', 'auto');
}

// set swipe triggers for touch devices
// close sidebar
$('.sidebar-header').on('swipeleft', function () { sidebar.close(); });
// prev/next tour iframe
$('#tour')
	.on('swiperight', function () { $('#tourPrev').trigger('click'); })
	.on('swipeleft', function () { $('#tourNext').trigger('click'); });

// smooth scrolling to anchor
var target;
$(document).on('click', 'a[href*="#goto"]', function (e) {
	target = $('[id=' + this.hash.slice(1) + ']');
	if (actTab === 'pois' && $('.poi-results').is(':visible')) $('.poi-icons').animate({ scrollTop: target.offset().top - 55 - $('.poi-results').css('height').replace('px', '') }, 1000);
	else $('.poi-icons, .sidebar-body').animate({ scrollTop: target.offset().top - 55 }, 1000);
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

var areaOutline = [];
$(document).ready(function () {
	// clear loading elements
	if (spinner === 0) $('#spinner').fadeOut();
	$('#map').css('background', '#e6e6e6');
	// sidebar information
	if (window.ontouchstart === undefined) $('.sidebar-tabs').tooltip({ hide: false, show: false, track: true, position: { my: 'left+15 top+10' } });
	getTips();
	if (actTab === defTab) showMapEditsRss();
	$('#home .sidebar-body').append('<p><img style="margin-bottom:-2px;" src="favicon-16x16.png"> <i class="comment">&copy; Bexhill-OSM 2016-' + new Date().getFullYear() + '</i></p>');
	$('#tourList').trigger('change');
	// add permalink modal to layer control
	$('#btnPermalink').parent().append(
		'<div id="modalPermalink" class="leaflet-control-layers leaflet-control">' +
			'<a class="leaflet-popup-close-button" title="Close" onclick="$(this).parent().hide(200);">×</a>' +
			'Share link<br>' +
			'<textarea id="inputPermalink" readonly></textarea>' +
			'<button type="button" id="btnCopyPermalink" class="theme" title="Copy to clipboard" onclick="copyPermalink();"></button>' +
		'</div>'
	);
	$('#inputPermalink').on('click', function () { $(this).select(); });
	// add overlay opacity slider to layer control
	$('.leaflet-top.leaflet-right').append(
		'<div id="inputOpacity" class="leaflet-control-layers leaflet-control">' +
			'<input type="range" min="0" max="1" step="0.05" title="Overlay opacity">' +
		'</div>'
	);
	$('.leaflet-control-layers-overlays label').eq(2).after('<div class="leaflet-control-layers-separator"></div>');
	// december xmas decorations
	if (new Date().getMonth() === 11) xmasDecor();
	// prevent click-through on map controls
	L.DomEvent
		.disableClickPropagation(L.DomUtil.get('inputOpacity'))
		.disableScrollPropagation(L.DomUtil.get('inputOpacity'));
	L.DomEvent
		.disableClickPropagation(L.DomUtil.get('modalPermalink'))
		.disableScrollPropagation(L.DomUtil.get('modalPermalink'));
	$('.leaflet-control').bind('contextmenu', function (e) { e.stopPropagation(); });
	// https://github.com/davidjbradshaw/image-map-resizer
	// add delay after load for sidebar to animate open to create minimap
	setTimeout(function () { $('map').imageMapResize(); }, 500);
	map.on('popupopen', function (e) {
		// show directions button if user located within map
		if (lc._active && LBounds.contains(lc._event.latlng)) $('.popup-direct').show();
		$('.popup-direct').click(function () {
			var popupLatlng = { latlng: e.popup._latlng };
			walkHere(popupLatlng);
			map.closePopup();
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
					url: 'https://www.openstreetmap.org/api/0.6/' + $('.popup-edit').attr('id').replace('_', '/') + nodeway,
					dataType: 'xml',
					success: function (xml) {
						if ($('#inputDebug').is(':checked')) console.debug(xml);
						areaOutline = new L.OSM.DataLayer(xml).addTo(map);
					}
				});
			}
			// fhrs api for showing food hygiene ratings
			if ($('.popup-fhrs').length) {
				// cors proxy for https users
				var proxyUrl = (window.location.protocol === 'https:') ? 'https://cors-anywhere.herokuapp.com/' : '';
				var fhrs = $('.popup-fhrs').attr('fhrs-key');
				$.ajax({
					url: proxyUrl + 'http://api.ratings.food.gov.uk/establishments/' + fhrs,
					headers: { 'x-api-version': 2 },
					dataType: 'json',
					success: function (result) {
						$('.popup-fhrs').html(
							'<a href="http://ratings.food.gov.uk/business/en-GB/' + fhrs + '" title="Food Standards Agency" target="_blank">' +
							'<img alt="Hygiene: ' + result.RatingValue + '" src="assets/img/fhrs/' + result.RatingKey + '.jpg"></a>'
						);
					}
				});
			}
		}, 200);
		if ($('.popup-imgContainer').length) {
			if ($('#img1').length) $('.popup-imgAttrib').css('text-align', 'left').css('padding-right', '55px');
			$('.popup-imgContainer')
				.on('dragstart', false)
				.on('selectstart', false)
				.on('swiperight', function () { navImg(0); })
				.on('swipeleft', function () { navImg(1); });
			$('.popup-imgContainer img')
				.on('load', function () { 
					$('.popup-imgContainer img').attr('alt', 'Image of ' + $('.popup-header h3').text());
					// timeout needed if switching between multiple popups
					setTimeout(function () { 
						getWikiAttrib(0);
						e.popup._adjustPan(); 
					}, 200); 
				})
				.on('error', function () {
					setTimeout(function () { $('.popup-imgContainer img').attr('alt', 'Error: Image not found'); }, 200);
				});
		}
	}).on('popupclose', function () {
		map.removeLayer(areaOutline);
	});
});

// https://github.com/aratcliffe/Leaflet.contextmenu
var map = new L.map('map', {
	maxBounds: LBounds.pad(0.1),
	maxBoundsViscosity: 1.0,
	minZoom: 10,
	bounceAtZoomLimits: false,
	contextmenu: true,
	contextmenuItems: [{
		text: '<i class="fas fa-search fa-fw"></i> <span class="contextmenu-query"></span>',
		index: 0,
		callback: reverseQuery
	}, {
		text: '<i class="fas fa-location-arrow fa-fw"></i> Walk to here',
		index: 1,
		callback: walkHere
	}, {
		text: '<i class="far fa-compass fa-fw"></i> Add a walk point',
		index: 2,
		callback: walkPoint
	}, {
		text: '<i class="fas fa-crosshairs fa-fw"></i> Centre map here',
		index: 3,
		callback: centreMap
	}, '-', {
		text: '<i class="far fa-sticky-note fa-fw"></i> Leave a note here',
		index: 4,
		callback: improveMap
	}]
}).on('contextmenu.show', function () {
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
}).on('mouseup', function (e) {
	// middle-mouse button reverseQuery on map layer
	if (e.originalEvent.button === 1 && e.originalEvent.target.id === 'map' && map.getZoom() >= 15) reverseQuery(e);
}).on('baselayerchange', function (e) {
	// get layer name on change
	for (var c in baseTileList.name) {
		if (e.name === baseTileList.name[c]) actBaseTileLayer = baseTileList.keyname[c];
	}
}).on('overlayadd', function (e) {
	loadingControl._showIndicator();
	// remove previous overlay
	setTimeout(function () {
		if ($('.leaflet-control-layers-overlays input:checked').length > 1) {
			map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
			$('.leaflet-control-layers-overlays label').eq(2).after('<div class="leaflet-control-layers-separator"></div>');
		}
		// get layer name on change
		for (var c in overlayTileList.name) {
			if (e.name === overlayTileList.name[c]) actOverlayLayer = overlayTileList.keyname[c];
		}
		// set overlay opacity controls
		$('#inputOpacity').show();
		$('#inputOpacity input')
			.val(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity)
			.on('input change', function () { tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(this.value); })
			.on('mouseover', function () { this.focus(); });
	}, 10);
}).on('overlayremove', function () {
	if (!$('.leaflet-control-layers-overlays input:checked').length) {
		actOverlayLayer = undefined;
		$('#inputOpacity').fadeOut('fast');
	}
});

// bounding coordinates for minimap
$('#minimap > map > area').click(function () {
	var mLoc = $(this).attr('title'), mBounds = [];
	switch (mLoc) {
		case 'Bexhill': mBounds = LBounds; break;
		case 'Barnhorn': mBounds = [[50.8507, 0.4301], [50.8415, 0.4066]]; break;
		case 'Central': mBounds = [[50.8425, 0.4801], [50.8351, 0.4649]]; break;
		case 'Collington': mBounds = [[50.8472, 0.4604], [50.8352, 0.4406]]; break;
		case 'Cooden': mBounds = [[50.8417, 0.4416], [50.8305, 0.4195]]; break;
		case 'Glenleigh Park': mBounds = [[50.8573, 0.4641], [50.8476, 0.4454]]; break;
		case 'Glyne Gap': mBounds = [[50.8485, 0.5102], [50.8423, 0.4954]]; break;
		case 'The Highlands': mBounds = [[50.8637, 0.4615], [50.8566, 0.4462]]; break;
		case 'Little Common': mBounds = [[50.8501, 0.4424], [50.8399, 0.4244]]; break;
		case 'Old Town': mBounds = [[50.8484, 0.4841], [50.8419, 0.4706]]; break;
		case 'Pebsham': mBounds = [[50.8589, 0.5140], [50.8472, 0.4882]]; break;
		case 'Sidley': mBounds = [[50.8607, 0.4833], [50.8509, 0.4610]]; break;
	}
	if (mBounds) map.flyToBounds(L.latLngBounds(mBounds));
});

var geoMarker, rQuery = false;
function reverseQuery (e) {
	// get location, look up id on nominatim and pass it to overpass
	$('#spinner').show();
	var geocoder = L.Control.Geocoder.nominatim();
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function (results) {
		geoMarker = results[0];
		if (geoMarker) {
			if ($('#inputDebug').is(':checked')) console.debug(geoMarker);
			clear_map();
			rQuery = true;
			show_overpass_layer(geoMarker.properties.osm_type + '(' + geoMarker.properties.osm_id + ');');
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
$('#tourPrev').click(function () {
	if ($('#tourList option:selected').prev().is(':enabled')) {
		$('#tourList option:selected').prev().prop('selected', 'selected');
		$('#tourList').trigger('change');
	}
});
$('#tourList').change(function () {
	var tourNum = $(this).val();
	if (tourNum.length === 1) tourNum = '0' + tourNum;
	$('#tourLoading').html('Loading...');
	$('#tourFrame')
		.hide()
		.attr('src', 'tour/tour' + tourNum + '/index.html')
		.one('load', function() {
			$('#tourLoading').empty();
			$(this).fadeIn();
		});
});

// https://github.com/Leaflet/Leaflet
var iconLayer = new L.LayerGroup(), imageOverlay = new L.featureGroup();
map.addLayer(iconLayer).addLayer(imageOverlay);
// leaflet icon image path
L.Icon.Default.imagePath = 'assets/img/leaflet/';
// quadkey layers
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
var attribution = '&copy; <a href="https://openstreetmap.org/copyright" title="Copyright and License" target="_blank">OpenStreetMap contributors</a>';
var tileBaseLayer = {
	bosm: {
		name: 'Bexhill-OSM',
		url: 'https://{s}.tiles.mapbox.com/v4/drmx.fa383e0e/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: attribution + ', <a href="https://mapbox.com/" target="_blank">MapBox</a>',
		maxNativeZoom: 20
	},
	osmstd: {
		name: 'OpenStreetMap',
		url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		maxNativeZoom: 19
	},
/*	
	osmuk: {
		name: 'OpenStreetMap UK',
		url: 'https://map.atownsend.org.uk/hot/{z}/{x}/{y}.png',
		maxNativeZoom: 20
	},
*/	
	antique: {
		name: 'Pirate',
		url: 'https://{s}.tiles.mapbox.com/v4/lrqdo.me2bng9n/{z}/{x}/{y}.png?access_token=' + mapboxKey,
		attribution: attribution + ', <a href="https://github.com/ajashton/pirate-map" target="_blank">AJ Ashton</a>',
		maxNativeZoom: 20
	},
	cycle: {
		name: 'OpenCycleMap',
		url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: attribution + ', <a href="https://thunderforest.com/maps/opencyclemap/" target="_blank">ThunderForest</a>',
		maxNativeZoom: 20
	},
	trnsprt: {
		name: 'Public Transport',
		url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: attribution + ', <a href="https://thunderforest.com/maps/transport/" target="_blank">ThunderForest</a>',
		maxNativeZoom: 20
	},
	matlas: {
		name: 'Mobile Atlas',
		url: 'https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=' + thuforKey,
		attribution: attribution + ', <a href="https://thunderforest.com/maps/mobile-atlas/" target="_blank">ThunderForest</a>',
		maxNativeZoom: 20
	},
	bing: {
		name: 'Bing Satellite',
		url: 'https://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
		attribution: '<a href="https://maps.bing.com/" target="_blank">Microsoft Bing</a>',
		subdomains: '0123',
		maxNativeZoom: 19,
		quadkey: true,
		errorTileUrl: 'https://ecn.t0.tiles.virtualearth.net/tiles/a1202020223330?g=737&n=z'
	}
};
var tileBaseLayers = {}, baseTileList = {name: [], keyname: []};
for (var tile in tileBaseLayer) {
	var subdomains = tileBaseLayer[tile].subdomains ? tileBaseLayer[tile].subdomains : 'abc';
	var tileAttribution = (tileBaseLayer[tile].attribution) ? tileBaseLayer[tile].attribution : attribution;
	var options = {
		attribution: tileAttribution,
		subdomains: subdomains,
		maxZoom: 20,
		maxNativeZoom: tileBaseLayer[tile].maxNativeZoom,
		errorTileUrl: tileBaseLayer[tile].errorTileUrl
	};
	if (tileBaseLayer[tile].quadkey) tileBaseLayers[tileBaseLayer[tile].name] = new L.TileLayer.QuadKeyTileLayer(tileBaseLayer[tile].url, options);
	else tileBaseLayers[tileBaseLayer[tile].name] = L.tileLayer(tileBaseLayer[tile].url, options);
	// create object array for all basemap layers
	baseTileList.name.push(tileBaseLayer[tile].name);
	baseTileList.keyname.push(tile);
}
// overlays
var tileOverlayLayer = {
	hshade: {
		name: 'Hillshading',
		url: 'https://korona.geog.uni-heidelberg.de/tiles/asterh/x={x}&y={y}&z={z}',
		attribution: '<a href="http://giscience.uni-hd.de/" target="_blank">GIScience Heidelberg</a>',
		maxNativeZoom: 18
	},
	lidar: {
		name: 'Lidar DTM 2m',
		url: 'http://www.geostore.com/OGC/OGCInterface;jsessionid=n2RNMRjfFYYfK0rb70ny36PN?SESSIONID=1356990971&INTERFACE=ENVIRONMENT',
		wms: {
			layers: 'LIDAR-DTM-TSR-2M-ENGLAND-EA-WMS',
			format: 'image/png',
			transparent: true,
			uppercase: true
		},
		attribution: '<a href="https://www.gov.uk/government/organisations/environment-agency/" target="_blank">Environment Agency</a>',
		opacity: 0.8
		
	},
	prow: {
		name: 'Rights of Way',
		url: 'http://inspire.misoportal.com:80/geoserver/east_sussex_county_council_east_sussex_rights_of_way/ows?resid=8886ba7d-a785-470d-be18-3e425',
		wms: {
			layers: 'east_sussex_county_council_east_sussex_rights_of_way',
			format: 'image/png',
			transparent: true
		},
		attribution: '<a href="https://www.eastsussex.gov.uk/leisureandtourism/countryside/rightsofway/" target="_blank">East Sussex County Council</a>',
		maxNativeZoom: 18
	},
/*	
	landreg: {
		name: 'Land registry',
		url: 'http://inspire.landregistry.gov.uk/inspire/ows',
		wms: {
			layers: 'inspire:CP.CadastralParcel',
			format: 'image/png',
			transparent: true
		}
	},
*/
	br1959: {
		name: '1959 British Rail',
		url: 'assets/maptiles/br1959/{q}.png',
		attribution: '<a href="http://car57.zenfolio.com/" target="_blank">Michael Pannell</a>',
		bounds: L.latLngBounds([50.83722, 0.45732], [50.8907, 0.5134]),
		maxNativeZoom: 19,
		quadkey: true
	},
	os1955: {
		name: '1955 Ordnance Survey',
		url: 'https://geo.nls.uk/mapdata3/os/ldn_tile/{z}/{x}/{y}.png',
		attribution: '<a href="http://maps.nls.uk/projects/api/" target="_blank">NLS Maps API</a>',
		bounds: LBounds,
		maxNativeZoom: 19
	},
/*
	ob1944: {
		name: '1944 Observer Bomb Map',
		url: 'assets/maptiles/ob1944/{q}.png',
		bounds: L.latLngBounds([50.826, 0.411], [50.878, 0.508]),
		maxNativeZoom: 16,
		quadkey: true
	},
*/
	os1909: {
		name: '1909 Ordnance Survey',
		url: 'assets/maptiles/os1909/{z}/{x}/{y}.png',
		attribution: '<a href="http://maps.nls.uk/projects/api/" target="_blank">NLS Maps API</a>',
		bounds: L.latLngBounds([50.819, 0.379], [50.848, 0.517]),
		minZoom: 13,
		minNativeZoom: 14,
		maxNativeZoom: 18
	},
	os1899: {
		name: '1899 Ordnance Survey',
		url: 'assets/maptiles/os1899/{z}/{x}/{y}.jpg',
		attribution: '<a href="http://maps.nls.uk/projects/api/" target="_blank">NLS Maps API</a>',
		bounds: LBounds,
		maxNativeZoom: 17
	},
	bt1839: {
		name: '1839 Bexhill Tithe',
		url: 'assets/maptiles/bt1839/{q}.png',
		attribution: '<a href="https://apps.eastsussex.gov.uk/leisureandtourism/localandfamilyhistory/tithemaps/MapDetail.aspx?ID=112769" target="_blank">East Sussex County Council TDE141</a>',
		bounds: L.latLngBounds([50.815, 0.351], [50.890, 0.536]),
		maxNativeZoom: 17,
		quadkey: true
	},
	yg1778: {
		name: '1778 Yeakell & Gardner',
		url: 'assets/maptiles/yg1778/{q}.png',
		attribution: '<a href="http://www.envf.port.ac.uk/geo/research/historical/webmap/sussexmap/" target="_blank">University of Portsmouth</a>',
		bounds: L.latLngBounds([50.810, 0.320], [50.890, 0.631]),
		maxNativeZoom: 15,
		quadkey: true
	}
};
var tileOverlayLayers = {}, overlayTileList = {name: [], keyname: []};
for (var tile in tileOverlayLayer) {
	var subdomains = tileOverlayLayer[tile].subdomains ? tileOverlayLayer[tile].subdomains : 'abc';
	var tms = tileOverlayLayer[tile].tms ? tileOverlayLayer[tile].tms : false;
	var opacity = tileOverlayLayer[tile].opacity ? tileOverlayLayer[tile].opacity : 1;
	var minZoom = tileOverlayLayer[tile].minZoom ? tileOverlayLayer[tile].minZoom : 0;
	var maxZoom = tileOverlayLayer[tile].maxZoom ? tileOverlayLayer[tile].maxZoom : 20;
	var options = {
		attribution: tileOverlayLayer[tile].attribution,
		tms: tms,
		subdomains: subdomains,
		bounds: tileOverlayLayer[tile].bounds,
		opacity: opacity,
		maxZoom: maxZoom,
		minZoom: minZoom,
		maxNativeZoom: tileOverlayLayer[tile].maxNativeZoom,
		minNativeZoom: tileOverlayLayer[tile].minNativeZoom
	};
	if (tileOverlayLayer[tile].quadkey) tileOverlayLayers[tileOverlayLayer[tile].name] = new L.TileLayer.QuadKeyTileLayer(tileOverlayLayer[tile].url, options);
	else if (tileOverlayLayer[tile].wms) tileOverlayLayers[tileOverlayLayer[tile].name] = L.tileLayer.wms(tileOverlayLayer[tile].url, $.extend(tileOverlayLayer[tile].wms, options));
	else tileOverlayLayers[tileOverlayLayer[tile].name] = L.tileLayer(tileOverlayLayer[tile].url, options);
	// create object array for all overlay layers
	overlayTileList.name.push(tileOverlayLayer[tile].name);
	overlayTileList.keyname.push(tile);
}
L.control.layers(tileBaseLayers, tileOverlayLayers).addTo(map);

// full screen button
L.easyButton({
	id: 'btnFullscr',
	states: [{
		icon: 'fas fa-expand',
		title: 'Full screen (alt-enter)',
		onClick: function () {
			if (document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen) {
				var cFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
				cFS.call(document);
			}
			else {
				var viewer = $('html')[0];
				var rFS = viewer.requestFullScreen || viewer.webkitRequestFullscreen  || viewer.mozRequestFullScreen || viewer.msRequestFullscreen;
				rFS.call(viewer);
			}
		}
	}]
}).addTo(map);

// permalink button
L.easyButton({
	id: 'btnPermalink',
	states: [{
		icon: 'fas fa-share-square',
		title: 'Share',
		onClick: function () {
			if ($('#modalPermalink').is(':hidden')) {
				var uri = URI(window.location.href);
				var selectedPois = '', walkCoords = '', settingChk, tourPage, c;
				var walkWayp = routingControl.getWaypoints();
				if (actTab === defTab) actTab = undefined;
				if (actBaseTileLayer === defBaseTileLayer) actBaseTileLayer = undefined;
				if (walkWayp[0].latLng && walkWayp[1].latLng) {
					for (c in walkWayp) {
						walkCoords += Math.round(walkWayp[c].latLng.lat * 100000) / 100000 + 'x' + Math.round(walkWayp[c].latLng.lng * 100000) / 100000 + '_';
					}
				}
				else if (walkWayp[0].latLng) walkCoords = Math.round(walkWayp[0].latLng.lat * 100000) / 100000 + 'x' + Math.round(walkWayp[0].latLng.lng * 100000) / 100000 + '_';
				walkCoords = walkCoords ? walkCoords.slice(0, -1) : undefined;
				if (actTab === 'tour' && $('#tourList option:selected').val() > 0) tourPage = $('#tourList option:selected').val();
				$('.poi-icons input.poi-checkbox:checked').each(function (i, element) { selectedPois += element.dataset.key + '-'; });
				selectedPois = selectedPois ? selectedPois.slice(0, -1) : undefined;
				if ($('#settings input:checkbox:checked').not('#inputDebug').length) {
					settingChk = '';
					for (c = 0; c < $('#settings input:checkbox').not('#inputDebug').length; c++) {
						settingChk += $('#settings input:checkbox').eq(c).is(':checked') ? '1' : '0';
					}
				}
				// M = basemap, O = overlay, S = settings, T = tab, U = tour frame, G = image layer, P = grouped pois, I = single poi, W = walkpoints
				uri.query({ 'M': actBaseTileLayer, 'O': actOverlayLayer, 'S': settingChk, 'T': actTab, 'U': tourPage, 'G': imgLayer, 'P': selectedPois, 'I': markerId, 'W': walkCoords });
				setTimeout(function () {
					$('#btnCopyPermalink').html('<i class="fas fa-copy"></i> Copy');
					$('#modalPermalink').show(200);
					$('#inputPermalink').val(uri.href()).click();
				});
			}
			else $('#modalPermalink').hide(200);
		}
	}]
}).addTo(map);
function copyPermalink() {
	$('#inputPermalink').select();
    var successful = document.execCommand('copy');
	if (successful) {
		$('#btnCopyPermalink').html('<i class="fas fa-check"></i> Copied to clipboard');
		setTimeout(function () { $('#modalPermalink').hide(200); }, 1000);
	}
	else $('#btnCopyPermalink').html('<i class="fas fa-times"></i> Please copy manually');
}

// https://github.com/domoritz/leaflet-locatecontrol
var lc = L.control.locate({
	icon: 'fas fa-location-arrow',
	iconLoading: 'fas fa-spinner fa-pulse',
	setView: true,
	flyTo: true,
	keepCurrentZoomLevel: true,
	metric: false,
	showPopup: true,
	circleStyle: { interactive: false },
	strings: {
		title: 'Show your location',
		popup: '<br><p style="margin:0; text-align:center;"><a onclick="userLoc();">What is around me?</a></p>'
	},
	locateOptions: {
		enableHighAccuracy: false
	},
	onLocationError: function () {
		alert('Sorry, there was an error while trying to locate you.');
	},
	onLocationOutsideMapBounds: function () {
		alert('You appear to be located outside the Bexhill area.\nCome visit! :)');
		lc.stop();
	}
}).addTo(map);
// show pois within a radius
function userLoc() {
	map.closePopup();
	clear_map();
	show_overpass_layer('(node(around:100,' + lc._event.latlng.lat + ',' + lc._event.latlng.lng + ');way(around:100,' + lc._event.latlng.lat + ',' + lc._event.latlng.lng + '););');
}

// https://github.com/perliedman/leaflet-control-geocoder
var geocode = L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north],
			email: email
		}
	}),
	expand: 'click',
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft',
	placeholder: 'Type address or place name...'
}).on('markgeocode', function (e) {
	// pass nominatim address query to overpass
	clear_map();
	rQuery = true;
	geoMarker = e.geocode;
	if ($('#inputDebug').is(':checked')) console.debug(geoMarker);
	if (map.getZoom() <= minOpZoom && $('#inputRange').is(':checked')) map.setZoom(minOpZoom, { animate: false });
	show_overpass_layer(geoMarker.properties.osm_type + '(' + geoMarker.properties.osm_id + ');');
	$('.leaflet-control-geocoder-form input').blur();
}).addTo(map);
$('.leaflet-control-geocoder-icon').html('<i class="fas fa-search"></i>').attr('title','Address search (ctrl-f)');


// switches to a tab and an optional link to tour or anchor
function switchTab(tab, anchor) {
	if (tab !== actTab) $('a[href="#' + tab + '"]').click();
	$('#' + tab + ' .sidebar-body').scrollTop(0);
	if (anchor) {
		if (tab === 'tour') $('#tourList').val(anchor).trigger('change');
		else $('a[href="#goto' + anchor + '"]').click();
	}
}

// clear map button
L.easyButton({
	id: 'btnClearmap',
	states: [{
		icon: 'fas fa-trash',
		title: 'Clear map (ctrl-del)',
		onClick: function () {
			// clear walk points, collapse suggested walks, clear poi marker layers
			routingControl.setWaypoints([]);
			clear_map();
		}
	}]
}).addTo(map);
// full reload on right click
$('#btnClearmap').bind('contextmenu', function () {
	$(location).attr('href', window.location.pathname);
	return false;
});

// fly the map to the bounds of markers
function getMarkerBounds() {
	if ($(window).width() < 768) sidebar.close();
	map.flyToBounds(L.featureGroup(poiList).getBounds().pad(0.2));
}

// https://github.com/Turbo87/sidebar-v2/
var sidebar = $('#sidebar').sidebar();

// https://github.com/mlevans/leaflet-hash
new L.Hash(map);

// https://github.com/ebrelsford/Leaflet.loading
var loadingControl = L.Control.loading({ separate: true });
map.addControl(loadingControl);

// https://github.com/perliedman/leaflet-routing-machine
var routingControl;
function setRoutingControl(units) {
	routingControl = L.Routing.control({
		units: units,
		collapsible: false,
		fitSelectedRoutes: false,
		reverseWaypoints: true,
		routeWhileDragging: false,
		showAlternatives: false,
		router: L.Routing.mapbox(mapboxKey, {
			profile: 'mapbox/walking'
		}),
		lineOptions: {
			styles: [{
				color: 'darkgreen',
				opacity: 0.6,
				weight: 5
			}]
		},
		pointMarkerStyle: {
			radius: 8,
			color: 'darkgreen',
			opacity: 0.6,
			fillColor:'white',
			fillOpacity:0.4
		},
		geocoder: L.Control.Geocoder.nominatim({
			geocodingQueryParams: {
				bounded: 1,
				viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north]
			}
		})
	});
	$('#routingControl').html(routingControl.onAdd(map));
}

function populatePoiTab() {
	var poiTags = {}, category = [], categoryList = [], t, c;
	for (var poi in pois) {
		if (pois[poi].catName && pois[poi].tagKeyword) {
			// get all keywords and put into categories
			poiTags[poi] = pois[poi].tagKeyword;
			category.push({ listLocation: poi, header: '<img src="assets/img/icons/' + pois[poi].iconName + '.png">' + pois[poi].catName + ' - ' + pois[poi].name });
			// get unique category label for poi checkbox tab
			if (categoryList.indexOf(pois[poi].catName) === -1) categoryList.push(pois[poi].catName);
		}
	}
	// https://github.com/pawelczak/EasyAutocomplete
	var options = {
		data: poiTags,
		minCharNumber: 3,
		list: {
			maxNumberOfElements: 10,
			match: { enabled: true },
			onChooseEvent: function () {
				// find selected items category and split it to get checkbox, then display
				var catSplit = $('.eac-category')[$('#autocomplete').getSelectedItemIndex()].textContent.split(' - ')[1];
				clear_map();
				$('a[href="#pois"]').click();
				$('.poi-icons input[id="' + catSplit + '"]').prop('checked', true);
				// scroll to checkbox
				if ($(window).width() >= 768) {
					$('.poi-icons')
						.scrollTop(0)
						.scrollTop($('.poi-icons input[id="' + catSplit + '"]').parent().position().top - 50);
				}
				poi_changed();
				$('#autocomplete').val('');
			}
		},
		categories: category
	};
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
							'<input type="checkbox" class="poi-checkbox" id="{name}" data-key="{key}" onclick="poi_changed(&#39;{key}&#39;)"><span>{name}</span>' +
						'</label>' +
					'</div></td>',
					{ key: poi, name: pois[poi].name, icon: pois[poi].iconName }
				);
				t++;
				if (t % 2 === 0) checkboxContent += '</tr>';
			}
		}
		checkboxContent += '</table>';
		checkboxContent += '<div class="anchor"><a href="#gototoppois" title="Back to top">| <i class="fas fa-arrow-up"></i> |</a></div>';
	}
	$('.poi-icons').append(checkboxContent);
}
populatePoiTab();

$(':text').on('focus', function () { $(this).select(); });

// keyboard shortcuts
$('#map').keydown(function (e) {
	// ALT-ENTER: full screen
	if (e.keyCode === $.ui.keyCode.ENTER && e.altKey) {
		$('#btnFullscr').click();
		e.preventDefault();
	}
	// CTRL-F: address search
	else if (e.keyCode === 70 && e.ctrlKey) {
		$('.leaflet-control-geocoder-icon').click();
		e.preventDefault();
	}
	// CTRL-DEL: clear all layers
	else if (e.keyCode === $.ui.keyCode.DELETE && e.ctrlKey) {
		$('#btnClearmap').click();
		e.preventDefault();
	}
});

// if user presses ENTER instead of selecting a category, do an address search with the value
$('#autocomplete').keydown(function (e) {
	if (e.keyCode === $.ui.keyCode.ENTER && $(this).val() && !$('#eac-container-autocomplete ul').is(':visible')) {
		if ($(window).width() < 768) sidebar.close();
		$('.leaflet-control-geocoder-icon').click();
		$('.leaflet-control-geocoder-form input').val($(this).val());
		geocode._geocode();
	}
});

// change unit of measurement
var scaleControl;
$('#inputUnit').change(function () {
	if (routingControl) $('#btnClearmap').click();
	if ($(this).is(':checked')) {
		if (scaleControl) scaleControl.remove();
		scaleControl = L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);
		setRoutingControl('metric');
	}
	else {
		if (scaleControl) scaleControl.remove();
		scaleControl = L.control.scale({ metric: false, position: 'bottomright' }).addTo(map);
		setRoutingControl('imperial');
	}
});

// developer tools
$('#devTools').accordion({
	heightStyle: 'content',
	collapsible: true,
	active: false
});
$('#inputDebug').change(function () {
	if ($(this).is(':checked')) {
		$('#inputOverpass, #inputOpServer').prop('disabled', false);
		map.setMaxBounds();
	}
	else {
		$('#inputOverpass, #inputOpServer').prop('disabled', true);
		map.setMaxBounds(LBounds.pad(0.1));
	}
});
$('#inputDebug').trigger('change');
$('#inputOverpass').keydown(function (e) {
	if (e.keyCode == $.ui.keyCode.ENTER && $(this).val()) {
		clear_map();
		show_overpass_layer('(node' + $(this).val() + ';' + 'way' + $(this).val() + ';' + 'relation' + $(this).val() + ';);');
	}
});

// clear poi marker and overlay layers
function clear_map() {
	imageOverlay.clearLayers();
	imgLayer = undefined;
	$('.poi-icons .poi-checkbox input:checked').prop('checked', false);
	poi_changed();
	spinner = 0;
	$('#spinner').fadeOut('fast');
	$('.poi-checkbox').removeClass('poi-loading');
	$('#modalPermalink').hide(200);
}

function poi_changed(newcheckbox) {
	// limit number of active checkboxes
	if ($('.poi-icons .poi-checkbox input:checked').length <= 3) {
		// remove old poi markers and results
		iconLayer.clearLayers();
		map.removeLayer(areaOutline);
		poiList = [];
		markerId = undefined;
		if ($('.poi-icons .poi-checkbox input:checked').length) {
			$('.poi-results h3').html('Results loading...');
			//build overpass query
			var query = '(';
			$('.poi-icons .poi-checkbox input:checked').each(function (i, element) {
				var poiKey = pois[element.dataset.key].query;
				if (poiKey.indexOf('relation') === 0 || poiKey.indexOf('node') === 0 || poiKey.indexOf('way') === 0) query += poiKey + ';';
				else query += 'node' + poiKey + ';way' + poiKey + ';';
			});
			query += ');';
			show_overpass_layer(query);
		}
		else {
			spinner = 0;
			$('#spinner').fadeOut('fast');
			$('.poi-results h3').html('Results cleared.');
			$('.poi-results').css('height', '').hide([]);
		}
		$('.poi-results-list').empty();
	}
	else $('[data-key=' + newcheckbox + ']').prop('checked', false);
	$('.poi-icons .poi-checkbox input').trigger('change');
}
// checkbox highlight
$('.poi-icons .poi-checkbox input').change(function () {
	if ($(this).prop('checked') === true) $(this).parent().addClass('poi-checkbox-selected');
	else $(this).parent().removeClass('poi-checkbox-selected');
});

// suggested walk waypoints
function suggestWalk(walkName) {
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
			show_overpass_layer('(node["ref"~"^TMT"];node(5059264455);node(5059264456););');
			map.flyTo([50.8385, 0.4787], 16);
			break;
		case 'highwoods':
			routingControl.setWaypoints([
				[50.84536, 0.43353],
				[50.84958, 0.42689],
				[50.86120, 0.42984]
			]);
			map.flyTo([50.8533, 0.4289], 15);
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
function permalinkReturn() {
	// M = basemap, O = overlay, S = settings, T = tab, U = tour frame, G = image layer, P = grouped pois, I = single poi, Q = geocode query, W = walkpoints
	var uri = URI(window.location.href), c;
	if (uri.hasQuery('M') && tileBaseLayer[uri.search(true).M]) actBaseTileLayer = uri.search(true).M;
	if (uri.hasQuery('O') && tileOverlayLayer[uri.search(true).O]) actOverlayLayer = uri.search(true).O;
	if (uri.hasQuery('S')) {
		var settingChk = uri.search(true).S;
		for (c = 0; c < settingChk.length; c++) {
			$('#settings input:checkbox').eq(c).prop('checked', parseInt(settingChk.charAt(c), 10));
		}
		if ($('#inputDebug').is(':checked')) $('#inputDebug').trigger('change');
	}
	// set up measurement units
	$('#inputUnit').trigger('change');
	if (uri.hasQuery('T')) actTab = uri.search(true).T;
	if (uri.hasQuery('U')) {
		var tourNum = uri.search(true).U;
		if ($('#tourList option[value=' + tourNum + ']').length && !$('#tourList option[value=' + tourNum + ']')[0].disabled)
			$('#tourList').val(tourNum).trigger('change');
	}
	if (uri.hasQuery('G')) tour(uri.search(true).G);
	if (uri.hasQuery('W')) {
		var walkPoints = uri.search(true).W;
		walkPoints = walkPoints.split('_');
		for (c in walkPoints) {
			walkPoints[c] = walkPoints[c].replace('x', ', ');
			routingControl.spliceWaypoints(c, 1, JSON.parse('[' + walkPoints[c] + ']'));
		}
	}
	if (uri.hasQuery('P')) {
		var groupedPoi = uri.search(true).P;
		if (groupedPoi.indexOf('-') !== -1) groupedPoi = groupedPoi.split('-');
		if (!$.isArray(groupedPoi)) {
			$('.poi-icons input[data-key=' + groupedPoi + ']').prop('checked', true);
			// scroll to checkbox
			if (actTab !== 'none') {
				sidebar.open(actTab);
				// add delay after load for sidebar to animate open, allows for scroll position
				setTimeout(function () {
					$('.poi-icons')
						.scrollTop(0)
						.scrollTop($('.poi-icons input[data-key="' + groupedPoi + '"]').parent().position().top - 50);
				}, 500);
			}
		}
		else {
			for (c in groupedPoi) {
				// the last poi has a "/" on it because leaflet-hash
				var multiplePois = groupedPoi[c].replace('/', '');
				$('.poi-icons input[data-key=' + multiplePois + ']').prop('checked', true);
				if (actTab !== 'none') sidebar.open(actTab);
			}
		}
		poi_changed();
	}
	else if (uri.hasQuery('I')) {
		var type, id;
		var singlePoi = uri.search(true).I;
		rQuery = true;
		switch (singlePoi.slice(0, 1)) {
			case 'n': type = 'node'; break;
			case 'w': type = 'way'; break;
			case 'r': type = 'relation'; break;
		}
		id = singlePoi.slice(1);
		show_overpass_layer(type + '(' + id + ');');
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
}
permalinkReturn();

// show random tip
function getTips() {
	var tips = [
		'Areas to the west are currently a work-in-progress.',
		'Click an area of the minimap to quickly zoom to that location.',
		'You can zoom-in and middle-click almost any building to see its details.',
		'Find any address by entering part of it into search <i class="fas fa-search fa-sm"></i> and pressing enter.',
		'Almost street in Bexhill has a history behind its name, search <i class="fas fa-search fa-sm"></i> for a road to learn more.',
		'Turn on your location to see POIs ordered by distance.',
		'Choose between miles or kilometres in the <a onclick="switchTab(&quot;settings&quot;);">Settings tab</a>.',
		'Click <i class="fas fa-trash fa-sm"></i> button to clear all layers from the map, right-clicking resets the map to defaults.',
		'You can share/bookmark anything you find by clicking <i class="fas fa-share-square fa-sm"></i> button and copying the text.',
		'Touch screen users can quickly close the sidebar by swiping the sidebar title.',
		'See your what POIs are around you by turning on location and clicking on your blue marker.',
		'Quickly create walking directions by turning on your location and right-clicking the map.',
		'We have a number of historical map overlays, select them using the top-right layer control.',
		'Colours in POI results indicate if that place is currently open (green) or closed (red).',
		'You can find booking, location and ratings on all accommodation under  <a onclick="switchTab(&quot;pois&quot;, &quot;Leisure-Tourism&quot;);">Leisure-Tourism</a>.',
		'Get the latest food hygiene ratings on every food business in the area under <a onclick="switchTab(&quot;pois&quot;, &quot;Amenities&quot;);">Amenities</a>.',
		'Find your closest recycling container and the materials it recycles under <a onclick="switchTab(&quot;pois&quot;, &quot;Amenities&quot;);">Amenities</a>.',
		'Have a look at the WW2 bomb-map over in the <a onclick="switchTab(&quot;tour&quot;, 9);">Historic Tour</a> section.',
		'Notice something wrong or missing on the map? Right-click the area and leave a note.',
		'Over 300 photos, 16,000 buildings + 200 miles of roads/paths within 15 miles&sup2; have been mapped thus far!',
		'The data behind Bexhill-OSM is completely open and free to use for anyone however they wish!',
		'For a mobile, offline version of this map - give Maps.Me a try.',
		'Anyone can help with building the map, visit OpenStreetMap.org on how to get started.'
	];
	$('#tips').html('Tip: ' + tips[Math.floor(Math.random()*tips.length)]);
}

// https://github.com/enginkizil/FeedEk
function showMapEditsRss() {
	// use map bounds and add date as a 1 hour cache-buster
	// feeds - zverik.osm.rambler.ru / simon04.dev.openstreetmap.org
	var feedUrl = 'http://simon04.dev.openstreetmap.org/whodidit/scripts/rss.php?bbox=' + mapBounds.west + ',' + mapBounds.south + ',' + mapBounds.east + ',' + mapBounds.north +
		'&r=' + new Date().getDate() + '' + new Date().getHours();
	var YQLstr = 'SELECT channel.item FROM feednormalizer WHERE output="rss_2.0" AND url="' + feedUrl + '" LIMIT 4';
	$.ajax({
		url: 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(YQLstr) + '&format=json&diagnostics=' + $('#inputDebug').is(':checked'),
		dataType: 'json',
		success: function (data) {
			if (data.query.count) {
				var s = '', t, u;
				$('#feedRss').empty();
				if (!(data.query.results.rss instanceof Array)) {
					data.query.results.rss = [data.query.results.rss];
				}
				$.each(data.query.results.rss, function (e, itm) {
					t = itm.channel.item.title.split('changeset: ');
					u = t[0].split('User ')[1].split(' has uploaded')[0];
					s += '<li><span class="fa-li"><i class="fas fa-sync"></i></span><a href="' + itm.channel.item.link + '" target="_blank" title="View changeset on OpenStreetMap"><i>' + t[1].substring(1, t[1].length - 1) + '</i></a>' +
					' - <a href="https://www.openstreetmap.org/user/' + u + '" target="_blank" title="View user on OpenStreetMap">' + u + '</a>' +
					' - ' + date_parser(itm.channel.item.date.split('T')[0], 'short') + '</span></li>';
				});
				$('#feedRss').append('Latest map edits:<ul class="fa-ul">' + s + '</ul><p><hr>');
			}
			else if ($('#inputDebug').is(':checked')) console.debug('ERROR: ' + data.query.meta.url.status + ' - ' + this.url);
		}
	});
}

tileBaseLayers[tileBaseLayer[actBaseTileLayer].name].addTo(map);
if (actOverlayLayer) tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].addTo(map);
