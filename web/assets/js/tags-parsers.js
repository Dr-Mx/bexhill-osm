// how much to truncate from web addresses labels depending on screensize
var truncWidth = ($(window).width() > 500) ? 35 : 20;
// tag template
var tagTmpl = '<i class="fa fa-{{iconName}}"></i> <strong>{{tag}}:</strong> {{value}}<br>', tag = '';

// edit in osm
function osmedit_parser(element) {
	var link = Mustache.render(
		'http://www.openstreetmap.org/edit?editor=id&{{type}}={{id}}',
		{type: element.type, id: element.id}
	);
	var markerPopup = Mustache.render(
		'<a style="top:19px;right:20px;position:absolute;" href="{{link}}" title="Edit in OpenStreetMap" target="_blank"><i class="fa fa-pencil"></i></a>',
		{link: link}
	);
	return markerPopup;
}

function generic_tag_parser(element, tag, tagName, iconName) {
	var tags = element.tags;
	var markerPopup = '';
	var result = '';
	if (tags[tag]) {
		if (tags[tag] === 'yes') result = '<i class="fa fa-check"></i>';
		else if (tags[tag] === 'no') result = '<i class="fa fa-remove"></i>';
		else result = tags[tag];
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: tagName, value: result, iconName: iconName}
		);
	}
	return markerPopup;
}

// used if poi has no parser
function generic_poi_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[]
	);
}

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
		if (tags['addr:city']) value += ', ' + tags['addr:city'];
		if (tags['addr:postcode']) value += ', ' + tags['addr:postcode'];
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
	var link = '';
	var markerPopup = '';
	if (tagwebsite) {
		var stagwebsite = tagwebsite;
		if (stagwebsite.length > truncWidth) stagwebsite = stagwebsite.substr(0, truncWidth) + '&hellip;';
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
		if (tag.indexOf('@') === -1) return markerPopup;
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

function facility_parser(element) {
	var tags = element.tags;
	var markerPopup = '';
	tag = '';
	if (tags.wheelchair === 'yes') tag += '<i class="fa fa-wheelchair fa-fw" title="wheelchair access" style="color:darkgreen"></i>';
	else if (tags.wheelchair === 'limited') tag += '<i class="fa fa-wheelchair fa-fw" title="limited wheelchair access" style="color:teal"></i>(limited) ';
	else if (tags.wheelchair === 'no') tag += '<i class="fa fa-wheelchair fa-fw" title="no wheelchair access" style="color:red"></i>(no) ';
	if (tags.dog === 'yes') tag += '<i class="fa fa-paw fa-fw" title="dog friendly" style="color:darkgreen"></i>';
	else if (tags.dog === 'no') tag += '<i class="fa fa-paw fa-fw" title="no dog access" style="color:red"></i>(no) ';
	if (tags.internet_access === 'yes') tag += '<i class="fa fa-wifi fa-fw" title="internet access" style="color:darkgreen"></i>';
	if (tag) markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Facilities', value: tag, iconName: 'info-circle'}
	);
	return markerPopup;
}

function payment_parser(element) {
	var tags = element.tags, key;
	var markerPopup = '';
	tag = '';
	for (key in tags) {
		if (key.indexOf('payment:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[1] + '; ';
	}
	if (tag) markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Payment options', value: tag, iconName: 'money'}
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

function hotel_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: star_parser},
			{callback: generic_tag_parser, tag: 'rooms', label: 'Rooms', iconName: 'bed'},
			{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'bed'},
			{callback: generic_tag_parser, tag: 'balcony', label: 'Balcony', iconName: 'dot-circle-o'},
			{callback: generic_tag_parser, tag: 'view', label: 'View', iconName: 'dot-circle-o'},
			{callback: generic_tag_parser, tag: 'cooking', label: 'Cooking facilities', iconName: 'dot-circle-o'}
		]
	);
}

