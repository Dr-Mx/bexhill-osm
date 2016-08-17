// how much to truncate from web addresses labels depending on screensize
if ($(window).width() > 500) var truncWidth = 35;
else var truncWidth = 20;

var titleTmpl = '<h3>{{title}}</h3>';
var tagTmpl = '<span class="fa fa-{{iconName}}"></span> <strong>{{tag}}:</strong> {{value}}<br>';
var tag = '';

function address_parser(element) {
    var tags = element.tags;
    var markerPopup = '';
    if (tags['addr:street'] || tags['addr:place']) {
		var value = '';
		if (tags['addr:housename']) value += tags['addr:housename'] + ', ';
		if (tags['addr:flats']) value += 'Flats:' + tags['addr:flats'] + ', ';
		if (tags['addr:housenumber']) value += tags['addr:housenumber'] + ' ';
		if (tags['addr:street']) value += tags['addr:street'];
		else if (tags['addr:place']) value += tags['addr:place'];
		if (tags['addr:city']) value += ", " + tags['addr:city'];
		if (tags['addr:postcode']) value += ", " + tags['addr:postcode'];
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Address', value: value, iconName: 'map-marker'}
		);
    }
    return markerPopup;
}

function website_parser(element) {
	var tags = element.tags;
	var tagwebsite = tags.website ? tags.website : tags['contact:website'];
	var markerPopup = '';
	var link = '';
	if (tagwebsite) {
		var stagwebsite = tagwebsite;
		if (stagwebsite.length > truncWidth) stagwebsite = stagwebsite.substr(0,truncWidth) + '&hellip;';
		link = Mustache.render(
			'<a href="{{tagwebsite}}" title="{{tagwebsite}}" target="_blank">{{stagwebsite}}</a>',
			{tagwebsite: tagwebsite, stagwebsite: stagwebsite}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Website', value: link, iconName: 'globe'}
		);
    }
	var tagurl = tags.url ? tags.url : tags['contact:url'];
	if (tagurl) {
		var stagurl = tagurl;
		if (stagurl.length > truncWidth) stagurl = stagurl.substr(0,truncWidth) + '&hellip;';
		link = Mustache.render(
			'<a href="{{tagurl}}" title="{{tagurl}}" target="_blank">{{stagurl}}</a>',
			{tagurl: tagurl, stagurl: stagurl}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Just Eat', value: link, iconName: 'external-link-square'}
		);
    }
    return markerPopup;
}

function facebook_parser(element) {
    var tags = element.tags;
    var tagfb = tags.facebook ? tags.facebook : tags['contact:facebook'];
    var markerPopup = '';
    if (tagfb) {
		var stagfb = tagfb;
		if (stagfb.length > truncWidth) stagfb = stagfb.substr(0,truncWidth) + '&hellip;';
		var link = Mustache.render(
			'<a href="{{tagfb}}" title="{{tagfb}}" target="_blank">{{stagfb}}</a>',
			{tagfb: tagfb, stagfb: stagfb}
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
    tag = tags.email ? tags.email : tags['contact:email'];
    var markerPopup = '';
    if (tag) {
		if (tag.indexOf('@') == -1) return markerPopup;
		var link = Mustache.render(
			'<a href="mailto:{{email}}" target="_blank">{{email}}</a>',
			{email: tag}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'E-mail', value: link, iconName: 'at'}
		);
    }
    return markerPopup;
}

function phone_parser(element) {
    var tags = element.tags;
    tag = tags.phone ? tags.phone : tags['contact:phone'];
    var markerPopup = '';
    if (tag) {
		var link = Mustache.render(
			'<a href="tel:{{phone}}" title="Call now">{{phone}}</a>',
			{phone: tag}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Phone', value: link, iconName: 'phone'}
		);
    }
    return markerPopup;
}

function payment_parser(element) {
	var tags = element.tags;
	var markerPopup = '';
	tag = '';
	if (tags['payment:cash'] == 'yes') tag += "cash; ";
	if (tags['payment:debit_cards'] == 'yes') tag += "debit card; ";
	if (tags['payment:credit_cards'] == 'yes') tag += "credit card; ";
	if (tag !== '') markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Payment Options', value: tag, iconName: 'money'}
	);
	return markerPopup;
}

