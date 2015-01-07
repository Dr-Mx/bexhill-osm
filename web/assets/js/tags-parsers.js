var tagTmpl = '<strong>{{tag}}:</strong> {{value}}<br>';

function develop_parser(element) {
    tags = element.tags;
    markerPopup = '\
        <div role="tabpanel" class="tab-pane" id="raw">\
        <h4>Developer tools</h4>\
    ';
    for (tag in tags) {
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: tag, value: tags[tag]});
    }

    link = Mustache.render(
	'http://www.openstreetmap.org/node/{{id}}',
	{id: element.id}
    );
    markerPopup += Mustache.render(
	'<a href="{{link}}">View in OpenStreetMap</a>',
	{link: link}
    );
    markerPopup += '</div>';
    return markerPopup;
}

function address_parser(element) {
    tags = element.tags;
    markerPopup = '';
    if (tags['addr:street']) {
	value = tags['addr:street'] + ' ' + tags['addr:housenumber'] || '';
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: 'Dirección', value: value}
	);
    }
    return markerPopup;
}

function website_parser(element) {
    tags = element.tags;
    markerPopup = '';
    if (tags.website) {
	if (tags.website.indexOf('http://') == -1) 
	    tags.website = 'http://' + tags.website;
	link = Mustache.render(
	    '<a href="{{link}}">{{link}}</a>',
	    {link: tags.website}
	);
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: 'Sitio Web', value: link}
	);
    }
    return markerPopup;
}

function atm_parser(element) {
    tags = element.tags;
    markerPopup = '';
    if (tags.amenity == 'bank') {
	if (tags.atm == 'yes') yes = 'Sí';
	else if (tags.atm == 'no') yes = 'No';
	else yes = 'Sin definir';
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: 'Cajero Automático', value: yes}
	);
    }
    return markerPopup;
}

function generic_tag_parser(element, tag, tagName) {
    tags = element.tags;
    markerPopup = '';
    if (tags[tag]) {
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: tagName, value: tags[tag]}
	);
    }
    return markerPopup;
}

var tabContentTmpl = '\
      <div class="tab-content">\
        <div role="tabpanel" class="tab-pane active" id="info">\
    ';
var titleTmpl = '<h4>{{title}}</h4>';


function bank_parser(element) {
    tags = element.tags;
    titlePopup = '';

    if (tags.amenity == 'bank') titlePopup = 'Banco';
    if (tags.amenity == 'atm') titlePopup = 'Cajero automático';

    var markerPopup = '';
    markerPopup += tabContentTmpl;

    markerPopup += Mustache.render(
	titleTmpl,
	{title: titlePopup}
    );

    markerPopup += generic_tag_parser(element, 'name', 'Nombre');
    markerPopup += atm_parser(element);
    markerPopup += generic_tag_parser(element, 'phone', 'Teléfono');
    markerPopup += address_parser(element);
    markerPopup += website_parser(element);
    markerPopup += '</div>';

    markerPopup += develop_parser(element);
    markerPopup += '</div>';

    // alert(markerPopup);
    return markerPopup;
}

function car_repair_parser(element) {
    tags = element.tags;
    titlePopup = '';

    if (tags.shop == 'car_repair') {
	titlePopup = 'Taller';
	if (tags.car_repair == 'wheel_repair')
	    titlePopup = 'Gomería';
    }

    var markerPopup = '';
    markerPopup += tabContentTmpl;
    markerPopup += Mustache.render(
	titleTmpl,
	{title: titlePopup}
    );

    markerPopup += generic_tag_parser(element, 'name', 'Nombre');
    markerPopup += generic_tag_parser(element, 'phone', 'Teléfono');
    markerPopup += address_parser(element);
    markerPopup += website_parser(element);
    markerPopup += '</div>';

    markerPopup += develop_parser(element);
    markerPopup += '</div>';

    return markerPopup;
}