function star_parser(element) {
	var tags = element.tags;
	tag = tags.stars;
	var markerPopup = '';
	if (tag) {
		var result = '<a href="https://www.visitengland.com/plan-your-visit/quality-assessment-and-star-ratings/visitengland-star-ratings" title="VisitEngland ratings" target="_blank">';
		for (var i = 0; i < tag; i++) {
			result += '<i class="fa fa-star-o"></i>';
		}
		result += '</a>';
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'VisitEngland rating', value: result, iconName: 'star'}
		);
	}
	return markerPopup;
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

function bikeshop_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: bikeservices_parser}
		]
	);
}
function bikeservices_parser(element) {
	var tags = element.tags, key;
	var markerPopup = '';
	tag = '';
	for (key in tags) {
		if (key.indexOf('service:bicycle:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[2] + '; ';
	}
	if (tag) markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Bicycle services', value: tag, iconName: 'bicycle'}
	);
	return markerPopup;
}

function school_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: edubase_parser}
		]
	);
}

function edubase_parser(element) {
	var tags = element.tags;
	tag = tags['ref:edubase'];
	var markerPopup = '';
	if (tag) {
		var link = Mustache.render(
			'<a href="http://www.education.gov.uk/edubase/establishment/summary.xhtml?urn={{link}}" title="Department for Education" target="_blank">{{link}}</a>',
			{link: tag}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'EduBase ref', value: link, iconName: 'file'}
		);
	}
	return markerPopup;
}

function fhrs_parser(element) {
	var tags = element.tags;
	tag = tags['fhrs:id'];
	var markerPopup= '';
	if (tag) {
		var link = Mustache.render(
			'<a href="http://ratings.food.gov.uk/business/en-GB/{{link}}" title="Food Standards Agency" target="_blank">{{link}}</a>',
			{link: tag}
		);
		markerPopup += Mustache.render(
			tagTmpl,
			{tag: 'Food Hygiene id', value: link, iconName: 'file'}
		);
	}
	return markerPopup;
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
			{tag: 'Historic England ref', value: link, iconName: 'file'}
		);
	}
	return markerPopup;
}

function worship_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'religion', label: 'Religion', iconName: 'dot-circle-o'},
			{callback: generic_tag_parser, tag: 'denomination', label: 'Denomination', iconName: 'dot-circle-o'},
			{callback: generic_tag_parser, tag: 'service_times', label: 'Service times', iconName: 'clock-o'}
		]
	);
}

function socialf_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'social_facility', label: 'Facility type', iconName: 'users'},
			{callback: generic_tag_parser, tag: 'social_facility:for', label: 'Facility for', iconName: 'users'},
			{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'users'}
		]
	);
}

function food_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: cuisine_parser},
			{callback: order_parser}
		]
	);
}

function cuisine_parser(element) {
	var tags = element.tags, key;
	var markerPopup = '';
	tag = '';
	if (tags.cuisine) tag += tags.cuisine + '; ';
	for (key in tags) {
		if (key.indexOf('diet:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[1] + ' options; ';
	}
	if (tag) markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Cuisine', value: tag, iconName: 'cutlery'}
	);
	return markerPopup;
}

function pub_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'real_ale', label: 'Real ale', iconName: 'beer'},
			{callback: generic_tag_parser, tag: 'real_cider', label: 'Real cider', iconName: 'beer'},
			{callback: order_parser}
		]
	);
}

function order_parser(element) {
	var tags = element.tags;
	var markerPopup = '';
	tag = '';
	if (tags.takeaway === 'yes') tag += 'takeaway; ';
	else if (tags.takeaway === 'only') tag += 'takeaway only; ';
	if (tags.delivery === 'yes') tag += 'delivery; ';
	if (tags.outdoor_seating === 'yes') tag += 'outdoor seating; ';
	if (tags.reservation === 'yes') tag += 'takes reservation; ';
	else if (tags.reservation === 'required') tag += 'needs reservation; ';
	if (tag) markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Order options', value: tag, iconName: 'shopping-bag'}
	);
	return markerPopup;
}	