function wikipedia_parser(element) {
	var tags = element.tags;
	tag = tags.wikipedia ? tags.wikipedia : tags['site:wikipedia'];
	var markerPopup = '';
	if (tag) {
		var s = tag.split(':');
		var lang = s[0] + '.';
		var subject = s[1];
		var href = 'http://' + lang + 'wikipedia.com/wiki/' + subject;
		var link = Mustache.render(
			'<a href="{{wikipedia}}" title="Wikipedia article" target="_blank">' + subject + '</a>',
			{wikipedia: href}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Wikipedia', value: link, iconName: 'wikipedia-w'}
		);
	}
	return markerPopup;
}

function star_parser(element) {
	var tags = element.tags;
	tag = tags.stars;
	var markerPopup = '';
	if (tag) {
		var result = '<a href="https://www.visitengland.com/plan-your-visit/quality-assessment-and-star-ratings/visitengland-star-ratings" title="VisitEngland ratings" target="_blank">';
		for (var i = 0; i < tag; i++) {
			result += '<span class="fa fa-star-o"></span>';
		}
		result += '</a>';
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'VisitEngland Rating', value: result, iconName: 'star'}
		);
	}
	return markerPopup;
}
	

function generic_tag_parser(element, tag, tagName, iconName) {
	var tags = element.tags;
	var markerPopup = '';
	var result = '';
	if (tags[tag]) {
		if (tags[tag] == 'yes') result = '<span class="fa fa-check"></span>';
		else if (tags[tag] == 'no') result = '<span class="fa fa-remove"></span>';
		else result = tags[tag];
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: tagName, value: result, iconName: iconName}
		);
	}
	return markerPopup;
}

function generic_poi_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[]
	);
}

function hairdresser_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'female', label: 'Female', iconName: 'female'},
			{callback: generic_tag_parser, tag: 'male', label: 'Male', iconName: 'male'},
			{callback: generic_tag_parser, tag: 'unisex', label: 'Unisex', iconName: 'venus-mars'}
		]
	);
}

function bike_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'service:bicycle:retail', label: 'Bike Sales', iconName: 'bicycle'},
			{callback: generic_tag_parser, tag: 'service:bicycle:second_hand', label: 'Second Hand', iconName: 'bicycle'},
			{callback: generic_tag_parser, tag: 'service:bicycle:rental', label: 'Bike Rental', iconName: 'bicycle'},
			{callback: generic_tag_parser, tag: 'service:bicycle:repair', label: 'Bike Repair', iconName: 'bicycle'},
			{callback: generic_tag_parser, tag: 'service:bicycle:pump', label: 'Free Pump', iconName: 'bicycle'}
		]
	);
}

function school_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'ref:edubase', label: 'EduBase Ref', iconName: 'graduation-cap'}
		]
	);
}

function worship_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'religion', label: 'Religion', iconName: 'dot-circle-o'},
			{callback: generic_tag_parser, tag: 'denomination', label: 'Denomination', iconName: 'dot-circle-o'},
			{callback: generic_tag_parser, tag: 'service_times', label: 'Service Times', iconName: 'clock-o'}
		]
	);
}

function socialf_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'social_facility', label: 'Facility Type', iconName: 'users'},
			{callback: generic_tag_parser, tag: 'social_facility:for', label: 'Facility For', iconName: 'users'},
			{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'users'}
		]
	);
}

function food_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'cuisine', label: 'Cuisine', iconName: 'cutlery'},
			{callback: diet_parser},
			{callback: facility_parser}
		]
	);
}

function diet_parser(element) {
	var tags = element.tags;
	var markerPopup = '';
	tag = '';
	if (tags['diet:gluten_free'] == 'yes') tag += "gluten free; ";
	if (tags['diet:vegan'] == 'yes') tag += "vegan; ";
	if (tags['diet:vegetarian'] == 'yes') tag += "vegetarian; ";
	if (tag !== '') markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Diet Options', value: tag, iconName: 'cutlery'}
	);
	return markerPopup;
}

function pub_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'real_ale', label: 'Real Ale', iconName: 'beer'},
			{callback: generic_tag_parser, tag: 'real_cider', label: 'Real Cider', iconName: 'beer'},
			{callback: facility_parser}
		]
	);
}

