// all main functions for site

// don't forget to create config.js with your api keys
if (typeof window.BOSM === 'undefined') window.alert('Error: No API keys defined, please see config.example.js');
// map area
const osmRelation = '12710197'; // osm relation for area id overpass queries, if blank bbox (mapBounds) will be used
const mapBounds = { south: 50.8020, west: 0.3720, north: 50.8780, east: 0.5250 };
const LBounds = L.latLngBounds([mapBounds.south, mapBounds.west], [mapBounds.north, mapBounds.east]);
const mapMinZoom = 10;
// map open location
const mapCentre = [50.8470, 0.4675];
const mapZoom = ($(window).width() < 768) ? 13 : 14;
// default map layers
const defBaseTileLayer = 'osmstd';
let actBaseTileLayer = defBaseTileLayer, actOverlayLayer;
// default tab to open
const defTab = 'home';
let actTab = ($(window).width() < 768) ? 'none' : defTab;
// set image width inside popups
const imgSize = ($(window).width() < 512) ? 256 : 310;
// maximum poi groups that can be selected
const maxPOICheckbox = 3;
// maximum overpass poi results
let maxOpResults = 250;
// maximum nominatim search results
const maxNomResults = 5;
// website checks
const noTouch = !L.Browser.mobile;
const noIframe = window.top === window.self;
let noPermalink = !new URL(window.location.href).searchParams.toString() || new URL(window.location.href).searchParams.toString() === 'T=none';
// title tag tooltip defaults
const tooltipDef = {
	disabled: noTouch ? false : true,
	hide: false,
	show: { delay: 200, duration: 50 },
	track: true,
	position: { my: 'left+15 top+10' },
	create: function() { $('.ui-helper-hidden-accessible').remove(); }
};
// local
const interactDesc = noTouch ? [ 'click', 'clicking', 'right-click', 'scroll-wheel'] : [ 'tap', 'tapping', 'long-press', 'swipe'];
const email = 'info' + String.fromCharCode(64) + 'bexhill-osm.org.uk';
const lang = $('html').attr('lang');
const version = $('script').last().attr('src').split('v=')[1];

// https://web.archive.org/web/20210325170940/https://fancyapps.com/fancybox/3/docs/
// show popup images in a lightbox
$.extend($.fancybox.defaults, {
	spinnerTpl: '<div class="spinner" style="left:0;" title="Loading...">' + $('.spinner').html() + '</div>',
	btnTpl: {
		slideShow: '<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"><i class="fa-solid fa-circle-play fa-2x"></i><i class="fa-solid fa-circle-pause fa-2x"></i></button>',
		close: '<button data-fancybox-close class="fancybox-button fancybox-close" title="{{CLOSE}}"><i class="fa-solid fa-times-circle fa-2x"></i></button>',
		arrowLeft: '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><i class="fa-solid fa-square-caret-left fa-2x"></i></button>',
		arrowRight: '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><i class="fa-solid fa-square-caret-right fa-2x"></i></button>'
	},
	idleTime: false,
	hash: false,
	loop: true,
	transitionEffect: 'slide',
	transitionDuration: 500,
	animationDuration: 500,
	mobile: {
		clickContent: false,
		clickSlide: 'close',
		dblclickContent: function(current) { return current.type === 'image' ? 'zoom' : false; }
	},
	slideShow: { speed: 4000 },
	opts: { iframe: { preload: true } }
});

// set swipe triggers for touch devices
// close sidebar
$('.sidebar-header').on('swipeleft', function() { $('.sidebar-close:visible').trigger('click'); });
// prev/next tour iframe
$('#tour-controls')
	.on('swiperight', function() { $('#tour-controls-prev').trigger('click'); })
	.on('swipeleft', function() { $('#tour-controls-next').trigger('click'); })
	.on('wheel', function(e) {
		if (e.originalEvent.deltaY > 0) $('#tour-controls-next').trigger('click');
		else if (e.originalEvent.deltaY < 0) $('#tour-controls-prev').trigger('click');
		e.preventDefault();
	});

$('.sidebar-tabs li').on('click', function() {
	// get current sidebar-tab
	actTab = ($('.sidebar.collapsed').length || actTab === 'closing') ? 'none' : $('.sidebar-pane.active').attr('id');
	// resize links on minimap
	if (actTab === 'home') {
		if (!$('#home-weather:visible').length && noIframe) { showWeather(); showEditFeed(); }
		setTimeout(function() { $('#home-minimap > map').imageMapResize(); }, 400);
	}
	if (actTab === 'pois') $('#pois-filter-in').trigger('input');
	if (actTab === 'tour') {
		$('#tour-controls-list').trigger('change');
		$('.sidebar-tabs ul li [href="#tour"] .sidebar-notif:visible').hide();
	}
	if (actTab === 'thennow' && actImgLayer !== 'thennow') tour('thennow', '', false);
	setTimeout(function() { $('.theme-scroll').trigger('scroll'); }, 10);
	// animate map recentre on sidebar open/close, matches sidebar transition-duration of 400ms
	if ($(window).width() >= 768 && $(window).width() < 1024) {
		let x = 0, timer = setInterval(function() {
			map.invalidateSize({ animate: true });
			if (++x === 4) clearInterval(timer);
		}, 100);
	}
	permalinkSet();
});
// no sidebar-tab
$('.sidebar-close').on('click', function() {
	actTab = 'closing';
	$(this).removeClass('fa-fade');
	$('.sidebar-tabs li.active').trigger('click');
});

// ignore map single click in some cases
L.Map.addInitHook(function() {
	let that = this, h;
	if (that.on) {
		that.on('click', check_later);
		that.on('dblclick', function() { setTimeout(clear_h); });
	}
	function check_later(e) {
		clear_h();
		// clear msg status box
		if ($('#modal:visible').length) {
			clickOutline.clearLayers();
			$('#modal').hide();
		}
		// ignore map click if... measuring / low zoom / dragging walk markers / layer-noclick / overlay control is open / spinner is shown / popup is open on screen
		else if (!measure._measuring && (map.getZoom() >= 15 && !$('.leaflet-marker-draggable, .layer-noclick').length && ($('.leaflet-control-layers').outerWidth() <= 44) && !imageOverlay.getLayers().length &&
		 !$('.spinner:visible').length && ($('.leaflet-control-geocoder').width() < 40) && !($('.leaflet-popup').length && map.getBounds().contains(map.layerPointToLatLng($('.leaflet-popup')[0]._leaflet_pos))))) {
			that.fire('visualclick', $.extend(e, { type: 'visualclick' }));
			// drop marker and reverse lookup on single click
			h = setTimeout(function() {
				clickOutline.clearLayers().addLayer(L.circleMarker(e.latlng, {
					className: 'circleMarker',
					radius: 10,
					weight: 2,
					opacity: 1,
					fillOpacity: 0.5,
					interactive: noTouch ? true : false,
					bubblingMouseEvents: false
				}).on('click' , function() {
					if ($('#modal .modal-body-addr').length) $('#modal .modal-body-addr').trigger('click');
				}));
				reverseQuery(e, 1);
			}, 350);
		}
		// highlight action to enable map click again
		else if (!$('.leaflet-popup, .leaflet-control-layers-expanded, .leaflet-marker-draggable, .polyline-measure-controlOnBgColor').length) {
			if (imageOverlay.getLayers().length) $('#control-clearlayers .fa-solid').addClass('fa-beat-fade');
			else if ($('.layer-noclick').length) $('#control-opacity .fa-solid').addClass('fa-beat-fade');
			else if (map.getZoom() < 15) $('.leaflet-control-zoom-in .fa-solid').addClass('fa-beat-fade');
		}
	}
	function clear_h() {
		$('#control-clearlayers .fa-solid, #control-opacity .fa-solid, .leaflet-control-zoom-in .fa-solid').removeClass('fa-beat-fade');
		if (h !== null) {
			clearTimeout(h);
			h = null;
		}
	}
});

