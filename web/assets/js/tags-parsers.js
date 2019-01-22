// parse tags and marker popup

var spinner = 0, markerId, ohState, ctState, poiList = [];
function parse_tags(element, titlePopup, poiParser) {
	var markerPopup = generic_header_parser(titlePopup, (element.tags.name || element.tags.ref), element.tags['fhrs:id']);
	// global callback parsers
	var address_parser = function (tags) {
		markerPopup = '';
		if (tags['addr:street'] || tags['addr:place']) {
			var value = '', buildLvl;
			if (tags.level > 0) {
				switch (tags.level) {
					case '1': buildLvl = 'First-floor'; break;
					case '2': buildLvl = 'Second-floor'; break;
					case '3': buildLvl = 'Third-floor'; break;
					case '4': buildLvl = 'Fourth-floor'; break;
					case '5': buildLvl = 'Fifth-floor'; break;
				}
				value += '<span title="Level">' + buildLvl + '</span>, ';
			}
			if (tags['addr:housename'] && tags['addr:housename'] !== tags.name) value += '<span title="House name">' + tags['addr:housename'] + '</span>, ';
			if (tags['addr:flats']) value += 'Flats: ' + tags['addr:flats'] + ', ';
			if (tags['addr:unit']) value += 'Unit ' + tags['addr:unit'] + ', ';
			if (tags['addr:housenumber']) value += '<span title="House number">' + tags['addr:housenumber'] + '</span> ';
			if (tags['addr:street']) value += '<span title="Street">' + tags['addr:street'] + '</span>';
			else if (tags['addr:place']) value += '<span title="Place">' + tags['addr:place'] + '</span>';
			if (tags['addr:suburb']) value += ', <span title="Suburb">' + tags['addr:suburb'] + '</span>';
			else if (tags['addr:hamlet']) value += ', <span title="Hamlet">' + tags['addr:hamlet'] + '</span>';
			if (tags['addr:city'] && tags['addr:city'] !== 'Bexhill') value += ', <span title="City">' + tags['addr:city'] + '</span>';
			if (tags['addr:postcode']) value += ', <span style="white-space:nowrap;" title="Postcode">' + tags['addr:postcode'] + '</span>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Address', value: value, iconName: 'fas fa-map-marker' });
		}
		return markerPopup;
	};
	var phone_parser = function (tags) {
		var tagPhone = tags.phone || tags['contact:phone'];
		markerPopup = '';
		if (tagPhone) {
			if (navigator.language === 'en-GB') tagPhone = tagPhone.replace('+44 ', '0');
			var link = '<a href="tel:' + tagPhone + '" title="Telephone">' + tagPhone + '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Phone', value: link, iconName: 'fas fa-phone' });
		}
		return markerPopup;
	};
	var website_parser = function (tags) {
		var tagWebsite = tags.website || tags['contact:website'] || tags['contact:webcam'];
		markerPopup = '';
		if (tagWebsite) {
			var link = '<a class="popup-truncate" style="max-width:' + (imgSize - 100) + 'px" href="' + tagWebsite + '" title="' + tagWebsite + '" target="_blank">' + tagWebsite + '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Website', value: link, iconName: 'fas fa-globe' });
		}
		return markerPopup;
	};
	var contact_parser = function (tags) {
		var tag = '';
		markerPopup = '';
		var tagMail = tags.email || tags['contact:email'];
		var tagFb = tags.facebook || tags['contact:facebook'];
		var tagTwit = tags.twitter || tags['contact:twitter'];
		var tagInstg = tags['contact:instagram'];
		if (tagMail) tag += '<a href="mailto:' + tagMail + '"><i class="fas fa-envelope fa-fw" title="E-mail: ' + tagMail + '"></i></a> ';
		if (tagFb) tag += '<a href="' + tagFb + '" target="_blank"><i class="fab fa-facebook fa-fw" title="Facebook: ' + tagFb + '" style="color:#3b5998;"></i></a> ';
		if (tagTwit) tag += '<a href="https://twitter.com/' + tagTwit + '" target="_blank"><i class="fab fa-twitter fa-fw" title="Twitter: @' + tagTwit + '" style="color:#1da1f2;"></i></a> ';
		if (tagInstg) tag += '<a href="https://instagram.com/' + tagInstg + '" target="_blank"><i class="fab fa-instagram fa-fw" title="Instagram: ' + tagInstg + '" style="color:#d93175;"></i></a> ';
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Contact', value: tag, iconName: 'fas fa-user-circle' });
		return markerPopup;
	};
	var wikipedia_parser = function (tags) {
		var wikipedia = tags.wikipedia || tags['site:wikipedia'];
		markerPopup = '';
		if (wikipedia) {
			var s = wikipedia.split(':');
			var lang = s[0] + '.', subject = s[1];
			var href = 'https://' + lang + 'wikipedia.org/wiki/' + subject;
			var link = '<a class="popup-truncate" style="max-width:' + (imgSize - 100) + 'px" href="' + href + '" title="' + subject + '" target="_blank">' + subject + '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Wikipedia', value: link, iconName: 'fab fa-wikipedia-w' });
		}
		return markerPopup;
	};
	var listed_parser = function (tags) {
		var tag = '', label = '', icon = '';
		markerPopup = '';
		if (tags.building) {
			label = 'Building';
			icon = 'fas fa-building';
			if (tags['building:architecture']) tag += '<span title="Architecture">' + titleCase(tags['building:architecture']) + '</span>, ';
			if (tags.architect) tag += '<span title="Architect">' + tags.architect + '</span>, ';
			if (tags.builder) tag += '<span title="Builder">' + tags.builder + '</span>, ';
			if (tags.start_date) tag += '<span title="Start date">' + date_parser(tags.start_date, 'short') + '</span>, ';
			if (tags.height) tag += '<span title="Height in metres">' + tags.height + 'm</span>, ';
		}
		else {
			label = 'Listed';
			icon = 'fas fa-file';
			if (tags.start_date) markerPopup += L.Util.template(tagTmpl, { tag: 'Start date', value: date_parser(tags.start_date, 'long'), iconName: 'fas fa-calendar-alt' });
			if (tags.architect) markerPopup += L.Util.template(tagTmpl, { tag: 'Architect', value: tags.architect, iconName: 'fas fa-user' });
		}
		if (tags.HE_ref) {
			var listedStatus = tags.listed_status || tags.HE_ref;
			tag += '<a href="https://historicengland.org.uk/listing/the-list/list-entry/' + tags.HE_ref + '" title="Historic England entry" target="_blank">' + listedStatus + '</a>, ';
		}
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup = L.Util.template(tagTmpl, { tag: label + ' details', value: tag, iconName: icon }) + markerPopup;
		}
		return markerPopup;
	};
	var facility_parser = function (tags) {
		var tag = '';
		markerPopup = '';
		if (tags.wheelchair === 'yes') tag += '<i class="facYes fas fa-wheelchair fa-fw" title="wheelchair: yes"></i>';
		else if (tags.wheelchair === 'limited') tag += '<i class="facLtd fas fa-wheelchair fa-fw" title="wheelchair: limited"></i>';
		else if (tags.wheelchair === 'no') tag += '<i class="facNo fas fa-wheelchair fa-fw" title="wheelchair: no"></i>';
		if (tags.dog === 'yes') tag += '<i class="facYes fas fa-dog fa-fw" title="dog: yes"></i>';
		else if (tags.dog === 'no') tag += '<i class="facNo fas fa-dog fa-fw" title="dog: no"></i>';
		if (tags.internet_access === 'wlan') tag += '<i class="facYes fas fa-wifi fa-fw" title="internet access: wireless"></i>';
		else if (tags.internet_access === 'terminal') tag += '<i class="facYes fas fa-desktop fa-fw" title="internet access: terminal"></i>';
		if (tags.shelter === 'yes' || tags.covered === 'yes' || tags.covered === 'booth') tag += '<i class="facYes fas fa-umbrella fa-fw" title="shelter: yes"></i>';
		if (tags.highway === 'bus_stop') {
			if (tags.bench === 'yes') tag += '<i class="facYes fas fa-chair fa-fw" title="bench: yes"></i>';
			if (tags.bin === 'yes') tag += '<i class="facYes fas fa-trash-alt fa-fw" title="rubbish bin: yes"></i>';
		}
		if (tags.amenity === 'telephone') {
			if (tags.internet_access === 'yes') tag += '<i class="facYes fas fa-at fa-fw" title="internet + email: yes"></i>';
			if (tags.sms === 'yes') tag += '<i class="facYes fas fa-sms fa-fw" title="sms: yes"></i>';
		}
		if (tags.amenity === 'toilets') {
			if (tags.unisex === 'yes') tag += '<i class="facYes fas fa-restroom fa-fw" title="unisex: yes"></i>';
			if (tags.male === 'yes') tag += '<i class="facYes fas fa-male fa-fw" title="male: yes"></i>';
			if (tags.female === 'yes') tag += '<i class="facYes fas fa-female fa-fw" title="female: yes"></i>';
			if (tags.diaper === 'yes') tag += '<i class="facYes fas fa-baby fa-fw" title="baby changing: yes"></i>';
		}
		if (tag) tag = '<span class="facGen">' + tag + '</span>';
		if (tags.amenity === 'recycling') {
			var recycTag = '', recycList = '';
			for (var recycKey in tags) {
				var recyc = '', recycIcon = '';
				if (recycKey.indexOf('recycling:') === 0 && (tags[recycKey] === 'yes')) {
					recyc = recycKey.split(':')[1];
					recycList += recyc + ', ';
				}
				switch (recyc) {
					case 'aerosol_cans': recycIcon = 'fas fa-spray-can'; break;
					case 'animal_waste': recycIcon = 'fas fa-poop'; break;
					case 'batteries': recycIcon = 'fas fa-battery-full'; break;
					case 'bicycles': recycIcon = 'fas fa-bicycles'; break;
					case 'books': recycIcon = 'fas fa-book'; break;
					case 'cans': recycIcon = 'fas fa-prescription-bottle'; break;
					case 'car_batteries': recycIcon = 'fas fa-car-battery'; break;
					case 'cardboard': recycIcon = 'fas fa-box'; break;
					case 'cds': recycIcon = 'fas fa-compact-disc'; break;
					case 'clothes': recycIcon = 'fas fa-tshirt'; break;
					case 'computers': recycIcon = 'fas fa-laptop'; break;
					case 'tv_monitor':
					case 'electrical_appliances': recycIcon = 'fas fa-tv'; break;
					case 'engine_oil': recycIcon = 'fas fa-oil-can'; break;
					case 'furniture': recycIcon = 'fas fa-couch'; break;
					case 'glass': recycIcon = 'fas fa-wine-glass'; break;
					case 'glass_bottles': recycIcon = 'fas fa-wine-bottle'; break;
					case 'green_waste': recycIcon = 'fas fa-leaf'; break;
					case 'christmas_trees':
					case 'wood': recycIcon = 'fas fa-tree'; break;
					case 'hazardous_waste': recycIcon = 'fas fa-biohazard'; break;
					case 'low_energy_bulbs': recycIcon = 'fas fa-lightbulb'; break;
					case 'mobile_phones': recycIcon = 'fas fa-mobile-alt'; break;
					case 'organic': recycIcon = 'fas fa-drumstick-bite'; break;
					case 'paint': recycIcon = 'fas fa-fill-drip'; break;
					case 'pallets': recycIcon = 'fas fa-pallet'; break;
					case 'magazines':
					case 'newspaper':
					case 'paper': recycIcon = 'fas fa-newspaper'; break;
					case 'pens': recycIcon = 'fas fa-pen-alt'; break;
					case 'plastic_bottles': recycIcon = 'fab fa-gulp'; break;
					case 'printer_cartridges': recycIcon = 'fas fa-print'; break;
					case 'scrap_metal': recycIcon = 'fas fa-cog'; break;
					case 'shoes': recycIcon = 'fas fa-shoe-prints'; break;
					case 'small_appliances': recycIcon = 'fas fa-blender'; break;
					case 'waste': recycIcon = 'fas fa-dumpster'; break;
				}
				if (recycIcon) recycTag += '<i class="' + recycIcon + ' fa-fw" title="' + recyc + ': yes"></i>';
			}
			if (recycList) markerPopup += L.Util.template(tagTmpl, { tag: 'Recycling options', value: recycList.replace(/_/g, '-').substring(0, recycList.length - 2), iconName: 'fas fa-recycle' });
			if (recycTag) tag += '<span class="facRecyc"' + (tag ? ' style="padding-left:10px;"' : '') + '>' + recycTag + '</span>';
		}
		if (Object.keys(tags).some(function (k){ return ~k.indexOf('payment:'); })) {
			var payTag = '', payList = '';
			for (var payKey in tags) {
				var pay = '', payIcon = '';
				if (payKey.indexOf('payment:') === 0 && tags[payKey] === 'yes') {
					pay = payKey.split(':')[1];
					payList += pay + ', ';
				}
				switch (pay) {
					case 'cash':
					case 'coins': payIcon = 'fas fa-coins'; break;
					case 'notes': payIcon = 'fas fa-money-bill'; break;
					case 'cheque': payIcon = 'fas fa-money-check-alt'; break;
					case 'credit_cards': payIcon = 'far fa-credit-card'; break;
					case 'debit_cards': payIcon = 'fas fa-credit-card'; break;
					case 'american_express': payIcon = 'fab fa-cc-amex'; break;
					case 'discover': payIcon = 'fab fa-cc-discover'; break;
					case 'diners_club': payIcon = 'fab fa-cc-diners-club'; break;
					case 'mastercard': payIcon = 'fab fa-cc-mastercard'; break;
					case 'visa_electron':
					case 'visa_debit':
					case 'visa': payIcon = 'fab fa-cc-visa'; break;
					case 'sms': payIcon = 'fas fa-sms'; break;
					case 'bitcoin': payIcon = 'fab fa-bitcoin'; break;
					case 'google_pay': payIcon = 'fab fa-google-wallet'; break;
					case 'apple_pay': payIcon = 'fab fa-apple-pay'; break;
					case 'gift_card': payIcon = 'fas fa-gift'; break;
				}
				if (payIcon) payTag += '<i class="' + payIcon + ' fa-fw" title="' + pay + ': yes"></i>';
			}
			if (payList) markerPopup += L.Util.template(tagTmpl, { tag: 'Payment options', value: payList.replace(/_/g, '-').substring(0, payList.length - 2), iconName: 'fas fa-cash-register' });
			if (payTag) tag += '<span class="facPay"' + (tag ? ' style="padding-left:10px;"' : '') + '>' + payTag + '</span>';
		}
		if (Object.keys(tags).some(function (k){ return ~k.indexOf('diet:'); })) {
			var dietTag = '';
			for (var dietKey in tags) {
				var diet = '', dietIcon = '';
				if (dietKey.indexOf('diet:') === 0 && tags[dietKey] === 'yes') diet = dietKey.split(':')[1];
				switch (diet) {
					case 'pescetarian': dietIcon = 'fas fa-fish'; break;
					case 'vegetarian': dietIcon = 'fas fa-carrot'; break;
					case 'vegan': dietIcon = 'fas fa-leaf'; break;
					case 'fruitarian': dietIcon = 'fas fa-apple'; break;
				}
				if (dietIcon) dietTag += '<i class="' + dietIcon + ' fa-fw" title="' + diet + ' options"></i>';
			}
			if (dietTag) tag += '<span class="facDiet"' + (tag ? ' style="padding-left:10px;"' : '') + '>' + dietTag + '</span>';
		}
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Facilities', value: '<span class="popup-facilities">' + tag + '</span>', iconName: 'fas fa-info-circle' });
		return markerPopup;
	};
	var street_parser = function (tags) {
		markerPopup = '';
		if (tags.highway && tags.name) {
			// get street history through xml file lookup
			$.ajax({
				async: false,
				url: 'assets/xml/streetnames.xml',
				dataType: 'xml',
				cache: true,
				success: function (xml) {
					var street = $(xml).find('name').filter(function () {
						return $(this).text() === tags.name;
					}).closest('street');
					var streetDate = $('date', street).text();
					var streetDesc = $('desc', street).text();
					if (streetDate && !tags.start_date) markerPopup += L.Util.template(tagTmpl, { tag: 'Start date', value: streetDate, iconName: 'fas fa-calendar-alt' });
					if (streetDesc) markerPopup += '<span class="popup-longDesc">' + L.Util.template(tagTmpl, { tag: 'Street history', value: streetDesc, iconName: 'fas fa-road' }) + '</span>';
					if (markerPopup) {
						var sourceLink = $(xml).find('source').text();
						var sourceAuthor = $(xml).find('author').text();
						markerPopup += '<span class="popup-streetSource"><a href="' + sourceLink + '" target="_blank" title="' + sourceLink + '">&copy; ' + sourceAuthor + '</a></span>';
					}
				},
				error: function () { if ($('#inputDebug').is(':checked')) console.debug('ERROR STREET-NAMES: ' + this.url); }
			});
			if (tags.maxspeed) markerPopup += L.Util.template(tagTmpl, { tag: 'Max speed', value: tags.maxspeed, iconName: 'fas fa-tachometer-alt' });
			if (tags.maxwidth) markerPopup += L.Util.template(tagTmpl, { tag: 'Max width', value: tags.maxwidth, iconName: 'fas fa-car' });
		}
		return markerPopup;
	};
	var furtherreading_parser = function (tags) {
		var tag = '';
		markerPopup = '';
		if (tags['url:bexhillhistorytrail']) {
			tag += '<a href="' + tags['url:bexhillhistorytrail'] + '" title="The Bexhill History Trail" target="_blank">History Trail</a>; ';
		}
		if (tags['ref:thekeep']) {
			tag += '<a href="http://www.thekeep.info/collections/getrecord/' + tags['ref:thekeep'] + '" title="The Keep record" target="_blank">The Keep</a>; ';
		}
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup = L.Util.template(tagTmpl, { tag: 'Futher reading', value: tag, iconName: 'fas fa-book' });
		}
		return markerPopup;
	};
	var image_parser = function (tags) {
		// get images
		var lID = 0;
		markerPopup = '';
		if (tags.wikimedia_commons && tags.wikimedia_commons.indexOf('File') === 0) {
			markerPopup += generic_img_parser(tags.wikimedia_commons, lID, 'inherit', '');
			lID++;
		}
		if (tags.image) {
			markerPopup += generic_img_parser(tags.image, lID, ((lID > 0) ? 'none' : 'inherit'), tags['source:image'] ? '&copy; ' + tags['source:image'] : '');
			// support up to 5 additional images
			if (tags['image:360'] || tags.image_1 || lID > 0) {
				lID++;
				for (x = 1; x <= 5; x++) {
					if (tags['image_' + x]) {
						markerPopup += generic_img_parser(tags['image_' + x], lID, 'none', tags['source:image_' + x] ? '&copy; ' + tags['source:image_' + x] : '');
						lID++;
					}
				}
				markerPopup += show_img_controls(lID, tags['image:360']);
			}
		}
		return markerPopup;
	};
	// https://github.com/opening-hours/opening_hours.js
	var opening_hours_parser = function (tags) {
		markerPopup = '';
		var drawTable = function (oh, date_today) {
			var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			var weekdays = ['Su','Mo','Tu','We','Th','Fr','Sa'];
			date_today = new Date(date_today);
			date_today.setHours(0, 0, 0, 0);
			var date = new Date(date_today), table = [];
			date.setDate(date.getDate() - 1);
			for (var row = 0; row < 7; row++) {
				date.setDate(date.getDate() + 1);
				var ohState = oh.getState(date), prevdate = date, curdate = date;
				table[row] = {
					date: new Date(date),
					text: []
				};
				while (curdate.getTime() - date.getTime() < 24*60*60*1000) {
					curdate = oh.getNextChange(curdate);
					if (typeof curdate === 'undefined') return '';
					if (ohState) {
						var text = pad(prevdate.getHours()) + ':' + pad(prevdate.getMinutes()) + '-';
						if (prevdate.getDay() !== curdate.getDay()) text += '24:00';
						else text += pad(curdate.getHours()) + ':' + pad(curdate.getMinutes());
						if (oh.getComment(prevdate)) text += '<br>' + oh.getComment(prevdate);
						table[row].text.push(text);
					}
					prevdate = curdate;
					ohState = !ohState;
				}
			}
			ret = '<table>';
			for (row in table) {
				var today = table[row].date.getDay() == date_today.getDay();
				var endweek = ((table[row].date.getDay() + 1) % 7) == date_today.getDay();
				var cl = today ? ' class="today"' : endweek ? ' class="endweek"' : '';
				ret += '<tr' + cl + '>' +
					'<td class="day ' + ((table[row].date.getDay() % 6 === 0) ? 'weekend' : 'workday') + '">' +
						weekdays[table[row].date.getDay()] + ' ' + months[table[row].date.getMonth()] + ' ' + table[row].date.getDate() +
					'</td><td class="times">' +
						(table[row].text.join(', ') || (oh.getComment(table[row].date) || 'closed')).toUpperCase() +
					'</td>' +
				'</tr>';
			}
			ret += '</table>';
			return ret;
		};
		try {
			var openhrsState = [];
			var oh = new opening_hours(tags.opening_hours, { 'address':{ 'state':'England', 'country_code':'gb' } });
			var strNextChange, comment = (oh.getComment() || oh.getComment(oh.getNextChange()) || '');
			ohState = oh.getState();
			if (oh.getUnknown()) {
				ohState = (oh.getComment(new Date()) && oh.getNextChange() !== undefined) ? true : 'depends';
				strNextChange = comment;
			}
			else strNextChange = oh.prettifyValue();
			if (oh.getNextChange()) {
				var nextTime = oh.getNextChange().toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
				var dateTomorrow = new Date(), dateWeek = new Date();
				dateTomorrow.setDate(new Date().getDate() + 1);
				dateWeek.setDate(new Date().getDate() + 7);
				// display 'today'
				if (oh.getNextChange().toLocaleDateString(navigator.language) === new Date().toLocaleDateString(navigator.language)) {
					strNextChange = nextTime;
				}
				// display 'tomorrow'
				else if (oh.getNextChange().toLocaleDateString(navigator.language) === dateTomorrow.toLocaleDateString(navigator.language)) {
					if (nextTime === '00:00') strNextChange = 'Midnight';
					else strNextChange = 'Tomorrow ' + nextTime;
				}
				// display day name if within a week
				else if (oh.getNextChange().getTime() > dateTomorrow.getTime() && oh.getNextChange().getTime() < dateWeek.getTime()) {
					strNextChange = oh.getNextChange().toLocaleDateString(navigator.language, { weekday: 'long' });
					if (nextTime !== '00:00') strNextChange += ' ' + nextTime;
				}
				// otherwise display date
				else strNextChange = date_parser(oh.getNextChange().toLocaleDateString(navigator.language), 'short');
				if (comment) strNextChange += ' (' + comment + ')';
			}
			// create readable table
			var ohTable = drawTable(oh, new Date()), minWidth = ohTable ? '250px' : '100px';
			if (tags.opening_hours.indexOf('PH ') === -1) ohTable += '<div class="comment" style="text-align:left; padding-top:5px;">Holiday periods may differ.</div>';
			// show tag and collapsible accordion
			if (ohState === true) openhrsState = 'Open until';
			else if (ohState === false) openhrsState = 'Closed until';
			else if (ohState === 'depends') openhrsState = 'Depends on';
			if (openhrsState) {	markerPopup =
				'<div class="popup-ohContainer" style="min-width:' + minWidth + ';">' +
					'<span class="popup-tagContainer" title="' + tags.opening_hours.replace(/"/g, '\'') + '">' +
						'<i class="popup-tagIcon popup-openhrsState openColor-' + ohState + ' fas fa-circle fa-fw"></i>' +
						'<span class="popup-tagValue"><strong>' + openhrsState + ':</strong> ' + strNextChange + '</span>' +
					'</span>' +
					'<div class="popup-ohTable">' + ohTable + '</div>' +
				'</div>';
			}
		}
		catch(err) {
			if (tags.opening_hours && $('#inputDebug').is(':checked')) console.debug('ERROR: Object "' + tags.name + '" cannot parse hours: ' + tags.opening_hours + '. ' + err);
		}
		return markerPopup;
	};
	markerPopup += '<a class="popup-direct" title="Walking directions"><i class="fas fa-walking fa-fw"></i></a>';
	markerPopup += '<a id="' + element.type + '_' + element.id + '" class="popup-edit" title="Edit with OpenStreetMap"><i class="fas fa-edit fa-fw"></i></a>';
	functions = [
		{callback: generic_tag_parser, tag: 'official_name', label: 'Official name'},
		{callback: generic_tag_parser, tag: 'loc_name', label: 'Local name'},
		{callback: generic_tag_parser, tag: 'alt_name', label: 'Alternative name'},
		{callback: generic_tag_parser, tag: 'old_name', label: 'Old name'},
		{callback: generic_tag_parser, tag: 'operator', label: 'Operator', iconName: 'fas fa-user-tie'},
		{callback: address_parser},
		{callback: phone_parser},
		{callback: website_parser},
		{callback: contact_parser},
		{callback: wikipedia_parser},
		{callback: listed_parser},
		{callback: generic_tag_parser, tag: 'opening_date', label: 'Opening date', iconName: 'fas fa-calendar-alt'},
		{callback: generic_tag_parser, tag: 'end_date', label: 'End date', iconName: 'fas fa-calendar-alt'},
		{callback: generic_tag_parser, tag: 'access', label: 'Access', iconName: 'fas fa-sign-in-alt'},
		{callback: generic_tag_parser, tag: 'description', label: 'Description', iconName: 'fas fa-clipboard'},
		{callback: facility_parser},
		{callback: street_parser},
		{callback: furtherreading_parser}
	].concat(
		poiParser,
		{callback: opening_hours_parser},
		{callback: image_parser}
	);
	for (var c = 0; c < functions.length; c++) {
		var data = functions[c];
		if (data.tag && data.label) {
			var iconName = data.iconName || 'fas fa-tag';
			markerPopup += data.callback(element.tags, data.tag, data.label, iconName);
		}
		else markerPopup += data.callback(element.tags);
	}
	return markerPopup;
}