function post_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'post_box:type', label: 'Type', iconName: 'archive'},
			{callback: generic_tag_parser, tag: 'ref', label: 'Post-Box ref', iconName: 'archive'},
			{callback: generic_tag_parser, tag: 'royal_cypher', label: 'Royal cypher', iconName: 'archive'},
			{callback: generic_tag_parser, tag: 'collection_times', label: 'Collection times', iconName: 'clock-o'}
		]
	);
}

function taxi_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'capacity', label: 'Taxi rank capacity', iconName: 'taxi'}

		]
	);
}		

function recyclecentre_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: recycle_parser}
		]
	);
}
function recycle_parser(element) {
	var tags = element.tags, key;
	var markerPopup = '';
	tag = '';
	for (key in tags) {
		if (key.indexOf('recycling:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[1] + '; ';
	}
	if (tag) markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Recycling options', value: tag, iconName: 'recycle'}
	);
	return markerPopup;
}

function fuelstation_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'shop', label: 'Shop', iconName: 'shopping-basket'},
			{callback: fuel_parser}
		]
	);
}
function fuel_parser(element) {
	var tags = element.tags, key;
	var markerPopup = '';
	tag = '';
	for (key in tags) {
		if (key.indexOf('fuel:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[1] + '; ';
	}
	if (tag) markerPopup += Mustache.render(
		tagTmpl,
		{tag: 'Fuel options', value: tag, iconName: 'tint'}
	);
	return markerPopup;
}

function carpark_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'capacity', label: 'Spaces', iconName: 'car'},
			{callback: generic_tag_parser, tag: 'capacity:disabled', label: 'Disabled spaces', iconName: 'wheelchair'},
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

function cctv_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'surveillance:type', label: 'Type', iconName: 'eye'},
			{callback: generic_tag_parser, tag: 'surveillance:zone', label: 'Zone', iconName: 'eye'},
			{callback: generic_tag_parser, tag: 'camera:mount', label: 'Camera mount', iconName: 'video-camera'},
			{callback: generic_tag_parser, tag: 'camera:type', label: 'Camera type', iconName: 'video-camera'}
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
			{callback: generic_tag_parser, tag: 'healthcare', label: 'Healthcare type', iconName: 'user-md'},
			{callback: generic_tag_parser, tag: 'healthcare:speciality', label: 'Healthcare speciality', iconName: 'user-md'}
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
			{callback: generic_tag_parser, tag: 'diaper', label: 'Baby changing', iconName: 'child'}
		]
	);
}

function club_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'club', label: 'Club type', iconName: 'comments'},
			{callback: generic_tag_parser, tag: 'sport', label: 'Sport type', iconName: 'trophy'}
		]
	);
}

function clothes_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'clothes', label: 'Clothes type', iconName: 'shopping-bag'},
			{callback: generic_tag_parser, tag: 'second_hand', label: 'Second hand', iconName: 'shopping-bag'}
		]
	);
}


function craft_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'craft', label: 'Craft type', iconName: 'shopping-bag'}
		]
	);
}

function artwork_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'artwork_type', label: 'Artwork type', iconName: 'paint-brush'},
			{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist name', iconName: 'user'},
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
			{callback: generic_tag_parser, tag: 'information', label: 'Info type', iconName: 'map-signs'},
			{callback: generic_tag_parser, tag: 'board_type', label: 'Board type', iconName: 'map-signs'},
			{callback: generic_tag_parser, tag: 'map_size', label: 'Map size', iconName: 'map-signs'},
			{callback: generic_tag_parser, tag: 'ref', label: 'Reference', iconName: 'slack'}
		]
	);
}

function historic_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'historic', label: 'Historic type', iconName: 'bank'},
			{callback: generic_tag_parser, tag: 'memorial', label: 'Memorial type', iconName: 'bank'},
			{callback: generic_tag_parser, tag: 'bunker_type', label: 'Military bunker type', iconName: 'fighter-jet'},
			{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist name', iconName: 'user'},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Made', iconName: 'calendar'},
			{callback: generic_tag_parser, tag: 'inscription', label: 'Inscription', iconName: 'pencil-square-o'},
			{callback: generic_tag_parser, tag: 'wreck:date_sunk', label: 'Date sunk', iconName: 'ship'},
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
			{tag: 'Historic England ref', value: link, iconName: 'file'}
		);
	}
	return markerPopup;
}	