// initialise map
const map = new L.map('map', {
	renderer: L.svg(),
	maxBoundsViscosity: 0.9,
	minZoom: mapMinZoom,
	maxZoom: 20,
	bounceAtZoomLimits: false,
	// https://github.com/aratcliffe/Leaflet.contextmenu
	contextmenu: true,
	contextmenuWidth: 140,
	contextmenuItems: [{
		text: '<i class="fa-solid fa-hand-pointer fa-fw"></i> Query feature',
		index: 0,
		callback: reverseQuery
	}, {
		text: '<i class="fa-solid fa-person-walking fa-fw"></i> Walk to here',
		index: 1,
		callback: walkHere
	}, {
		text: '<i class="fa-solid fa-location-dot fa-fw"></i> Add a walk point',
		index: 2,
		callback: walkPoint
	}, {
		text: '<i class="fa-solid fa-crosshairs fa-fw"></i> Centre map here',
		index: 3,
		callback: centreMap
	}, '-', {
		text: '<i class="fa-regular fa-sticky-note fa-fw"></i> Leave a note here',
		index: 4,
		callback: improveMap
	}, {
		text: '<i class="fa-solid fa-wrench fa-fw"></i> FixMyStreet',
		index: 5,
		callback: fixMyStreet
	}, {
		text: '<i class="fa-solid fa-street-view fa-fw"></i> Photosphere view',
		index: 6,
		callback: panoView
	}, '-', {
		text: '<div id="contextmenu-item-copygeos" class="comment" title="Copy to clipboard"></div>',
		index: 7,
		callback: copyGeos
	}]
}).whenReady(function() {
	map.attributionControl.setPrefix('<a onclick="switchTab(\'info\', \'#info-software\');" title="Attribution"><i class="fa-solid fa-circle-info fa-fw"></i></a>');
	if (!noIframe) {
		$('#control-bookmarks').parent().add('.leaflet-control-locate').hide();
		$('#settings-devtools').css('visibility', 'hidden');
		map.attributionControl.addAttribution('<a href="/" target="_blank">Bexhill-OSM</a>');
	}
	if (!localStorageAvail()) $('#settings-cleardata, #control-bookmarks').parent().add('#settings-devtools').hide();
	// sidebar information
	sidebar.fadeIn();
	$('body').removeClass('preload');
	$('.sidebar-tabs, .sidebar-close, .leaflet-bar a, button, #settings-options .settings-label').tooltip(tooltipDef);
	getTips('random');
	if (actTab === defTab && noIframe) { setTimeout(showWeather, 10); showEditFeed(); }
	else $('#home-weather').hide();
	$('footer > span').append(new Date().getFullYear() + ' | <a href="https://github.com/Dr-Mx/bexhill-osm/blob/master/CHANGELOG.md" title="Changelog" target="_blank" rel="noopener">v' + version + '</a>');
	$('#walk-list, #tour-controls-list').trigger('change');
	if (!noTouch) $('#walk-container-pdf a').removeAttr('data-fancybox');
	// metadata badges updated via cronjob.sh
	const dailyCache = '?d=' + new Date().getFullYear() + new Date().getMonth() + new Date().getDate();
	$('#info-about .info-links').append('<br><br>' +
		'<a href="https://www.twitter.com/bexhillosm" target="_blank" rel="noopener" title="Twitter followers"><img src="assets/img/info-twitter.svg' + dailyCache +'" loading="lazy"></a><br>' +
		'<a href="https://www.youtube.com/@bexhillosm" target="_blank" rel="noopener" title="YouTube subscribers"><img src="assets/img/info-youtube.svg' + dailyCache +'" loading="lazy"></a><br><br>' +
		'<a href="https://osm.org/user/Bexhill-OSM" target="_blank" rel="noopener" title="OpenStreetMap edits"><img src="assets/img/info-osm.svg' + dailyCache +'" loading="lazy"></a><br>' +
		'<a href="https://commons.wikimedia.org/wiki/Special:ListFiles?user=Dr-Mx" target="_blank" rel="noopener" title="Wikimedia Commons uploads"><img src="assets/img/info-wikimedia.svg' + dailyCache +'" loading="lazy"></a><br>' +
		'<a href="https://archive.org/details/@dr-mx" target="_blank" rel="noopener" title="Internet Archive uploads"><img src="assets/img/info-archive.svg' + dailyCache +'" loading="lazy"></a>'
	);
	// add overlay opacity slider to layer control
	$('.leaflet-top.leaflet-right').append(
		'<div id="control-opacity" class="leaflet-control leaflet-bar">' +
			'<input type="range" min="0.05" max="1" step="0.05">' +
			'<div class="leaflet-popup-close-button" title="Remove overlay" onclick="map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);"><i class="fa-solid fa-xmark fa-sm"></i></div>' +
		'</div>'
	);
	$('.leaflet-bottom.leaflet-right').prepend('<div id="modal" class="leaflet-control"></div>');
	// back to top button
	$('.sidebar-anchor')
		.hide()
		.attr('title', 'Return to top')
		.on('click', function() {
			$(this).parent().scrollTop(0);
		})
		.parent().on('scroll', function() {
			if ($(this).scrollTop() > 350) $(this).find('.sidebar-anchor').fadeIn(200);
			else $(this).find('.sidebar-anchor').fadeOut(200);
		});
	// scroll shadow
	$('.theme-scroll').on('scroll', function() {
		const scrollPos = Math.abs(this.scrollHeight - this.clientHeight - this.scrollTop);
		const scrollOpacity = scrollPos < 300 ? Math.round(scrollPos / 60) / 10 : 0.5;
		$(this).css('background-image', 'linear-gradient(transparent, rgba(var(--scroll-shadow), ' + scrollOpacity + '))');
	}).trigger('scroll');
	setTimeout(setOverlayLabel, 10);
	// easter holiday decorations
	if (new Date().getMonth() === 3 && new Date().getDate() >= 18 && new Date().getDate() <= 21) $('#home .sidebar-header-text').html($('#home .sidebar-header-text').html().replace('O', '<span title="Happy Easter!">&#x1FABA</span>'));
	// bexhill day holiday decorations
	else if (new Date().getMonth() === 7 && new Date().getDate() === 22) sidebar.append('<img id="holiday-bexhillday" alt="" title="It\'s Bexhill Day!" src="assets/img/holidays/bexhilldaySb.png">');
	// halloween holiday decorations
	else if (new Date().getMonth() === 9 && new Date().getDate() >= 15) $('#home .sidebar-header-text').html($('#home .sidebar-header-text').html().replace('O', '<span title="Happy Halloween!">&#x1F383;</span>'));
	// xmas holiday decorations
	else if ((new Date().getMonth() === 10 && new Date().getDate() >= 30) || new Date().getMonth() === 11) {
		$('html').css({ '--main-color': '#ca3535', '--second-color': '#a23030' });
		// central
		L.imageOverlay('assets/img/holidays/xmasMapTree.svg', [[50.84090, 0.47320], [50.84055, 0.47370]], { className: 'holiday-xmas-tree' }).addTo(map);
		// little common
		L.imageOverlay('assets/img/holidays/xmasMapTree.svg', [[50.84545, 0.43350], [50.84510, 0.43400]], { className: 'holiday-xmas-tree' }).addTo(map);
		// sidley
		L.imageOverlay('assets/img/holidays/xmasMapTree.svg', [[50.85600, 0.47280], [50.85565, 0.47330]], { className: 'holiday-xmas-tree' }).addTo(map);
		// santa hat
		sidebar.append('<img id="holiday-xmas-hat" title="Merry Christmas!" alt="" src="assets/img/holidays/xmasSb.png" tabindex="0">');
		// window competition
		$('#home-box').after('<div id="holiday-xmas-msg" title="Show on map" onclick="tour(\'xmas\');">' +
			'<div id="xmasTitle">~ <span>Christmas Window Display Competition</span> ~</div>' +
			'<div class="comment">2024\'s theme is \'Pantomime\', in association with Bexhill Community Events Group</div>' +
		'</div>');
	}
	// prevent click-through on map controls
	L.DomEvent.disableClickPropagation($('#control-opacity')[0]).disableScrollPropagation($('#control-opacity')[0]);
	L.DomEvent.disableClickPropagation($('#modal')[0]).disableScrollPropagation($('#modal')[0]);
	$('.leaflet-control, .leaflet-popup').on('contextmenu', function(e) { e.stopPropagation(); });
	$('.leaflet-control-geocoder-form').on('click', function(e) { e.stopPropagation(); });
	// refocus status message on mouseover
	$('#modal').on('mouseenter tap', function() { if ($(this).is(':animated')) $(this).stop(true).css('opacity', 1); });
	// add delay after load for sidebar to animate open
	setTimeout(function() {
		$('#home-minimap > map').imageMapResize();
		if ($(window).width() >= 768 && $(window).width() < 1024) map.invalidateSize();
	}, 500);
	// filter poi using keywords
	$('#pois-filter-in').on('input', function() {
		$('.pois-checkbox input').each(function() {
			if ($(this).data('keyword').indexOf($('#pois-filter-in').val().toLowerCase()) != -1 || $(this).parent('.pois-checkbox-selected').length) $(this).parent().parent().show();
			else $(this).parent().parent().hide();
		});
		$('.pois-group').each(function() {
			$(this).show();
			if (!$(this).find('.pois-checkbox:visible').length) $(this).hide();
		});
		$('#pois-filter').css('position', $('#pois-filter-in').val() ? 'sticky' : '');
		$('#pois-icons .comment').html(!$('.pois-group .pois-checkbox:visible').length ? 'No places found.' : 'Make up to ' + maxPOICheckbox + ' selections at a time.');
	});
	$('#pois-filter .leaflet-routing-remove-waypoint').on('click', function() { $('#pois-filter-in').val('').trigger('input'); });
	// set attic data max date
	$('#settings-overpass-attic').prop('max', new Date().toISOString().substring(0,10));
	// clear loading elements
	if (spinner > 0) spinner--;
	else $('.spinner').fadeOut(500);
	// tutorial modals
	if (localStorageAvail() && !window.localStorage.tutorial) window.localStorage.tutorial = '';
	if (noPermalink && noIframe && localStorageAvail() && window.localStorage.tutorial.indexOf('modals') === -1) { setTimeout(function() {
		const showModalTutor = function(txt, sty) {
			$('#sidebar').before(
				'<div id="tutorial' + sty.id + '" class="tutorial leaflet-control" style="top:' + sty.pos[0] + 'px;' + sty.dir + ':' + (sty.dir === 'left' ? 30 + sty.pos[1] : $(window).width() - sty.pos[1]) + 'px;">' +
					'<div class="tutorial-arrow" style="' + sty.dir + ':-5px;"></div>' +
					'<div class="tutorial-text"><span>' + (sty.id+1) + '/<span>0</span>:</span> ' + txt + '</div>' +
					'<button type="button" class="tutorial-button theme-color">' + (!sty.last ? 'Next' : 'Got it') + '</button>' +
					(!sty.last ? ' <button type="button" class="tutorial-button theme-color"><i class="fa-solid fa-xmark fa-sm"></i></button>' : '') +
				'</div>'
			);
			L.DomEvent.disableClickPropagation($('#tutorial' + sty.id)[0]).disableScrollPropagation($('#tutorial' + sty.id)[0]);
			$('.tutorial-text > span > span').text(sty.id+1);
			$('#tutorial' + sty.id + ' .tutorial-button').first().on('click', function() {
				$(this).parent().fadeOut(100, function() { $(this).remove(); });
				if ($('#tutorial' + (sty.id+1)).length) $('#tutorial' + (sty.id+1)).fadeIn(100, function() { $(this).find('button').first().trigger('focus'); });
				else window.localStorage.tutorial += 'modals;';
			});
			if (!sty.last) $('#tutorial' + sty.id + ' .tutorial-button').last().on('click', function() {
				$(this).parent().fadeOut(100, function() {
					$('.tutorial').remove();
					window.localStorage.tutorial += 'modals;';
				});
			});
			$('#tutorial' + sty.id).on('keydown', function(e) {
				if (e.keyCode === 27) $('#tutorial' + sty.id + ' .tutorial-button').last().trigger('click');
			});
		};
		showModalTutor(
			'Choose from a growing number of modern and historical maps.' + (noTouch ? '<br>Tapping <kbd>CTRL</kbd> will fade loaded overlays in and out.' : ''),
			{ id: 0, pos: Object.values($('.leaflet-control-layers').offset()), dir: 'right' }
		);
		showModalTutor(
			'Display articles on Bexhill\'s history; from dinosaurs, to Martello towers, to WWII incidents.',
			{ id: 1, pos: Object.values($('.sidebar-tabs ul li [href="#tour"]').offset()), dir: 'left' }
		);
		showModalTutor(
			'This button will clear any map markers.<br>Zoom in and ' + interactDesc[0] + ' on the map to find information on almost any place.',
			{ id: 2, pos: Object.values($('#control-clearlayers').offset()), dir: 'left', last: true }
		);
		$('#tutorial0').fadeIn(500);
		$('#tutorial0 button').first().trigger('focus');
	}, 1000); }
}).on('contextmenu.show', function(e) {
	$('#contextmenu-item-copygeos').html(e.latlng.lat.toFixed(3) + ', ' + e.latlng.lng.toFixed(3) + ' | ' + wgs84ToGridRef(e.latlng.lat, e.latlng.lng, 3));
	// elevation data
	// https://www.opentopodata.org/api/
	$.ajax({
		url: 'https://bexhill-osm.opentopodata.org/v1/eudem25m?locations=' + e.latlng.lat + ',' + e.latlng.lng,
		dataType: 'json',
		mimeType: 'application/json',
		success: function(json) {
			if (json.status === 'OK') $('#contextmenu-item-copygeos').append('<br>Elevation: ' + ($('#settings-unit').is(':checked') ? json.results[0].elevation.toFixed(2) + ' m' : (json.results[0].elevation*3.280839895).toFixed(2) + ' ft'));
			else this.error();
		},
		error: function() { if ($('#settings-debug').is(':checked')) console.debug('ERROR OPENTOPODATA:', encodeURI(this.url)); }
	});
	// show walkHere if user located within map and accuracy is high
	if (lc._active && lc._event && map.options.maxBounds && map.options.maxBounds.contains(lc._event.latlng) && map.getZoom() >= 14 && lc._circle.getRadius() <= 100) $('.leaflet-contextmenu-item').eq(1).show();
	else $('.leaflet-contextmenu-item').eq(1).hide();
}).on('tooltipopen', function(e) {
	if (!e.tooltip._container.classList.value.includes('polyline-measure')) highlightOutline(e.tooltip._source._leaflet_id, 1);
}).on('tooltipclose', function(e) {
	if (!e.tooltip._source.isPopupOpen() && !e.tooltip._container.classList.value.includes('polyline-measure')) highlightOutline(e.tooltip._source._leaflet_id, 0);
}).on('popupopen', function(e) {
	const popupThis = $(e.popup.getElement());
	const osmId = e.popup._source._leaflet_id;
	// hide tooltip
	if (e.popup._source.getTooltip()) e.popup._source.getTooltip().setOpacity(0);
	// add/remove favourites
	if ($('a.popup-bookmark').length) {
		if (!window.localStorage.favourites) window.localStorage.favourites = '';
		if (window.localStorage.favourites.indexOf(elementType(osmId) + '(' + osmId.slice(1) + ');') >= 0) popupThis.find($('a.popup-bookmark i').removeClass('fa-regular').addClass('fa-solid'));
		$('a.popup-bookmark').off('click').on('click', function() {
			if ($('a.popup-bookmark i.fa-solid').length) {
				window.localStorage.favourites = window.localStorage.favourites.replace(elementType(osmId) + '(' + osmId.slice(1) + ');', '');
				popupThis.find($('a.popup-bookmark i').removeClass('fa-solid fa-beat').addClass('fa-regular'));
			}
			else {
				window.localStorage.favourites = window.localStorage.favourites + elementType(osmId) + '(' + osmId.slice(1) + ');';
				popupThis.find($('a.popup-bookmark i').removeClass('fa-regular').addClass('fa-solid fa-beat'));
			}
		});
	}
	// wikidata
	$('.popup-wikidata').off('click').on('click', function() {
		const wikidata = JSON.parse(decodeURI($('.popup-wikidata').data('wikidata')));
		let wikidataLinks = '<table>';
		Object.keys(wikidata).forEach(key => {
			wikidataLinks += '<tr><td>' + key + ':</td>' +
			'<td><a href="https://www.wikidata.org/wiki/' + wikidata[key] + '" target="_blank" rel="noopener">' + wikidata[key] + '</a></td></tr>';
		});
		wikidataLinks += '</table>';
		setMsgStatus('fa-solid fa-barcode', '<span>Wikidata</span>', wikidataLinks);
	});
	// editing options
	$('.popup-edit').off('click').on('click', function() {
		// element edit history
		// https://wiki.openstreetmap.org/wiki/API_v0.6
		const urlEditor = 'https://www.openstreetmap.org/';
		$.ajax({
			url: 'https://www.openstreetmap.org/api/0.6/' + elementType(osmId) + '/' + osmId.slice(1) + '.json',
			dataType: 'json',
			success: function(json) {
				e = json.elements[0];
				const infoTags =
					(e.tags.comment ? '<tr><td>Comment:</td><td><i>' + e.tags.comment + '</i></td></tr>' : '') +
					(e.tags.note ? '<tr><td>Note:</td><td><i>' + e.tags.note + '</i></td></tr>' : '') +
					(e.tags.fixme ? '<tr><td>Fixme:</td><td><i>' + e.tags.fixme + '</i></td></tr>' : '') +
					(e.tags.source ? '<tr><td>Source:</td><td><i>' + e.tags.source + '</i></td></tr>' : '') +
					(e.tags.check_date ? '<tr><td>Check date:</td><td><i>' + dateFormat(e.tags.check_date, 'short') + '</i></td></tr>' : '');
				if ($('#osm-details:visible').length) {
					$('#osm-details').html('<table>' +
					'<tr><td>Last edit:</td><td title="' + dateFormat(e.timestamp, 'short') + '"><a href="https://pewu.github.io/osm-history/#/' + elementType(osmId) + '/' + osmId.slice(1) + '" target="_blank" rel="noopener">' + timeSince(e.timestamp) + '</a></td></tr>' +
					'<tr><td>Edited by:</td><td title="UserID: ' + e.uid + '"><a href="' + urlEditor + 'user/' + e.user + '" target="_blank" rel="noopener">' + e.user + '</a></td></tr>' +
					'</table><hr>' + (infoTags ? '<table>' + infoTags + '</table><hr>' : ''));
					$('#modal-head span').append(' | Ver. ' + e.version);
				}
			},
			error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR OSM-API: ' + this.url); }
		});
		setMsgStatus(
			'fa-solid fa-pen-to-square',
			'<span>' + titleCase(elementType(osmId) + ' ' + osmId.slice(1)) + '</span>',
			'<span id="osm-details"></span>' +
			'<span id="edit-details"><table>' +
			'<tr><td><img src="assets/img/edit-id.svg"></td><td><a href="' + urlEditor + 'edit?editor=id&' + elementType(osmId) + '=' + osmId.slice(1) + '" target="_blank" rel="noopener">Edit with iD (in-browser editor)</a></td></tr>' +
			'<tr><td><img src="assets/img/edit-josm.svg"></td><td><a onclick="josmEditor(\'' + osmId + '\');">Edit with Remote Control (JOSM)</a></td></tr>' +
			'<tr><td><img src="assets/img/edit-osm.svg"></td><td><a href="' + urlEditor + elementType(osmId) + '/' + osmId.slice(1) + '" target="_blank" rel="noopener">View on openstreetmap.org</a></td></tr>' +
			'</table></span>'
		);
	});
	popupThis.find($('.popup-header > a, .popup-facilities i, .popup-navigate [title]')).tooltip(tooltipDef);
	// opening-hours accordion
	popupThis.find($('.popup-openhrs')).accordion({
		heightStyle: 'content',
		animate: 150,
		collapsible: true,
		active: false
	});
	// show food hygiene ratings
	// https://ratings.food.gov.uk/open-data
	if (popupThis.find($('.popup-fhrs.notloaded')).length) $.ajax({
		url: 'https://api.ratings.food.gov.uk/establishments/' + encodeURI(popupThis.find($('.popup-fhrs')).data('fhrs')),
		headers: { 'x-api-version': 2 },
		dataType: 'json',
		cache: true,
		success: function(result) {
			const ratingDate = (result.RatingValue.length === 1) ? ' (' + new Date(result.RatingDate).toLocaleDateString(lang) + ')' : '';
			const ratingValue = (result.RatingValue.length === 1) ? result.RatingValue : 'question';
			popupThis.find($('.popup-fhrs')).html(
				'<a href="https://ratings.food.gov.uk/business/' + encodeURI(result.FHRSID) + '" title="Food Hygiene Rating\n' + result.BusinessName + ratingDate + (ratingValue.length > 1 ? '\n' + result.RatingValue : '') + '" target="_blank" rel="noopener">' +
				'<span class="fa-stack"><i class="fa-solid fa-circle fa-stack-1x fa-xl"></i><i class="fanum fa-solid fa-' + ratingValue + ' fa-stack-1x"></i></span></a>'
			).removeClass('notloaded');
			if ($('#settings-debug').is(':checked')) console.debug('Food Hygiene Rating:', result);
		},
		error: function() {
			popupThis.find($('.popup-fhrs')).empty();
			if ($('#settings-debug').is(':checked')) console.debug('ERROR FHRS:', encodeURI(this.url));
		}
	});
	// show bus times
	// https://www.travelinedata.org.uk/traveline-open-data/nextbuses-api
	if (popupThis.find($('.popup-bustime-table')).length) $.ajax({
		type: 'POST',
		url: 'https://cors.bridged.cc/' + 'https://nextbus.mxdata.co.uk/nextbuses/1.0/1',
		headers: { 'Authorization': 'Basic ' + btoa(window.BOSM.trvllneApi.u + ':' + window.BOSM.trvllneApi.p), 'x-cors-grida-api-key': window.BOSM.corsKey },
		contentType: 'text/xml',
		dataType: 'xml',
		cache: false,
		data:
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
			'<Siri version="1.0" xmlns="http://www.siri.org.uk/">' +
			'<ServiceRequest>' +
				'<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>' +
				'<RequestorRef>' + window.BOSM.trvllneApi.u + '</RequestorRef>' +
				'<StopMonitoringRequest version="1.0">' +
					'<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>' +
					'<MessageIdentifier>12345</MessageIdentifier>' +
					'<MonitoringRef>' + popupThis.find($('.popup-bustime-table')).data('naptan') + '</MonitoringRef>' +
				'</StopMonitoringRequest>' +
			'</ServiceRequest>' +
			'</Siri>',
		success: function(xml) {
			const numResults = $(xml).find('MonitoredVehicleJourney').length;
			if (numResults) {
				popupThis.find($('.popup-bustime-table')).empty();
				for (let c = 0; c < numResults; c++) {
					const departTime = $(xml).find('ExpectedDepartureTime').eq(c).text() ? $(xml).find('ExpectedDepartureTime').eq(c).text() : $(xml).find('AimedDepartureTime').eq(c).text();
					const departTimer = minToTime((new Date(departTime) - new Date()) / 60000);
					popupThis.find($('.popup-bustime-table')).append(
						'<tr><td>' + $(xml).find('PublishedLineName').eq(c).text() + '</td>' +
						'<td>' + $(xml).find('DirectionName').eq(c).text() + '</td>' +
						'<td>' + (departTimer === -1 ? 'Due' : (departTimer + ' (' + new Date(departTime).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + ')')) + '</td></tr>'
					);
				}
				popupThis.find($('.popup-bustime-table')).after('<div class="popup-comment"><a href="https://www.travelinedata.org.uk/" target="_blank" rel="noopener">Traveline NextBuses</div>');
				if (e.popup.options.autoPan) e.popup._adjustPan();
			}
			else popupThis.find($('.popup-bustime-table')).html('<span class="comment">No buses due at this time.</span>');
			if ($('#settings-debug').is(':checked')) console.debug('Nextbus:', xml);
		},
		error: function() {
			popupThis.find($('.popup-bustime-table').empty());
			if ($('#settings-debug').is(':checked')) console.debug('ERROR BUSES:', encodeURI(this.url));
		}
	});
	highlightOutline(osmId, 1);
	// highlight in results list and add openpopup to permalink
	if (poiList.length && !popupThis.find($('#popup-userloc')).length && !$('#settings-debug').is(':checked')) {
		popupThis.find($('#pois-results-list tr#' + osmId).addClass('pois-result-selected'));
		if ($('.pois-result-selected').length) $('.pois-result-selected')[0].scrollIntoView({ block: 'center' });
		markerId = osmId;
		permalinkSet();
	}
	if (popupThis.find($('.popup-img')).length) {
		// reduce height of long descriptions if image exists
		if (popupThis.find($('.popup-tag-long')).length) popupThis.find($('.popup-tag-long')).css('--popup-tag-long-height', '150px');
		setTimeout(function() {
			popupThis.find($('.popup-img-item').each(function(i, element) {
				// dynamically load images and attribution
				$(element).find('img').attr('src', $(element).find('a').attr('href') + ($(element).find('a').data('srcset') ? '&width=320' : ''));
				if (popupThis.find($(element).find('.popup-img-attrib.notloaded')).length) getWikiAttrib(popupThis.find($(element)));
				// save popup content
				else if (!popupThis.find('.popup-img-attrib.notloaded').length) map._layers[osmId].setPopupContent();
			}));
		}, 200);
		popupThis.find($('.popup-img'))
			.on('swiperight', function() { navImg(0); })
			.on('swipeleft', function() { navImg(1); })
			.on('dragstart', false)
			.on('selectstart', false)
			.on('wheel', function(e) {
				if (e.originalEvent.deltaY < 0) navImg(0);
				else if (e.originalEvent.deltaY > 0) navImg(1);
				e.preventDefault();
			});
		popupThis.find($('.popup-img-item img')).on('error', function(e) {
				// error if image not found
				if (!popupThis.find($('.popup-img-item:visible')).length) popupThis.find($('#img0')).show();
				if (!popupThis.find($('.popup-navigate:visible')).length) popupThis.find($('.popup-navigate')).show();
				$(e.currentTarget).attr('alt', 'Error: Image not found');
				$(e.currentTarget).parent().css('pointer-events', 'none');
				$(e.currentTarget).parent().next().html('<span>Error: Image not found</span>');
			});
		popupThis.find($('#img0 img'))
			.on('load', function() {
				try {
					// stop placeholder images from being zoomed
					if (popupThis.find($('.popup-img-item img')).attr('src').indexOf('000placehldr') >= 0) popupThis.find($('.popup-img').css('pointer-events', 'none'));
					popupThis.find($('.popup-img-item img')).attr('alt', 'Image of ' + popupThis.find($('.popup-header h3')).text());
					if (popupThis.find($('.popup-navigate')).length) {
						// add padding on attribution for navigation buttons
						popupThis.find($('.popup-img-attrib')).css('padding-right', Math.floor(popupThis.find($('.popup-navigate')).width()+5) + 'px');
						if (!popupThis.find($('.popup-navigate:visible')).length) popupThis.find($('.popup-navigate')).fadeIn();
					}
					popupThis.find($('.popup-img-item')).removeClass('notloaded');
					if (e.popup.options.autoPan && map.getBounds().contains(e.popup._latlng)) setTimeout(function() { e.popup._adjustPan(); }, 200);
				}
				catch(err) {
					if ($('#settings-debug').is(':checked')) console.debug(err + '- Popup was probably closed.');
				}
			});
	}
	// add padding for navigation icons without image
	else if (popupThis.find($('.popup-navigate')).length && !popupThis.find($('.popup-img')).length) {
		popupThis.find($('.popup-navigate')).css('bottom', 'auto').fadeIn();
		popupThis.find($('.popup-body')).css('padding-bottom', '12px');
	}
	// scroll shadow
	if (popupThis.find($('.theme-scroll')).length) setTimeout(function() {
		popupThis.find($('.theme-scroll')).on('scroll', function() {
			const scrollPos = Math.abs($(this)[0].scrollHeight - $(this)[0].clientHeight - $(this).scrollTop());
			const scrollOpacity = scrollPos < 50 ? Math.round(scrollPos / 10) / 10 : 0.5;
			$(this).css('background-image', 'linear-gradient(transparent, rgba(var(--scroll-shadow-popup), ' + scrollOpacity + '))');
		}).trigger('scroll');
	}, 10);
	// set that user has already seen bouncing navigation icons
	if (noIframe && localStorageAvail() && window.localStorage.tutorial.indexOf('bouncedicon') === -1 && popupThis.find($('.pano .fa-bounce, .vid .fa-bounce')).length) window.localStorage.tutorial += 'bouncedicon;';
	// photosphere and video attribution
	$('.pano.notloaded, .vid.notloaded').each(function(i, element) {
		$(element).data('caption', '<a href="https://commons.wikimedia.org/wiki/' + encodeURI($(element).data('caption')) + '" title="Wikimedia Commons" target="_blank" rel="noopener">Wikimedia Commons</a>').removeClass('notloaded');
	});
}).on('popupclose', function(e) {
	// hide tooltip
	if (e.popup._source.getTooltip()) {
		e.popup._source.getTooltip().setOpacity(1);
		if (!e.popup._source.isTooltipOpen()) highlightOutline(markerId, 0);
	}
	// unselect from poi list
	if (poiList.length) {
		$('#pois-results-list tr').removeClass('pois-result-selected');
		if (!rQuery) markerId = undefined;
		permalinkSet();
	}
}).on('baselayerchange', function(e) {
	// get layer name on change
	for (let c in baseTileList.name) if (e.name === baseTileList.name[c]) actBaseTileLayer = baseTileList.keyname[c];
	if (tileBaseLayer[actBaseTileLayer].offset) map.fire('zoomend');
	if (noIframe && localStorageAvail()) window.localStorage.baseLayer = actBaseTileLayer;
	permalinkSet();
}).on('overlayadd', function(e) {
	loadingControl._showIndicator();
	// remove previous overlay
	setTimeout(function() {
		if ($('.leaflet-control-layers-overlays input:checked').length > 1) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
		// get layer name on change
		for (let c in overlayTileList.name) if (e.name === overlayTileList.name[c]) actOverlayLayer = overlayTileList.keyname[c];
		if (darkMode && actOverlayLayer === 'xmas') {
			tileOverlayLayer.xmas.opacity = 0.1;
			tileOverlayLayers[tileOverlayLayer.xmas.name].setOpacity(tileOverlayLayer.xmas.opacity);
		}
		// set overlay opacity controls
		$('#control-opacity').show(100);
		$('#control-opacity input')
			.val(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity)
			.on('input', function() {
				tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(this.value);
				$(this).attr('title', tileOverlayLayer[actOverlayLayer].name + '\n' + Math.floor(this.value*100) + '% opacity');
			})
			.on('change', permalinkSet)
			.on('mouseenter', function() { $(this).trigger('focus'); })
			.attr('title', tileOverlayLayer[actOverlayLayer].name + '\n' + Math.floor($('#control-opacity input').val()*100) + '% opacity');
		setOverlayLabel();
		permalinkSet();
		if (actOverlayLayer && tileOverlayLayer[actOverlayLayer].offset) {
			if (tileOverlayLayer[actOverlayLayer].wmsOverlay) $(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]).on('load', function() {
				setTimeout(function() { changeOffset('overlay', tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]._currentOverlay._image); });
			});
			else map.fire('zoomend');
		}
	}, 10);
}).on('overlayremove', function() {
	if (tileOverlayLayer[actOverlayLayer].hide) setPageTitle();
	if (tileOverlayLayer[actOverlayLayer].offset && tileOverlayLayer[actOverlayLayer].wmsOverlay) $(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]).off('load');
	if (!$('.leaflet-control-layers-overlays input:checked').length) {
		actOverlayLayer = undefined;
		$('#control-opacity').fadeOut(100);
	}
	setOverlayLabel();
	permalinkSet();
}).on('zoomend', function() {
	if (tileBaseLayer[actBaseTileLayer].offset) changeOffset('base', tileBaseLayers[tileBaseLayer[actBaseTileLayer].name].getContainer());
	if (actOverlayLayer && tileOverlayLayer[actOverlayLayer].offset && !tileOverlayLayer[actOverlayLayer].wmsOverlay) changeOffset('overlay', tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].getContainer());
});