function callback(data) {
	if ($('#inputDebug').is(':checked') && data.elements.length) console.debug(data);
	var type, name, iconName, markerPopup;
	var customPOptions = {
		maxWidth: imgSize,
		autoPanPaddingBottomRight: [5, 50]
	};
	var customTOptions = {
		direction: 'right',
		offset: [15, 2],
		interactive: true
	};
	// padding so popup is not obfuscated by map controls
	customPOptions.autoPanPaddingTopLeft = ($(window).width() < 1300 || !rQuery) ? [20, 40] : [sidebar.width() + 50, 5];
	// push data to results list
	var setPoiList = function () {
		// get openhrs colour
		marker.ohState = ohState;
		marker.ctState = ctState;
		// get distance if location on
		if (lc._active) marker.distance = map.distance(lc._event.latlng, marker._origLatlng);
		// get facilities from popup
		marker.facilities = $('.popup-facilities', $(markerPopup))[0] ? $('.popup-facilities', $(markerPopup))[0].innerHTML : '';
		poiList.push(marker);
	};
	// https://github.com/jfirebaugh/leaflet-osm
	// https://wiki.openstreetmap.org/wiki/API_v0.6
	var getOsmOutline = function (type, id) {
		if (type !== 'node') {
			// check if cached
			if (eleCache['VEC' + type + id]) areaOutline.addLayer(new L.OSM.DataLayer(eleCache['VEC' + type + id])).addTo(map);
			else $.ajax({
				url: 'https://www.openstreetmap.org/api/0.6/' + type + '/' + id + '/full',
				dataType: 'xml',
				success: function (xml) {
					areaOutline.addLayer(new L.OSM.DataLayer(xml)).addTo(map);
					eleCache['VEC' + type + id] = xml;
				},
				error: function () { if ($('#inputDebug').is(':checked')) console.debug('ERROR OSM-OUTLINE: ' + this.url); }
			});
		}
	};
	// define poi elements
	for (var c in data.elements) {
		var e = data.elements[c];
		// check tags exist
		if (!e.tags || e.id in this.instance._ids || e.id === 604081690) continue;
		this.instance._ids[e.id] = true;
		var pos = (e.type === 'node') ? new L.LatLng(e.lat, e.lon) : new L.LatLng(e.center.lat, e.center.lon);
		name = type = iconName = ohState = ctState = undefined;
		if (e.tags.construction && e.tags.ref) {
			name = e.tags.construction + ' construction';
			type = 'construction';
		}
		if (e.tags.amenity) {
			if (!name) name = e.tags.amenity;
			if (!type) type = e.tags.amenity;
			switch (e.tags.amenity) {
				case 'animal_boarding': type = 'animal_shelter'; break;
				case 'arts_centre': type = 'attraction'; iconName = 'theater'; break;
				case 'cafe':
				case 'fast_food':
				case 'restaurant':
					if (e.tags.cuisine) {
						name = e.tags.cuisine;
						if (e.tags.amenity === 'restaurant' && e.tags.takeaway === 'only') name += ' takeaway';
						else name += ' ' + e.tags.amenity;
						switch (e.tags.cuisine) {
							case 'chinese': iconName = 'restaurant_chinese'; break;
							case 'fish_and_chips': iconName = 'fishchips'; break;
							case 'ice_cream': iconName = 'icecream'; break;
							case 'indian': iconName = 'restaurant_indian'; break;
							case 'italian': iconName = 'restaurant_italian'; break;
							case 'kebab': iconName = 'kebab'; break;
							case 'latin_american':
							case 'mexican': iconName = 'restaurant_mexican'; break;
							case 'pizza': iconName = 'pizzaria'; break;
							case 'seafood': iconName = 'restaurant_fish'; break;
							case 'spanish': iconName = 'restaurant_tapas'; break;
							case 'steak_house': iconName = 'restaurant_steakhouse'; break;
							case 'thai': iconName = 'restaurant_thai'; break;
							case 'vegetarian': iconName = 'restaurant_vegetarian'; break;
						}
					}
					break;
				case 'clock':
					type = 'clock';
					if (e.tags.display === 'sundial') {
						name = e.tags.display;
						iconName = 'sundial';
					}
					else if (e.tags.display) name = e.tags.display + ' ' + e.tags.amenity;
					break;
				case 'fire_station': type = 'police'; iconName = 'firetruck'; break;
				case 'place_of_worship': if (e.tags.religion) name = e.tags.religion; break;
				case 'public_bookcase': type = 'library'; break;
				case 'nightclub': type = 'bar'; break;
				case 'post_box': name = (e.tags['post_box:type'] || '') + ' ' + name; break;
				case 'post_office': type = 'post_box'; iconName = 'postoffice'; break;
				case 'pub': if (e.tags.microbrewery) name = 'Microbrewery'; break;
				case 'recycling':
					if (e.tags.recycling_type) {
						name = e.tags.amenity + ' ' + e.tags.recycling_type;
						if (e.tags.recycling_type === 'container') iconName = 'recyclecon';
					}
					break;
				case 'retirement_home':
				case 'social_facility':
					type = 'social_facility';
					name = e.tags.social_facility;
					if (e.tags['social_facility:for']) name = e.tags['social_facility:for'] + ' ' + name; 
					break;
				case 'social_centre':
					if (e.tags.club) {
						if (e.tags.sport) name = e.tags.sport + ' club';
						else name = e.tags.club + ' club';
						type = 'club';
					}
					break;
				case 'taxi': if (!e.tags.building) { name = e.tags.amenity + ' rank'; iconName = 'taxirank'; } break;
			}
		}
		if (e.tags.highway) {
			iconName = 'roadtype_tar';
			switch (e.tags.highway) {
				case 'bus_stop': iconName = 'busstop'; type = 'bus_stop'; break;
				case 'footway':
				case 'path':
				case 'track':
				case 'pedestrian': iconName = 'roadtype_track'; break;
				case 'speed_camera':
					type = 'surveillance';
					name = e.tags.highway;
					iconName = 'trafficcamera';
					break;
			}
		}
		if (e.tags.historic) {
			if (!name) name = 'historic ' + e.tags.historic;
			if (!type) type = 'historic';
			if (e.tags.ruins) iconName = 'ruins-2';
			if (e.tags.military) {
				iconName = 'war';
				switch (e.tags.military) {
					case 'bunker': iconName = 'bunker'; break;
					case 'barrier': iconName = 'tanktrap'; break;
				}
			}
			switch (e.tags.historic) {
				case 'beacon': iconName = 'landmark'; break;
				case 'boundary_stone': iconName = pois.boundary_stone.iconName; break;
				case 'memorial':
					if (e.tags.memorial) {
						name = 'memorial ' + e.tags.memorial;
						if (!iconName) {
							switch (e.tags.memorial) {
								case 'blue_plaque':
								case 'plaque': iconName = 'plaque'; break;
								case 'clock': iconName = 'clock'; break;
								case 'statue': iconName = 'statue-2'; break;
								case 'war_memorial': name = 'war memorial'; iconName = 'war_memorial'; break;
							}
						}
					}
					if (!iconName) iconName = 'memorial';
					break;
				case 'moat': iconName = 'lake2'; break;
				case 'railway_station': iconName = 'steamtrain'; break;
				case 'street_lamp': iconName = 'streetlamp'; break;
				case 'wreck': iconName = 'shipwreck'; break;
				case 'watering_place': iconName = 'wateringplace'; break;
			}
		}
		if (e.tags.man_made) {
			if (!name) name = e.tags.man_made;
			if (!type) type = e.tags.man_made;
			if (type === 'survey_point') {
				name = e.tags.survey_point;
				switch (e.tags.survey_point) {
					case 'triangulation_station': iconName = 'sppillar'; break;
					case 'flush_bracket': iconName = 'spbracket'; break;
					case 'pivot':
					case 'rivet': iconName = 'sprivet'; break;
				}
			}
		}
		if (e.tags.natural) {
			if (!name) name = e.tags.natural;
			if (!type) type = e.tags.natural;
			if (type === 'peak') iconName = 'hill';
		}
		if (e.tags.shop) {
			if (e.tags.shop === 'yes') name = 'shop';
			if (!name) name = e.tags.shop;
			if (!type) type = e.tags.shop;
			switch (e.tags.shop) {
				case 'beauty': if (e.tags.beauty) name = e.tags.beauty + ' ' + e.tags.shop; break;
				case 'bathroom_furnishing':
				case 'interior_decoration':
				case 'kitchen': type = 'houseware'; break;
				case 'butcher': type = 'deli'; iconName = 'butcher-2'; break;
				case 'boutique': type = 'clothes'; break;
				case 'collector': type = 'games'; break;
				case 'craft': if (e.tags.craft) name = e.tags.craft; break;
				case 'department_store': type = 'clothes'; iconName = 'departmentstore'; break;
				case 'e-cigarette': type = 'tobacco'; break;
				case 'garden_centre': type = 'florist'; break;
				case 'hairdresser':
					if (e.tags.male === 'yes') { name = 'male barber'; iconName = 'hairmale'; }
					else if (e.tags.female === 'yes') { name = 'female hairdresser'; iconName = 'hairfemale'; }
					else if (e.tags.unisex === 'yes') name = 'unisex hairdresser';
					break;
				case 'hardware': type = 'doityourself'; break;
				case 'hearing_aids': type = 'mobility'; iconName = 'hoergeraeteakustiker_22px'; break;
				case 'laundry': type = 'dry_cleaning'; break;
				case 'signs': type = 'copyshop'; break;
				case 'trade': if (e.tags.trade) name = e.tags.trade + ' ' + e.tags.shop; break;
				case 'window_blind': type = 'curtain'; break;
				case 'vacant': name = e.tags.shop + ' shop';
			}
		}
		if (e.tags.tourism) {
			if (!name) name = e.tags.tourism;
			if (!type) type = e.tags.tourism;
			switch (e.tags.tourism) {
				case 'apartment': type = 'guest_house'; iconName = 'villa'; break;
				case 'artwork': if (e.tags.artwork_type) name = e.tags.artwork_type + ' ' + e.tags.tourism; break;
				case 'caravan_site': type = 'guest_house'; iconName = 'campingcar'; break;
				case 'gallery': type = 'artwork'; iconName = 'museum_paintings'; break;
				case 'hotel': type = 'guest_house'; iconName = 'hotel_0star'; break;
				case 'information':
					if (e.tags.information) {
						name = e.tags.tourism + ' ' + e.tags.information;
						switch (e.tags.information) {
							case 'board': iconName = 'board'; break;
							case 'guidepost': iconName = 'signpost-3'; name = e.tags.tourism + ' ' + e.tags.information; break; // [ascii 255] force to bottom of results
							case 'map': iconName = 'map'; if (e.tags.map_type && e.tags.map_type === 'toposcope') type = 'artwork'; break;
							case 'office': name = ' ' + name; break; // [ascii 32] force to top of results
						}
					}
					break;
			}
		}
		if (e.tags.leisure) {
			if (!name) name = e.tags.leisure;
			if (!type) type = e.tags.leisure;
			if (e.tags.sport) name = e.tags.sport + ' ' + e.tags.leisure;
			switch (type) {
				case 'common':
				case 'nature_reserve': type = 'park'; break;
				case 'fitness_station': type = 'fitness_centre'; break;
				case 'garden': iconName = 'urbanpark'; break;
				case 'golf_course': type = 'recreation'; iconName = 'golfing'; break;
				case 'horse_riding': type = 'recreation'; iconName = 'horseriding'; break;
				case 'sports_centre':
					type = 'recreation';
					if (e.tags.sport === 'swimming') iconName = 'swimming2'; 
					else iconName = 'indoor-arena';
					break;
			}
		}
		if (e.tags.surveillance) {
			if (!name) name = e.tags.surveillance;
			if (!type) type = e.tags.surveillance;
		}
		if (e.tags.emergency) {
			if (!name) name = e.tags.emergency;
			if (!type) type = e.tags.emergency;
			if (type === 'ambulance_station') { type = 'police'; iconName = 'ambulance'; }
		}
		if (e.tags.office) {
			if (!name) name = (e.tags.office !== 'yes') ? e.tags.office + ' office' : 'office';
			if (!type) type = e.tags.office;
			switch (type) {
				case 'financial': type = 'accountant'; break;
				case 'property_management': type = 'estate_agent'; break;
			}
		}
		if (e.tags.healthcare) {
			if (!name && e.tags['healthcare:speciality']) name = e.tags['healthcare:speciality'];
			else if (!name) name = e.tags.healthcare;
			if (!type) type = 'healthcare';
		}
		if (e.tags.listed_status) {
			if (!type || type === 'shelter' || type === 'company') type = 'listed_status';
			if (!name || name === 'shelter') {
				if (e.tags.building && e.tags.building !== 'yes' && e.tags.building !== 'commercial' && e.tags.building !== 'public' && e.tags.building !== 'hut') name = e.tags.building;
				else if (e.tags.barrier && e.tags.barrier !== 'yes') name = e.tags.barrier;
				if (name) name = 'heritage-listed ' + name;
			}
		}
		if (e.tags.route === 'bus') {
			type = e.tags.route;
			name = e.tags.route + ' route';
		}
		if (e.tags.landuse) {
			if (!name) name = e.tags.landuse;
			if (!type) type = e.tags.landuse;
			if (e.tags.landuse === 'cemetery') iconName = 'cemetery';
			if (e.tags.landuse === 'recreation_ground') { type = 'recreation'; iconName = 'soccer'; }
		}
		if (e.tags.boundary) {
			if (!name) name = e.tags.protection_title;
			if (!type) type = e.tags.boundary;
		}
		if (e.tags.place) {
			name = e.tags.place;
			iconName = 'smallcity';
		}
		// set marker options
		customPOptions.minWidth = (e.tags.image || e.tags.wikimedia_commons) ? imgSize : '';
		var poi = pois[type];
		if (!iconName) {
			if (poi) iconName = poi.iconName;
			else if (e.tags.building) {
				if (e.tags.building === 'house' || e.tags.building === 'bungalow') iconName = 'bighouse';
				else if (e.tags.building === 'hut') iconName = 'hut';
				else if (e.tags.building === 'service') iconName = 'powersubstation';
				else iconName = 'apartment-3';
			}
			else iconName = '000blank';
		}
		var marker = L.marker(pos, {
			// do not bounce marker: when single poi, in debug mode, on small devices
			bounceOnAdd: (!rQuery && $(window).width() >= 768 && !$('#inputDebug').is(':checked')),
			bounceOnAddOptions: {duration: 500, height: 200},
			icon: L.icon({
				iconUrl: 'assets/img/icons/' + iconName + '.png',
				iconSize: [32, 37],
				iconAnchor: [16, 35],
				shadowUrl: 'assets/img/icons/000shadow.png',
				shadowAnchor: [16, 27],
				popupAnchor: [0, -27]
			}),
			keyboard: false,
			riseOnHover: true
		});
		// find alternative poi name
		if (!name || (poi && name === poi.name.toLowerCase())) {
			if (poi) name = poi.name;
			else if (e.tags.highway) name = (e.tags.highway === 'bus_stop') ? e.tags.highway : e.tags.highway + ' highway';
			else if (e.tags.railway) name = 'railway ' + e.tags.railway;
			else if (e.tags.building && e.tags.building !== 'yes') name = e.tags.building;
			else if (e.tags.ref) name = e.tags.ref;
			else if (e.tags['addr:housename']) name = e.tags['addr:housename'];
			else name = '&hellip;';
		}
		if (name != '&hellip;') name = titleCase(name);
		marker._leaflet_id = e.type.slice(0, 1) + e.id;
		// tooltip
		customTOptions.permanent = poi ? poi.permTooltip : 0;
		var toolTip = '<b>' + name + '</b>';
		if (e.tags.name) toolTip += '<br><i>' + e.tags.name + '</i>';
		else if (e.tags['addr:street']) {
			if (e.tags['addr:housename']) toolTip += '<br><i>' + e.tags['addr:housename'] + ', ' + e.tags['addr:street'] + '</i>';
			else if (e.tags['addr:housenumber']) toolTip += '<br><i>' + e.tags['addr:housenumber'] + ' ' + e.tags['addr:street'] + '</i>';
			else if (e.tags['addr:unit']) toolTip += '<br><i>Unit ' + e.tags['addr:unit'] + ', ' + e.tags['addr:street'] + '</i>';
			else toolTip += '<br><i>' + e.tags['addr:street'] + '</i>';
		}
		else if (e.tags['addr:place']) toolTip += '<br><i>' + e.tags['addr:place'] + '</i>';
		else if (e.tags.ref) toolTip += '<br><i>' + e.tags.ref + '</i>';
		else if (e.tags.operator) toolTip += '<br><i>' + e.tags.operator + '</i>';
		if (e.tags.image || e.tags.wikimedia_commons) {
			toolTip += ' <i style="color:#777; min-width:17px;" class="fas ';
			toolTip += ((e.tags.image && e.tags.wikimedia_commons) || e.tags.image_1) ? 'fa-images' : 'fa-image';
			toolTip += ' fa-fw" title="Image"></i>';
			if (e.tags['image:360']) toolTip += ' <i style="color:#777; min-width:17px;" class="fa fa-street-view fa-fw" title="360 Panorama"></i>';
		}
		// check if already defined poi
		if (poi) {
			// create pop-up
			markerPopup = poi.tagParser ? poi.tagParser(e, name) : parse_tags(e, name, []);
			customTOptions.className = (ohState !== undefined) ? 'openColor-list-' + ohState : 'openColor-list-' + ctState;
			// show pop-up
			marker.bindPopup(markerPopup, customPOptions);
			marker.bindTooltip(toolTip, customTOptions);
			if (rQuery) {
				if ($(window).width() < 768 && !$('.sidebar.collapsed').length) $('.sidebar-close').click();
				marker.addTo(this.instance).openPopup();
				setPoiList();
				markerId = marker._leaflet_id;
				// get and display the area outline through openstreetmap api
				getOsmOutline(e.type, e.id);
			}
			// marker from group poi and check 'currently open' setting
			else if (!$('#inputOpen').is(':checked') || ($('#inputOpen').is(':checked') && ohState === true)) {
				marker.addTo(this.instance);
				setPoiList();
				getOsmOutline(e.type, e.id);
				// open popup from permalink
				if (marker._leaflet_id === markerId) marker.openPopup().stopBounce();
			}
		}
		else if (rQuery) {
			// single poi marker
			markerPopup = parse_tags(e, name, []);
			customTOptions.className = (ohState !== undefined) ? 'openColor-list-' + ohState : 'openColor-list-' + ctState;
			marker.bindPopup(markerPopup, customPOptions);
			marker.bindTooltip(toolTip, customTOptions);
			if ($(window).width() < 768 && !$('.sidebar.collapsed').length) $('.sidebar-close').click();
			marker.addTo(this.instance).openPopup();
			setPoiList();
			markerId = marker._leaflet_id;
			getOsmOutline(e.type, e.id);
		}
		else if ($('#inputDebug').is(':checked')) {
			// custom overpass query
			markerPopup = parse_tags(e, name, []);
			customTOptions.className = (ohState !== undefined) ? 'openColor-list-' + ohState : 'openColor-list-' + ctState;
			marker.bindPopup(markerPopup, customPOptions);
			marker.bindTooltip(toolTip, customTOptions);
			marker.addTo(this.instance);
			setPoiList();
			getOsmOutline(e.type, e.id);
		}
	}
	// output list of pois in sidebar
	if (poiList.length) setTimeout(function () {
		// sort by distance or name
		poiList.sort(function (a, b) {
			if (a.distance) return (a.distance > b.distance) ? 1 : -1;
			else return (a._tooltip._content > b._tooltip._content) ? 1 : -1;
		});
		var poiResultsList = '<table>';
		for (c = 0; c < poiList.length; c++) {
			var state = (poiList[c].ohState !== undefined) ? poiList[c].ohState : poiList[c].ctState;
			var openColorTitle = (state === true || state === false) ? ' title="' + ((state === true) ? 'Open' : 'Closed') + '"' : '';
			poiResultsList += '<tr id="' + c + '">' +
				'<td class="openColor-list-' + state + '"' + openColorTitle + '><img src="' + poiList[c]._icon.src + '"></td>' +
				'<td>' + poiList[c]._tooltip._content + '</td>' +
				'<td>' + poiList[c].facilities + '</td>';
			if (poiList[c].distance) {
				if ($('#inputUnit').is(':checked')) {
					if (poiList[c].distance < 1000) poiResultsList += '<td>' + Math.round(poiList[c].distance) + ' m</td>';
					else poiResultsList += '<td>' + Math.round((poiList[c].distance / 1000) * 100) / 100 + ' km</td>';
				}
				else {
					if (poiList[c].distance < 800) poiResultsList += '<td>' + Math.round(poiList[c].distance / 0.9144) + ' yd</td>';
					else poiResultsList += '<td>' + Math.round((poiList[c].distance / 1609.34) * 100) / 100 + ' mi</td>';
				}
			}
			poiResultsList += '</tr>';
		}
		poiResultsList += '</table>';
		$('.poi-results-list').html(poiResultsList).fadeTo(0, 1);
		$('.poi-results').slideDown(400, function() {
			// keep checkbox in view
			if ($('.poi-checkbox input:checked').length === 1) $('.poi-icons')
				.scrollTop(0)
				.animate({ scrollTop: $('.poi-checkbox input:checked').parent().position().top - 50 }, 100);
		}).css('pointer-events', 'auto');
		// interact with map
		$('.poi-results-list tr').hover(
			function () { poiList[this.id].openTooltip(); },
			function () { if (!poiList[this.id]._tooltip.options.permanent) poiList[this.id].closeTooltip(); }
		);
		$('.poi-results-list tr').click(function () {
			if ($(window).width() < 768) $('.sidebar-close').click();
			else {
				// focus 150px above marker to allow room for popup
				var px = map.project(poiList[this.id]._popup._latlng);
				px.y -= 150;
				map.flyTo(map.unproject(px));
			}
			poiList[this.id].closePopup().openPopup();
		});
		if (poiList[0].distance) $('.poi-results h3').html($('.leaflet-marker-icon').length + ' results <i style="color:#777;" class="fas fa-sort-numeric-down fa-fw"></i>');
		else $('.poi-results h3').html($('.leaflet-marker-icon').length + ' results <i style="color:#777;" class="fas fa-sort-alpha-down fa-fw"></i>');
		if (poiList.length === maxOpResults) {
			$('.poi-results h3').append('<br>(maximum number of results)');
			$('.leaflet-control-statusmsg').html('<i class="fas fa-info-circle fa-fw"></i> Maximum number of results shown (' + maxOpResults + ').').show();
		}
	}, 50);
	if (spinner > 0) spinner--;
	if (spinner === 0) {
		$('#spinner').fadeOut(200);
		$('.poi-checkbox').removeClass('poi-loading');
	}
	permalinkSet();
}

