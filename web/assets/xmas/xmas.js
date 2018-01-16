// overlays for christmas

// xmas deco overlay
function xmasDecor() {
	// new town
	L.imageOverlay('assets/xmas/tree.png', [[50.84090, 0.47320], [50.84055, 0.47370]], { opacity: 0.9 }).addTo(map);
	L.imageOverlay('assets/xmas/lights.png', [[50.84037, 0.47415], [50.83800, 0.46980]], { opacity: 0.9 }).addTo(map);
	// little common
	L.imageOverlay('assets/xmas/tree.png', [[50.84545, 0.43400], [50.84510, 0.43350]], { opacity: 0.9 }).addTo(map);
	$('#sidebar').append('<img id="xmasHat" src="assets/xmas/santahat.png">');
	$('#xmas').append(
		'<div id="xmasTitle"><i class="fas fa-tree fa-fw"></i> <a onclick="xmasShops();">Christmas Window Display Competition</a> <i class="fas fa-tree fa-fw"></i></div>' +
		'<div class="comment">2017 is "pantomime themed", in association with shininglightsbexhill.com and bexhillonline.net</div>' +
		'<hr>'
	);
}

function xmasShops() {
	clear_map();
	if ($(window).width() < 768) sidebar.close();
	$.ajax({
		url: 'assets/xmas/2017.geojson',
		dataType: 'json',
		mimeType: 'application/json',
		cache: false,
		success: function (json) {
			imageOverlay.addLayer(L.geoJSON(json, {
				onEachFeature: function (feature, layer) {
					var shopImg = 'soon', shopImgLink = '', shopImgIcon = '', winnerIconColor = '', winnerImgLink = '', winnerImgIcon = '';
					if (feature.properties.img) {
						shopImg = feature.properties.img;
						shopImgLink = 'onclick="window.open(&quot;assets/xmas/' + shopImg + '.jpg&quot;, &quot;imgWindow&quot;, &quot;width=1024, height=768, resizable=yes&quot;)"';
						shopImgIcon += ' <i style="color:#808080;" class="fas fa-image fa-fw"></i>';
					}
					if (feature.properties.winner) {
						switch(feature.properties.winner) {
							case '1st': winnerIconColor = '#ffd700'; break;
							case '2nd': winnerIconColor = '#808080'; break;
							case '3rd': winnerIconColor = '#d2b48c'; break;
							case '4th': winnerIconColor = '#345a55'; break;
							case 'HighlyCommended': winnerIconColor = '#4682b4'; break;
						}
						winnerImgLink = '<img style="position:absolute; left:calc(75% - 20px); top:25px; filter:drop-shadow(0 0 10px #fff);" title="' + feature.properties.winner + '" src="assets/xmas/award-' + feature.properties.winner + '.png">';
						winnerImgIcon = ' <i style="color:' + winnerIconColor + ';" class="fas fa-trophy fa-fw"></i>';
					}
					layer
						.bindPopup(
							'<div class="popup-header" style="background-color:rgb(150, 200, 150);"><h3>' + feature.properties.name + '</h3></div>' +
							'<a ' + shopImgLink + '>' +
								'<div id="img0" class="popup-imgContainer"><img alt="Loading image..." style="width:' + imgSize + 'px; border-color:darkred;" src="assets/xmas/' + shopImg + '.jpg"></div>' +
							'</a>' +
							winnerImgLink +
							'<div class="popup-imgAttrib" style="text-align:center;">' +
								'<a style="color:darkgreen;" onclick="shopDetail(&quot;' + feature.properties.osmid + '&quot;)">(¯`·._.·(¯`·._.· &nbsp; Business Details &nbsp; ·._.·´¯)·._.·´¯)</a>' +
							'</div>',
							{ maxWidth: imgSize, minWidth: imgSize }
						)
						.bindTooltip(
							'<b>Christmas Window Display</b><br><i>' + feature.properties.name + '</i>' + shopImgIcon + winnerImgIcon,
							{ direction: 'left', offset: [-15, -2] }
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
						riseOnHover: true
					});
				}
			}));
		}
	});
	imgLayer = 'xmas';
}

// link to shop
function shopDetail(osmid) {
	iconLayer.clearLayers();
	rQuery = true;
	show_overpass_layer(osmid + ';');
}
