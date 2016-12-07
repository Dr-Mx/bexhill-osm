// how much to truncate from popup labels depending on screensize
var truncWidth = ($(window).width() > 500) ? 35 : 20;
// tag template
var tagTmpl = '<i class="fa fa-{iconName}"></i> <strong>{tag}:</strong> {value}<br>', state = '';

// edit in osm
function osmedit_parser(element) {
	var link = L.Util.template(
		'http://www.openstreetmap.org/edit?editor=id&{type}={id}',
		{type: element.type, id: element.id}
	);
	var markerPopup = L.Util.template(
		'<a style="top:19px; right:20px; position:absolute;" href="{link}" title="Edit in OpenStreetMap" target="_blank"><i class="fa fa-pencil"></i></a>',
		{link: link}
	);
	return markerPopup;
}

function generic_tag_parser(element, tag, tagName, iconName) {
	var tags = element.tags, markerPopup = '', result;
	if (tags[tag]) {
		if (tags[tag] === 'yes') result = '<i class="fa fa-check"></i>';
		else if (tags[tag] === 'no') result = '<i class="fa fa-remove"></i>';
		else result = tags[tag];
		markerPopup = L.Util.template(
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
		markerPopup = L.Util.template(
			tagTmpl,
			{tag: 'Address', value: value, iconName: 'map-marker'}
		);
	}
	return markerPopup;
}

function website_parser(element) {
	var tags = element.tags, link = '', markerPopup = '';
	var tagwebsite = tags.website ? tags.website : tags['contact:website'];
	var tagurl = tags.url ? tags.url : tags['contact:url'];
	if (tagwebsite) {
		var stagwebsite = tagwebsite;
		if (stagwebsite.length > truncWidth) stagwebsite = stagwebsite.substr(0, truncWidth) + '&hellip;';
		link = L.Util.template(
			'<a href="{tagwebsite}" title="{tagwebsite}" target="_blank">{stagwebsite}</a>',
			{tagwebsite: tagwebsite, stagwebsite: stagwebsite}
		);
		markerPopup = L.Util.template(
			tagTmpl,
			{tag: 'Website', value: link, iconName: 'globe'}
		);
	}
	if (tagurl) {
		var stagurl = tagurl;
		if (stagurl.length > truncWidth) stagurl = stagurl.substr(0,truncWidth) + '&hellip;';
		link = L.Util.template(
			'<a href="{tagurl}" title="{tagurl}" target="_blank">{stagurl}</a>',
			{tagurl: tagurl, stagurl: stagurl}
		);
		markerPopup += L.Util.template(
			tagTmpl,
			{tag: 'Just Eat', value: link, iconName: 'external-link-square'}
		);
	}
	return markerPopup;
}

function facebook_parser(element) {
	var tagfb = element.tags.facebook ? element.tags.facebook : element.tags['contact:facebook'];
	var markerPopup = '';
	if (tagfb) {
		var stagfb = tagfb;
		if (stagfb.length > truncWidth) stagfb = stagfb.substr(0,truncWidth) + '&hellip;';
		var link = L.Util.template(
			'<a href="{tagfb}" title="{tagfb}" target="_blank">{stagfb}</a>',
			{tagfb: tagfb, stagfb: stagfb}
		);
		markerPopup = L.Util.template(
			tagTmpl,
			{tag: 'Facebook', value: link, iconName: 'facebook-official'}
		);
	}
	return markerPopup;
}

function email_parser(element) {
	var tagmail = element.tags.email ? element.tags.email : element.tags['contact:email'];
	var markerPopup = '';
	if (tagmail && tagmail.indexOf('@') !== -1) {
		var stagmail = tagmail;
		if (stagmail.length > truncWidth) stagmail = stagmail.substr(0,truncWidth) + '&hellip;';
		var link = L.Util.template(
			'<a href="mailto:{tagmail}" title="{tagmail}" target="_blank">{stagmail}</a>',
			{tagmail: tagmail, stagmail: stagmail}
		);
		markerPopup = L.Util.template(
			tagTmpl,
			{tag: 'E-mail', value: link, iconName: 'at'}
		);
	}
	return markerPopup;
}

function phone_parser(element) {
	var phone = element.tags.phone ? element.tags.phone : element.tags['contact:phone'];
	var markerPopup = '';
	if (phone) {
		var link = L.Util.template(
			'<a href="tel:{phone}" title="Call now">{phone}</a>',
			{phone: phone}
		);
		markerPopup = L.Util.template(
			tagTmpl,
			{tag: 'Phone', value: link, iconName: 'phone'}
		);
	}
	return markerPopup;
}

function facility_parser(element) {
	var tags = element.tags;
	var markerPopup = '', tag = '';
	if (tags.wheelchair === 'yes') tag += '<i class="fa fa-wheelchair fa-fw" title="wheelchair access" style="color:darkgreen;"></i>';
	else if (tags.wheelchair === 'limited') tag += '<i class="fa fa-wheelchair fa-fw" title="limited wheelchair access" style="color:teal;"></i>(limited) ';
	else if (tags.wheelchair === 'no') tag += '<i class="fa fa-wheelchair fa-fw" title="no wheelchair access" style="color:red;"></i>(no) ';
	if (tags.dog === 'yes') tag += '<i class="fa fa-paw fa-fw" title="dog friendly" style="color:darkgreen;"></i>';
	else if (tags.dog === 'no') tag += '<i class="fa fa-paw fa-fw" title="no dog access" style="color:red;"></i>(no) ';
	if (tags.internet_access === 'wlan') tag += '<i class="fa fa-wifi fa-fw" title="internet access" style="color:darkgreen;"></i>';
	if (tag) markerPopup = L.Util.template(
		tagTmpl,
		{tag: 'Facilities', value: tag, iconName: 'info-circle'}
	);
	return markerPopup;
}

function payment_parser(element) {
	var markerPopup = '', tag = '';
	for (var key in element.tags) {
		if (key.indexOf('payment:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[1] + '; ';
	}
	if (tag) markerPopup = L.Util.template(
		tagTmpl,
		{tag: 'Payment options', value: tag, iconName: 'money'}
	);
	return markerPopup;
}

function wikipedia_parser(element) {
	var wikipedia = element.tags.wikipedia ? element.tags.wikipedia : element.tags['site:wikipedia'];
	var markerPopup = '';
	if (wikipedia) {
		var s = wikipedia.split(':');
		var lang = s[0] + '.', subject = s[1];
		var href = 'http://' + lang + 'wikipedia.com/wiki/' + subject;
		var link = L.Util.template(
			'<a href="{wikipedia}" title="Wikipedia article" target="_blank">' + subject + '</a>',
			{wikipedia: href}
		);
		markerPopup = L.Util.template(
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
	var stars = element.tags.stars, markerPopup = '';
	if (stars) {
		var result = '<a href="https://www.visitengland.com/plan-your-visit/quality-assessment-and-star-ratings/visitengland-star-ratings" title="VisitEngland ratings" target="_blank">';
		for (var c = 0; c < stars; c++) {
			result += '<i class="fa fa-star-o"></i>';
		}
		result += '</a>';
		markerPopup = L.Util.template(
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
	var markerPopup = '', tag = '';
	for (var key in element.tags) {
		if (key.indexOf('service:bicycle:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[2] + '; ';
	}
	if (tag) markerPopup = L.Util.template(
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
	var tag = element.tags['ref:edubase'], markerPopup = '';
	if (tag) {
		var link = L.Util.template(
			'<a href="http://www.education.gov.uk/edubase/establishment/summary.xhtml?urn={link}" title="Department for Education" target="_blank">{link}</a>',
			{link: tag}
		);
		markerPopup = L.Util.template(
			tagTmpl,
			{tag: 'EduBase ref', value: link, iconName: 'file'}
		);
	}
	return markerPopup;
}

function fhrs_parser(element) {
	var fhrs = element.tags['fhrs:id'], markerPopup = '';
	if (fhrs) {
		var link = L.Util.template(
			'<a href="http://ratings.food.gov.uk/business/en-GB/{link}" title="Food Standards Agency" target="_blank">{link}</a>',
			{link: fhrs}
		);
		markerPopup = L.Util.template(
			tagTmpl,
			{tag: 'Food Hygiene id', value: link, iconName: 'file'}
		);
	}
	return markerPopup;
}

function listedhe_parser(element) {
	var HEref = element.tags.HE_ref, markerPopup = '';
	if (HEref) {
		var link = L.Util.template(
			'<a href="https://historicengland.org.uk/listing/the-list/list-entry/{link}" title="Historic England entry" target="_blank">{link}</a>',
			{link: HEref}
		);
		markerPopup = L.Util.template(
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
	var markerPopup = '', tag = '';
	if (element.tags.cuisine) tag = element.tags.cuisine + '; ';
	for (var key in element.tags) {
		if (key.indexOf('diet:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[1] + ' options; ';
	}
	if (tag) markerPopup = L.Util.template(
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
	var tags = element.tags, tag = '', markerPopup = '';
	if (tags.takeaway === 'yes') tag += 'takeaway; ';
	else if (tags.takeaway === 'only') tag += 'takeaway only; ';
	if (tags.delivery === 'yes') tag += 'delivery; ';
	if (tags.outdoor_seating === 'yes') tag += 'outdoor seating; ';
	if (tags.reservation === 'yes') tag += 'takes reservation; ';
	else if (tags.reservation === 'required') tag += 'needs reservation; ';
	if (tag) markerPopup = L.Util.template(
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
	var markerPopup = '', tag = '';
	for (var key in element.tags) {
		if (key.indexOf('recycling:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[1] + '; ';
	}
	if (tag) markerPopup = L.Util.template(
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
	var markerPopup = '', tag = '';
	for (var key in element.tags) {
		if (key.indexOf('fuel:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[1] + '; ';
	}
	if (tag) markerPopup = L.Util.template(
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
			{callback: generic_tag_parser, tag: 'fee', label: 'Fee', iconName: 'money'},
			{callback: maxstay_parser}
		]
	);
}

function maxstay_parser(element) {
	var maxstay = element.tags.maxstay, markerPopup = '';
	if (maxstay) {
		maxstay = (maxstay >= 60) ? maxstay / 60 + ' hour(s)' : maxstay + ' minutes';
		markerPopup = L.Util.template(
			tagTmpl,
			{tag: 'Max stay', value: maxstay, iconName: 'clock-o'}
		);
	}
	return markerPopup;
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
			{callback: generic_tag_parser, tag: 'defibrillator:location', label: 'Location', iconName: 'location-arrow'},
			{callback: generic_tag_parser, tag: 'indoor', label: 'Inside building', iconName: 'sign-in'}
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

function listed_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'listed_status', label: 'Listed status', iconName: 'home'},
			{callback: generic_tag_parser, tag: 'start_date', label: 'Built', iconName: 'calendar'}
		]
	);
}

// https://github.com/ypid/opening_hours.js
function opening_hours_parser(tags) {
	var openhrs = '';
	try {
		var opening_hours = require('opening_hours');
		var hours = tags.opening_hours;
		var oh = new opening_hours(hours);
		var strNextChange;
		// return false state for no hours - opennow checkbox
		if (!hours) state = false;
		if (oh.getNextChange()) {
			var dateTomorrow = new Date(), dateWeek = new Date();
			dateTomorrow.setDate(new Date().getDate() + 1);
			dateWeek.setDate(new Date().getDate() + 7);
			// display 'today'
			if (oh.getNextChange().toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB')) {
				strNextChange = 'Today ' + oh.getNextChange().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'} );
			}
			// display 'tomorrow'
			else if (oh.getNextChange().toLocaleDateString('en-GB') === dateTomorrow.toLocaleDateString('en-GB')) {
				strNextChange = 'Tomorrow ' + oh.getNextChange().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'} );
			}
			// display day if within a week
			else if (oh.getNextChange().getTime() > dateTomorrow.getTime() && oh.getNextChange().getTime() < dateWeek.getTime()) {
				strNextChange = oh.getNextChange().toLocaleDateString('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit'} );
			}
			// otherwise display date
			else strNextChange = oh.getNextChange().toLocaleDateString('en-GB');
		}
		else strNextChange = oh.prettifyValue();
		state = oh.getState();
		// create table
		var ohTable = oh.prettifyValue({ conf: { rule_sep_string: '<br>', print_semicolon: false } });
		// collapsible accordion
		if (state) openhrs = '<div id="accordOh"><span><i style="color:green;" class="fa fa-circle"></i> <strong>Open until:</strong> ';
		else if (state === false) openhrs = '<div id="accordOh"><span><i style="color:red;" class="fa fa-circle"></i> <strong>Closed until:</strong> ';
		if (openhrs) openhrs +=  strNextChange + '&nbsp; <i style="color:#b05000;" title="See full opening hours" class="fa fa-caret-down"></i> </span><div class="ohTable">' + ohTable + '</div></div>';
	}
	catch(err) {
		if (hours) console.log('ERROR: Object "' + tags.name + '" cannot parse hours: ' + hours + '. ' + err);
	}
	return openhrs;
}

// https://github.com/placemarker/jQuery-MD5
// get md5 hash from wikimedia filename to link image thumbnail
function image_parser(img) {
	var markerPopup = '';
	if (img && img.indexOf('File:') === 0) {
		var imgSplit = img.split(':');
		imgSplit[1] = imgSplit[1].replace(/ /gi, '_');
		var md5 = $.md5(imgSplit[1]);
		var url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + md5.substring(0, 1) + '/' + md5.substring(0, 2) + '/' + imgSplit[1] + '/200px-' + imgSplit[1];
		markerPopup = '<p style="text-align:center;"><a href="https://commons.wikimedia.org/wiki/' + img + '" title="Wikimedia Commons" target="_blank"><img style="border:2px solid #ccc;" src="' + url + '"></a></p>';
	}
	return markerPopup;
}

function parse_tags(element, titlePopup, functions) {
	var markerPopup = L.Util.template('<h3>{title}&emsp;<hr style="width:100%;"></h3>', {title: titlePopup});
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
		{callback: listedhe_parser},
		{callback: fhrs_parser},
		{callback: generic_tag_parser, tag: 'access', label: 'Access', iconName: 'sign-in'},
		{callback: generic_tag_parser, tag: 'description', label: 'Description', iconName: 'pencil-square-o'},
		{callback: facility_parser},
		{callback: payment_parser}
	].concat(functions);
	for (var c = 0; c < functions.length; c++) {
		var data = functions[c];
		if (data.tag && data.label) {
			var iconName = data.iconName ? data.iconName : 'tag';
			markerPopup += data.callback(element, data.tag, data.label, iconName);
		}
		else markerPopup += data.callback(element);
	}
	markerPopup += opening_hours_parser(element.tags);
	markerPopup += image_parser(element.tags.image);
	return markerPopup;
}