// templates
var tagTmpl = '<div class="popup-tagContainer"><i class="popup-tagIcon {iconName} fa-fw"></i><span class="popup-tagValue"><strong>{tag}:</strong> {value}</span></div>';
function generic_header_parser(header, subheader, fhrs) {
	var markerPopup = '<div class="popup-header"><h3>' + header + '</h3>';
	if (subheader) markerPopup += '<span class="popup-header-sub">' + subheader + '</span>';
	if (fhrs) markerPopup += '<span class="popup-fhrs" fhrs-key="' + fhrs + '"><img title="Loading hygiene rating..." src="assets/img/loader.gif"></span>';
	return markerPopup + '</div>';
}
function generic_tag_parser(tags, tag, label, iconName) {
	var markerPopup = '', result;
	// ignore implied access
	if (tags[tag] && tag === 'access' && tags[tag] === 'yes') return markerPopup;
	else if (tags[tag]) {
		if (tags[tag] === 'yes') result = '<i class="fas fa-check fa-fw"></i>';
		else if (tags[tag] === 'no') result = '<i class="fas fa-times fa-fw"></i>';
		else if (tag.indexOf('_date') > -1 || tag.indexOf('date_') > -1) result = date_parser(tags[tag], 'long');
		else result = tags[tag].replace(/;/g, ', ').replace(/_/g, ' ');
		markerPopup += L.Util.template(tagTmpl, { tag: label, value: result, iconName: iconName });
	}
	if ((tags.description || tags.inscription) && markerPopup) markerPopup = '<span class="popup-longDesc">' + markerPopup + '</span>';
	return markerPopup;
}
function generic_img_parser(img, id, display, attrib) {
	var url = '', imgTmpl = '<div id="img{id}" class="popup-imgContainer" style="display:{display};">' +
		'<i class="imgZoom theme fas fa-search-plus fa-sm"></i>' +
		'<img data-url="{url}" alt="Loading image..." style="max-height:{maxheight}px;" src="{img}">' + 
		'<br><div class="popup-imgAttrib">';
	if (img.indexOf('File') === 0) {
		url = img;
		attrib = 'Loading attribution...';
		img = 'https://commons.wikimedia.org/w/thumb.php?f=' + encodeURIComponent(img.split(':')[1]) + '&w=' + imgSize;
		imgTmpl += '{attrib}';
	}
	else {
		imgTmpl += '<a class="imgOpen" onclick="imgpopup($(img{id}).find(\'img\'));">View image</a>';
		if (attrib) imgTmpl += ' | {attrib}';
	}
	imgTmpl += '</div></div>';
	return L.Util.template(imgTmpl, { id: id, display: display, url: url, maxheight: imgSize / 2, img: img, attrib: attrib });
}