function listed_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'listed_status', label: 'Listed status', iconName: 'home'},
			{callback: listedhe_parser},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Built', iconName: 'calendar'}
		]
	);
}

// https://github.com/ypid/opening_hours.js
var openhrs = '', state = '';
function opening_hours_parser(element) {
	try {
		var opening_hours = require('opening_hours');
		var hours = element.tags.opening_hours;
		var oh = new opening_hours(hours);
		// display 'today' instead of week day
		var nextchange = oh.getNextChange().toLocaleDateString('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit'} );
		if (oh.getNextChange().toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB')) {
			nextchange = 'Today ' + oh.getNextChange().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'} );
		}
		state = oh.getState();
		// create table
		var ohTable = oh.prettifyValue({ conf: { rule_sep_string: '<br>', print_semicolon: false } });
		// collapsible accordion
		if (state) openhrs = '<div id="accordOh"><span><i style="color:green" class="fa fa-circle"></i> <strong>Open until:</strong> ';
		else if (state === false) openhrs = '<div id="accordOh"><span><i style="color:red" class="fa fa-circle"></i> <strong>Closed until:</strong> ';
		if (openhrs) openhrs +=  nextchange + '&nbsp; <i style="color:#b05000" class="fa fa-caret-down"></i> </span><div class="ohTable">' + ohTable + '</div></div>';
		
	}
	catch(err) {
		if (hours) console.log('ERROR: Object "' + element.tags.name + '" cannot parse hours: ' + hours + '. ' + err);
		openhrs = '';
	}
	// return false state for no hours - opennow checkbox
	if (!element.tags.opening_hours) state = false;
}

// https://github.com/placemarker/jQuery-MD5
// get md5 hash from wikimedia filename to find link to image thumbnail
var wikimediaImg;
function image_parser(img) {
	imgSplit = img.split(':');
	if (imgSplit[0] === 'File') {
		imgSplit[1] = imgSplit[1].replace(/ /gi, '_');
		var md5 = $.md5(imgSplit[1]);
		var wikimediaUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + md5.substring(0, 1) + '/' + md5.substring(0, 2) + '/' + imgSplit[1] + '/200px-' + imgSplit[1];
		wikimediaImg = '<p style="text-align:center"><a href="https://commons.wikimedia.org/wiki/' + img + '" title="Wikimedia Commons" target="_blank"><img style="border:2px solid #ccc" src="' + wikimediaUrl + '"></a></p>';
	}
	else wikimediaImg = '';
}

function parse_tags(element, titlePopup, functions) {
	var markerPopup = Mustache.render('<h3>{{title}}&emsp;<hr style="width:100%;"></h3>', {title: titlePopup});
	functions = [
		{callback: osmedit_parser},
		{callback: generic_tag_parser, tag: 'name', label: 'Name'},
		{callback: generic_tag_parser, tag: 'operator', label: 'Operator', iconName: 'building-o'},
		{callback: address_parser},
		{callback: phone_parser},
		{callback: email_parser},
		{callback: website_parser},
		{callback: facebook_parser},
		{callback: wikipedia_parser},
		{callback: facility_parser},
		{callback: fhrs_parser},
		{callback: generic_tag_parser, tag: 'access', label: 'Access', iconName: 'sign-in'},
		{callback: generic_tag_parser, tag: 'description', label: 'Description', iconName: 'pencil-square-o'},
		{callback: payment_parser}
	].concat(functions);
	for (var i = 0; i < functions.length; i++) {
		var data = functions[i];
		if (data.tag && data.label) {
			var iconName = data.iconName ? data.iconName : 'tag';
			markerPopup += data.callback(element, data.tag, data.label, iconName);
		}
		else markerPopup += data.callback(element);
	}
	opening_hours_parser(element);
	markerPopup += openhrs;
	if (element.tags.image) {
		image_parser(element.tags.image);
		markerPopup += wikimediaImg;
	}
	return markerPopup;
}
