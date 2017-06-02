// parse tags and marker popup

// convert a non-uppercase string to titlecase
function titleCase(str) {
	str = str.replace(/_/g, ' ');
	if (str === str.toUpperCase()) return str;
	else return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

// parse ISO 8601 dates
function date_parser(dtStr, style) {
	var dt, dtFrmt = dtStr.split('-').length - 1;
	if (style === 'long') {
		dt = new Date(dtStr);
		if (dtFrmt === 2) dt = dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
		else if (dtFrmt === 1) dt = dt.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
		else dt = dtStr;
		if (dt.indexOf('/') > -1) style = 'short';
	}
	if (style === 'short') {
		if (dtFrmt === 2) dt = dtStr.split('-')[2] + '/' + dtStr.split('-')[1] + '/' + dtStr.split('-')[0];
		else if (dtFrmt === 1) dt = dtStr.split('-')[1] + '/' + dtStr.split('-')[0];
		else dt = dtStr;
	}
	if (dt === 'Invalid Date' || dt === 'undefined') dt = dtStr;
	return dt;
}

// tag template
var tagTmpl = '<div class="popup-tagContainer"><i class="popup-tagIcon fa fa-{iconName} fa-fw"></i><span class="popup-tagValue"><strong>{tag}: </strong>{value}</span></div>';
function generic_tag_parser(element, tag, tagName, iconName) {
	var tags = element.tags, markerPopup = '', result;
	if (tags[tag]) {
		if (tags[tag] === 'yes') result = '<i class="fa fa-check"></i>';
		else if (tags[tag] === 'no') result = '<i class="fa fa-remove"></i>';
		else if (tag.split('_')[1] === 'date') result = date_parser(tags[tag], 'long');
		else result = tags[tag].replace(/;/g, ', ');
		markerPopup = L.Util.template(tagTmpl, { tag: tagName, value: result, iconName: iconName });
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
		markerPopup = L.Util.template(tagTmpl, { tag: 'Address', value: value, iconName: 'map-marker' });
	}
	return markerPopup;
}

function website_parser(element) {
	var tags = element.tags, markerPopup = '';
	var tagWebsite = tags.website ? tags.website : tags['contact:website'];
	if (tagWebsite) {
		var link = '<a class="popup-truncate" style="max-width:' + (imgSize - 100) + 'px" href="' + tagWebsite + '" title="' + tagWebsite + '" target="_blank">' + tagWebsite + '</a>';
		markerPopup += L.Util.template(tagTmpl, { tag: 'Website', value: link, iconName: 'globe' });
	}
	return markerPopup;
}

function phone_parser(element) {
	var tagPhone = element.tags.phone ? element.tags.phone : element.tags['contact:phone'];
	var markerPopup = '';
	if (tagPhone) {
		tagPhone = tagPhone.replace('+44 ', '0');
		var link = '<a href="tel:' + tagPhone + '" title="Call now">' + tagPhone + '</a>';
		markerPopup = L.Util.template(tagTmpl, { tag: 'Phone', value: link, iconName: 'phone' });
	}
	return markerPopup;
}

function contact_parser(element) {
	var markerPopup = '', tag = '';
	var tagMail = element.tags.email ? element.tags.email : element.tags['contact:email'];
	var tagFb = element.tags.facebook ? element.tags.facebook : element.tags['contact:facebook'];
	var tagTwit = element.tags.twitter ? element.tags.twitter : element.tags['contact:twitter'];
	if (tagMail) tag += '<a href="mailto:' + tagMail + '"><i class="fa fa-envelope fa-fw" title="E-mail: ' + tagMail + '"></i></a> ';
	if (tagFb) tag += '<a href="' + tagFb + '" target="_blank"><i class="fa fa-facebook-official fa-fw" title="Facebook: ' + tagFb + '" style="color:#3b5998;"></i></a> ';
	if (tagTwit) tag += '<a href="https://twitter.com/' + tagTwit + '" target="_blank"><i class="fa fa-twitter fa-fw" title="Twitter: @' + tagTwit + '" style="color:#1da1f2;"></i></a> ';
	if (tag) markerPopup = L.Util.template(tagTmpl, { tag: 'Contact', value: tag, iconName: 'user-circle' });
	return markerPopup;
}

function facility_parser(element) {
	var tags = element.tags;
	var markerPopup = '', tag = '';
	if (tags.wheelchair === 'yes') tag += '<i class="fa fa-wheelchair fa-fw" title="wheelchair access" style="color:darkgreen;"></i> ';
	else if (tags.wheelchair === 'limited') tag += '<i class="fa fa-wheelchair fa-fw" title="limited wheelchair access" style="color:teal;"></i>(limited) ';
	else if (tags.wheelchair === 'no') tag += '<i class="fa fa-wheelchair fa-fw" title="no wheelchair access" style="color:red;"></i>(no) ';
	if (tags.dog === 'yes') tag += '<i class="fa fa-paw fa-fw" title="dog friendly" style="color:darkgreen;"></i> ';
	else if (tags.dog === 'no') tag += '<i class="fa fa-paw fa-fw" title="no dog access" style="color:red;"></i>(no) ';
	if (tags.internet_access === 'wlan') tag += '<i class="fa fa-wifi fa-fw" title="wireless internet access" style="color:darkgreen;"></i> ';
	else if (tags.internet_access === 'terminal') tag += '<i class="fa fa-desktop fa-fw" title="terminal internet access" style="color:darkgreen;"></i> ';
	if (tags.male === 'yes' || tags.unisex === 'yes') tag += '<i class="fa fa-male fa-fw" title="male" style="color:darkgreen;"></i> ';
	if (tags.female === 'yes' || tags.unisex === 'yes') tag += '<i class="fa fa-female fa-fw" title="female" style="color:darkgreen;"></i> ';
	if (tags.diaper === 'yes') tag += '<i class="fa fa-child fa-fw" title="baby changing" style="color:darkgreen;"></i> ';
	if (tag) markerPopup = L.Util.template(tagTmpl, { tag: 'Facilities', value: tag, iconName: 'info-circle' });
	return markerPopup;
}

function payment_parser(element) {
	var markerPopup = '', tag = '';
	for (var key in element.tags) {
		if (key.indexOf('payment:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[1] + ', ';
	}
	if (tag) {
		tag = tag.replace(/_/g, '-');
		tag = tag.substring(0, tag.length - 2);
		markerPopup = L.Util.template(tagTmpl, { tag: 'Payment options', value: tag, iconName: 'money' });
	}
	return markerPopup;
}

function wikipedia_parser(element) {
	var wikipedia = element.tags.wikipedia ? element.tags.wikipedia : element.tags['site:wikipedia'];
	var markerPopup = '';
	if (wikipedia) {
		var s = wikipedia.split(':');
		var lang = s[0] + '.', subject = s[1];
		var href = 'http://' + lang + 'wikipedia.com/wiki/' + subject;
		var link = '<a class="popup-truncate" style="max-width:' + (imgSize - 100) + 'px" href="' + href + '" title="' + subject + '" target="_blank">' + subject + '</a>';
		markerPopup += L.Util.template(tagTmpl, { tag: 'Wikipedia', value: link, iconName: 'wikipedia-w' });
	}
	return markerPopup;
}

function listed_parser(element) {
	var HEref = element.tags.HE_ref, markerPopup = '';
	if (HEref) {
		var listedStatus = element.tags.listed_status ? element.tags.listed_status : HEref;
		var link = '<a href="https://historicengland.org.uk/listing/the-list/list-entry/' + HEref + '" title="Historic England entry" target="_blank">' + listedStatus + '</a>';
		markerPopup = L.Util.template(tagTmpl, { tag: 'Listed status', value: link, iconName: 'file' });
	}
	return markerPopup;
}

function hotel_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: hotelservices_parser},
			{callback: generic_tag_parser, tag: 'rooms', label: 'Rooms', iconName: 'bed'}
		]
	);
}
function hotelservices_parser(element) {
	var tags = element.tags;
	var markerPopup = '', tag = '';
	if (tags.stars) {
		var result = '<a href="https://www.visitengland.com/plan-your-visit/quality-assessment-and-star-ratings/visitengland-star-ratings" title="' + tags.stars + ' stars" target="_blank">';
		for (var c = 0; c < tags.stars; c++) {
			result += '<i class="fa fa-star-o"></i>';
		}
		result += '</a>';
		markerPopup += L.Util.template(tagTmpl, { tag: 'VisitEngland rating', value: result, iconName: 'star' });
	}
	if (tags.view) tag += tags.view + ' view; ';
	if (tags.balcony) tag += 'balcony; ';
	if (tags.cooking) tag += 'self-catering; ';
	if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Accomodation', value: tag, iconName: 'bed' });
	return markerPopup;
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
		if (key.indexOf('service:bicycle:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[2] + ', ';
	}
	if (tag) {
		tag = tag.replace(/_/g, '-');
		tag = tag.substring(0, tag.length - 2);
		markerPopup = L.Util.template(tagTmpl, { tag: 'Bicycle services', value: tag, iconName: 'bicycle' });
	}
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
		var link = '<a href="http://www.education.gov.uk/edubase/establishment/summary.xhtml?urn=' + tag + '" title="Department for Education" target="_blank">' + tag + '</a>';
		markerPopup += L.Util.template(tagTmpl, { tag: 'EduBase URN', value: link, iconName: 'file' });
	}
	return markerPopup;
}

