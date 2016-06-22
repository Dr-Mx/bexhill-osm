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

    markerPopup += '<h2>Actions</h2>';

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
			value = tags['addr:housenumber'] + ' ' + value;
		}
		if (tags['addr:flats']) {
			value = 'Flats:' + tags['addr:flats'] + ', ' + value;
		}
		if (tags['addr:housename']) {
			value = tags['addr:housename'] + ', ' + value;
		}
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Address', value: value, iconName: 'map-marker'}
		);
    }
    return markerPopup;
}

function website_parser(element) {
    var tags = element.tags;
    var tag = tags.website ? tags.website : tags['contact:website'];
    var markerPopup = '';
    if (tag) {
	var link = Mustache.render(
	    '<a href="{{link}}" target="_blank">{{link}}</a>',
	    {link: tag}
	);
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: 'Website', value: link, iconName: 'globe'}
	);
    }
    return markerPopup;
}

function facebook_parser(element) {
    var tags = element.tags;
    var tag = tags.facebook ? tags.facebook : tags['contact:facebook'];
    var markerPopup = '';
    if (tag) {
		var link = Mustache.render(
	    '<a href="{{link}}" target="_blank">{{link}}</a>',
	    {link: tag}
	);
	markerPopup += Mustache.render(
	    tagTmpl,
	    {tag: 'Facebook', value: link, iconName: 'facebook-official'}
	);
    }
    return markerPopup;
}

function email_parser(element) {
    var tags = element.tags;
    var tag = tags.email ? tags.email : tags['contact:email'];
    var markerPopup = '';
    if (tag) {
	if (tag.indexOf('@') == -1) return markerPopup
		var link = Mustache.render(
			'<a href="mailto:{{email}}" target="_blank">{{email}}</a>',
			{email: tag}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Email', value: link, iconName: 'at'}
		);
    }
    return markerPopup;
}

function phone_parser(element) {
    var tags = element.tags;
    var tag = tags.phone ? tags.phone : tags['contact:phone'];
    var markerPopup = '';
    if (tag) {
		var link = Mustache.render(
			'<a href="tel:{{phone}}">{{phone}}</a>',
			{phone: tag}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Phone', value: link, iconName: 'phone'}
		);
    }
    return markerPopup;
}