// poi callback parsers
function allotment_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'user', label: 'Point of contact', iconName: 'fas fa-user-circle'},
		{callback: generic_tag_parser, tag: 'plots', label: 'Plots', iconName: 'fas fa-th-large'},
	]);
}
function artwork_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'artwork_type', label: 'Artwork type', iconName: 'fas fa-paint-brush'},
		{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist', iconName: 'far fa-user'},
		{callback: generic_tag_parser, tag: 'material', label: 'Material', iconName: 'fas fa-cube'}
	]);
}
function atm_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'brand', label: 'Brand'},
		{callback: generic_tag_parser, tag: 'indoor', label: 'Enter building to access', iconName: 'fas fa-sign-in-alt'},
		{callback: generic_tag_parser, tag: 'fee', label: 'Fee', iconName: 'fas fa-coins'}
	]);
}
function bikepark_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'bicycle_parking', label: 'Type', iconName: 'fas fa-lock'},
		{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'fas fa-bicycle'},
	]);
}
function bikeshop_parser(tags, titlePopup) {
	var bikeservices_parser = function (tags) {
		var markerPopup = '', tag = '';
		for (var key in tags) {
			if (key.indexOf('service:bicycle:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[2] + ', ';
		}
		if (tag) {
			tag = tag.replace(/_/g, '-');
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Bicycle services', value: tag, iconName: 'fas fa-bicycle' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: bikeservices_parser}
	]);
}
function busstop_parser(tags, titlePopup) {
	var nextbus_parser = function (tags) {
		var markerPopup = '', bearing;
		if (tags['naptan:Bearing']) {
			switch(tags['naptan:Bearing']) {
				case 'N': bearing = 'North'; break;
				case 'E': bearing = 'East'; break; 
				case 'S': bearing = 'South'; break;
				case 'W': bearing = 'West'; break;
				case 'NE': bearing = 'North-east'; break;
				case 'NW': bearing = 'North-west'; break;
				case 'SE': bearing = 'South-east'; break;
				case 'SW': bearing = 'South-west'; break;
			}
			markerPopup += L.Util.template(tagTmpl, { tag: 'Bearing', value: bearing, iconName: 'fas fa-compass' });
		}
		if (tags['naptan:AtcoCode']) markerPopup += '<div class="popup-bsTable" naptan-key="' + tags['naptan:AtcoCode'] + '">' +
				'<img title="Loading next bus times" src="assets/img/loader.gif"></div>';
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: generic_tag_parser, tag: 'ref', label: 'Stop ID', iconName: 'fas fa-bus'},
		{callback: generic_tag_parser, tag: 'naptan:Street', label: 'Street', iconName: 'fas fa-road'},
		{callback: nextbus_parser}
	]);
}
function carpark_parser(tags, titlePopup) {
	var maxstay_parser = function (tags) {
		var markerPopup = '';
		if (tags.maxstay) markerPopup += L.Util.template(tagTmpl, { tag: 'Max stay', value: time_parser(tags.maxstay), iconName: 'fas fa-clock' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'capacity', label: 'Spaces', iconName: 'fas fa-car'},
		{callback: generic_tag_parser, tag: 'capacity:disabled', label: 'Disabled spaces', iconName: 'fas fa-wheelchair'},
		{callback: generic_tag_parser, tag: 'capacity:parent', label: 'Parent spaces', iconName: 'fas fa-child'},
		{callback: generic_tag_parser, tag: 'fee', label: 'Fee', iconName: 'fas fa-coins'},
		{callback: maxstay_parser}
	]);
}
function carshop_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'service', label: 'Services', iconName: 'fas fa-car'}
	]);
}
function cctv_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'highway', label: 'Type', iconName: 'fas fa-eye'},
		{callback: generic_tag_parser, tag: 'maxspeed', label: 'Max speed', iconName: 'fas fa-video'},
		{callback: generic_tag_parser, tag: 'surveillance:type', label: 'Type', iconName: 'fas fa-eye'},
		{callback: generic_tag_parser, tag: 'surveillance:zone', label: 'Zone', iconName: 'fas fa-eye'},
		{callback: generic_tag_parser, tag: 'camera:mount', label: 'Camera mount', iconName: 'fas fa-video'},
		{callback: generic_tag_parser, tag: 'camera:type', label: 'Camera type', iconName: 'fas fa-video'}
	]);
}
function clock_parser(tags, titlePopup) {
	var clockDetail = function (tags) {
		var markerPopup = '', tag = '';
		if (tags.disused === 'yes') tag += 'noncurrent, ';
		if (tags.display) tag += tags.display + ', ';
		if (tags.support) tag += tags.support + ', ';
		if (tags.faces >= 2) tag += tags.faces + ' faces, ';
		else tag += '1 face, ';
		if (tag) {
			tag = tag.replace(/_/g, '-');
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Detail', value: tag, iconName: 'fas fa-clock' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: clockDetail}
	]);
}
function clothes_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'clothes', label: 'Clothes type', iconName: 'fas fa-tshirt'},
		{callback: generic_tag_parser, tag: 'second_hand', label: 'Second hand', iconName: 'fas fa-tshirt'}
	]);
}
function club_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'club', label: 'Club type', iconName: 'fas fa-comments'},
		{callback: generic_tag_parser, tag: 'sport', label: 'Sport type', iconName: 'fas fa-trophy'}
	]);
}
function construction_parser(tags, titlePopup) {
	var planningRef = function (tags) {
		var markerPopup = '';
		if (tags.ref && tags.ref.indexOf('RR/') === 0) {
			var link = '<a href="http://planweb01.rother.gov.uk/OcellaWeb/planningDetails?reference=' + tags.ref + '" title="Rother Planning Application" target="_blank">' + tags.ref + '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Planning ref', value: link, iconName: 'fas fa-file' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: planningRef}
	]);
}
function craft_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'craft', label: 'Craft type', iconName: 'fas fa-shopping-bag'}
	]);
}
function defib_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'defibrillator:location', label: 'Location', iconName: 'fas fa-location-arrow'},
		{callback: generic_tag_parser, tag: 'indoor', label: 'Enter building to access', iconName: 'fas fa-sign-in-alt'}
	]);
}
function food_parser(tags, titlePopup) {
	var cuisine_parser = function (tags) {
		var markerPopup = '', tag = '';
		if (tags.cuisine) tag += tags.cuisine + ', ';
		if (tags.fair_trade === 'yes') tag += 'fairtrade, ';
		if (tags.breakfast === 'yes') tag += 'breakfast, ';
		if (tags.lunch === 'yes') tag += 'lunch, ';
		if (tags.ice_cream === 'yes') tag += 'ice cream, ';
		if (tags.real_ale === 'yes') tag += 'real ale, ';
		if (tags.real_cider === 'yes') tag += 'real cider, ';
		for (var key in tags) {
			if (key.indexOf('diet:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[1] + ' options, ';
		}
		if (tag) {
			tag = tag.replace(/_/g, '-');
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Cuisine', value: tag, iconName: 'fas fa-utensils' });
		}
		return markerPopup;
	};
	var service_parser = function (tags) {
		var tag = '', markerPopup = '';
		if (tags.takeaway === 'yes') tag += 'takeaway, ';
		else if (tags.takeaway === 'only') tag += 'takeaway only, ';
		if (tags.delivery === 'yes') tag += 'delivery, ';
		if (tags.capacity) tag += 'seats ' + tags.capacity + ', ';
		if (tags.beer_garden === 'yes') tag += 'beer garden, ';
		else if (tags.outdoor_seating === 'yes') tag += 'outdoor seating, ';
		if (tags.reservation === 'yes') tag += 'takes reservation, ';
		else if (tags.reservation === 'required') tag += 'needs reservation, ';
		if (tags['url:just_eat']) tag += '<a href="' + tags['url:just_eat'] + '" title="just-eat.com" target="_blank">just-eat</a>, ';
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Service', value: tag, iconName: 'fas fa-shopping-bag' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: cuisine_parser},
		{callback: service_parser}
	]);
}
function fuelstation_parser(tags, titlePopup) {
	var fuel_parser = function (tags) {
		var markerPopup = '', tag = '';
		for (var key in tags) {
			if (key.indexOf('fuel:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[1] + ', ';
		}
		if (tag) {
			tag = tag.replace(/_/g, '-');
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Fuel options', value: tag, iconName: 'fas fa-oil-can' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'shop', label: 'Shop', iconName: 'fas fa-store-alt'},
		{callback: fuel_parser}
	]);
}
function healthcare_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'healthcare', label: 'Healthcare type', iconName: 'fas fa-medkit'},
		{callback: generic_tag_parser, tag: 'healthcare:speciality', label: 'Healthcare speciality', iconName: 'fas fa-medkit'}
	]);
}
function historic_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'historic', label: 'Historic type', iconName: 'fas fa-landmark'},
		{callback: generic_tag_parser, tag: 'bunker_type', label: 'Bunker type', iconName: 'fas fa-cube'},
		{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist', iconName: 'fas fa-user'},
		{callback: generic_tag_parser, tag: 'inscription', label: 'Inscription', iconName: 'fas fa-pen-square'},
		{callback: generic_tag_parser, tag: 'wreck:date_sunk', label: 'Date sunk', iconName: 'fas fa-ship'},
		{callback: generic_tag_parser, tag: 'wreck:visible_at_low_tide', label: 'Visible at low tide', iconName: 'fas fa-ship'}
	]);
}
function hotel_parser(tags, titlePopup) {
	var hotelservices_parser = function (tags) {
		var markerPopup = '', tag = '';
		if (tags.stars) {
			var result = '<a href="https://www.visitengland.com/plan-your-visit/quality-assessment-and-star-ratings/visitengland-star-ratings" title="' + tags.stars + ' stars" target="_blank">';
			for (var c = 0; c < tags.stars; c++) {
				result += '<i class="far fa-star fa-fw"></i>';
			}
			result += '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'VisitEngland rating', value: result, iconName: 'fas fa-star' });
		}
		if (tags.view) tag += tags.view + ' view, ';
		if (tags.balcony) tag += 'balcony, ';
		if (tags.cooking) tag += 'self-catering, ';
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Accomodation', value: tag, iconName: 'fas fa-bed' });
		}
		// booking.com affiliate link
		if (tags['url:booking_com']) markerPopup += L.Util.template(tagTmpl, { tag: 'Check avalibility', value: '<a href="' + tags['url:booking_com'] + '?aid=1335159&no_rooms=1&group_adults=1" title="booking.com" target="_blank"><img alt="booking.com" class="popup-imgBooking" src="assets/img/booking_com.png"></a>', iconName: 'fas fa-file' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: hotelservices_parser},
		{callback: generic_tag_parser, tag: 'rooms', label: 'Rooms', iconName: 'fas fa-bed'}
	]);
}
function hospital_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'emergency', label: 'Emergency', iconName: 'fas fa-ambulance'}
	]);
}
function info_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'board_type', label: 'Board type', iconName: 'fas fa-map-signs'},
		{callback: generic_tag_parser, tag: 'map_size', label: 'Map size', iconName: 'fas fa-map-signs'},
		{callback: generic_tag_parser, tag: 'ref', label: 'Reference', iconName: 'fas fa-hashtag'}
	]);
}
function post_parser(tags, titlePopup) {
	var postcypher_parser = function (tags) {
		var royalcypher = tags.royal_cypher;
		var markerPopup = '';
		if (royalcypher) {
			switch (royalcypher) {
				case 'VR': royalcypher += ': Victoria (1837-1901)'; break;
				case 'EVIIR': royalcypher += ': Edward VII (1901-1910)'; break;
				case 'GR': royalcypher += ': George V (1910-1936)'; break;
				case 'EVIIIR': royalcypher += ': Edward VIII (1936)'; break;
				case 'GVIR': royalcypher += ': George VI (1936-1952)'; break;
				case 'EIIR': royalcypher += ': Elizabeth II (1952+)'; break;
			}
			markerPopup += L.Util.template(tagTmpl, { tag: 'Royal cypher', value: royalcypher, iconName: 'fas fa-archive' });
		}
		return markerPopup;
	};
	var collection_parser = function (tags) {
		var markerPopup = '';
		if (tags.collection_times) {
			var strNextChange, ct = new opening_hours(tags.collection_times, { 'address':{ 'state':'England', 'country_code':'gb' } }, 1).getNextChange();
			if (ct.getDate() === new Date().getDate()) strNextChange = 'Today in ' + time_parser((ct - new Date()) / 60000);
			else if (ct.getDate() === new Date().getDate() + 1) strNextChange = 'Tomorrow ' + ct.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
			else if (ct.getDate() > new Date().getDate() + 1) strNextChange = ct.toLocaleDateString(navigator.language, { weekday: 'long' }) + ' ' + ct.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
			ctState = (ct.getDate() === new Date().getDate() && ct.getDate() >= new Date().getDate()) ? true : false;
			markerPopup += L.Util.template(tagTmpl, { tag: 'Next collection', value: '<span title="' + tags.collection_times + '">' + strNextChange + '</span>', iconName: 'openColor-' + ctState + ' fas fa-circle' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: postcypher_parser},
		{callback: generic_tag_parser, tag: 'post_box:mounting', label: 'Mounted on', iconName: 'fas fa-archive'},
		{callback: generic_tag_parser, tag: 'collection_times', label: 'Collection times', iconName: 'fas fa-clock'},
		{callback: collection_parser}
	]);
}
function shelter_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'shelter_type', label: 'Shelter type', iconName: 'fas fa-umbrella'}
	]);
}
function school_parser(tags, titlePopup) {
	var edubase_parser = function (tags) {
		var tag = tags['ref:edubase'], markerPopup = '';
		if (tag) {
			var link = '<a href="https://get-information-schools.service.gov.uk/Establishments/Establishment/Details/' + tag + '" title="Department for Education" target="_blank">' + tag + '</a>; ' +
				'<a href="http://www.ofsted.gov.uk/oxedu_providers/full/(urn)/' + tag + '" title="Ofstead" target="_blank">Ofstead</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'EduBase', value: link, iconName: 'fas fa-school' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: edubase_parser}
	]);
}
function socialf_parser(tags, titlePopup) {
	var socialfservices_parser = function (tags) {
		var markerPopup = '', tag = '';
		if (tags['social_facility:for']) tag += tags['social_facility:for'] + ' ';
		if (tags.social_facility) tag += tags.social_facility;
		if (tag) {
			tag = tag.replace(/_/g, ' ');
			markerPopup += L.Util.template(tagTmpl, { tag: 'Social facility', value: tag, iconName: 'fas fa-users' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: socialfservices_parser},
		{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'fas fa-users'}
	]);
}
function surveyp_parser(tags, titlePopup) {
	var trigpointuk_parser = function (tags) {
		var tag = tags.tpuk_ref, markerPopup = '';
		if (tag) {
			var link = '<a href="http://trigpointing.uk/trig/' + tag.split('TP')[1] + '" title="Trigpointing UK" target="_blank">' + tag + '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'TrigpointingUK', value: link, iconName: 'fas fa-monument' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: trigpointuk_parser},
		{callback: generic_tag_parser, tag: 'ref', label: 'Bracket number', iconName: 'fas fa-hashtag'},
		{callback: generic_tag_parser, tag: 'ele', label: 'Elevation (m above sea)', iconName: 'fas fa-arrow-up'},
		{callback: generic_tag_parser, tag: 'height', label: 'Height (m above ground)', iconName: 'fas fa-arrow-up'},
		{callback: generic_tag_parser, tag: 'survey_point:levelling_date', label: 'Levelling date', iconName: 'fas fa-calendar-alt'},
		{callback: generic_tag_parser, tag: 'survey_point:verified_date', label: 'Verified date', iconName: 'fas fa-calendar-alt'}
	]);
}
function tap_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'drinking_water', label: 'Drinking water', iconName: 'fas fa-tint'},
	]);
}
function taxi_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [ {callback: generic_tag_parser, tag: 'capacity', label: 'Taxi rank capacity', iconName: 'fas fa-taxi'} ]);
}
function telephone_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'disused', label: 'Disused', iconName: 'fas fa-wrench'},
	]);
}
function toilet_parser(tags, titlePopup) {
	return parse_tags( tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'indoor', label: 'Enter building to access', iconName: 'fas fa-sign-in-alt'}
	]);
}
function worship_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'denomination', label: 'Denomination', iconName: 'fas fa-place-of-worship'},
		{callback: generic_tag_parser, tag: 'service_times', label: 'Service times', iconName: 'fas fa-clock'}
	]);
}

