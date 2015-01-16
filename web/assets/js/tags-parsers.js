var titleTmpl = '<h3>{{title}}</h3>';
var tagTmpl = '<span class="fa fa-{{iconName}}"></span> <strong>{{tag}}:</strong> {{value}}<br>';

function develop_parser(element) {
    var tags = element.tags;
    var markerPopup = '<h2>Etiquetas</h2>';
    var tagTmpl = '<tr><td><strong>{{tag}}</strong></td><td>{{value}}</td></tr>';
    markerPopup += '<table>';

    for (tag in tags) {
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: tag, value: tags[tag]});
    }
    markerPopup += '<table>';

    markerPopup += '<h2>Acciones</h2>';

    // View in OpenStreetMap
    var link = Mustache.render(
	'http://www.openstreetmap.org/node/{{id}}',
	{id: element.id}
    );
    markerPopup += Mustache.render(
	'<a href="{{link}}" target="_blank">Ver en OpenStreetMap</a> <br />',
	{link: link}
    );

    // Edit in OpenStreetMap
    var link = Mustache.render(
	'http://www.openstreetmap.org/edit?editor=id&node={{id}}',
	{id: element.id}
    );
    markerPopup += Mustache.render(
	'<a href="{{link}}" target="_blank">Editar en OpenStreetMap</a> <br />',
	{link: link}
    );

    return markerPopup;
}

function address_parser(element) {
    var tags = element.tags;
    var markerPopup = '';

    if (tags['addr:street']) {
	var value = tags['addr:street']
	if (tags['addr:housenumber']) {
	    value += ' ' + tags['addr:housenumber'];
	}
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: 'Dirección', value: value, iconName: 'map-marker'}
	);
    }
    return markerPopup;
}

function website_parser(element) {
    var tags = element.tags;
    var website_tag = tags.website ? tags.website : tags['contact:website'];
    var markerPopup = '';

    if (website_tag) {
	if (website_tag.indexOf('http://') == -1)
	    website_tag = 'http://' + website_tag;
	var link = Mustache.render(
	    '<a href="{{link}}" target="_blank">{{link}}</a>',
	    {link: website_tag}
	);
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: 'Sitio Web', value: link, iconName: 'globe'}
	);
    }
    return markerPopup;
}

function generic_tag_parser(element, tag, tagName, iconName) {
    var tags = element.tags;
    var markerPopup = '';

    if (tags[tag]) {
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: tagName, value: tags[tag], iconName: iconName}
	);
    }
    return markerPopup;
}

function generic_yes_no_tag_parser(element, tag, tagName) {
    var tags = element.tags;
    var markerPopup = '';
    var yes = false;

    if (tags[tag] == 'yes') yes = '<span class="fa fa-check"></span>';
    else if (tags[tag] == 'no') yes = '<span class="fa fa-remove"></span>';

    if (!yes) return ''

    markerPopup += Mustache.render(
	tagTmpl,
	{tag: tagName, value: yes, iconName: 'info-circle'}
    );

    return markerPopup;
}

function bank_parser(element) {
    return parse_tags(
	element,
	'Banco',
	[
	    {callback: generic_yes_no_tag_parser, arg1: 'atm', arg2: 'Cajero Automático'},
	    {callback: generic_tag_parser, arg1: 'network', arg2: 'Red'},
	]
    );
}

function generic_poi_parser(element, titlePopup) {
    return parse_tags(
	element,
	titlePopup,
	[]
    );
}

function fuel_parser(element) {
    return parse_tags(
	element,
	'Estación de Servicio',
	[
	    {callback: generic_tag_parser, arg1: 'brand', arg2: 'Marca'},
	    {callback: generic_yes_no_tag_parser, arg1: 'fuel:diesel', arg2: 'Diesel'},
	    {callback: generic_yes_no_tag_parser, arg1: 'fuel:cng', arg2: 'GNC'},
	]
    );
}

function hotel_parser(element) {
    return parse_tags(
	element,
	'Hotel',
	[
	    {callback: generic_tag_parser, arg1: 'stars', arg2: 'Estrellas', iconName: 'star'},
	]
    );
}

function opening_hours_parser(element) {
    // TODO: https://github.com/ypid/opening_hours.js
}

function internet_access_parser(element) {
    // TODO:
}

function parse_tags(element, titlePopup, functions) {
    // functions = [
    //	{callback: generic_tag_parse,  arg1: 'name', arg2: 'Nombre'},
    //	{callback: address_parser},
    //	{callback: generic_yes_no_tag_parser, arg1: 'fuel:diesel', arg2: 'Diesel'}
    // ]

    var markerPopup = '';
    markerPopup += Mustache.render(
	titleTmpl,
	{title: titlePopup}
    );

    functions = [
	{callback: generic_tag_parser, arg1: 'name', arg2: 'Nombre'},
	{callback: address_parser},
	{callback: generic_tag_parser, arg1: 'phone', arg2: 'Teléfono', iconName: 'phone'},
	{callback: generic_tag_parser, arg1: 'contact:phone', arg2: 'Teléfono', iconName: 'phone'},
	{callback: generic_tag_parser, arg1: 'contact:fax', arg2: 'Fax', iconName: 'fax'},
	{callback: generic_tag_parser, arg1: 'contact:email', arg2: 'Email', iconName: 'at'},
	{callback: generic_tag_parser, arg1: 'email', arg2: 'Email', iconName: 'at'},
	{callback: website_parser},
    ].concat(functions)

    for (var i = 0; i < functions.length; i++) {
	var data = functions[i]
	if (data.arg1 && data.arg2) {
	    var iconName = data.iconName ? data.iconName : 'info-circle';
	    markerPopup += data.callback(element, data.arg1, data.arg2, iconName);
	}
	else {
	    markerPopup += data.callback(element);
	}
    }

    markerPopup += '<br> <span class="fa fa-comments"></span> ';
    markerPopup += '<a href="#" onclick="javascript: sidebar.open(\'comments\'); return false;">Ver comentarios</a>';

    return markerPopup;
}