function fhrs_parser(element) {
	var fhrs = element.tags['fhrs:id'], markerPopup = '';
	if (fhrs) {
		var link = '<a href="http://ratings.food.gov.uk/business/en-GB/' + fhrs + '" title="Food Standards Agency" target="_blank"><span class="popup-fhrs">' + fhrs + '</span></a>';
		markerPopup = L.Util.template(tagTmpl, { tag: 'Food hygiene rating', value: link, iconName: 'file' });
	}
	return markerPopup;
}

function worship_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
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
			{callback: socialfservices_parser},
			{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'users'}
		]
	);
}
function socialfservices_parser(element) {
	var tags = element.tags;
	var markerPopup = '', tag = '';
	if (tags['social_facility:for']) tag += tags['social_facility:for'] + ' ';
	if (tags.social_facility) tag += tags.social_facility;
	if (tag) {
		tag = tag.replace(/_/g, ' ');
		markerPopup += L.Util.template(tagTmpl, { tag: 'Facility', value: tag, iconName: 'users' });
	}
	return markerPopup;
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
	if (element.tags.cuisine) tag += element.tags.cuisine + ', ';
	if (element.tags.breakfast === 'yes') tag += 'breakfast, ';
	if (element.tags.lunch === 'yes') tag += 'lunch, ';
	if (element.tags.ice_cream === 'yes') tag += 'ice cream, ';
	for (var key in element.tags) {
		if (key.indexOf('diet:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[1] + ' options, ';
	}
	if (tag) {
		tag = tag.replace(/_/g, '-');
		tag = tag.substring(0, tag.length - 2);
		markerPopup = L.Util.template(tagTmpl, { tag: 'Cuisine', value: tag, iconName: 'cutlery' });
	}
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
	var tagUrl = tags.url ? tags.url : tags['contact:url'];
	if (tags.takeaway === 'yes') tag += 'takeaway, ';
	else if (tags.takeaway === 'only') tag += 'takeaway only, ';
	if (tags.delivery === 'yes') tag += 'delivery, ';
	if (tags.outdoor_seating === 'yes') tag += 'outdoor seating, ';
	if (tags.reservation === 'yes') tag += 'takes reservation, ';
	else if (tags.reservation === 'required') tag += 'needs reservation, ';
	if (tagUrl && tagUrl.indexOf('just-eat.co.uk') >= 0) {
		tag += '<a href="' + tagUrl + '" title="' + tagUrl + '" target="_blank">just-eat</a>, ';
	}
	if (tag) markerPopup = L.Util.template(tagTmpl, { tag: 'Order options', value: tag.substring(0, tag.length - 2), iconName: 'shopping-bag' });
	return markerPopup;
}

function atm_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'brand', label: 'Brand'},
			{callback: generic_tag_parser, tag: 'indoor', label: 'Enter building to access', iconName: 'sign-in'},
			{callback: generic_tag_parser, tag: 'fee', label: 'Fee', iconName: 'money'}
		]
	);
}