function highlightOutline(i, on) {
	// outline highlighting
	if (areaOutline.getLayer('o_' + i)) areaOutline.getLayer('o_' + i).setStyle({ opacity: on ? 0.7 : 0.3 });
	if (Object.keys(imageOverlay._layers).length) {
		const layer = imageOverlay.getLayer(i) || imageOverlay._layers[Object.keys(imageOverlay._layers)[0]].getLayer(i) || '';
		if (layer && layer.options.fill) layer.setStyle({ fillOpacity: on ? 0.75 : 0.5, weight: on ? 3 : 2 });
	}
}
function setOverlayLabel() {
	// adds titles and hides certain layers in control
	if (!$('.control-layers-title').length) {
		$('.leaflet-control-layers-overlays label').first().before('<div class="control-layers-title">Overlays</div>');
		$('.leaflet-control-layers-overlays label:contains("Bing Aerial")').first().before('<div class="control-layers-title">Air photography</div>');
		$('.leaflet-control-layers-overlays label:contains("Ordnance Survey")').first().before('<div class="control-layers-title">Historical maps</div>');
		$('.leaflet-control-layers-overlays label').last().after('<a class="control-layers-title" onclick="switchTab(\'tour\', \'overlays\');">More...</a>');
	}
	for (let tileBase in tileBaseLayer) if (tileBaseLayer[tileBase].hide) $('.leaflet-control-layers-base label:contains("' + tileBaseLayer[tileBase].name + '")').addClass('hideLayer');
	for (let tileOverlay in tileOverlayLayer) if (tileOverlayLayer[tileOverlay].hide) $('.leaflet-control-layers-overlays label:contains("' + tileOverlayLayer[tileOverlay].name + '")').addClass('hideLayer');
	if (!$('.leaflet-control-layers-list.theme-scroll').length) $('.leaflet-control-layers-list').addClass('theme-scroll');
	if (!$('.leaflet-control-layers-toggle span').length) $('.leaflet-control-layers-toggle').html('<span style="margin:5px 4px;" class="fa fa-solid fa-layer-group fa-2x"></span>');
}
function changeOffset(layer, container) {
	// offset layer, metres to pixels
	const metresPerPixel = 40075017 * Math.cos(map.getCenter().lat * (Math.PI/180)) / Math.pow(2, map.getZoom()+8);
	layer = (layer === 'base') ? tileBaseLayer[actBaseTileLayer] : tileOverlayLayer[actOverlayLayer];
	$(container).css('transform', 'translate3d(' + Math.floor(layer.offset[0] / metresPerPixel) + 'px,' + Math.floor(layer.offset[1] / metresPerPixel) + 'px, 0px)');
}

// https://github.com/davidjbradshaw/image-map-resizer
$('#home-minimap > map > area').on('click', function() {
	// bounding coordinates for minimap
	const mBounds = {
		'Bexhill-on-Sea': LBounds,
		'Barnhorn': [[50.8507, 0.4301], [50.8415, 0.4066]],
		'Central': [[50.8425, 0.4801], [50.8351, 0.4649]],
		'Collington': [[50.8472, 0.4604], [50.8352, 0.4406]],
		'Cooden': [[50.8417, 0.4416], [50.8305, 0.4195]],
		'Glenleigh Park': [[50.8573, 0.4641], [50.8476, 0.4454]],
		'Glyne Gap': [[50.8485, 0.5102], [50.8423, 0.4954]],
		'The Highlands': [[50.8637, 0.4615], [50.8566, 0.4462]],
		'Little Common': [[50.8501, 0.4424], [50.8399, 0.4244]],
		'Normans Bay': [[50.8302, 0.4020], [50.8216, 0.3814]],
		'Old Town': [[50.8484, 0.4841], [50.8419, 0.4706]],
		'Pebsham': [[50.8589, 0.5140], [50.8472, 0.4882]],
		'Sidley': [[50.8607, 0.4833], [50.8509, 0.4610]],
	}[$(this).attr('title')];
	if (mBounds) {
		map.flyToBounds(L.latLngBounds(mBounds));
		if ($(window).width() < 768) $('.sidebar-close:visible').trigger('click');
	}
});

