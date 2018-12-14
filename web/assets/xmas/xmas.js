// overlays for holidays

// holiday decorations overlay
function holidayDecor() {
	if (new Date().getMonth() === 3 && new Date().getDate() >= 20) $('#sidebar').append('<img id="holidayImg" src="assets/img/holidays/easterSb.png">');
	else if (new Date().getMonth() === 9 && new Date().getDate() >= 20) $('#sidebar').append('<img id="holidayImg" src="assets/img/holidays/halloweenSb.png">');
	else if ((new Date().getMonth() === 10 && new Date().getDate() >= 25) || new Date().getMonth() === 11) {
		$('html').css('--main-color', 'darkred');
		// new town
		L.imageOverlay('assets/img/holidays/xmasMapTree.png', [[50.84090, 0.47320], [50.84055, 0.47370]], { opacity: 0.9 }).addTo(map);
		// L.imageOverlay('assets/img/holidays/xmasMapLights.png', [[50.84037, 0.47415], [50.83800, 0.46980]], { opacity: 0.9 }).addTo(map);
		// little common
		L.imageOverlay('assets/img/holidays/xmasMapTree.png', [[50.84545, 0.43400], [50.84510, 0.43350]], { opacity: 0.9 }).addTo(map);
		$('#sidebar').append('<img id="holidayImg" src="assets/img/holidays/xmasSb.png">');
		$('#xmasMsg').append(
			'<div id="xmasTitle"><i class="fas fa-tree fa-lg fa-fw"></i> <a onclick="tour(\'xmas\');">Christmas Window Display Competition</a> <i class="fas fa-snowman fa-lg fa-fw"></i></div>' +
			'<div class="comment">2018 is carol and song themed, in association with Shining&nbsp;Lights and Bexhill&nbsp;Online</div>'
		);
	}
}

function xmasShops(year) {
	clear_map();
	$('#spinner').show();
	if ($(window).width() < 768) $('.sidebar-close').click();
	$.ajax({
		url: 'assets/xmas/' + year + '/' + year + '.geojson',
		dataType: 'json',
		mimeType: 'application/json',
		cache: false,
		success: function (json) {
			imageOverlay.addLayer(L.geoJSON(json, {
				onEachFeature: function (feature, layer) {
					var shopImg = 'soon', shopImgLink = '', shopImgIcon = '', winnerIconColor = '', winnerImgLink = '', winnerImgIcon = '';
					if (feature.properties.img) {
						shopImg = year + '/' + feature.properties.img;
						shopImgIcon += ' <i style="color:#808080;" class="fas fa-image fa-fw"></i>';
					}
					if (feature.properties.winner) {
						switch(feature.properties.winner) {
							case '1st': winnerIconColor = '#ffd700'; break;
							case '2nd': winnerIconColor = '#bbb'; break;
							case '3rd': winnerIconColor = '#d2b48c'; break;
							case '4th': winnerIconColor = '#345a55'; break;
							case 'HighlyCommended': winnerIconColor = '#6b7186'; break;
						}
						winnerImgLink = '<img class="popup-xmas-award" title="' + feature.properties.winner + '" src="assets/xmas/award-' + feature.properties.winner + '.png">';
						winnerImgIcon = ' <i style="text-shadow:1px 1px 2px black; color:' + winnerIconColor + ';" class="fas fa-trophy fa-lg fa-fw"></i>';
					}
					layer
						.bindPopup(
							'<div class="popup-header"><h3>' + feature.properties.name + '</h3></div>' +
							winnerImgLink + generic_img_parser('assets/xmas/' + shopImg + '.jpg', 0, 'inherit', '<a onclick="shopDetail(\'' + feature.properties.osmid + '\')">Business details</a>'),
							{ maxWidth: imgSize, minWidth: imgSize, className: 'popup-xmas' }
						)
						.bindTooltip(
							'<b>Christmas Window Display</b><br><i>' + feature.properties.name + '</i>' + shopImgIcon + winnerImgIcon,
							{ direction: 'right', offset: [15, 2], interactive: true }
						);
				},
				pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {
						bounceOnAdd: true,
						bounceOnAddOptions: {
							duration: 500,
							height: 200
						},
						bounceOnAddCallback: function() { map.flyToBounds(imageOverlay.getBounds().pad(0.5)); },
						icon: L.icon({
							iconUrl: 'assets/xmas/window.png',
							iconSize: [32, 37],
							iconAnchor: [16, 35],
							shadowUrl: 'assets/img/icons/000shadow.png',
							shadowAnchor: [16, 27],
							popupAnchor: [0, -27]
						}),
						keyboard: false,
						riseOnHover: true,
						zIndexOffset: 1000
					});
				}
			}));
		}
	});
	imgLayer = 'xmas';
	$('#spinner').fadeOut('fast');
}

// link to shop
function shopDetail(osmid) {
	clear_map('poi');
	rQuery = true;
	show_overpass_layer(elementType(osmid) + '(' + osmid.slice(1) + ');', osmid);
}
