function get_poi(element) {
    // TODO: improve this
    var type = ''
    if (e.tags.highway) {
        if (type == '') type = e.tags.highway;
    }
    if (e.tags.amenity) {
        if (type == '') type = e.tags.amenity;
    }
    if (e.tags.tourism) {
        if (type == '') type = e.tags.tourism;
    }
    if (e.tags.shop) {
	if (e.tags.car_repair == 'wheel_repair') type = 'wheel_repair';
	if (type == '') type = e.tags.shop;
    }
    if (e.tags.leisure) {
	if (type == '') type = e.tags.leisure;
    }

    var poi = pois[type];
    return poi;
}


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

	var poi = get_poi(e)
	// skip this undefined icon
	if (!poi) {
	    console.info('Skipping undefined icon: "' + type + '"');
	    continue;
	}

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

	// used to show the expert mode panel side
	marker._element = e;
	marker.on('click', function(e) {
	    var element = e.target._element;
	    $('#developer > .tags').html(develop_parser(element));

	    var name = element.tags.name ? element.tags.name : element.id;
	    $('#comments #comment-name').html(name);
	    // reload disqus thread
	    DISQUS.reset({
		reload: true,
		config: function () {
		    this.page.identifier = element.id;
		    this.page.url = 'http://pois.elblogdehumitos.com.ar/#!' + element.id;
		}
	    });
	});

	if (poi.tagParser) var markerPopup = poi.tagParser(e);
	else var markerPopup = generic_poi_parser(e, poi.name);

	marker.bindPopup(markerPopup);
	marker.addTo(this.instance);
    }
}

function build_overpass_query() {
    query = '(';
    $('#pois input:checked').each(function(i, element) {
	query += 'node(BBOX)' + pois[element.dataset.key].query + ';';
	query += 'way(BBOX)' + pois[element.dataset.key].query + ';';
	query += 'relation(BBOX)' + pois[element.dataset.key].query + ';';
    });
    query += ');out center;';
}

function setting_changed() {
    // remove pois from current map
    iconLayer.clearLayers();
    build_overpass_query();
    show_overpass_layer();
}

function show_pois_checkboxes() {
    // build the content for the "Home" sidebar pane
    var i = 0;
    var content = '';
    content += '<table>';
    for (poi in pois) {
	if (i % 2 == 0) content += '<tr>';
	content += '<td>';
	var checkbox = Mustache.render(
	    '<div class="poi-checkbox"> \
		<label> \
		    <img src="assets/img/icons/{{icon}}.png"></img> \
		    <input type="checkbox" data-key="{{key}}" onclick="setting_changed()"><span>{{name}}</span> \
		</label> \
	    </div>',
	    {key: poi, name: pois[poi].name, icon: pois[poi].iconName}
	);
	content += checkbox;
	content += '</td>';
	i++;
	if (i % 2 == 0) content += '</tr>';
    }
    content += '</table>';
    $('#pois').append(content);
}

function show_overpass_layer() {
    if (query == '' || query == '();out center;') {
	console.debug('There is nothing selected to filter by.');
	return;
    }
    var opl = new L.OverPassLayer({
	query: query,
	callback: callback,
	minzoom: 14
    });

    iconLayer.addLayer(opl);
}

function get_permalink() {
    var uri = URI(window.location.href);
    var selectedPois = [];
    $('#pois input:checked').each(function(i, element) {
	selectedPois.push(element.dataset.key);
    });

    uri.query({'pois': selectedPois, 'norestoreview': true});
    return uri.href();
}

function update_permalink() {
    var link = get_permalink();
    $('#permalink').attr('href', link);
}