function wikipedia_parser(element, tag, tagName, iconName) {
	var tags = element.tags;
	var tag = tags.wikipedia ? tags.wikipedia : tags['site:wikipedia'];
	var markerPopup= '';
	if (tag) {
		var s = tag.split(':');
		var lang = s[0] + '.';
		var subject = s[1];
		var href = 'http://' + lang + 'wikipedia.com/wiki/' + subject;
		var link = Mustache.render(
			'<a href="{{wikipedia}}" target="_blank">' + subject +'</a>',
			{wikipedia: href}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Wikipedia', value: link, iconName: 'wikipedia-w'}
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

function generic_yes_no_tag_parser(element, tag, tagName, iconName) {
    var tags = element.tags;
    var markerPopup = '';
    var iconName = iconName ? iconName : 'info-circle';
    var yes = false;
    if (tags[tag] == 'yes') yes = '<span class="fa fa-check"></span>';
    else if (tags[tag] == 'no') yes = '<span class="fa fa-remove"></span>';
    if (!yes) return ''
    markerPopup += Mustache.render(
		tagTmpl,
		{tag: tagName, value: yes, iconName: iconName}
    );
    return markerPopup;
}

function generic_poi_parser(element, titlePopup) {
    return parse_tags(
	element,
	titlePopup,
	[]
    );
}

function school_parser(element) {
	return parse_tags(
		element,
		'School' || 'College',
		[
			{callback: generic_tag_parser, tag: 'ref:edubase', label: 'EduBase Ref', iconName: 'graduation-cap'},
		]
	);
}

function worship_parser(element) {
	return parse_tags(
		element,
		'Place of Worship',
		[
			{callback: generic_tag_parser, tag: 'religion', label: 'Religion', iconName: 'dot-circle-o'},
			{callback: generic_tag_parser, tag: 'denomination', label: 'Denomination', iconName: 'dot-circle-o'},
			{callback: generic_tag_parser, tag: 'service_times', label: 'Service Times', iconName: 'clock-o'},
		]
	);
}

function food_parser(element) {
	return parse_tags(
		element,
		'Cafe' || 'Fast Food' || 'Restaurant',
		[
			{callback: generic_tag_parser, tag: 'cuisine', label: 'Cuisine', iconName: 'cutlery'},
			{callback: generic_tag_parser, tag: 'takeaway', label: 'Takeaway', iconName: 'shopping-bag'},
			{callback: generic_yes_no_tag_parser, tag: 'delivery', label: 'Delivery', iconName: 'motorcycle'},
			{callback: generic_yes_no_tag_parser, tag: 'outdoor_seating', label: 'Outdoor Seating', iconName: 'sun-o'},
			{callback: generic_yes_no_tag_parser, tag: 'diet:gluten_free', label: 'Gluten Free', iconName: 'dot-circle-o'},
			{callback: generic_yes_no_tag_parser, tag: 'diet:vegan', label: 'Vegan', iconName: 'dot-circle-o'},
			{callback: generic_yes_no_tag_parser, tag: 'diet:vegetarian', label: 'Vegetarian', iconName: 'dot-circle-o'},
		]
	);
}

function taxi_parser(element) {
	return parse_tags(
		element,
		'Taxi',
		[
			{callback: generic_tag_parser, tag: 'capacity', label: 'Taxi Rank Capacity', iconName: 'taxi'},

		]
	);
}		

function recycle_parser(element) {
    return parse_tags(
		element,
		'Recycling',
		[
			{callback: generic_yes_no_tag_parser, tag: 'recycling:batteries', label: 'Batteries', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:books', label: 'Books', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:cans', label: 'Cans', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:cardboard', label: 'Cardboard', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:clothes', label: 'Clothes', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:electrical_appliances', label: 'Electrical Appliances', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:glass', label: 'Glass', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:glass_bottles', label: 'Glass Bottles', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:green_waste', label: 'Green Waste', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:paper', label: 'Paper', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:plastic', label: 'Plastic', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:plastic_packaging', label: 'Plastic Packaging', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:scrap_metal', label: 'Scrap Metal', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:shoes', label: 'Shoes', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:small_appliances', label: 'Small Appliances', iconName: 'recycle'},
			{callback: generic_yes_no_tag_parser, tag: 'recycling:waste', label: 'General Waste', iconName: 'recycle'},
		]
	);
}

function fuel_parser(element) {
    return parse_tags(
		element,
		'Fuel',
		[
			{callback: generic_yes_no_tag_parser, tag: 'fuel:diesel', label: 'Diesel', iconName: 'tint'},
			{callback: generic_yes_no_tag_parser, tag: 'fuel:octane_95', label: 'Octane 95', iconName: 'tint'},
		]
	);
}

function carpark_parser(element) {
    return parse_tags(
		element,
		'Car Parking',
		[
			{callback: generic_tag_parser, tag: 'capacity', label: 'Spaces', iconName: 'car'},
			{callback: generic_tag_parser, tag: 'capacity:disabled', label: 'Disabled Spaces', iconName: 'wheelchair'},
			{callback: generic_tag_parser, tag: 'fee', label: 'Fee', iconName: 'money'},
		]
	);
}

function bikepark_parser(element) {
    return parse_tags(
		element,
		'Bicycle Parking',
		[
			{callback: generic_tag_parser, tag: 'bicycle_parking', label: 'Type', iconName: 'lock'},
			{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'bicycle'},
			{callback: generic_tag_parser, tag: 'covered', label: 'Covered', iconName: 'umbrella'},
		]
	);
}

function hospital_parser(element) {
    return parse_tags(
		element,
		'Hospital',
		[
			{callback: generic_yes_no_tag_parser, tag: 'emergency', label: 'Emergency', iconName: 'ambulance'},
		]
	);
}

function healthcare_parser(element) {
    return parse_tags(
		element,
		'Healthcare',
		[
			{callback: generic_tag_parser, tag: 'healthcare', label: 'Healthcare Type', iconName: 'user-md'},
			{callback: generic_tag_parser, tag: 'healthcare:speciality', label: 'Healthcare Speciality', iconName: 'user-md'},
		]
	);
}

function defib_parser(element) {
    return parse_tags(
		element,
		'Defibrillator',
		[
			{callback: generic_tag_parser, tag: 'defibrillator:location', label: 'Location', iconName: 'location-arrow'},
		]
	);
}

function toilet_parser(element) {
    return parse_tags(
		element,
		'Toilets',
		[
			{callback: generic_yes_no_tag_parser, tag: 'female', label: 'Female', iconName: 'female'},
			{callback: generic_yes_no_tag_parser, tag: 'male', label: 'Male', iconName: 'male'},
			{callback: generic_tag_parser, tag: 'diaper', label: 'Baby Changing', iconName: 'child'},			
		]
	);
}

function club_parser(element) {
	return parse_tags(
		element,
		'Club',
		[
			{callback: generic_tag_parser, tag: 'club', label: 'Club Type', iconName: 'info'},
		]
	);
}

function craft_parser(element) {
    return parse_tags(
		element,
		'Craft',
		[
			{callback: generic_tag_parser, tag: 'craft', label: 'Craft Type', iconName: 'shopping-bag'},
		]
	);
}

function artwork_parser(element) {
	return parse_tags(
		element,
		'Public Artwork',
		[
			{callback: generic_tag_parser, tag: 'artwork_type', label: 'Artwork Type', iconName: 'paint-brush'},
			{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist Name', iconName: 'user'},
			{callback: generic_tag_parser, tag: 'material', label: 'Material', iconName: 'cube'},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Made', iconName: 'calendar'},
		]
	);
}

function historic_parser(element) {
	return parse_tags(
		element,
		'Historical',
		[
			{callback: generic_tag_parser, tag: 'historic', label: 'Historic Type', iconName: 'bank'},
			{callback: generic_tag_parser, tag: 'memorial', label: 'Memorial Type', iconName: 'bank'},
			{callback: generic_tag_parser, tag: 'bunker_type', label: 'Military Bunker Type', iconName: 'fighter-jet'},
			{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist Name', iconName: 'user'},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Made', iconName: 'calendar'},
			{callback: generic_tag_parser, tag: 'inscription', label: 'Inscription', iconName: 'pencil'},
			{callback: generic_tag_parser, tag: 'wreck:date_sunk', label: 'Date Sunk', iconName: 'ship'},
			{callback: generic_yes_no_tag_parser, tag: 'wreck:visible_at_low_tide', label: 'Visible at low tide', iconName: 'ship'},
		]
	);
}

function listedhe_parser(element, tag, tagName, iconName) {
	var tags = element.tags;
	var tag = tags.HE_ref ? tags.HE_ref : tags['he:ref'];
	var markerPopup= '';
	if (tag) {
		var link = Mustache.render(
			'<a href="http://www.britishlistedbuildings.co.uk/en-{{link}}" target="_blank">{{link}}</a>',
			{link: tag}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Historic England Ref', value: link, iconName: 'home'}
		);
	}
	return markerPopup;
}	

function listed_parser(element) {
    return parse_tags(
		element,
		'Heritage Listed',
		[
			{callback: generic_tag_parser, tag: 'listed_status', label: 'Listed Status', iconName: 'home'},
			{callback: listedhe_parser},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Built', iconName: 'calendar'},
		]
	);
}

// https://github.com/ypid/opening_hours.js
function opening_hours_parser(element) {
    try
    {
		var hours = element.tags["opening_hours"];
		var oh = new opening_hours(hours);
        var state = oh.getStateString();
		var nextchange = oh.getNextChange();
		if (state == "open") {
			return "<span style='color:green' class='fa fa-circle'></span> <b>Opening hours:</b> " + hours + "<p>";
		}
		else if (state == "close") {
			return "<span style='color:red' class='fa fa-circle'></span> <b>Opening hours:</b> " + hours + "<p>";
		}
		else if (state == "undefined") {
			return "<span style='color:gray' class='fa fa-circle'></span> <b>Opening hours:</b> " + hours + "<p>";
		}
	}
    catch(err)
    {
        //console.log("ERROR: cannot parse hours: " + hours);
		return "";
    }
}

function parse_tags(element, titlePopup, functions) {
    var markerPopup = '';
    markerPopup += Mustache.render(
	titleTmpl,
	{title: titlePopup}
    );

    functions = [
		{callback: generic_tag_parser, tag: 'name', label: 'Name'},
		{callback: generic_tag_parser, tag: 'operator', label: 'Operator', iconName: 'building-o'},
		{callback: address_parser},
		{callback: phone_parser},
		{callback: email_parser},
		{callback: website_parser},
		{callback: facebook_parser},
		{callback: wikipedia_parser},
		{callback: generic_yes_no_tag_parser, tag: 'internet_access', label: 'Internet Access', iconName: 'wifi'},
		{callback: generic_yes_no_tag_parser, tag: 'wheelchair', label: 'Wheelchair Access', iconName: 'wheelchair'},
		{callback: generic_tag_parser, tag: 'stars', label: 'Stars', iconName: 'star'},
		{callback: generic_tag_parser, tag: 'information', label: 'Info Type', iconName: 'map-signs'},
		{callback: generic_tag_parser, tag: 'description', label: 'Description', iconName: 'pencil-square-o'},
		{callback: opening_hours_parser},
    ].concat(functions)

    for (var i = 0; i < functions.length; i++) {
		var data = functions[i]
		if (data.tag && data.label) {
			var iconName = data.iconName ? data.iconName : 'info-circle';
			markerPopup += data.callback(element, data.tag, data.label, iconName);
		}
		else {
			markerPopup += data.callback(element);
		}
    }

    return markerPopup;
}