function facility_parser(element) {
	var tags = element.tags;
	var markerPopup = '';
	tag = '';
	if (tags.takeaway == 'yes') tag += "takeaway; ";
	else if (tags.takeaway == 'only') tag += "takeaway only; ";
	if (tags.delivery == 'yes') tag += "delivery; ";
	if (tags.outdoor_seating == 'yes') tag += "outdoor seating; ";
	if (tags.reservation == 'yes') tag += "takes reservation; ";
	else if (tags.reservation == 'required') tag += "needs reservation; ";
	if (tag !== '') markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Facilities', value: tag, iconName: 'shopping-bag'}
	);
	return markerPopup;
}	

function post_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'post_box:type', label: 'Type', iconName: 'archive'},
			{callback: generic_tag_parser, tag: 'ref', label: 'Post-Box Ref', iconName: 'archive'},
			{callback: generic_tag_parser, tag: 'royal_cypher', label: 'Royal Cypher', iconName: 'archive'},
			{callback: generic_tag_parser, tag: 'collection_times', label: 'Collection Times', iconName: 'clock-o'}
		]
	);
}

function taxi_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'capacity', label: 'Taxi Rank Capacity', iconName: 'taxi'}

		]
	);
}		

function recycle_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'recycling:batteries', label: 'Batteries', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:books', label: 'Books', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:cans', label: 'Cans', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:cardboard', label: 'Cardboard', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:clothes', label: 'Clothes', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:electrical_appliances', label: 'Electrical Appliances', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:glass', label: 'Glass', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:glass_bottles', label: 'Glass Bottles', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:green_waste', label: 'Green Waste', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:paper', label: 'Paper', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:plastic', label: 'Plastic', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:plastic_packaging', label: 'Plastic Packaging', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:scrap_metal', label: 'Scrap Metal', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:shoes', label: 'Shoes', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:small_appliances', label: 'Small Appliances', iconName: 'recycle'},
			{callback: generic_tag_parser, tag: 'recycling:waste', label: 'General Waste', iconName: 'recycle'}
		]
	);
}

function fuel_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'shop', label: 'Shop', iconName: 'shopping-basket'},
			{callback: generic_tag_parser, tag: 'fuel:diesel', label: 'Diesel', iconName: 'tint'},
			{callback: generic_tag_parser, tag: 'fuel:octane_95', label: 'Octane 95', iconName: 'tint'}
		]
	);
}

function carpark_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'capacity', label: 'Spaces', iconName: 'car'},
			{callback: generic_tag_parser, tag: 'capacity:disabled', label: 'Disabled Spaces', iconName: 'wheelchair'},
			{callback: generic_tag_parser, tag: 'fee', label: 'Fee', iconName: 'money'}
		]
	);
}

function bikepark_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'bicycle_parking', label: 'Type', iconName: 'lock'},
			{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'bicycle'},
			{callback: generic_tag_parser, tag: 'covered', label: 'Covered', iconName: 'umbrella'}
		]
	);
}

function hospital_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'emergency', label: 'Emergency', iconName: 'ambulance'}
		]
	);
}

function healthcare_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'healthcare', label: 'Healthcare Type', iconName: 'user-md'},
			{callback: generic_tag_parser, tag: 'healthcare:speciality', label: 'Healthcare Speciality', iconName: 'user-md'}
		]
	);
}

function defib_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'defibrillator:location', label: 'Location', iconName: 'location-arrow'}
		]
	);
}

function toilet_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'female', label: 'Female', iconName: 'female'},
			{callback: generic_tag_parser, tag: 'male', label: 'Male', iconName: 'male'},
			{callback: generic_tag_parser, tag: 'diaper', label: 'Baby Changing', iconName: 'child'}
		]
	);
}

function club_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'club', label: 'Club Type', iconName: 'comments'},
			{callback: generic_tag_parser, tag: 'sport', label: 'Sport Type', iconName: 'trophy'}
		]
	);
}

function clothes_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'female', label: 'Female', iconName: 'female'},
			{callback: generic_tag_parser, tag: 'male', label: 'Male', iconName: 'male'},
			{callback: generic_tag_parser, tag: 'second_hand', label: 'Second Hand', iconName: 'shopping-bag'}
		]
	);
}