// popup image elements
function getWikiAttrib(id) {
	// https://commons.wikimedia.org/wiki/Commons:API
	// get image attribution
	if ($('#img' + id).html() && $('#img' + id).html().indexOf('wikimedia.org') !== -1) {
		var img = $('#img' + id + ' img').data('url');
		$.ajax({
			url: 'https://commons.wikimedia.org/w/api.php',
			dataType: 'jsonp',
			cache: true,
			data: { action: 'query', prop: 'imageinfo', iiprop: 'extmetadata', titles: img, format: 'json' },
			success: function (result) {
				if (!result.query.pages[-1]) {
					var imgAttrib = result.query.pages[Object.keys(result.query.pages)[0]].imageinfo['0'].extmetadata;
					if ($('#inputDebug').is(':checked')) console.debug(imgAttrib);
					var imgArtist = (imgAttrib.Artist.value.indexOf('href=') > 0) ? $(imgAttrib.Artist.value).text() : imgAttrib.Artist.value;
					var imgDate = imgAttrib.DateTimeOriginal.value || imgAttrib.DateTime.value;
					imgDate = new Date(imgDate.split(' ')[0]).getFullYear() || imgDate;
					$('#img' + id + ' .popup-imgAttrib').html(
						'<a class="imgOpen" onclick="imgpopup($(\'#img' + id + '\').find(\'img\'));">View image</a>' +
						' | <a href="https://commons.wikimedia.org/wiki/' + img + '" title="Wikimedia Commons" target="_blank">' +
						'&copy; ' + imgArtist + ' ' + imgDate + ' [' + imgAttrib.LicenseShortName.value + ']</a>'
					);
				}
				else $('#img' + id + ' .popup-imgAttrib').html('Error: Attribution not found');
				$('#img' + id + ' .popup-imgAttrib').addClass('attribd');
			},
			error: function () { if ($('#inputDebug').is(':checked')) console.debug('ERROR WIKI-ATTRIB: ' + this.url); }
		});
	}
}
function show_img_controls(imgMax, img360) {
	// add image navigation controls to popup
	var ctrlTmpl = '<div class="navigateItem">';
	if (img360 && img360.indexOf('File') === 0) ctrlTmpl +=
		'<a title="360 Panorama" onclick="nav360(&quot;' + img360 + '&quot;)">' +
		'<i style="min-width:25px" class="fas fa-street-view fa-fw jump"></i></a>';
	if (imgMax > 1) ctrlTmpl +=
		'<span class="theme navigateItemPrev"><a title="Previous image" onclick="navImg(0);"><i class="fas fa-caret-square-left fa-fw"></i></a></span>' +
		'<i class="fas fa-image fa-fw" title="1 of ' + imgMax + '"></i>' +
		'<span class="theme navigateItemNext"><a title="Next image" onclick="navImg(1);"><i class="fas fa-caret-square-right fa-fw"></i></a></span>';
	return ctrlTmpl + '</div>';
}
function nav360(img) {
	// https://tools.wmflabs.org/admin/tool/panoviewer
	popupWindow('https://tools.wmflabs.org/panoviewer/#' + encodeURIComponent(img.split(':')[1]), 'imgWindow', 800, 600);
}
function navImg(direction) {
	if (!$('.popup-imgContainer').is(':animated')) {
		// get the current and last image
		var cID = parseInt($('.popup-imgContainer:visible').attr('id').split('img')[1]);
		var lID = parseInt($('.popup-imgContainer:last').attr('id').split('img')[1]);
		// get the next image
		var swapImg = function (nID) {
			$('.popup-imgContainer#img' + cID).hide(300);
			$('.popup-imgContainer#img' + nID).show(300);
			if (!$('#img' + nID + ' .attribd').length) getWikiAttrib(nID);
			$('.navigateItem > .fa-image').attr('title', parseInt(nID+1) + ' of ' + parseInt(lID+1));
		};
		// navigate through multiple images. 0 = previous, 1 = next
		if (direction === 0 && cID > 0) swapImg(cID - 1);
		else if (direction === 1 && cID < lID) swapImg(cID + 1);
		else if (direction === 0 && cID === 0 && cID !== lID) swapImg(lID);
		else if (direction === 1 && cID === lID && cID !== 0) swapImg(0);
	}
}