function post_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'ref', label: 'Ref', iconName: 'archive'},
			{callback: generic_tag_parser, tag: 'post_box:type', label: 'Type', iconName: 'archive'},
			{callback: postcypher_parser},
			{callback: generic_tag_parser, tag: 'collection_times', label: 'Collection times', iconName: 'clock-o'}
		]
	);
}
function postcypher_parser(element) {
	var royalcypher = element.tags.royal_cypher;
	var markerPopup = '';
	if (royalcypher) {
		if (royalcypher === 'VR') royalcypher += ': Victoria (1837 to 1901)';
		else if (royalcypher === 'EVIIR') royalcypher += ': Edward VII (1901 to 1910)';
		else if (royalcypher === 'GR') royalcypher += ': George V (1910 to 1936)';
		else if (royalcypher === 'EVIIIR') royalcypher += ': Edward VIII (1936)';
		else if (royalcypher === 'GVIR') royalcypher += ': George VI (1936 to 1952)';
		else if (royalcypher === 'EIIR') royalcypher += ': Elizabeth II (1952 to present)';
		markerPopup += L.Util.template(tagTmpl, { tag: 'Royal cypher', value: royalcypher, iconName: 'archive' });
	}
	return markerPopup;
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
		if (key.indexOf('recycling:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[1] + ', ';
	}
	if (tag) {
		tag = tag.replace(/_/g, '-');
		tag = tag.substring(0, tag.length - 2);
		markerPopup = L.Util.template(tagTmpl, { tag: 'Recycling options', value: tag, iconName: 'recycle' });
	}
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
		if (key.indexOf('fuel:') === 0 && (element.tags[key] === 'yes')) tag += key.split(':')[1] + ', ';
	}
	if (tag) {
		tag = tag.replace(/_/g, '-');
		tag = tag.substring(0, tag.length - 2);
		markerPopup = L.Util.template(tagTmpl, { tag: 'Fuel options', value: tag, iconName: 'tint' });
	}
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
		markerPopup = L.Util.template(tagTmpl, { tag: 'Max stay', value: maxstay, iconName: 'clock-o' });
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
			{callback: generic_tag_parser, tag: 'highway', label: 'Type', iconName: 'eye'},
			{callback: generic_tag_parser, tag: 'maxspeed', label: 'Max speed', iconName: 'video-camera'},
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
			{callback: generic_tag_parser, tag: 'indoor', label: 'Enter building to access', iconName: 'sign-in'}
		]
	);
}