// https://github.com/perliedman/leaflet-control-geocoder
let rQuery = false;
function reverseQuery(e, singlemapclick) {
	const geoServer = $('#settings-reverse-server').val();
	let geocoder, geoMarker;
	if (singlemapclick) setMsgStatus('fa-solid fa-spinner fa-spin-pulse', 'Searching...', '');
	else $('.spinner').show();
	if (geoServer === 'nominatim') geocoder = L.Control.Geocoder.nominatim({ reverseQueryParams: { format: 'jsonv2', namedetails: 1, email: email } });
	else if (geoServer === 'opencage') geocoder = L.Control.Geocoder.opencage({ apiKey: window.BOSM.ocKey, reverseQueryParams: { limit: 1, roadinfo: (map.getZoom() < 17 ? 1 : 0) } });
	else if (geoServer === 'photon') geocoder = L.Control.Geocoder.photon({ reverseQueryParams: { distance_sort: true, radius: 0.05 } });
	else if (geoServer === 'openrouteservice') geocoder = L.Control.Geocoder.openrouteservice({ apiKey: window.BOSM.orsKey, reverseQueryParams: { 'boundary.circle.radius': 0.05, size: 1, sources: 'osm' } });
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom() > 16 ? 18 : 17), function(results) {
		if (geoServer === 'opencage') geoMarker = results[0];
		else geoMarker = results[0] ? results[0].properties : '';
		if ($('#settings-debug').is(':checked') && results[0]) console.debug(titleCase(geoServer) + 'reverse search:', results[0]);
		if (geoMarker.osm_id || (geoMarker.source_id && geoMarker.source_id.indexOf('/')) > 0) {
			if (singlemapclick && $('#modal:visible').length) {
				let msgStatusHead, msgStatusBody;
				// https://nominatim.org/release-docs/develop/api/Reverse/
				if (geoServer === 'nominatim') {
					const geoName = geoMarker.namedetails ? geoMarker.namedetails.ref || geoMarker.namedetails.name || geoMarker.namedetails['addr:housename'] || '' : '';
					const geoRoad = geoMarker.address ? geoMarker.address.road || geoMarker.address.footway || geoMarker.address.pedestrian || geoMarker.address.path || geoMarker.address.locality || '' : '';
					msgStatusHead = titleCase(geoMarker.type === 'yes' || geoMarker.type === geoMarker.addresstype ? geoMarker.category : geoMarker.type + (geoMarker.addresstype === 'road' ? ' road' : ''));
					msgStatusBody = '<a class="modal-body-addr" onclick="reverseQueryOP(\'' + geoMarker.osm_type + '\', \'' + geoMarker.osm_id + '\');">' + (geoName ? '<b>' + geoName + '</b><br>' : '') +
						(geoMarker.address.house_number ? geoMarker.address.house_number + ' ' : '') + (geoRoad ? geoRoad + (geoMarker.address.postcode ? ', ' + geoMarker.address.postcode + '<br>' : '') : '') +
						(geoMarker.address.retail ? geoMarker.address.retail : '') + '</a>';
				}
				// https://opencagedata.com/api
				else if (geoServer === 'opencage') {
					msgStatusHead = titleCase(geoMarker.type);
					msgStatusBody = '<a class="modal-body-addr" onclick="reverseQueryOP(\'' + geoMarker.osm_type + '\', \'' + geoMarker.osm_id + '\');"><b>' + geoMarker.name.replace(',', '</b><br>').replace(', United Kingdom', '') + '</a>';
				}
				// https://photon.komoot.io/
				else if (geoServer === 'photon') {
					msgStatusHead = geoMarker.osm_value !== 'yes' ? titleCase(geoMarker.osm_value + ' ' + geoMarker.osm_key) : '';
					msgStatusBody = '<a class="modal-body-addr" onclick="reverseQueryOP(\'' + geoMarker.osm_type + '\', \'' + geoMarker.osm_id + '\');">' + (geoMarker.name ? '<b>' + geoMarker.name + '</b><br>' : '') +
						(geoMarker.housenumber ? geoMarker.housenumber + ' ' : '') + (geoMarker.street + (geoMarker.postcode ? ', ' + geoMarker.postcode : '') ? geoMarker.street : '') + '</a>';
				}
				// https://openrouteservice.org/dev/#/api-docs/geocode
				else if (geoServer === 'openrouteservice') {
					msgStatusHead = titleCase(geoMarker.layer);
					msgStatusBody = '<a class="modal-body-addr" onclick="reverseQueryOP(\'' + geoMarker.source_id.charAt(0) + '\', \'' + geoMarker.source_id.split('/')[1] + '\');">' + '<b>' + geoMarker.name + '</b><br>' +
						(geoMarker.postalcode ? geoMarker.postalcode : '') + '</a>';
				}
				if ($('#settings-overpass-attic').val()) msgStatusBody += '<br><span class="comment">Above result may differ to actual attic data.</span>';
				setMsgStatus('fa-solid fa-magnifying-glass-location', msgStatusHead, msgStatusBody);
				// move click location to address location on hover
				$('#modal .modal-body-addr')
					.on('mouseenter', function() { if (clickOutline.getLayers()[0]) {
						$(clickOutline.getLayers()[0]._path).addClass('layer-visualclick');
						clickOutline.getLayers()[0].setLatLng(results[0].center);
					}})
					.on('mouseleave', function() { if (clickOutline.getLayers()[0]) {
						clickOutline.getLayers()[0].setLatLng(e.latlng);
						setTimeout(function() { $(clickOutline.getLayers()[0]._path).removeClass('layer-visualclick'); }, 350);
					}});
			}
			else reverseQueryOP(geoMarker.osm_type || geoMarker.source_id.charAt(0), geoMarker.osm_id || geoMarker.source_id.split('/')[1]);
		}
		else {
			$('.spinner').fadeOut(200);
			setMsgStatus('fa-solid fa-circle-info', 'No Places Found', 'Please try another area.', 4);
			clickOutline.clearLayers();
		}
	});
}
function reverseQueryOP(type, id) {
	// pass reverse lookup to overpass
	clear_map('markers');
	rQuery = true;
	$('#modal').fadeOut(200);
	show_overpass_layer(elementType(type) + '(' + id + ');', type.charAt(0).toUpperCase() + id);
}
function walkPoint(e) {
	if ($(window).width() >= 768 && actTab !== 'walking' && actTab !== 'none') $('a[href="#walking"]').trigger('click');
	// drop a walk marker if one doesn't exist
	const wp = routingControl.getWaypoints();
	for (let c in wp) if (!wp[c].name) {
		routingControl.spliceWaypoints(c, 1, e.latlng);
		return;
	}
	routingControl.spliceWaypoints(wp.length, 0, e.latlng);
}
function walkHere(e) {
	if ($(window).width() >= 768 && actTab !== 'walking' && actTab !== 'none') $('a[href="#walking"]').trigger('click');
	routingControl.setWaypoints([
		[lc._event.latlng.lat, lc._event.latlng.lng],
		[e.latlng.lat, e.latlng.lng]
	]);
}
function centreMap(e) {
	map.panTo(e.latlng);
}
function improveMap(e, id) {
	// create a note on osm.org
	if (id === undefined) id = 'new';
	popupWindow('popup', 'https://www.openstreetmap.org/note/' + id + '#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng + '&layers=N', 'noteWindow');
}
function fixMyStreet(e) {
	popupWindow('popup', 'https://osm.fixmystreet.com/around?zoom=4&latitude=' + e.latlng.lat + '&longitude=' + e.latlng.lng, 'fmsWindow');
}
function panoView(e, fromSequence) {
	// tries to find photospheres from Mapillary, if none use Google
	// https://www.mapillary.com/developer/api-documentation#image
	$('.spinner').show();
	$.ajax({
		url: 'https://graph.mapillary.com/images?access_token=' + window.BOSM.mpllryKey + '&fields=id,camera_type&bbox=' + (e.latlng.lng-0.00015) + ',' + (e.latlng.lat-0.0001) + ',' + (e.latlng.lng+0.00015) + ',' + (e.latlng.lat+0.0001),
		dataType: 'json',
		mimeType: 'application/json',
		cache: true,
		success: function(json) {
			let imgId;
			if (json.data.length > 0) json.data.forEach(x => { if (x.camera_type === 'equirectangular') imgId = x.id; });
			if (imgId && ($('#settings-mapillary').is(':checked') || fromSequence)) {
				$('.spinner').hide();
				popupWindow('iframe', 'https://www.mapillary.com/embed?image_key=' + imgId + '&x=0.5&y=0.5&style=photo', '', 'Mapillary Street-Level');
			}
			else this.error();
		},
		error: function() {
			if ($('#settings-debug').is(':checked') && $('#settings-mapillary').is(':checked')) console.debug('ERROR MAPILLARY IMAGES:', encodeURI(this.url));
			if (!fromSequence) {
				$('.spinner').hide();
				popupWindow('iframe', 'https://www.google.com/maps/embed/v1/streetview?location=' + e.latlng.lat + ',' + e.latlng.lng + '&fov=90&key=' + window.BOSM.googleKey, '', 'Google Street View');
			}
		}
	});
}
function copyGeos(e) {
	const geos = e.latlng.lat.toFixed(5) + '°N ' + e.latlng.lng.toFixed(5) + '°E | ' + wgs84ToGridRef(e.latlng.lat, e.latlng.lng, 6);
	navigator.clipboard.writeText(geos).then(
		function() { setMsgStatus('fa-solid fa-copy', 'Clipboard', 'Coordinates copied successfully.<p class="comment">' + geos + '</p>', 4); },
		function() { setMsgStatus('fa-solid fa-copy', 'Clipboard Error', 'Could not copy coordinates. Manually copy below <p class="comment">' + geos + '</p>'); }
	);
}

$('#walk-list').on('change', function() {
	$('#walk-desc').html('<figure><img alt="Walk preview" src="assets/img/walks/' + $(this).val() + '.jpg" loading="lazy"><figcaption>' + suggestWalk($('#walk-list').val(), 0) + '</figcaption></figure>');
});
$('#walk-select').on('click', function() {
	clear_map('walk');
	routingControl.zoomBounds = true;
	routingControl.setWaypoints(suggestWalk($('#walk-list').val(), 1));
	if ($(window).width() < 768) $('.sidebar-close:visible').trigger('click');
});
function suggestWalk(walkId, isWP) {
	return {
		ww2h: [
			'The route of this walk is marked out by a series of 10 plaques along the promenade. ' +
			'Launched in 2011, it hopes to encourage people to regularly walk a specific distance along the promenade. ' +
			'Small plinths are placed at ground level opposite every third beach groyne between numbers 48 and 72.',
			[[50.83567, 0.45892], [50.83701, 0.47363]]
		],
		tmrt: [
			'In May 1902 Bexhill-on-Sea became "The Birthplace of British Motor Racing". ' +
			'Follow five seafront Motoring Heritage panels and two galleries dedicated to the story of those intrepid ' +
			'early motoring pioneers (the 5th panel is situated outside ' +
			'<a class="theme-color" onclick="map.flyTo([50.833, 0.427], 18);">Cooden Beach Hotel <i class="fa-solid fa-magnifying-glass fa-sm"></i></a>).',
			[[50.84059, 0.49121], [50.83729, 0.47612], [50.83647, 0.46637], [50.83732, 0.46639]]
		],
		neye: [
			'Pevensey Levels was a tidal inlet until the eastward drift of coastal shingle isolated it and a salt marsh developed. ' +
			'The walk starts and ends at The Star Inn pub, heading north-west towards the archaeological site of Northeye, a village abandoned to flooding in the Middle Ages. ' +
			'Before making your way back round, you will see evidence of a wooden sea defence from the 14th century called Crooked Ditch.<br>' +
			'Although sometimes rough and wet in places, there are great open views of countryside and plenty of grazing sheep to keep you company.',
			[[50.83026, 0.39324], [50.83832, 0.38729], [50.83618, 0.40594], [50.83007, 0.39370]]
		],
		hwds: [
			'Starting at the Wheatsheaf Inn, this walk takes you on a public right-of-way through wood, farmland and down country lanes. ' +
			'Pass through Whydown and see the extraordinary early 20th century Gotham Wood House, before arriving at the south-west corner of ancient Highwoods.',
			[[50.84536, 0.43353], [50.84958, 0.42689], [50.85671, 0.42740], [50.86120, 0.42984]]
		],
		gnwy: [
			'The Greenway runs alongside the Combe Valley Way, providing access for walkers, cyclists and horse riders between Bexhill and Hastings. ' +
			'It links up with public bridleways and footpaths in the area, including the 1066 Country Walk Bexhill Link, with two sections where horse ' +
			'riders take an alternative route to walkers and cyclists.',
			[[50.85676, 0.47898], [50.87003, 0.52085]]
		],
		ad1066: [
			'The route commemorates the 1066 Battle of Hastings, linking the places and the people of that important time. ' +
			'This is a section of the Bexhill - Battle link, the full route can be found on ' +
			'<a href="https://hiking.waymarkedtrails.org/#route?id=3161493&map=13!50.8789!0.4901" target="_blank" rel="noopener">waymarkedtrails.org <i class="theme-color fa-solid fa-up-right-from-square fa-sm"></i></a>.',
			[[50.84522, 0.48044], [50.85591, 0.49312], [50.87800, 0.50009]]
		],
		bcr1: [
			'This is an edge of town walk of about 6 miles. It includes riverside fields and farmland, hedgerow remains of ancient woodland, ' +
			'reedbeds, vegetated shingle and a wonderful mile of rock pools at low tide. There are no hills or particularly muddy areas. Refreshments and toilets are ' +
			'available at the start point - Bexhill railway station - and towards the end of the walk.',
			[[50.84125, 0.47717], [50.84484, 0.47876], [50.84523, 0.48052], [50.85590, 0.49312], [50.86230, 0.51823],
			[50.84808, 0.52014], [50.83780, 0.47660], [50.84093, 0.47718]]
		]
	}[walkId][isWP];
}

// navigation controls for history tour
$('#tour-controls-prev').on('click', function() { $('#tour-controls-list option:selected').prevAll(':enabled').eq(0).prop('selected', true).trigger('change'); });
$('#tour-controls-list').on('change', function() {
	const tourVal = $(this).val();
	// only load iframe on focus or a new item selected
	if (actTab === 'tour' && $('#tour-frame')[0].contentWindow.location.href.indexOf('/list' + titleCase(tourVal)) === -1) {
		$('#tour-controls').children().prop('disabled', true);
		$('#tour-frame').hide();
		$('#tour-loading').show();
		$('#tour-frame')[0].contentWindow.location.replace(window.location.origin + '/' + 'tour/list' + titleCase(tourVal) + '/index.html?v=' + version);
		$('#tour-frame').one('load', function() {
			$('#tour-loading').hide();
			$(this).fadeIn();
			// set theme
			$('#settings-theme').trigger('change');
			// set reference links
			$(this).contents().find('sup').on('click', function() { tourRef(tourVal, this.innerText); });
			$(this).contents().find('sup').each(function() { try { $(this).attr('title', $('#tour-frame')[0].contentWindow.tourRefs[tourVal][this.innerText].name); } finally {} });
			// create fancybox gallery from iframe images
			const tourImg = $(this).contents().find('img').not('.link-map img'), tourGall = [];
			tourImg.each(function() { tourGall.push({ 'src': this.src, 'caption': $(this).parent('figure').find('figCaption').html() || this.alt }); });
			tourImg.off('click').on('click', function() { $.fancybox.open(tourGall, {}, tourImg.index(this)); });
			$('#tour-controls').children().prop('disabled', false);
			if ($('#tour-controls-list').prop('selectedIndex') === 0) $('#tour-controls-prev').prop('disabled', true);
			else if ($('#tour-controls-list').prop('selectedIndex') === $('#tour-controls-list option').length-1) $('#tour-controls-next').prop('disabled', true);
		});
		permalinkSet();
	}
	else $('#settings-theme').trigger('change');
});
$('#tour-controls-next').on('click', function() { $('#tour-controls-list option:selected').nextAll(':enabled').eq(0).prop('selected', true).trigger('change'); });

// https://github.com/Leaflet/Leaflet
const iconLayer = new L.featureGroup(), clickOutline = new L.featureGroup(), areaOutline = new L.featureGroup(), imageOverlay = new L.featureGroup();
let tileBaseLayer = {}, tileBaseLayers = {}, baseTileList = {name: [], keyname: []};
let tileOverlayLayer = {}, tileOverlayLayers = {}, overlayTileList = {name: [], keyname: []};
function setLeaflet() {
	map.addLayer(iconLayer).addLayer(clickOutline).addLayer(imageOverlay).addLayer(areaOutline);
	// leaflet icon image path
	L.Icon.Default.imagePath = 'assets/img/leaflet/';
	// baselayers
	const attribution = '&copy; <a href="https://openstreetmap.org/copyright" title="Copyright and License" target="_blank" rel="noopener">OpenStreetMap</a>';
	tileBaseLayer = {
		osmstd: {
			name: 'OpenStreetMap',
			url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
			maxNativeZoom: 19
		},
		bosm: {
			name: 'OSM Bexhill',
			url: 'https://api.mapbox.com/styles/v1/drmx/cjyfrglvo1v3c1cqqlcvzyd07/tiles/256/{z}/{x}/{y}@2x?access_token=' + window.BOSM.mapboxKey,
			attribution: attribution + ', <a href="https://mapbox.com/" target="_blank" rel="noopener">MapBox</a>'
		},
		osmtopo: {
			name: 'OSM Topo',
			url: 'https://tile.tracestrack.com/topo__/{z}/{x}/{y}.png?key=' + window.BOSM.tracestrackKey,
			attribution: attribution + ', <a href="https://www.tracestrack.com/" target="_blank" rel="noopener">Tracestrack</a>',
			maxNativeZoom: 19
		},
		osmnolab: {
			name: 'OSM (no labels)',
			url: 'https://tile.openstreetmap.bzh/eu/{z}/{x}/{y}.png',
			hide: 1
		},
		osmuk: {
			name: 'OSM UK',
			url: 'https://map.atownsend.org.uk/hot/{z}/{x}/{y}.png',
			attribution: attribution + ', <a href="https://map.atownsend.org.uk/maps/map/map.html" target="_blank" rel="noopener">Andy Townsend</a>',
			hide: 1
		},
		general: {
			name: 'OSM Humanitarian',
			url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
			attribution: attribution + ', <a href="https://www.hotosm.org/" target="_blank" rel="noopener">HOTOSM</a>',
			maxNativeZoom: 20
		},
		cycle: {
			name: 'OSM OpenCycleMap',
			url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + window.BOSM.thuforKey,
			attribution: attribution + ', <a href="https://thunderforest.com/maps/opencyclemap/" target="_blank" rel="noopener">ThunderForest</a>'
		},
		trnsprt: {
			name: 'OSM Public Transport',
			url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + window.BOSM.thuforKey,
			attribution: attribution + ', <a href="https://thunderforest.com/maps/transport/" target="_blank" rel="noopener">ThunderForest</a>'
		},
		bing: {
			name: 'Bing Aerial',
			maxNativeZoom: 19,
			offset: [-1, 1]
		}
		/*google: {
			name: 'Google Aerial',
			url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
			subdomains: '0123',
			offset: [-1, 1]
		}*/
	};
	for (let tile in tileBaseLayer) {
		const tbl = tileBaseLayer[tile], bOptions = {
			attribution: tbl.attribution || attribution,
			subdomains: tbl.subdomains || 'abc',
			maxZoom: map.getMaxZoom(),
			maxNativeZoom: tbl.maxNativeZoom,
			errorTileUrl: tbl.errorTileUrl,
			className: tbl.className || ''
		};
		if (tile === 'bing') tileBaseLayers[tbl.name] = L.bingLayer(window.BOSM.bingKey, bOptions);
		else tileBaseLayers[tbl.name] = L.tileLayer(tbl.url, bOptions);
		// create object array for all basemap layers
		baseTileList.name.push(tbl.name);
		baseTileList.keyname.push(tile);
	}
	// overlays, set an offset by using metres (offset: [left, top])
	tileOverlayLayer = {
		landreg: {
			name: 'Land Registry',
			url: 'https://tiles.osmuk.org/PropertyBoundaries/{z}/{x}/{y}.png',
			attribution: '<a href="https://eservices.landregistry.gov.uk/eservices/FindAProperty/view/LrInspireIdInit.do" target="_blank" rel="noopener">HM Land Registry</a>',
			opacity: 1,
			minNativeZoom: 18,
			maxNativeZoom: 20,
			minZoom: 16,
			offset: [-0.5, 0.5]
		},
		lidar: {
			name: 'Lidar DTM 1m',
			url: 'https://environment.data.gov.uk/spatialdata/lidar-composite-digital-terrain-model-dtm-1m/wms',
			wms: {
				layers: 'Lidar_Composite_DTM_1m',
				format: 'image/png',
				transparent: true
			},
			attribution: '<a href="https://www.gov.uk/government/organisations/environment-agency/" target="_blank" rel="noopener">Environment Agency</a>',
			opacity: 0.8
		},
		tpo: {
			name: 'Tree Preservation Orders',
			url: 'https://maps.rother.gov.uk/geoserver/re/wms',
			wms: {
				layers: 're:Tree_Preservation_Orders',
				format: 'image/png',
				transparent: true
			},
			attribution: '<a href="https://maps.rother.gov.uk/tpo.html" target="_blank" rel="noopener">Rother District Council</a>',
			opacity: 1,
			className: 'theme-dropshadow'
		},
		osm2012: {
			name: '2012 OpenStreetMap',
			url: 'https://map.fosm.org/default/{z}/{x}/{y}.png',
			opacity: 1,
			hide: 1,
			className: 'layer-noclick'
		},
		osmlabels: {
			name: 'OSM Labels',
			url: 'https://tile.tracestrack.com/_-name/{z}/{x}/{y}.png?key=' + window.BOSM.tracestrackKey,
			opacity: 1,
			hide: 1
		},
		prow: {
			name: 'Public Rights-of-Way',
			url: 'https://osm.cycle.travel/rights_of_way/{z}/{x}/{y}.png',
			attribution: '<a href="https://row.eastsussex.gov.uk/standardmap.aspx" target="_blank" rel="noopener">East Sussex County Council</a>',
			opacity: 1,
			maxNativeZoom: 18,
			className: 'theme-dropshadow'
		},
		xmas: {
			name: 'Xmas Snow',
			url: 'tour/itemXmas/img/overlay-snow.gif',
			opacity: 0.5,
			hide: 1,
			className: 'layer-noclick'
		},
		// air photography
		bing: {
			name: 'Bing Aerial',
			opacity: 0.5,
			maxNativeZoom: 19,
			offset: [-1, 1]
		},
		/*google: {
			name: 'Google Aerial',
			opacity: 0.5,
			url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
			subdomains: '0123',
			offset: [-1, 1]
		},*/
		bm1975: {
			name: '1975 Aerial (coast)',
			url: 'https://tiles.bexhillheritage.com/bm1975/{z}/{x}/{y}.png',
			attribution: 'Meridian Airmaps Ltd, <a href="https://bexhillmuseum.org.uk/" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layer-noclick'
		},
		bm1967: {
			name: '1967 Aerial',
			url: 'https://tiles.bexhillheritage.com/bm1967/{z}/{x}/{y}.png',
			attribution: 'BKS Surveys, <a href="https://bexhillmuseum.org.uk/" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layer-noclick'
		},
		br1959: {
			name: '1959 Aerial (railway)',
			url: 'https://tiles.bexhillheritage.com/br1959/{z}/{x}/{y}.png',
			attribution: 'British Rail, <a href="https://car57.zenfolio.com/" target="_blank" rel="noopener">Michael Pannell</a>',
			bounds: L.latLngBounds([50.83722, 0.45732], [50.8907, 0.5134]),
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layer-noclick'
		},
		raf1959: {
			name: '1959 RAF (l.common)',
			url: 'https://tiles.bexhillheritage.com/raf1959/{z}/{x}/{y}.png',
			attribution: 'RAF CPEUK',
			bounds: L.latLngBounds([50.877, 0.402], [50.838, 0.444]),
			opacity: 1,
			minNativeZoom: 14,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layer-noclick'
		},
		os1950: {
			name: '1950 Aerial',
			url: 'https://tiles.bexhillheritage.com/os1950/{z}/{x}/{y}.png',
			attribution: 'Ordnance Survey, <a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			className: 'layer-noclick'
		},
		raf1946: {
			name: '1946 RAF',
			url: 'https://tiles.bexhillheritage.com/raf1946/{z}/{x}/{y}.png',
			attribution: 'RAF CPEUK',
			opacity: 1,
			minNativeZoom: 14,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layer-noclick'
		},
		raf1941c: {
			name: '1941 RAF (central)',
			url: 'https://tiles.bexhillheritage.com/raf1941c/{z}/{x}/{y}.png',
			attribution: 'RAF CPEUK',
			bounds: L.latLngBounds([50.841, 0.474], [50.836, 0.480]),
			opacity: 1,
			minNativeZoom: 15,
			maxNativeZoom: 19,
			hide: 1,
			className: 'layer-noclick'
		},
		// historical maps
		os1962: {
			name: '1962 Ordnance Survey',
			url: 'https://mapseries-tilesets.s3.amazonaws.com/os/britain10knatgrid/{z}/{x}/{y}.png',
			attribution: 'Ordnance Survey, <a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 16,
			offset: [5, 3],
			className: 'layer-noclick'
		},
		os1955: {
			name: '1955 Ordnance Survey',
			url: 'https://mapseries-tilesets.s3.amazonaws.com/london_1940s/{z}/{x}/{y}.png',
			attribution: 'Ordnance Survey, <a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 19,
			offset: [1, 1],
			className: 'layer-noclick'
		},
		wl1950: {
			name: '1950 Ward Lock',
			url: 'https://tiles.bexhillheritage.com/wl1950/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.852, 0.445], [50.832, 0.494]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layer-noclick'
		},
		ob1944: {
			name: '1944 Observer Bomb Map',
			url: 'https://tiles.bexhillheritage.com/ob1944/{z}/{x}/{y}.png',
			bounds: L.latLngBounds([50.826, 0.411], [50.878, 0.508]),
			opacity: 1,
			maxNativeZoom: 16,
			hide: 1,
			className: 'layer-noclick'
		},
		arp1942: {
			name: '1942 Air Raid Precautions',
			url: 'https://tiles.bexhillheritage.com/arp1942/{z}/{x}/{y}.png',
			attribution: 'Ordnance Survey, <a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.8292, 0.4157], [50.8713, 0.5098]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layer-noclick'
		},
		wl1940: {
			name: '1940 Ward Lock',
			url: 'https://tiles.bexhillheritage.com/wl1940/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.851, 0.454], [50.832, 0.492]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layer-noclick'
		},
		os1938: {
			name: '1938 Ordnance Survey',
			url: 'https://tiles.bexhillheritage.com/os1938/{z}/{x}/{y}.png',
			attribution: 'Ordnance Survey, <a href="https://www.ordnancesurvey.co.uk/" target="_blank" rel="noopener">Crown Copyright Ordnance Survey</a>',
			bounds: L.latLngBounds([50.874, 0.380], [50.833, 0.518]),
			opacity: 1,
			maxNativeZoom: 17,
			className: 'layer-noclick'
		},
		os1930: {
			name: '1930 Ordnance Survey',
			url: 'https://tiles.bexhillheritage.com/os1930/{z}/{x}/{y}.png',
			attribution: 'Ordnance Survey, <a href="https://www.ordnancesurvey.co.uk/" target="_blank" rel="noopener">Crown Copyright Ordnance Survey</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			offset: [-2, -2],
			className: 'layer-noclick'
		},
		mc1925: {
			name: '1925 Maynards Chronicle',
			url: 'https://tiles.bexhillheritage.com/mc1925/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.869, 0.417], [50.827, 0.509]),
			opacity: 1,
			maxNativeZoom: 17,
			hide: 1,
			className: 'layer-noclick'
		},
		wl1911: {
			name: '1911 Ward Lock',
			url: 'https://tiles.bexhillheritage.com/wl1911/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.848, 0.459], [50.834, 0.488]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layer-noclick'
		},
		os1909: {
			name: '1909 Ordnance Survey',
			url: 'https://mapseries-tilesets.s3.amazonaws.com/25_inch/holes_england/{z}/{x}/{y}.png',
			attribution: 'Ordnance Survey, <a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 18,
			offset: [2, 2],
			className: 'layer-noclick'
		},
		mt1902: {
			name: '1902 Motor Track',
			url: 'https://tiles.bexhillheritage.com/mt1902/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.83575, 0.50081], [50.84238, 0.47520]),
			opacity: 1,
			minNativeZoom: 12,
			maxNativeZoom: 19,
			hide: 1,
			className: 'layer-noclick'
		},
		os1899: {
			name: '1899 Ordnance Survey',
			url: 'https://tiles.bexhillheritage.com/os1899/{z}/{x}/{y}.jpg',
			attribution: 'Ordnance Survey, <a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			offset: [7, 2],
			className: 'layer-noclick'
		},
		jd1887: {
			name: '1887 Downsborough',
			url: 'https://tiles.bexhillheritage.com/jd1887/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.8565, 0.454], [50.831, 0.505]),
			opacity: 1,
			maxNativeZoom: 17,
			hide: 1,
			className: 'layer-noclick'
		},
		os1873: {
			name: '1873 Ordnance Survey',
			url: 'https://mapseries-tilesets.s3.amazonaws.com/os/six-inch-sussex/{z}/{x}/{y}.png',
			attribution: 'Ordnance Survey, <a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			offset: [8, -4],
			className: 'layer-noclick'
		},
		bt1839: {
			name: '1839 Bexhill Tithe',
			url: 'https://tiles.bexhillheritage.com/bt1839/{z}/{x}/{y}.png',
			attribution: '<a href="https://apps.eastsussex.gov.uk/leisureandtourism/localandfamilyhistory/tithemaps/map/artefact/112769" target="_blank" rel="noopener">ESRO TDE 141</a>, ' +
				'<b><a href="https://apps.eastsussex.gov.uk/leisureandtourism/localandfamilyhistory/tithemaps/apportionment/artefact/112769" target="_blank" rel="noopener">Apportionment</a></b>',
			bounds: L.latLngBounds([50.815, 0.351], [50.890, 0.536]),
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layer-noclick'
		},
		mb1805: {
			name: '1805 Manor of Bexhill',
			url: 'https://tiles.bexhillheritage.com/mb1805/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.thekeep.info/collections/getrecord/GB179_AMS5819" target="_blank" rel="noopener">ESRO AMS 5819</a>',
			bounds: L.latLngBounds([50.805, 0.376], [50.883, 0.511]),
			opacity: 1,
			maxNativeZoom: 17,
			className: 'layer-noclick'
		},
		yg1795: {
			name: '1795 Yeakell, Gardner & Gream',
			url: 'https://tiles.bexhillheritage.com/yg1795/{z}/{x}/{y}.png',
			attribution: '<a href="https://digitalarchive.mcmaster.ca/islandora/object/macrepo:80922" target="_blank" rel="noopener">McMaster University</a>',
			bounds: L.latLngBounds([50.810, 0.320], [50.890, 0.554]),
			opacity: 1,
			maxNativeZoom: 15,
			hide: 1,
			className: 'layer-noclick'
		},
		yg1778: {
			name: '1778 Yeakell & Gardner',
			url: 'https://tiles.bexhillheritage.com/yg1778/{z}/{x}/{y}.png',
			attribution: '<a href="http://www.envf.port.ac.uk/geo/research/historical/webmap/sussexmap/Yeakell_36.htm" target="_blank" rel="noopener">University of Portsmouth</a>',
			bounds: L.latLngBounds([50.810, 0.320], [50.890, 0.554]),
			opacity: 1,
			maxNativeZoom: 16,
			hide: 1,
			className: 'layer-noclick'
		}
	};
	for (let tile in tileOverlayLayer) {
		const tol = tileOverlayLayer[tile], oOptions = {
			attribution: tol.attribution,
			subdomains: tol.subdomains || 'abc',
			bounds: tol.bounds,
			opacity: tol.opacity,
			maxZoom: map.getMaxZoom(),
			minZoom: tol.minZoom || map.getMinZoom(),
			maxNativeZoom: tol.maxNativeZoom,
			minNativeZoom: tol.minNativeZoom,
			className: tol.className || ''
		};
		if (tile === 'bing') tileOverlayLayers[tol.name] = L.bingLayer(window.BOSM.bingKey, oOptions);
		else if (tol.wms) tileOverlayLayers[tol.name] = L.tileLayer.wms(tol.url, $.extend(tol.wms, oOptions));
		else if (tol.wmsOverlay) tileOverlayLayers[tol.name] = L.WMS.overlay(tol.url, $.extend(tol.wmsOverlay, oOptions));
		else tileOverlayLayers[tol.name] = L.tileLayer(tol.url, oOptions);
		// create object array for all overlay layers
		overlayTileList.name.push(tol.name);
		overlayTileList.keyname.push(tile);
	}
	L.control.layers(tileBaseLayers, tileOverlayLayers).addTo(map);
}
setLeaflet();

// BUTTON zoom icon style
$('.leaflet-control-zoom-in').html('<i class="fa-solid fa-plus"></i>');
$('.leaflet-control-zoom-out').html('<i class="fa-solid fa-minus"></i>');

// BUTTON full screen events
const fcnFullscr = L.easyButton({
	id: 'control-fullscreen',
	states: [{
		stateName: 'control-fullscreen-off',
		icon: 'fa-solid fa-expand',
		title: 'Full screen',
		onClick: function(control) {
			const viewer = $('html')[0];
			const rFS = viewer.requestFullscreen || viewer.webkitRequestFullscreen;
			rFS.call(viewer);
			control.state('control-fullscreen-on');
		}
	}, {
		stateName: 'control-fullscreen-on',
		icon: 'fa-solid fa-compress',
		title: 'Exit full screen',
		onClick: function(control) {
			const cFS = document.exitFullscreen || document.webkitExitFullscreen;
			cFS.call(document);
			control.state('control-fullscreen-off');
		}
	}]
}).addTo(map);
$(document).on('fullscreenchange', btnFullscrState).on('webkitfullscreenchange', btnFullscrState);
function btnFullscrState() {
	const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
	if (!fullscreenElement) fcnFullscr.state('control-fullscreen-off');
}

// https://github.com/domoritz/leaflet-locatecontrol
// BUTTON locate control
const lc = L.control.locate({
	icon: 'fa-solid fa-location-arrow',
	iconLoading: 'fas fa-compass fa-spin',
	iconElementTag: 'i',
	setView: true,
	flyTo: true,
	keepCurrentZoomLevel: true,
	metric: false,
	showPopup: true,
	circleStyle: { interactive: false },
	markerStyle: { radius: 8 },
	strings: {
		title: 'Show your location',
		popup: '<div id="popup-userloc"><strong>Accuracy:</strong> {distance} {unit}</div>'
	},
	locateOptions: {
		enableHighAccuracy: false
	},
	onLocationError: function() {
		setMsgStatus('fa-solid fa-triangle-exclamation', 'Location Error', 'Sorry, we could not locate you.', 4);
	},
	onLocationOutsideMapBounds: function() {
		setMsgStatus('fa-solid fa-circle-info', 'Out of Bounds', 'You appear to be located outside the map area.', 4);
		lc.stop();
	}
}).addTo(map);

// https://github.com/ppete2/Leaflet.PolylineMeasure
// BUTTON measurement control
const measure = L.control.polylineMeasure({
	unit: 'landmiles',
	tooltipTextDelete: 'Press <kbd>SHIFT</kbd> and click to <b>delete point</b>',
	tooltipTextMove: 'Click and drag to <b>move point</b><br>',
	tooltipTextResume: '<br>Press <kbd>CTRL</kbd> and click to <b>resume line</b>',
	tooltipTextAdd: 'Press <kbd>CTRL</kbd> and click to <b>add point</b>',
	measureControlTitleOn: 'Enable measurement',
	measureControlTitleOff: 'Disable measurement',
	measureControlLabel: '<i class="fa-solid fa-ruler"></i>',
	fixedLine: { color: '#00f', weight: 2 },
	arrow: { color: '#006' }
}).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
// BUTTON search
const geocode = L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(','),
			limit: maxNomResults,
			email: email
		}
	}),
	expand: 'click',
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft',
	placeholder: 'Type address or place name...'
}).on('markgeocode', function(e) {
	// pass nominatim address query to overpass
	if ($('#settings-debug').is(':checked')) console.debug('Nominatim search:', e.geocode);
	const geoMarker = e.geocode.properties;
	if (geoMarker.osm_id) {
		clear_map('markers');
		rQuery = true;
		show_overpass_layer(geoMarker.osm_type + '(' + geoMarker.osm_id + ');', geoMarker.osm_type.charAt(0).toUpperCase() + geoMarker.osm_id);
		// hide geocoder controls
		setTimeout(function() {
			$('.leaflet-control-geocoder-alternatives').addClass('leaflet-control-geocoder-alternatives-minimized');
			$('.leaflet-control-geocoder-form input').trigger('blur');
			$('.leaflet-control-geocoder').removeClass('leaflet-control-geocoder-expanded');
		}, 50);
	}
}).addTo(map);
$('.leaflet-control-geocoder-icon').html('<i class="fa-solid fa-magnifying-glass"></i><i style="display:none;" class="fa-solid fa-spinner fa-spin-pulse"></i>').attr('title','Address search');
// automate a geocode from a given address
function searchAddr(addr) {
	$('.leaflet-control-geocoder-form input').val(addr);
	geocode.options.geocoder.options.geocodingQueryParams.limit = 1;
	geocode._geocode();
	$('.leaflet-control-geocoder-form input').val('');
	geocode.options.geocoder.options.geocodingQueryParams.limit = maxNomResults;
}