function craft_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'craft', label: 'Craft Type', iconName: 'shopping-bag'}
		]
	);
}

function artwork_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'artwork_type', label: 'Artwork Type', iconName: 'paint-brush'},
			{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist Name', iconName: 'user'},
			{callback: generic_tag_parser, tag: 'material', label: 'Material', iconName: 'cube'},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Made', iconName: 'calendar'}
		]
	);
}

function info_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'information', label: 'Info Type', iconName: 'map-signs'},
			{callback: generic_tag_parser, tag: 'map_size', label: 'Map Size', iconName: 'map-signs'},
			{callback: generic_tag_parser, tag: 'ref', label: 'Reference', iconName: 'slack'}
		]
	);
}

function historic_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'historic', label: 'Historic Type', iconName: 'bank'},
			{callback: generic_tag_parser, tag: 'memorial', label: 'Memorial Type', iconName: 'bank'},
			{callback: generic_tag_parser, tag: 'bunker_type', label: 'Military Bunker Type', iconName: 'fighter-jet'},
			{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist Name', iconName: 'user'},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Made', iconName: 'calendar'},
			{callback: generic_tag_parser, tag: 'inscription', label: 'Inscription', iconName: 'pencil'},
			{callback: generic_tag_parser, tag: 'wreck:date_sunk', label: 'Date Sunk', iconName: 'ship'},
			{callback: generic_tag_parser, tag: 'wreck:visible_at_low_tide', label: 'Visible at low tide', iconName: 'ship'}
		]
	);
}

function listedhe_parser(element) {
	var tags = element.tags;
	tag = tags.HE_ref ? tags.HE_ref : tags['he:ref'];
	var markerPopup= '';
	if (tag) {
		var link = Mustache.render(
			'<a href="http://www.britishlistedbuildings.co.uk/en-{{link}}" title="British Listed Buildings" target="_blank">{{link}}</a>',
			{link: tag}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Historic England Ref', value: link, iconName: 'home'}
		);
	}
	return markerPopup;
}	

function listed_parser(element, titlePopup) {
    return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'listed_status', label: 'Listed Status', iconName: 'home'},
			{callback: listedhe_parser},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Built', iconName: 'calendar'}
		]
	);
}

// https://github.com/ypid/opening_hours.js
var openhrs = '';
var state = '';
function opening_hours_parser(element) {
	try
    {
		var opening_hours = require('opening_hours');
		var hours = element.tags.opening_hours;
		if (hours === '') console.log("test");
		var oh = new opening_hours(hours);
        state = oh.getState();
		var prettified_value = oh.prettifyValue();
		if (state === true) openhrs = "<span style='color:green' class='fa fa-circle'></span> <b>Opening hours:</b> " + prettified_value;
		else if (state === false) openhrs = "<span style='color:red' class='fa fa-circle'></span> <b>Opening hours:</b> " + prettified_value;
	}
    catch(err)
    {
		if (hours !== null) console.log("ERROR: Object '" + element.tags.name + "' cannot parse hours: " + hours + ". " + err);
		openhrs = '';
    }
	// return false state for no hours - opennow checkbox
	if (element.tags.opening_hours === null) state = false;
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
		{callback: star_parser},
		{callback: generic_tag_parser, tag: 'access', label: 'Access', iconName: 'sign-in'},
		{callback: generic_tag_parser, tag: 'internet_access', label: 'Internet Access', iconName: 'wifi'},
		{callback: generic_tag_parser, tag: 'wheelchair', label: 'Wheelchair Access', iconName: 'wheelchair'},
		{callback: generic_tag_parser, tag: 'dog', label: 'Dog Friendly', iconName: 'paw'},
		{callback: generic_tag_parser, tag: 'description', label: 'Description', iconName: 'pencil-square-o'},
		{callback: payment_parser}
	].concat(functions);
	for (var i = 0; i < functions.length; i++) {
		var data = functions[i];
		if (data.tag && data.label) {
			var iconName = data.iconName ? data.iconName : 'info-circle';
			markerPopup += data.callback(element, data.tag, data.label, iconName);
		}
		else markerPopup += data.callback(element);
	}
	opening_hours_parser(element);
	markerPopup += openhrs;
	return markerPopup;
}