function toilet_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
			{callback: generic_tag_parser, tag: 'indoor', label: 'Enter building to access', iconName: 'sign-in'}
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
			{callback: generic_tag_parser, tag: 'material', label: 'Material', iconName: 'cube'}
		]
	);
}

function info_parser(element, titlePopup) {
	return parse_tags(
		element,
		titlePopup,
		[
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
			{callback: generic_tag_parser, tag: 'bunker_type', label: 'Military bunker type', iconName: 'fighter-jet'},
			{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist name', iconName: 'user'},
			{callback: generic_tag_parser, tag: 'inscription', label: 'Inscription', iconName: 'pencil-square-o'},
			{callback: generic_tag_parser, tag: 'wreck:date_sunk', label: 'Date sunk', iconName: 'ship'},
			{callback: generic_tag_parser, tag: 'wreck:visible_at_low_tide', label: 'Visible at low tide', iconName: 'ship'}
		]
	);
}

// get bexhill street history through xml file lookup
function street_parser(element) {
	var markerPopup = '';
	if (element.tags.highway && element.tags.name) {
		$.ajax({
			async: false,
			url: 'assets/xml/streetnames.xml',
			dataType: 'xml',
			success: function (xml) {
				var $street = $(xml).find('name').filter(function () {
					return $(this).text() === element.tags.name;
				}).closest('street');
				var streetDate = $('date', $street).text();
				var streetDesc = $('desc', $street).text();
				if (streetDate) markerPopup += L.Util.template(tagTmpl, { tag: 'Street date', value: streetDate, iconName: 'calendar' });
				if (streetDesc) markerPopup += '<span class="popup-longDesc">' + L.Util.template(tagTmpl, { tag: 'Street history', value: streetDesc, iconName: 'road' }) + '</span>';
				if (markerPopup) markerPopup += '<span class="popup-streetSource"><a href="' + $(xml).find('source').text() + '" target="_blank" title="Source">&copy; ' + $(xml).find('author').text() + '</a></span>';
			}
		});
	}
	return markerPopup;
}

// https://github.com/ypid/opening_hours.js
var state = '';
function opening_hours_parser(tags) {
	var openhrsState = [], openhrs = '', comment = '';
	state = 'unknown';
	try {
		var opening_hours = require('opening_hours');
		var oh = new opening_hours(tags.opening_hours);
		var strNextChange;
		if (oh.getNextChange()) {
			var dateTomorrow = new Date(), dateWeek = new Date();
			dateTomorrow.setDate(new Date().getDate() + 1);
			dateWeek.setDate(new Date().getDate() + 7);
			// display 'today'
			if (oh.getNextChange().toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB')) {
				strNextChange = 'Today ' + oh.getNextChange().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
			}
			// display 'tomorrow'
			else if (oh.getNextChange().toLocaleDateString('en-GB') === dateTomorrow.toLocaleDateString('en-GB')) {
				strNextChange = 'Tomorrow ' + oh.getNextChange().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
			}
			// display day name if within a week
			else if (oh.getNextChange().getTime() > dateTomorrow.getTime() && oh.getNextChange().getTime() < dateWeek.getTime()) {
				strNextChange = oh.getNextChange().toLocaleDateString('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
			}
			// otherwise display date
			else strNextChange = oh.getNextChange().toLocaleDateString('en-GB');
		}
		else strNextChange = oh.prettifyValue();
		if (oh.getComment()) {
			if (strNextChange === tags.opening_hours) state = 'depends';
			else {
				comment = ' (' + oh.getComment() + ')';
				state = true;
			}
		}
		else state = oh.getState();
		// create readable table
		var ohTable = oh.prettifyValue({ conf: { rule_sep_string: '<br>', print_semicolon: false } });
		// show tag and collapsible accordion
		if (state === true) openhrsState = [ 'green', 'Open until' ];
		else if (state === false) openhrsState = [ 'red', 'Closed until' ];
		else if (state === 'depends') openhrsState = [ 'grey', 'Depends on' ];
		if (openhrsState) {	openhrs =
			'<div class="popup-ohContainer">' +
				'<span class="popup-tagContainer">' +
					'<i style="color:' + openhrsState[0] + ';" class="popup-tagIcon fa fa-circle fa-fw"></i>' +
					'<span class="popup-tagValue"><strong>' + openhrsState[1] + ':</strong> ' + strNextChange + comment + '&nbsp; </span>' +
					'<i style="color:#b05000;" title="See full opening hours" class="fa fa-caret-down fa-fw"></i>' +
				'</span>' +
				'<div class="popup-ohTable">' + ohTable + '</div>' +
			'</div>';
		}
	}
	catch(err) {
		if (tags.opening_hours) console.log('ERROR: Object "' + tags.name + '" cannot parse hours: ' + hours + '. ' + err);
	}
	return openhrs;
}

function popup_buttons(element) {
	// edit in osm
	var markerPopup = L.Util.template(
		'<a id="{type}_{id}" class="popup-edit" href="https://www.openstreetmap.org/edit?editor=id&{type}={id}" title="Edit with OpenStreetMap" target="_blank"><i class="fa fa-pencil"></i></a>',
		{type: element.type, id: element.id}
	);
	// walking direction button
	markerPopup += '<a class="popup-direct" title="Walking directions"><i class="fa fa-location-arrow"></i></a>';
	return markerPopup;
}

// get wikimedia image
function image_parser(img) {
	var markerPopup = '';
	if (img && img.indexOf('File:') === 0) {
		var url = 'https://commons.wikimedia.org/w/thumb.php?f=' + img.split(':')[1] + '&w=' + imgSize;
		markerPopup =
			'<div class="popup-imgContainer">' +
				'<a href="https://commons.wikimedia.org/wiki/' + img + '" title="Wikimedia Commons" target="_blank"><img alt="Loading image..." style="max-height:' + imgSize + 'px;" src="' + url + '"></a><br>' +
				'<span class="popup-imgAttrib">Loading attribution...</span>' +
			'</div>';
	}
	return markerPopup;
}

// parse all tags into variable
function parse_tags(element, titlePopup, functions) {
	var markerPopup = L.Util.template('<div class="popup-header"><h3>{title}</h3>', { title: titlePopup });
	if (element.tags.name) markerPopup += L.Util.template('<span class="popup-header-tagName">{tagName}</span>', { tagName: element.tags.name });
	else if (element.tags.ref) markerPopup += L.Util.template('<span class="popup-header-tagName">{tagName}</span>', { tagName: element.tags.ref });
	markerPopup += '</div>';
	functions = [
		{callback: popup_buttons},
		{callback: generic_tag_parser, tag: 'loc_name', label: 'Local name'},
		{callback: generic_tag_parser, tag: 'alt_name', label: 'Alternative name'},
		{callback: generic_tag_parser, tag: 'old_name', label: 'Old name'},
		{callback: generic_tag_parser, tag: 'operator', label: 'Operator', iconName: 'building-o'},
		{callback: address_parser},
		{callback: phone_parser},
		{callback: website_parser},
		{callback: contact_parser},
		{callback: wikipedia_parser},
		{callback: listed_parser},
		{callback: generic_tag_parser, tag: 'opening_date', label: 'Opening date', iconName: 'calendar'},
		{callback: generic_tag_parser, tag: 'start_date', label: 'Start date', iconName: 'calendar'},
		{callback: generic_tag_parser, tag: 'end_date', label: 'End date', iconName: 'calendar'},
		{callback: fhrs_parser},
		{callback: generic_tag_parser, tag: 'access', label: 'Access', iconName: 'sign-in'},
		{callback: generic_tag_parser, tag: 'description', label: 'Description', iconName: 'pencil-square-o'},
		{callback: facility_parser},
		{callback: generic_tag_parser, tag: 'fair_trade', label: 'Fair trade', iconName: 'pie-chart '},
		{callback: payment_parser},
		{callback: street_parser}
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

// marker popup
var spinner = 0, markerId, poiList = [];
function callback(data) {
	var type, name, iconName, markerPopup, customOptions = {};
	// popup maxwidth on mobile is image width
	customOptions.maxWidth = imgSize;
	// padding so popup is not obfuscated by map controls
	customOptions.autoPanPaddingTopLeft = ($(window).width() < 768 || !rQuery) ? [20, 40] : [sidebar.width() + 50, 5];
	customOptions.autoPanPaddingBottomRight = [5, 50];
	if (spinner > 0) spinner--;
	if (spinner === 0) $('#spinner').hide();
	for (var c in data.elements) {
		var e = data.elements[c];
		if (e.id in this.instance._ids) continue;
		this.instance._ids[e.id] = true;
		var pos = (e.type === 'node') ? new L.LatLng(e.lat, e.lon) : new L.LatLng(e.center.lat, e.center.lon);
		name = undefined;
		type = undefined;
		if (siteDebug) console.debug(e);
		if (e.tags.amenity) {
			if (e.tags.waste === 'dog_excrement') {
				name = 'Dog Waste-Bin';
				type = e.tags.waste;
			}
			if (!name && (e.tags.amenity === 'restaurant' || e.tags.amenity === 'fast_food' || e.tags.amenity === 'cafe') && e.tags.cuisine) {
				name = e.tags.cuisine;
				if (e.tags.amenity === 'restaurant' && e.tags.takeaway === 'only') name += ' takeaway';
				else name += ' ' + e.tags.amenity;
			}
			else if (!name && e.tags.amenity === 'place_of_worship' && e.tags.religion) name = e.tags.religion;
			else if (!name && e.tags.amenity === 'taxi' && e.tags.capacity) name = e.tags.amenity + ' rank';
			else if (!name) name = e.tags.amenity;
			if (!type) type = e.tags.amenity;
			// Group similar pois
			if (type === 'arts_centre') type = 'attraction';
			if (type === 'nightclub') type = 'bar';
			if (type === 'college') type = 'school';
			if (type === 'school' && e.tags.name === undefined) type = undefined;
			if (type === 'retirement_home') type = 'social_facility';
			if (type === 'post_office') type = 'post_box';
			// Hide non-public parking
			if (type === 'parking') {
				if (e.tags.access === 'private' || e.tags.access === 'permissive') type = undefined;
			}
			if (type === 'animal_boarding') type = 'animal_shelter';
		}
		if (e.tags.historic) {
			if (!name && e.tags.memorial) name = 'historic ' + e.tags.memorial;
			else if (!name) name = 'historic ' + e.tags.historic;
			if (!type) type = 'historic';
		}
		if (e.tags.highway === 'speed_camera') type = 'surveillance';
		if (e.tags.man_made) {
			if (!name) name = e.tags.man_made;
			if (!type) type = e.tags.man_made;
		}
		if (e.tags.shop) {
			if (!name && e.tags.craft) name = e.tags.craft;
			else if (!name && e.tags.beauty) name = e.tags.beauty + ' ' + e.tags.shop;
			else if (!name && e.tags.shop === 'hairdresser') {
				if (e.tags.male === 'yes') name = 'male barber';
				else if (e.tags.female === 'yes') name = 'female hairdresser';
				else if (e.tags.unisex === 'yes') name = 'unisex hairdresser';
			}
			else if (!name) name = e.tags.shop;
			if (!type) type = e.tags.shop;
			// Group similar pois
			if (type === 'deli') type = 'butcher';
			if (type === 'e-cigarette') type = 'tobacco';
			if (type === 'hardware') type = 'doityourself';
			if (type === 'boutique') type = 'clothes';
			if (type === 'department_store') type = 'clothes';
			if (type === 'window_blind') type = 'curtain';
			if (type === 'laundry') type = 'dry_cleaning';
			if (type === 'garden_centre') type = 'florist';
			if (type === 'tyres') type = 'car_repair';
			if (type === 'hearing_aids') type = 'mobility';
			if (type === 'interior_decoration' || type === 'bathroom_furnishing' || type === 'kitchen') type = 'houseware';
		}
		if (e.tags.tourism) {
			if (!name && e.tags.artwork_type) name = e.tags.artwork_type + ' ' + e.tags.tourism;
			else if (!name && e.tags.information) name = e.tags.tourism + ' ' + e.tags.information;
			else if (!name) name = e.tags.tourism;
			if (!type) type = e.tags.tourism;
			if (type === 'hotel') type = 'guest_house';
			if (type === 'information') {
				if (!e.tags.name && !e.tags.ref) type = undefined;
			}
		}
		if (e.tags.landuse) {
			if (!name) name = e.tags.landuse;
			if (!type) type = e.tags.landuse;
			// Hide non-public grounds
			if (type === 'recreation_ground') {
				if (e.tags.access === 'private') type = undefined;
			}
		}
		if (e.tags.leisure) {
			if (!name && e.tags.sport) name = e.tags.sport + ' ' + e.tags.leisure;
			else if (!name) name = e.tags.leisure;
			if (!type) type = e.tags.leisure;
			if (type === 'common') type = 'park';
			if (type === 'swimming_pool') {
				if (e.tags.access === 'private') type = undefined;
			}
		}
		if (e.tags.emergency) {
			if (!name) name = e.tags.emergency;
			if (!type) type = e.tags.emergency;
		}
		if (e.tags.office) {
			if (!name) name = e.tags.office + ' office';
			if (!type) type = e.tags.office;
			if (type === 'financial') type = 'accountant';
		}
		if (e.tags.healthcare) {
			if (!name && e.tags['healthcare:speciality']) name = e.tags['healthcare:speciality'];
			else if (!name) name = e.tags.healthcare;
			if (!type) type = 'healthcare';
		}
		if (e.tags.listed_status) {
			if (!type || type === 'shelter' || type === 'company') type = 'listed_status';
		}
		customOptions.minWidth = e.tags.image ? imgSize : '';

		var poi = pois[type];
		if (e.tags.military) iconName = 'war';
		else if (poi) iconName = poi.iconName;
		else if (e.tags.construction) iconName = 'construction';
		else if (e.tags.highway) {
			if (e.tags.highway === 'path' || e.tags.highway === 'footway' || e.tags.highway === 'track') iconName = 'roadtype_track';
			else if (e.tags.highway === 'bus_stop') iconName = 'busstop';
			else iconName = 'roadtype_tar';
		}
		else if (e.tags.building) {
			if (e.tags.building === 'house' || e.tags.building === 'bungalow') iconName = 'bighouse';
			else if (e.tags.building === 'service') iconName = 'powersubstation';
			else iconName = 'apartment-3';
		}
		else iconName = '000blank';
		var markerIcon = L.icon({
			iconUrl: 'assets/img/icons/' + iconName + '.png',
			iconSize: [32, 37],
			iconAnchor: [16, 35],
			shadowUrl: 'assets/img/icons/000shadow.png',
			shadowAnchor: [16, 27],
			popupAnchor: [0, -27]
		});
		var marker = L.marker(pos, {
			bounceOnAdd: !rQuery,
			icon: markerIcon,
			keyboard: false,
			riseOnHover: true
		});
		// find alternative poi name
		if (!name || (poi && name === poi.name.toLowerCase())) {
			if (poi) name = poi.name;
			else if (e.tags.natural) name = e.tags.natural;
			else if (e.tags.highway) name = (e.tags.highway === 'bus_stop') ? e.tags.highway : e.tags.highway + ' highway';
			else if (e.tags.railway) name = 'railway ' + e.tags.railway;
			else if (e.tags.ref) name = e.tags.ref;
			else if (e.tags.building && e.tags.building !== 'yes') name = e.tags.building;
			else if (e.tags['addr:housename']) name = e.tags['addr:housename'];
			else name = '&hellip;';
		}
		if (name != '&hellip;') name = titleCase(name);
		// show a tooltip on mouse hover
		if (name) {
			var toolTip = '<b>' + name + '</b>';
			if (e.tags.name) toolTip += '<br><i>' + e.tags.name + '</i>';
			else if (e.tags['addr:housename']) toolTip += '<br><i>' + e.tags['addr:housename'] + '</i>';
			else if (e.tags['addr:housenumber'] && e.tags['addr:street']) toolTip += '<br><i>' + e.tags['addr:housenumber'] + ' ' + e.tags['addr:street'] + '</i>';
			else if (e.tags.ref) toolTip += '<br><i>' + e.tags.ref + '</i>';
			if (e.tags.image) toolTip += ' <i style="color:#808080;" class="fa fa-picture-o fa-fw"></i>';
			marker.bindTooltip(toolTip, { direction: 'left', offset: [-15, -2] });
		}
		// check if already defined poi
		if (poi) {
			// create pop-up
			markerPopup = poi.tagParser ? poi.tagParser(e, name) : generic_poi_parser(e, name);
			// show pop-up
			marker.bindPopup(markerPopup, customOptions);
			// check if coming from reverseQuery
			if (rQuery) {
				marker.addTo(this.instance).openPopup();
				markerId = e.type + '_' + e.id;
			}
			else {
				marker.addTo(this.instance);
				// get list of markers with openhrs state
				marker.state = state;
				poiList.push(marker);
			}
		}
		else if (rQuery) {
			// use generic marker
			markerPopup = generic_poi_parser(e, name);
			marker.bindPopup(markerPopup, customOptions);
			marker.addTo(this.instance).openPopup();
			markerId = e.type + '_' + e.id;
		}
		rQuery = false;
	}
	// output multiple results in sidebar
	if (poiList.length) {
		$('.poi-results').css('height', 'calc(50% - 22px)');
		$('.poi-icons').css('height', 'calc(50% - 35px)');
		if ($(window).width() < 768) $('.poi-results button').show();
		var openColour, poiResultsList = '<table>';
		for (c = 0; c < poiList.length; c++) {
			if (poiList[c].state === true) openColour = 'rgba(0,128,0,0.5);';
			else if (poiList[c].state === false) openColour = 'rgba(255,0,0,0.5)';
			else if (poiList[c].state === 'depends') openColour = 'rgba(128,128,128,0.5)';
			else openColour = '';
			poiResultsList += '<tr id="poi-result-' + c + '">' +
				'<td style="background-color:' + openColour + ';"><img src="' + poiList[c]._icon.src + '"></td>' +
				'<td>' + poiList[c]._tooltip._content + '</td>';
			// add distance column if location on
			if (lc._active) poiResultsList += '<td>' + Math.round((map.distance(lc._event.latlng, poiList[c]._latlng) / 1609.34) * 100) / 100 + ' miles</td>';
			poiResultsList += '</tr>';
		}
		poiResultsList += '</table>';
		$('.poi-results-list').html(poiResultsList);
		// interact with map
		$('.poi-results-list tr').hover(
			function () { poiList[this.id.split('poi-result-')[1]].openTooltip(); },
			function () { poiList[this.id.split('poi-result-')[1]].closeTooltip(); }
		);
		$('.poi-results-list tr').click(function () {
			if ($(window).width() < 768) sidebar.close();
			else map.flyTo(poiList[this.id.split('poi-result-')[1]]._latlng);
			poiList[this.id.split('poi-result-')[1]].openPopup();
		});
	}
}