// BUTTON mapillary sequences
const fcnStLvl = L.easyButton({
	id: 'control-mapillary',
	states: [{
		stateName: 'control-mapillary-off',
		icon: 'fa-solid fa-street-view',
		title: 'Show Mapillary street-level views',
		onClick: function() { tour('pano'); }
	}, {
		stateName: 'control-mapillary-on',
		icon: 'fa-solid fa-street-view',
		title: 'Zoom Mapillary street-level views',
		onClick: function() { zoom_area(); }
	}]
}).addTo(map);

// BUTTON bookmarks
L.easyButton({
	id: 'control-bookmarks',
	states: [{
		icon: 'fa-solid fa-bookmark',
		title: 'Show bookmarks',
		onClick: function() {
			if (window.localStorage.favourites) {
				$('#settings-overpass-query').val('(' + window.localStorage.favourites + ')');
				customQuery('(' + window.localStorage.favourites + ')', true);
			}
			else setMsgStatus('fa-solid fa-circle-info', 'Bookmarks', 'Add your favourite places by ' + interactDesc[1] + ' <i class="fa-regular fa-bookmark fa-fw"></i> within a popup.', 4);
		}
	}]
}).addTo(map);

// https://github.com/cliffcloud/Leaflet.EasyButton
// BUTTON clear map
L.easyButton({
	id: 'control-clearlayers',
	states: [{
		icon: 'fa-solid fa-trash',
		title: 'Clear layers',
		onClick: function() { clear_map('all'); }
	}]
}).addTo(map);