// formatting parsers
function titleCase(str) {
	// remove underscore, replace semi-colon with comma, convert to title-case
	str = str.replace(/;/g, ', ').replace(/_/g, ' ');
	if (str === str.toUpperCase()) return str;
	else return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
function date_parser(dtStr, style) {
	// parse ISO 8601 dates
	if (dtStr.indexOf('T') === 10) dtStr = new Date(dtStr).toISOString().replace('T', ' ').substring(0, 16);
	var tm, dt, dtFrmt = dtStr.split('-').length - 1;
	// check for time
	tm = (dtStr.indexOf(':') > -1) ? tm = ', ' + new Date(dtStr).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) : '';
	if (tm) dtStr = dtStr.split(' ')[0];
	if (style === 'long') {
		dt = new Date(dtStr);
		if (dtFrmt === 2) dt = dt.toLocaleDateString(navigator.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
		else if (dtFrmt === 1) dt = dt.toLocaleDateString(navigator.language, { month: 'long', year: 'numeric' });
		else dt = dtStr;
		if (dt.indexOf('/') > -1) style = 'short';
	}
	if (style === 'short') {
		if (dtFrmt === 2) dt = dtStr.split('-')[2] + '/' + dtStr.split('-')[1] + '/' + dtStr.split('-')[0];
		else if (dtFrmt === 1) dt = dtStr.split('-')[1] + '/' + dtStr.split('-')[0];
		else dt = dtStr;
	}
	if (dt === 'Invalid Date' || dt === undefined) dt = dtStr;
	return dt + tm;
}
function time_parser(tmStr) {
	// parse minutes to hours and minutes
	tmStr = Math.round(tmStr);
	var m = tmStr % 60;
	var h = (tmStr - m) / 60;
	if (h < 1 && m < 1) return -1;
	return (h) ? pad(h) + ':' + pad(m) + ' h:m' : m + ' m';
}
function pad(n) {
	// pad single number with a leading zero
	return (n < 10) ? '0' + n : n;
}
function elementType(e) {
	switch (e.toLowerCase().slice(0, 1)) {
		case 'n': return 'node';
		case 'w': return 'way';
		case 'r': return 'relation';
	}
}