// https://github.com/ebrelsford/Leaflet.loading
// BUTTON loading spinner
const loadingControl = L.Control.loading({ separate: true });
map.addControl(loadingControl);
$('.leaflet-control-loading').html('<i class="fa-solid fa-spinner fa-spin-pulse"></i>');

// switches to a tab; links to an anchor; a tour; a tour overlay
function switchTab(tab, anchorTour, poi, actImgLayer) {
	if (tab) {
		if (tab !== actTab) {
			if (tab === 'none') $('.sidebar-close:visible').trigger('click');
			else {
				$('a[href="#' + tab + '"]').trigger('click');
				$('#' + (tab === 'pois' ? tab + ' #pois-icons,' : tab) + ' .sidebar-body').scrollTop(0);
			}
		}
		if (anchorTour) { 
			if (tab === 'tour') {
				$('#tour-controls-list').val(anchorTour).trigger('change');
				if (tab !== actTab) $('a[href="#tour"]').trigger('click');
			}
			else setTimeout(function() { $(anchorTour)[0].scrollIntoView(); }, actTab === 'none' ? 200 : 20);
		}
	}
	if (poi) {
		if (!tab && $(window).width() < 768) $('.sidebar-close:visible').trigger('click');
		clear_map('markers');
		if (poi.charAt(0) === '[' && poi.charAt(poi.length-1) === ']') {
			$('#settings-overpass-query').val(poi);
			customQuery(poi, true);
		}
		else {
			$('#' + poi).prop('checked', true);
			poi_changed();
		}
	}
	else if (actImgLayer) tour(actImgLayer);
}

// https://github.com/Turbo87/sidebar-v2/
const sidebar = $('#sidebar').sidebar();

// https://github.com/mlevans/leaflet-hash
new L.Hash(map);

// https://github.com/perliedman/leaflet-routing-machine
let routingControl;
function setRoutingControl(units) {
	routingControl = L.Routing.control({
		units: units,
		collapsible: false,
		fitSelectedRoutes: false,
		reverseWaypoints: true,
		routeWhileDragging: false,
		showAlternatives: false,
		router: L.Routing.mapbox(window.BOSM.mapboxKey, {
			profile: 'mapbox/walking'
		}),
		lineOptions: {
			styles: [{
				color: 'darkgreen',
				opacity: 0.6,
				weight: noTouch ? 5 : 8
			}]
		},
		pointMarkerStyle: {
			radius: 8,
			color: 'darkgreen',
			opacity: 0.6,
			fillColor: '#fff',
			fillOpacity: 0.4
		},
		geocoder: L.Control.Geocoder.nominatim({
			geocodingQueryParams: {
				bounded: 1,
				viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(',')
			}
		})
	})
	.on('waypointschanged', function(e) {
		permalinkSet();
		setTimeout(function() {
			if (e.waypoints[0].latLng) {
				$('.sidebar-tabs ul li [href="#walking"] .sidebar-notif').text($('.leaflet-marker-draggable').length).show();
				$('.leaflet-routing-delete-waypoints, .leaflet-routing-reverse-waypoints').prop('disabled', false);
				if ($('#settings-debug').is(':checked')) console.debug('Nominatim walkpoint:', e.waypoints);
			}
			else {
				$('.sidebar-tabs ul li [href="#walking"] .sidebar-notif').hide();
				$('.leaflet-routing-delete-waypoints, .leaflet-routing-reverse-waypoints').prop('disabled', true);
			}
		}, 50);
	})
	.on('routeselected', function() {
		if (routingControl.zoomBounds) {
			map.flyToBounds(routingControl._line.getBounds().pad(0.5));
			routingControl.zoomBounds = false;
		}
	});
	$('#routing-control').html(routingControl.onAdd(map));
	$('.leaflet-routing-geocoders').append('<button class="leaflet-routing-delete-waypoints" type="button" onclick="clear_map(\'walk\');" title="Clear waypoints"><i class="fa-solid fa-trash"></i></i></button>');
	$('.leaflet-routing-reverse-waypoints').html('<i class="fa-solid fa-retweet"></i>').attr('title', 'Reverse waypoints');
	$('.leaflet-routing-add-waypoint').html('<i class="fa-solid fa-plus"></i>').attr('title', 'Add a waypoint');
	$('.leaflet-routing-delete-waypoints, .leaflet-routing-reverse-waypoints').prop('disabled', true);
}

function populatePoiTab() {
	let poiTags = {}, category = [], categoryList = [], c;
	for (let poi in pois) if (pois[poi].catName && pois[poi].tagKeyword) {
		// get all keywords and put into categories
		poiTags[poi] = pois[poi].tagKeyword;
		category.push({ listLocation: poi, header: '<img data-key="poi" src="assets/img/icons/' + pois[poi].iconName + '.png">' + pois[poi].catName + ' - ' + pois[poi].name });
		// get unique category label for poi checkbox tab
		if (categoryList.indexOf(pois[poi].catName) === -1) categoryList.push(pois[poi].catName);
	}
	for (c = 0; c < $('#tour-controls-list option').length - 1; c++) if ($('#tour-controls-list option:enabled').eq(c).data('keyword')) {
		category.push({ listLocation: $('#tour-controls-list option').eq(c).text(), header: '<img class="tour-category" data-key="' + $('#tour-controls-list option').eq(c).val() + '" src="assets/img/sidebar-icons.png">Tour - ' + $('#tour-controls-list option').eq(c).text() });
		poiTags[$('#tour-controls-list option').eq(c).text()] = $('#tour-controls-list option').eq(c).data('keyword').split(', ');
	}
	// https://github.com/pawelczak/EasyAutocomplete
	const options = {
		data: poiTags,
		minCharNumber: 3,
		list: {
			showAnimation: { type: 'fade', time: 100 },
			hideAnimation: { type: 'slide', time: 100 },
			maxNumberOfElements: 10,
			match: { enabled: true },
			onLoadEvent: function() {
				// removes empty categories
				$('#eac-container-autocomplete li').last().nextAll('.eac-category').remove();
			},
			onChooseEvent: function() {
				// select poi
				if ($('#eac-container-autocomplete .selected').prevAll('.eac-category').eq(0).find('img').data('key') === 'poi') {
					// find selected items category and split it to get checkbox, then display
					clear_map('markers');
					$('a[href="#pois"]').trigger('click');
					$('.pois-checkbox label[title="' + $('#eac-container-autocomplete .selected').prevAll('.eac-category').eq(0).text().split(' - ')[1] + '"] input').prop('checked', true);
					poi_changed();
				}
				// select tour
				else switchTab('tour', $('#eac-container-autocomplete .selected').prevAll('.eac-category').eq(0).find('img').data('key'));
				$('#autocomplete').val('');
				if ($('#pois-filter-in').val().length) $('#pois-filter-in').val('').trigger('input');
			}
		},
		categories: category
	};
	$('#autocomplete').easyAutocomplete(options);
	$('div.easy-autocomplete').removeAttr('style');
	// create checkbox tables using poi categories
	let checkboxContent = '<div id="pois-filter"><input id="pois-filter-in" type="text" placeholder="Filter, e.g. \'dog\', \'park\', \'eat\', \'bed\'" title="Enter a keyword"><span class="leaflet-routing-remove-waypoint"></span></div>' +
			'<div class="comment" style="text-align:right;">Make up to ' + maxPOICheckbox + ' selections at a time.</div>';
	for (let c = 0; c < categoryList.length; c++) {
		checkboxContent += '<div id="pois-' + categoryList[c].toLowerCase() + '" class="pois-group"><hr><h3>' + categoryList[c] + '</h3>';
		for (let poi in pois) if (pois[poi].catName === categoryList[c]) checkboxContent += L.Util.template(
			'<div class="pois-checkbox">' +
				'<label title="{name}">' +
					'<img alt="" src="assets/img/icons/{icon}.png" loading="lazy">' +
					'<input type="checkbox" id="{key}" data-keyword="{keyword}"><span>{name}</span>' +
				'</label>' +
			'</div>',
			{ key: poi, name: pois[poi].name, icon: pois[poi].iconName, keyword: pois[poi].tagKeyword.join(',') }
		);
		checkboxContent += '</div>';
	}
	$('#pois-icons').append(checkboxContent + '<a class="theme-color sidebar-anchor"></a>');
}
populatePoiTab();

// localStorage detection
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability
function localStorageAvail() {
	let storage;
	try {
		storage = window.localStorage;
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch (e) {
		return e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && (storage && storage.length !== 0);
	}
}

// highlight textboxes on focus
$(':text').on('focus', function() { $(this).trigger('select'); });

// iframe and popup window
// type of popup, url, popup title, iframe caption, iframe animation
function popupWindow(type, url, pTitle, iCap, iAni) {
	const wSize = $(window).width() >= 1024 && $(window).height() >= 500;
	// The Story of Bexhill Street Names book
	if (type === 'streetbook') {
		type = 'auto';
		url = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/tour/itemStreetNames/streetnames.html#' + (darkMode ? 'darkMode' : 'lightMode');
		pTitle = 'bookWindow';
		iCap = '<a href="https://bexhill-osm.org.uk/streetnames" target="_blank">https://bexhill-osm.org.uk/streetnames</a>';
		iAni = 'fade';
	}
	// YouTube video
	else if (type === 'youtube') {
		if (wSize) $.fancybox.open({
			src: 'https://www.youtube.com/embed/' + url,
			youtube: {
				modestbranding: 1,
				iv_load_policy: 3,
				rel: 0
			}
		});
		else {
			type = 'popup';
			url = 'https://www.youtube.com/watch?v=' + url;
		}
	}
	// iframe if larger screen size
	if (type === 'iframe' || (type === 'auto' && wSize)) $.fancybox.open([{
		src: url,
		type: 'iframe',
		opts: {
			caption: iCap || '',
			animationEffect: iAni || 'circular'
		}
	}]);
	// popup window
	else if (type === 'popup' || type === 'auto') window.open(encodeURI(url), pTitle || 'aWindow', 'popup,width=1024,height=768').focus();
}

// keyboard shortcuts
let oInterval;
$('html').on('keydown', function(e) {
	clearInterval(oInterval);
	// ALT-ENTER: full screen
	if (e.keyCode === $.ui.keyCode.ENTER && e.altKey) {
		$('#control-fullscreen').trigger('click');
		e.preventDefault();
	}
	// CTRL-F: address search
	else if (e.keyCode === 70 && e.ctrlKey) {
		$('.leaflet-control-geocoder-icon').trigger('click');
		e.preventDefault();
	}
	// CTRL-DEL: clear all layers
	else if (e.keyCode === $.ui.keyCode.DELETE && e.ctrlKey) {
		$('#control-clearlayers').trigger('click');
		e.preventDefault();
	}
}).on('keyup', function(e) {
	// CTRL down: switch overlay transparency on
	if (e.keyCode === 17 && actOverlayLayer && !measure._measuring) {
		if ($('#control-opacity input').val() >= 0.5) oInterval = setInterval(() => {
			$('#control-opacity input').val(+$('#control-opacity input').val() - 0.05).trigger('input');
			if ($('#control-opacity input').val() == 0.05) {
				clearInterval(oInterval);
				$('#control-opacity input').trigger('change');
			}
		}, 40);
		else if ($('#control-opacity input').val() < 0.5) oInterval = setInterval(() => {
			$('#control-opacity input').val(+$('#control-opacity input').val() + 0.05).trigger('input');
			if ($('#control-opacity input').val() == 1) {
				clearInterval(oInterval);
				$('#control-opacity input').trigger('change');
			}
		}, 40);
		e.preventDefault();
	}
});

// if user presses ENTER instead of selecting a category on home search bar
$('#autocomplete').on('keydown', function(e) {
	if (e.keyCode === $.ui.keyCode.ENTER && !$('#eac-container-autocomplete ul:visible').length) autocomplete();
});
function autocomplete() {
	if ($('#autocomplete').val()) {
		if ($(window).width() < 768) $('.sidebar-close:visible').trigger('click');
		// grid reference lookup
		if ($('#autocomplete').val().startsWith('TQ')) {
			const latlngPoint = new GridRefToWgs84($('#autocomplete').val(), 5);
			clear_map('all');
			if (actOverlayLayer) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
			map.setView(latlngPoint, 18);
			setTimeout(function() { map.fire('click', {
				latlng: latlngPoint,
				layerPoint: map.latLngToLayerPoint(latlngPoint),
				containerPoint: map.latLngToContainerPoint(latlngPoint)
			}); }, 400);
		}
		// address search
		else {
			$('.leaflet-control-geocoder-icon').trigger('click');
			$('.leaflet-control-geocoder-form input').val($('#autocomplete').val());
			geocode._geocode();
		}
	}
}

// map display options
let darkMode, scaleControl;
$('#settings-theme').on('change', function() {
	const cssVar = getComputedStyle($('html')[0],null);
	if ((window.matchMedia('(prefers-color-scheme: dark)').matches && $(this).val() === 'auto') || $(this).val() === 'dark') {
		$('#darkcss').prop('disabled', false);
		$('#tour-frame').contents().find('html').css({
			'--text-color': cssVar.getPropertyValue('--text-color'),
			'--bg-color': cssVar.getPropertyValue('--bg-color'),
			'--bg-color2': cssVar.getPropertyValue('--bg-color2')
		});
		darkMode = true;
	}
	else {
		$('#darkcss').prop('disabled', true);
		$('#tour-frame').contents().find('html').prop('style', '');
		darkMode = false;
	}
	// apply theme to iframes
	$('#tour-frame').contents().find('html').css({
		'--main-color': cssVar.getPropertyValue('--main-color'),
		'--scr-track': cssVar.getPropertyValue('--scr-track'),
		'--scr-thumb': cssVar.getPropertyValue('--scr-thumb'),
		'--scroll-shadow': cssVar.getPropertyValue('--scroll-shadow')
	});
	if (noIframe && localStorageAvail()) window.localStorage.theme = $(this).prop('selectedIndex');
});
$('#settings input').not('#settings-debug').on('change', function() {
	if ($(this).attr('id') === 'settings-unit') {
		// change unit of measurement
		if (routingControl) $('#control-clearlayers').trigger('click');
		if (scaleControl) scaleControl.remove();
		if ($(this).is(':checked')) {
			scaleControl = L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
			setRoutingControl('metric');
			lc.options.metric = true;
			measure.options.unit = 'kilometres';
		}
		else {
			scaleControl = L.control.scale({ metric: false, position: 'bottomleft' }).addTo(map);
			setRoutingControl('imperial');
			lc.options.metric = false;
			measure.options.unit = 'landmiles';
		}
	}
	else if ($(this).attr('id') === 'settings-mapillary') {
		if ($(this).is(':checked')) $('#control-mapillary').parent().show();
		else {
			if (actImgLayer === 'pano') clear_map('markers');
			$('#control-mapillary').parent().hide();
		}
	}
	else if ($(this).attr('id') === 'settings-controlzoom') {
		$('.leaflet-control-zoom').css('display', $(this).is(':checked') ? 'block' : '');
	}
	permalinkSet();
});
$('#settings-cleardata').on('click', function() {
	window.localStorage.clear();
	window.location.href = window.location.origin;
	return false;
});

// developer tools
$('#settings-devtools').accordion({
	heightStyle: 'content',
	animate: 150,
	collapsible: true,
	active: $('#settings-debug').is(':checked') ? 0 : false,
	activate: function(e, ui) { if (ui.oldPanel[0]) $('#settings-overpass-query, #settings-overpass-attic').val(''); }
});
$('#settings-overpass-export').on('click', function() {
	// https://wiki.openstreetmap.org/wiki/Overpass_turbo/Development
	window.open('https://overpass-turbo.eu/?Q=' + encodeURIComponent(queryBbox.replace('[out:json];', '') + '(._;>;);out meta qt;') + '&C=' + mapCentre.join(';') + ';' + mapZoom + '&R', '_blank');
});
$('#settings-overpass-download').on('click', function() {
	// https://wiki.openstreetmap.org/wiki/Overpass_API/XAPI_Compatibility_Layer
	window.location = 'https://' + $('#settings-overpass-server').val() + '/api/map?bbox=' + [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(',');
	$(this).prop('disabled', true);
	setTimeout(function() { $('#settings-overpass-download').prop('disabled', false); }, 20000);
});
function customQuery(q, fromInput) {
	spinner++;
	if (fromInput) clear_map('all');
	if (q.charAt(0) === '[' && q.charAt(q.length-1) === ']') show_overpass_layer('(nw' + ($('#settings-overpass-relation').is(':checked') ? 'r' : '') + q + ';);', '', {
		custom: true,
		bound: true,
		forceBbox: false
	});
	else if (q.charAt(0) === '(' && q.charAt(q.length-1) === ')') show_overpass_layer(q + ';', '', {
		custom: true,
		bound: true,
		forceBbox: false
	});
	else setMsgStatus('fa-solid fa-circle-info', 'Incorrect Query', 'Enclose queries with [ ] for tags,<br>and ( ) for element ids.', 4);
	if (spinner > 0 && fromInput) spinner--;
}
$('#settings-overpass-query').on('keydown', function(e) {
	if (e.keyCode == $.ui.keyCode.ENTER && $(this).val()) customQuery($(this).val(), true);
});
$('#settings-overpass-cache').on('change', function() {
	if ($(this).val() > 720) $(this).val(720);
	else if ($(this).val() < 0) $(this).val(0);
	else if ($(this).val() === '') $(this).val(120);
	if (window.localStorage) window.localStorage.opCacheDur = $(this).val();
	eleCache = [];
});
$('#settings-overpass-server').on('change', function() { if (window.localStorage) {
	window.localStorage.opServer = $(this).prop('selectedIndex');
	// server support for attic data
	$('#settings-overpass-attic').prop('disabled', $('#settings-overpass-server option:selected').data('attic') ? false : true);
	// delete cached overpass queries on server change
	eleCache = [];
	Object.keys(window.localStorage).forEach((key) => { if (key.startsWith('op_')) window.localStorage.removeItem(key); });
	if ($('#settings-debug').is(':checked')) console.debug('Cached Overpass queries have been cleared.');
} });
$('#settings-reverse-server').on('change', function() { if (window.localStorage) window.localStorage.revServer = $(this).prop('selectedIndex'); });
$('#settings-debug').on('change', function(e, init) {
	if ($(this).is(':checked')) {
		console.debug('%cDEBUG MODE ON%c\nAPI requests output to console, map bounds unlocked.', 'color:' + $('html').css('--main-color') + ';font-weight:bold;');
		setMsgStatus('fa-solid fa-bug', 'Debug Mode Enabled', 'Check web console for details.', 4);
		$('#settings-devtools').accordion({ collapsible: false });
		$('.sidebar-tabs ul li [href="#settings"] .sidebar-notif').show();
		map.setMaxBounds();
		map.options.minZoom = 1;
	}
	else {
		$('#settings-devtools').accordion({ collapsible: true });
		$('.sidebar-tabs ul li [href="#settings"] .sidebar-notif').hide();
		map.setMaxBounds(LBounds.pad(1));
		map.options.minZoom = mapMinZoom;
		if (!init) console.debug('%cDEBUG MODE OFF%c', 'color:' + $('html').css('--main-color') + ';font-weight:bold;');
	}
});
$('#settings-debug').trigger('change', [true]);

// clear layers
function clear_map(layer) {
	if (layer === 'markers' || layer === 'all') {
		$('.pois-checkbox input:checked').prop('checked', false);
		poi_changed();
		$('.pois-checkbox').removeClass('pois-loading');
		queryBbox = undefined;
		$('#settings-overpass-export').prop('disabled', true);
		rQuery = false;
		imageOverlay.clearLayers();
		fcnStLvl.state('control-mapillary-off');
		$('.sidebar-tabs ul li [href="#tour"] .sidebar-notif').hide();
		actImgLayer = undefined;
		$('#thennow figure a').off('mouseenter mouseleave');
		$('#control-ww2').remove();
		$('div[role="tooltip"]').remove();
		if (actOverlayLayer && tileOverlayLayer[actOverlayLayer].hide) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
		setPageTitle();
	}
	if (layer === 'all' && $('#pois-filter-in').val().length) $('#pois-filter-in').val('').trigger('input');
	if (layer === 'walk' || layer === 'all') routingControl.setWaypoints([]);
	spinner = 0;
	$('.spinner, #modal').hide();
	permalinkSet();
}

// fly to bounds of layer
function zoom_area(closeTab, layer) {
	let offset = 0, layers = layer || areaOutline.getBounds().extend(iconLayer.getBounds()).extend(imageOverlay.getBounds());
	if ($(window).width() < 768 && closeTab) $('.sidebar-close:visible').trigger('click');
	else if ($(window).width() >= 1024 && !$('.sidebar.collapsed').length) offset = Math.round(sidebar.width());
	map.closePopup();
	if (map.getBoundsZoom(layers) > 18) map.flyTo(layers.getCenter(), 18);
	else map.flyToBounds(layers, { paddingTopLeft: [offset, 0] });
}

function poi_changed(newcheckbox) {
	const poiChk = $('.pois-checkbox input:checked');
	rQuery = false;
	// limit number of active checkboxes
	if (poiChk.length <= maxPOICheckbox) {
		// remove old poi markers and results
		$('#pois-results').css('pointer-events', '');
		$('#pois-results button').prop('disabled', true);
		map.closePopup();
		iconLayer.clearLayers();
		clickOutline.clearLayers();
		areaOutline.clearLayers();
		imageOverlay.clearLayers();
		fcnStLvl.state('control-mapillary-off');
		actImgLayer = undefined;
		setPageTitle();
		poiList = [];
		if (poiChk.is(':checked')) {
			$('#pois-results h3').html('Results loading...');
			$('#pois-results-list').css('opacity', 0.5);
			$('#pois-results').css('min-height', '');
			//build overpass query
			let query = '', selectedPois = '', poiLabels = '';
			poiChk.each(function(i, element) {
				query += pois[element.id].query;
				selectedPois += element.id + '-';
				poiLabels += pois[element.id].name + ', ';
			});
			show_overpass_layer(query, selectedPois.slice(0, -1), {
				bound: true,
				forceBbox: false
			});
			setPageTitle(poiLabels.substring(0,poiLabels.length-2));
		}
		else {
			markerId = undefined;
			$('#pois-results h3').html('Results cleared.');
			$('#pois-results-list').fadeOut(250, function() { $(this).empty(); });
			$('#pois-results').css('min-height', 'unset').slideUp(400, function() { $(this).css('height', ''); });
			$('.sidebar-tabs ul li [href="#pois"] .sidebar-notif').hide();
			permalinkSet();
		}
	}
	else if (poiChk.length > maxPOICheckbox) {
		// flash selected pois and clear layers when max number reached
		poiChk.parent().add('#pois-results button .fa-trash, #control-clearlayers .fa-trash').fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
		$('#' + newcheckbox).prop('checked', false);
	}
	$('.pois-checkbox input').trigger('change');
}
$('.pois-checkbox input').on('click', function() {
	poi_changed($(this).attr('id'));
});
// checkbox highlight
$('.pois-checkbox input').on('change', function() {
	const that = this;
	// timeout fix for chrome not redrawing poi list
	setTimeout(function() {
		if ($(that).prop('checked')) $(that).parent().addClass('pois-checkbox-selected');
		else $(that).parent().removeClass('pois-checkbox-selected');
	}, 500);
});
function poi_list_reverse(sortBy) {
	sortBy = ($('#pois-results-sort.fa-arrow-down-' + sortBy).length ? sortBy : sortBy.split('').reverse().join(''));
	$('#pois-results-sort').removeClass('fa-arrow-down-' + sortBy).addClass('fa-arrow-down-' + sortBy.split('').reverse().join(''));
	$('#pois-results-list tbody').append($.makeArray($('tr', $('#pois-results-list tbody')).detach()).reverse());
}
// jump to next result item
function poi_next() {
	$('#btnPoiResultsNext').prop('disabled', true);
	if (!$('.pois-result-selected').length || $('#pois-results-list tr').last().hasClass('pois-result-selected')) $('#pois-results-list tr').eq(0).trigger('click');
	else $('#pois-results-list tr').eq($('#pois-results-list tr.pois-result-selected').index('tr')+1).trigger('click');
	setTimeout(function() { $('#btnPoiResultsNext').prop('disabled', false); }, 1000);
}

// sets the page title
function setPageTitle(subTitle) {
	$(document).attr('title', (subTitle ? subTitle + ' | ' + $('meta[name=\'application-name\']').attr('content') : $('meta[property=\'og:title\']').attr('content')));
}

// set status message modal
function setMsgStatus(headerIco, headerTxt, msgBody, closeTime) {
	$('#modal').stop(true).html(
		'<div id="modal-head">' +
			'<i class="' + headerIco + ' fa-lg fa-fw"></i> ' + headerTxt +
			'<div class="leaflet-popup-close-button" onclick="clickOutline.clearLayers();$(\'#modal\').stop(true).hide();"><i class="fa-solid fa-xmark fa-sm"></i></div>' +
		'</div>' +
		'<div id="modal-body">' + msgBody + '</div>'
	).fadeIn(200);
	if (closeTime > 0) $('#modal').delay(closeTime*1000).fadeOut(3000);
}

// show tips
function getTips(tip) {
	let nextTip;
	const tips = [
		titleCase(interactDesc[2]) + ' the map to see a context menu with information on that area.',
		titleCase(interactDesc[0]) + ' an area of the above minimap to quickly <i class="fa-solid fa-magnifying-glass-plus fa-sm"></i> to that location.',
		'Zoom into the map and ' + interactDesc[0] + ' almost any place to see more details.',
		'Find any address by entering part of it into Search <i class="fa-solid fa-magnifying-glass fa-sm"></i> and pressing enter.',
		'Almost every street has a history behind its name, search for a road to learn more.',
		'Zoom into the map and ' + interactDesc[0] + ' a bus-stop <i class="fa-solid fa-bus fa-sm"></i> to see real-time information on arrivals.',
		titleCase(interactDesc[3]) + ' to see the next image in a pop-up. ' + titleCase(interactDesc[0]) + ' an image to see it full-screen.',
		titleCase(interactDesc[0]) + ' <i class="fa-solid fa-location-arrow fa-sm"></i> to turn on your location to see place results ordered by distance.',
		titleCase(interactDesc[0]) + ' <i class="fa-solid fa-ruler fa-sm"></i> to measure simple distances. Units can be changed in <a onclick="switchTab(\'settings\');">Settings <i class="fa-solid fa-gear fa-sm"></i></a>.',
		'Quickly create walking <i class="fa-solid fa-person-walking fa-sm"></i> directions by turning on <i class="fa-solid fa-location-arrow fa-sm"></i> and ' + interactDesc[2] + 'ing the map.',
		'Choose between miles or kilometres in <a onclick="switchTab(\'settings\');">Settings <i class="fa-solid fa-gear fa-sm"></i></a>.',
		'Dark theme can be enabled/disabled in <a onclick="switchTab(\'settings\');">Settings <i class="fa-solid fa-gear fa-sm"></i></a>.',
		titleCase(interactDesc[0]) + ' <i class="fa-solid fa-trash fa-sm"></i> to clear all layers from the map.',
		'Touch screen users can quickly close the sidebar by swiping <i class="fa-solid fa-hand-point-up fa-sm"></i> the sidebar title.',
		'Bookmark any place by ' + interactDesc[1] + ' <i class="fa-regular fa-bookmark fa-sm"></i> in a popup, ' + interactDesc[0] + ' it again to remove.',
		'Discover a number of historical overlays using the top-right layer control <i class="fa-solid fa-layer-group fa-sm"></i>.',
		'Results in Places are coloured to show currently open (green) or closed (red).',
		'Zoom into the map and ' + interactDesc[0] + ' a postbox <i class="fa-solid fa-envelope fa-sm"></i> to see the next post collection.',
		'You can find booking information on accommodation under <a onclick="switchTab(\'pois\', \'#pois-leisure-tourism\');">Leisure-Tourism</a>.',
		'Get the latest food hygiene ratings on businesses under <a onclick="switchTab(\'pois\', \'#pois-amenities\');">Amenities</a>.',
		'Find your closest <i class="fa-solid fa-recycle fa-sm"></i> container and the materials it recycles under <a onclick="switchTab(\'pois\', \'#pois-amenities\');">Amenities</a>.',
		'Have a look at our WW2 Incident Map under <a onclick="switchTab(\'tour\', \'ww2\', \'\', \'bombmap\');">History <i class="fa-solid fa-book fa-sm"></i></a>.',
		'Some places have a photosphere view, ' + interactDesc[0] + ' <i class="fa-solid fa-street-view fa-fw"></i> in a popup to view it.',
		'View superimposed and colourised photographs under <a onclick="switchTab(\'thennow\');">Then and Now <i class="fa-regular fa-image fa-sm"></i></a>.',
		'Something wrong or missing on the map? ' + titleCase(interactDesc[2]) + ' the area and <i class="fa-regular fa-sticky-note fa-sm"></i> Leave a note.',
		'1,500 photos, 22,000 buildings and 250 miles of roads have been mapped so far!',
		'This website is open-source and can be used by anyone however they wish!',
		'For a mobile, offline version of this map - give <a href="https://organicmaps.app" target="_blank" rel="noopener">Organic Maps</a> a try.',
		'Anyone can help with building the <i class="fa-regular fa-map fa-sm"></i>, visit <a href="https://osm.org" target="_blank" rel="noopener">OpenStreetMap.org</a> on how to get started.'
	];
	if (tip === 'random') nextTip = Math.floor(Math.random() * tips.length);
	else if (parseInt($('#home-tips-text').data('tip')) === tips.length - 1) nextTip = 0;
	else nextTip = parseInt($('#home-tips-text').data('tip')) + 1;
	$('#home-tips-text').stop(true).fadeOut(150, function() { $(this).html(tips[nextTip]).data('tip', nextTip); }).fadeIn(150);
	$('#home-tips-button').attr('title', 'Next tip (' + (nextTip + 1) + ' of ' + tips.length + ')');
}

function showWeather() {
	// get tides
	// https://developer.admiralty.co.uk/api-details#api=uk-tidal-api&operation=Stations_GetStation
	let tideData = '', tideTooltip = '';
	$.ajax({
		async: false,
		url: 'assets/data/tides.json',
		dataType: 'json',
		mimeType: 'application/json',
		cache: false,
		success: function(json) {
			let tideNext = '', tidePercent = '';
			const tideInfo = { HighWater: ['High-tide', 'fa-caret-up'], LowWater: ['Low-tide', 'fa-caret-down'] };
			$.each(json, function(i, element) { if (new Date().getTime() > new Date(element.DateTime + 'Z').getTime()) tideNext = i+1; });
			const tideTimes = [ new Date(json[tideNext-1].DateTime + 'Z'), new Date(json[tideNext].DateTime + 'Z'), new Date(json[tideNext+1].DateTime + 'Z') ];
			if (tideNext && tideNext < json.length-1) {
				tideTooltip =
					'<i class="fa-solid fa-sm ' + tideInfo[json[tideNext].EventType][1] + '"></i> ' + tideInfo[json[tideNext].EventType][0] + ': ' + json[tideNext].Height.toFixed(2) + 'm in ' + minToTime((new Date(tideTimes[1]) - new Date()) / 60000) + 'ins<br>' +
					'<i class="fa-solid fa-sm ' + tideInfo[json[tideNext+1].EventType][1] + '"></i> ' + tideInfo[json[tideNext+1].EventType][0] + ': ' + json[tideNext+1].Height.toFixed(2) + 'm in ' + minToTime((new Date(tideTimes[2]) - new Date()) / 60000) + 'ins<br>' +
					'<span class="comment">Click to visualise current tide</span>';
				// find percentage of time from current tide to next tide
				tidePercent = Math.round((new Date().getTime() - tideTimes[0].getTime()) / (tideTimes[1].getTime() - tideTimes[0].getTime()) * 100);
				tideData =
					'<div class="home-weather-tide" data-tide-percent="' + tidePercent + ',' + tideInfo[json[tideNext].EventType][0] + ',' + tideInfo[json[tideNext].EventType][1] + '">' +
						'<span><i class="fa-solid fa-water fa-2x"></i></span>' +
						'<span>' +
							'<i class="fa-solid fa-sm ' + tideInfo[json[tideNext].EventType][1] + '"></i> ' + tideTimes[1].toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + '<br>' +
							'<i class="fa-solid fa-sm ' + tideInfo[json[tideNext+1].EventType][1] + '"></i> ' + tideTimes[2].toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) +
						'</span>' +
					'</div>';
			}
			else this.error();
		},
		error: function() { if ($('#settings-debug').is(':checked')) console.debug('ERROR TIDES:', encodeURI(this.url)); }
	});
	// get weather
	// https://openweathermap.org/current
	$.ajax({
		url: 'https://api.openweathermap.org/data/2.5/weather',
		dataType: 'json',
		mimeType: 'application/json',
		cache: false,
		data: { id: '2655777', units: 'metric', appid: window.BOSM.owmKey },
		success: function(json) {
			if (json.weather) {
				const tempIcon = {
					'01d': 'sun', '02d': 'cloud-sun', '03d': 'cloud', '04d': 'cloud', '09d': 'cloud-sun-rain', '10d': 'cloud-rain', '11d': 'cloud-showers-heavy', '13d': 'snowflake', '50d': 'smog',
					'01n': 'moon', '02n': 'cloud-moon', '03n': 'cloud', '04n': 'cloud', '09n': 'cloud-moon-rain', '10n': 'cloud-rain', '11n': 'cloud-showers-heavy', '13n': 'snowflake', '50n': 'smog'
				}, windDir = [
					'North', 'North-northeast', 'Northeast', 'East-northeast',
					"East",  'East-southeast', 'Southeast', 'South-southeast',
					'South', 'South-southwest', 'Southwest', 'West-southwest',
					'West',  'West-northwest', 'Northwest', 'North-northwest'
				], getWinddir = json.wind.deg ? windDir[(Math.floor((json.wind.deg / 22.5) + 0.5)) % 16] : 'Calm';
				$('#home-weather').html(
					'<div class="home-weather-temp">' +
						'<span><i class="fa-solid fa-' + tempIcon[json.weather[0].icon] + ' fa-2x"></i></span>' +
						'<span>' +
							json.weather[0].description.charAt(0).toUpperCase() + json.weather[0].description.slice(1) + '<br>' +
							json.main.temp.toFixed(1) + '&deg;C' +
						'</span>' +
					'</div>' +
					'<div class="home-weather-wind">' +
						'<span><i class="fa-solid fa-wind fa-2x"' + (json.wind.deg ? ' style="transform:rotate(' + (json.wind.deg + 90) + 'deg);"' : '') + '></i></span>' +
						'<span>' +
							getWinddir + '<br>' +
							'<span>' + (json.wind.speed * 2.236936).toFixed(1) + 'mph</span>' +
						'</span>' +
					'</div>' +
					(tideData ? tideData : '')
				).show();
				$('.home-weather-temp, .home-weather-wind').attr('title', '').tooltip($.extend({
					classes: { 'ui-tooltip': 'weather-tooltip' },
					content: '<i class="fa-solid fa-sm fa-cloud"></i> Cloud: ' + json.clouds.all + '%<br>' +
						'<i class="fa-solid fa-sm fa-wind"></i> Gust: ' + (json.wind.gust * 2.236936).toFixed(1) + 'mph<br>' +
						'<i class="fa-solid fa-sm fa-temperature-half"></i> Humidity: ' + json.main.humidity + '%<br>' +
						'<i class="fa-solid fa-sm fa-sun"></i> Sunrise: ' + new Date(json.sys.sunrise * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + '<br>' +
						'<i class="fa-solid fa-sm fa-moon"></i> Sunset: ' + new Date(json.sys.sunset * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + '<br>' +
						'<span class="comment">Data provided by OpenWeather</span>'
				}, tooltipDef)).attr('onclick', 'popupWindow("popup", "https://openweathermap.org/city/' + json.id + '", "owWindow");');
				if (tideData) $('.home-weather-tide').attr('title', '').tooltip($.extend({
					classes: { 'ui-tooltip': 'weather-tooltip' },
					content: tideTooltip
				}, tooltipDef)).attr('onclick', 'tour("tide");');
			}
			else this.error();
			if ($('#settings-debug').is(':checked')) console.debug('Openweather:', json);
		},
		error: function() {
			if ($('#settings-debug').is(':checked')) console.debug('ERROR OPENWEATHER:', encodeURI(this.url));
			$('#home-weather').hide();
			$('#home-minimap').css('padding-top', '2px');
		}
	});
}

// display latest osm changesets
// https://github.com/OSMCha/osmcha-frontend/wiki/API
function showEditFeed() {
	$.ajax({
		url: 'https://osmcha.org/api/v1/changesets/',
		headers: { 'Authorization': 'Token ' + window.BOSM.osmchaTok },
		dataType: 'json',
		cache: false,
		data: {
			page: 1,
			page_size: 5,
			in_bbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(','),
			area_lt: 5
		},
		success: function(data) {
			if (data.features) {
				let s = '';
				$.each(data.features, function(e, itm) {
					s += '<li><span class="fa-li"><i class="fa-solid fa-circle-' + ( itm.properties.is_suspect ? 'question' : 'check') + '"></i></span>' +
					'<a href="https://overpass-api.de/achavi/?changeset=' + encodeURI(itm.id) + '&layers=B0FTTFT" title="' + dateFormat(itm.properties.date, 'short') + '\n' +
					itm.properties.create + ' created\n' + itm.properties.modify + ' modified\n' + itm.properties.delete + ' deleted\n' + itm.properties.comments_count + ' comments">' + timeSince(itm.properties.date) + '</a>' +
					' - <a href="https://www.openstreetmap.org/user/' + encodeURI(itm.properties.user) + '" title="Source: ' + itm.properties.source + '\nEditor: ' + itm.properties.editor + '">' + itm.properties.user + '</a>' +
					'<span onclick="$(this).toggleClass(\'comment-expanded\');" class="comment" title="' + itm.properties.comment + '">' + itm.properties.comment + '</span></li>';
				});
				$('#home-osm-feed')
					.html('Recent map edits:<ul class="fa-ul">' + s + '</ul>')
					.slideDown();
				$('#home-osm-feed a')
					.attr({
						'onClick': 'confirmDialog(this) || event.preventDefault();',
						'target': '_blank',
						'rel': 'noopener'
					});
				if ($('#settings-debug').is(':checked')) console.debug('OSM feed:', data);
			}
			else this.error();
		},
		error: function() { if ($('#settings-debug').is(':checked')) console.debug('ERROR OSM-FEED:', encodeURI(this.url)); }
	});
}

// m = basemap, o = overlay, op = overlay opacity, s = settings, t = tab, u = tour frame, g = image layer, p = grouped pois, i = single poi, w = walkpoints
// tn = thennow slideshow, qg = geocode query, qo = overpass query, ql = location query
function permalinkSet() {
	// get clean url without parameters and hash
	const uri = new URL(window.location.href.split('?')[0].split('#')[0]);
	let selectedPois = '', walkCoords = '', setChk, overlayOpacity, c;
	const walkWayp = routingControl ? routingControl.getWaypoints() : undefined;
	if (actTab !== defTab) uri.searchParams.set('t', actTab);
	if (actBaseTileLayer !== defBaseTileLayer) uri.searchParams.set('m', actBaseTileLayer);
	if (actImgLayer && actTab !== 'thennow') uri.searchParams.set('g', actImgLayer);
	if (actOverlayLayer) {
		uri.searchParams.set('o', actOverlayLayer);
		overlayOpacity = Math.floor(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity * 100);
		if (overlayOpacity === tileOverlayLayer[actOverlayLayer].opacity * 100) overlayOpacity = undefined;
		if (overlayOpacity) uri.searchParams.set('op', overlayOpacity);
	}
	if (walkWayp) {
		for (c = 0; c < walkWayp.length; c++) if (walkWayp[c].latLng) walkCoords += walkWayp[c].latLng.lat.toFixed(5) + 'x' + walkWayp[c].latLng.lng.toFixed(5) + '_';
		if (walkCoords) uri.searchParams.set('w', walkCoords.slice(0, -1));
	}
	if (actTab === 'tour' && $('#tour-controls-list option').eq(0).val() !== $('#tour-controls-list option:selected').eq(0).val()) uri.searchParams.set('u', $('#tour-controls-list option:selected').val());
	if ($('[data-thennow]').length) uri.searchParams.set('tn', $('[data-thennow]').attr('data-thennow'));
	$('.pois-checkbox input:checked').each(function(i, element) { selectedPois += element.id + '-'; });
	if (selectedPois && !$('#settings-overpass-attic').val()) uri.searchParams.set('p', selectedPois.slice(0, -1));
	else if (queryCustom && queryBbox && $('#settings-overpass-query').val() && ($('#settings-bbox').val() !== 'screen') && !$('#settings-overpass-attic').val()) uri.searchParams.set('qo', ($('#settings-overpass-relation').is(':checked') ? 'r' : '') + $('#settings-overpass-query').val());
	if ($('#settings input[data-uri]:checkbox:checked').length) {
		setChk = '';
		for (c = 0; c < $('#settings input[data-uri]:checkbox').length; c++) setChk += $('#settings input[data-uri]:checkbox').eq(c).is(':checked') ? '1' : '0';
		uri.searchParams.set('s', setChk);
	}
	if (noIframe && localStorageAvail()) {
		window.localStorage.setChk = '';
		for (c = 0; c < $('#settings input[data-cache]:checkbox').length; c++) window.localStorage.setChk += $('#settings input[data-cache]:checkbox').eq(c).is(':checked') ? '1' : '0';
	}
	if (markerId && !(rQuery && actImgLayer) && !$('#settings-overpass-attic').val()) uri.searchParams.set('i', markerId);
	window.history.replaceState(null, null, uri + window.location.hash);
}
function permalinkReturn() {
	let uri = new URLSearchParams(Array.from(new URL(window.location.href).searchParams, ([key, value]) => [key.toLowerCase(), value]));
	let junkQ = window.location.href.split('?');
	let c;
	// split fix for facebook and other junk trackers adding ?fbclid etc and busting queries
	if (junkQ.length > 2) {
		uri = URI(junkQ.slice(0, 2).join('?'));
		window.history.replaceState(null, null, '?' + junkQ.slice(0, 2)[1]);
	}
	// check localstorage for settings
	if (noIframe && localStorageAvail()) {
		// set theme
		if (parseInt(window.localStorage.theme) >= 0 && parseInt(window.localStorage.theme) < $('#settings-theme option').length) $('#settings-theme').prop('selectedIndex', window.localStorage.theme);
		// set checkboxes
		if (window.localStorage.setChk) for (c = 0; c < window.localStorage.setChk.length; c++)	$('#settings input[data-cache]:checkbox').eq(c).prop('checked', parseInt(window.localStorage.setChk.charAt(c)));
		// set basemap if none specified
		if (window.localStorage.baseLayer) actBaseTileLayer = window.localStorage.baseLayer;
		// set cache duration
		if (parseInt(window.localStorage.opCacheDur) >= 0 && parseInt(window.localStorage.opCacheDur) <= 240)	$('#settings-overpass-cache').val(parseInt(window.localStorage.opCacheDur));
		else $('#settings-overpass-cache').val($('#settings-overpass-cache').attr('value'));
		// set servers
		if (parseInt(window.localStorage.revServer) >= 0 && parseInt(window.localStorage.revServer) < $('#settings-reverse-server option').length) $('#settings-reverse-server').prop('selectedIndex', window.localStorage.revServer);
		if (parseInt(window.localStorage.opServer) >= 0 && parseInt(window.localStorage.opServer) < $('#settings-overpass-server option').length) $('#settings-overpass-server').prop('selectedIndex', window.localStorage.opServer);
		$('#settings-overpass-attic').prop('disabled', $('#settings-overpass-server option:selected').data('attic') ? false : true);
	}
	else if (!noIframe) $('#settings-theme').val('light');
	$('#settings-theme, #settings-unit, #settings-mapillary, #settings-controlzoom').trigger('change');
	if (!osmRelation) {
		$('#settings-bbox option[value="area_id"]').prop('disabled', true);
		$('#settings-bbox option[value="bbox"]').prop('selected', true);
	}
	if (!noPermalink) {
		if (uri.has('m') && tileBaseLayer[uri.get('m')]) actBaseTileLayer = uri.get('m');
		if (uri.has('o') && tileOverlayLayer[uri.get('o')]) {
			actOverlayLayer = uri.get('o');
			tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].addTo(map);
			if (uri.has('op')) tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(uri.get('op') / 100);
		}
		if (uri.has('s')) {
			const setChk = uri.get('s');
			for (c = 0; c < setChk.length; c++) $('#settings input[data-uri]:checkbox').eq(c).prop('checked', parseInt(setChk.charAt(c)));
			if ($('#settings-debug').is(':checked')) $('#settings-debug').trigger('change');
		}
		if (uri.has('t')) actTab = uri.get('t');
		if (uri.has('u')) {
			const tourVal = uri.get('u');
			if ($('#tour-controls-list option[value=' + tourVal + ']').length && !$('#tour-controls-list option[value=' + tourVal + ']')[0].disabled)
				$('#tour-controls-list').val(tourVal).trigger('change');
		}
		if (uri.has('w')) {
			let walkPoints = uri.get('w');
			walkPoints = walkPoints.split('_');
			for (c = 0; c < walkPoints.length; c++) {
				walkPoints[c] = walkPoints[c].replace('x', ', ');
				routingControl.spliceWaypoints(c, 1, JSON.parse('[' + walkPoints[c] + ']'));
			}
		}
		if (uri.has('g')) {
			// if no latlng tell tour function to zoom to area
			if (window.location.hash.indexOf('/') !== 3) tour(uri.get('g'), '', false);
			else if (uri.get('g') === 'thennow') tour('thennow', uri.has('tn') ? uri.get('tn') : '', true);
			else setTimeout(function() { tour(uri.get('g'), uri.has('i') ? uri.get('i') : '', true); }, 100);
		}
		else if (uri.has('p')) {
			let groupedPoi = uri.get('p');
			if (groupedPoi.indexOf('-') !== -1) groupedPoi = groupedPoi.split('-');
			if (uri.has('i')) markerId = uri.get('i');
			setTimeout(function() {
				if (!Array.isArray(groupedPoi)) $('#' + groupedPoi).prop('checked', true);
				// the last poi has a '/' on it because leaflet-hash
				else for (c = 0; c < groupedPoi.length; c++) { $('#' + groupedPoi[c].replace('/', '')).prop('checked', true); }
				poi_changed(groupedPoi);
			}, 500);
			spinner++;
		}
		else if (uri.has('qo')) {
			let QO = decodeURIComponent(uri.get('qo'));
			if (QO.charAt(0) === 'r') {
				QO = uri.get('qo').slice(1);
				$('#settings-overpass-relation').prop('checked', true);
			}
			else $('#settings-overpass-relation').prop('checked', false);
			$('#settings-overpass-query').val(QO);
			customQuery(QO);
			if (uri.has('i')) markerId = uri.get('i');
			$('#settings-devtools').accordion({ active: 0 });
		}
		else if (uri.has('i')) {
			const singlePoi = uri.get('i');
			rQuery = true;
			spinner++;
			setTimeout(function() { show_overpass_layer(elementType(singlePoi) + '(' + singlePoi.slice(1) + ');', singlePoi.toUpperCase()); }, 500);
		}
		else if (uri.has('qg')) searchAddr(decodeURIComponent(uri.get('qg')));
		if (uri.has('ql')) setTimeout(function() { lc.start(); }, 500);
	}
	else if (uri.has('t')) actTab = uri.get('t');
	tileBaseLayers[tileBaseLayer[actBaseTileLayer].name].addTo(map);
	if (window.location.hash.indexOf('/') !== 3) map.setView(mapCentre, mapZoom);
	if ($('.sidebar-pane#' + actTab).length) {
		sidebar.open(actTab);
		if (actTab === 'thennow' && !uri.has('i')) tour('thennow', uri.has('tn') ? uri.get('tn') : '', true);
	}
	else actTab = 'none';
	// animate sidebar close button on smaller devices if layers underneath
	if ($('.sidebar-pane#' + actTab).length && $(window).width() < 768 && (uri.has('o') || uri.has('g') || uri.has('p') || uri.has('i') || uri.has('w')))
		$('#' + actTab + ' .sidebar-close').addClass('fa-fade');
}
permalinkReturn();

// allow postMessage from these websites when in an iframe
window.addEventListener('message', function(event) {
	const iframeAccess = ['//www.discoverbexhill.com', '//locallist.bexhillheritage.com'];
	if (!noIframe && iframeAccess.findIndex(x => x === event.origin.split(':')[1]) >= 0) switchTab('none', '', event.data);
	else return;
});
