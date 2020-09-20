// parse tags and marker popup

var spinner = 0, markerId, ohState, ctState, poiList = [];
function parse_tags(element, titlePopup, poiParser) {
	var eName = element.tags['name:en'] || element.tags.name || undefined;
	if (eName && element.tags.ref) eName += ' (' + element.tags.ref + ')';
	var markerPopup = generic_header_parser(titlePopup, (eName || element.tags.ref), element.tags['fhrs:id'], true);
	// global callback parsers
	var address_parser = function(tags) {
		markerPopup = '';
		if (tags['addr:street'] || tags['addr:place']) {
			var addr = '';
			if (tags.level <= 10) addr += '<span title="Level">' + ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'][tags.level] + '-floor</span>, ';
			if (tags['addr:unit']) addr += 'Unit ' + tags['addr:unit'] + ', ';
			if (tags['addr:flats']) addr += 'Flats ' + tags['addr:flats'] + ', ';
			if (tags['addr:housename'] && tags['addr:housename'] !== eName) addr += '<span title="House name">' + tags['addr:housename'] + '</span>, ';
			if (tags['addr:housenumber']) addr += '<span title="House number">' + tags['addr:housenumber'] + '</span> ';
			if (tags['addr:street']) addr += '<span title="Street">' + tags['addr:street'] + '</span>';
			else if (tags['addr:place']) addr += '<span title="Place">' + tags['addr:place'] + '</span>';
			if (tags['addr:suburb']) addr += ', <span title="Suburb">' + tags['addr:suburb'] + '</span>';
			else if (tags['addr:hamlet']) addr += ', <span title="Hamlet">' + tags['addr:hamlet'] + '</span>';
			if (tags['addr:city'] && tags['addr:city'] !== 'Bexhill-on-Sea') addr += ', <span title="City">' + tags['addr:city'] + '</span>';
			if (tags['addr:postcode']) addr += ', <span class="nowrap" title="Postcode">' + tags['addr:postcode'] + '</span>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Address', value: addr, iconName: 'fas fa-map-marker' });
		}
		return markerPopup;
	};
	var phone_parser = function(tags) {
		var tagPhone = tags.phone || tags['contact:phone'];
		markerPopup = '';
		if (tagPhone) {
			if (navigator.language === 'en-GB') tagPhone = tagPhone.replace('+44 ', '0');
			var link = '<a href="tel:' + tagPhone + '" title="Telephone">' + tagPhone + '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Phone', value: link, iconName: 'fas fa-phone' });
		}
		return markerPopup;
	};
	var website_parser = function(tags) {
		var tagWebsite = tags.website || tags['contact:website'] || tags['contact:webcam'];
		markerPopup = '';
		if (tagWebsite) {
			var strWebsite = tagWebsite.split('://')[1];
			if (strWebsite.slice(-1) === '/') strWebsite = strWebsite.slice(0, -1);
			var link = '<a class="popup-truncate" style="max-width:' + ($(window).width() >= 512 ? imgSize - 70 : imgSize - 100) + 'px" href="' + tagWebsite + '" title="' + tagWebsite + '" target="_blank" rel="noopener nofollow">' + strWebsite + '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Website', value: link, iconName: 'fas fa-globe' });
		}
		return markerPopup;
	};
	var contact_parser = function(tags) {
		var tag = '';
		markerPopup = '';
		var tagMail = tags.email || tags['contact:email'], tagFb = tags.facebook || tags['contact:facebook'], tagTwit = tags.twitter || tags['contact:twitter'], tagInstg = tags['contact:instagram'], tagYtube = tags['contact:youtube'];
		if (tagMail) tag += '<a href="mailto:' + tagMail + '"><i class="fas fa-envelope fa-fw" title="E-mail: ' + tagMail + '"></i></a> ';
		if (tagFb) tag += '<a href="' + tagFb + '" target="_blank" rel="noopener nofollow"><i class="fab fa-facebook fa-fw" title="Facebook: ' + tagFb + '" style="color:#3b5998;"></i></a> ';
		if (tagTwit) tag += '<a href="https://twitter.com/' + tagTwit + '" target="_blank" rel="noopener nofollow"><i class="fab fa-twitter fa-fw" title="Twitter: @' + tagTwit + '" style="color:#1da1f2;"></i></a> ';
		if (tagInstg) tag += '<a href="https://instagram.com/' + tagInstg + '" target="_blank" rel="noopener nofollow"><i class="fab fa-instagram fa-fw" title="Instagram: ' + tagInstg + '" style="color:#d93175;"></i></a> ';
		if (tagYtube) tag += '<a href="' + tagYtube + '" target="_blank" rel="noopener nofollow"><i class="fab fa-youtube fa-fw" title="YouTube: ' + tagYtube + '" style="color:#ff0000;"></i></a> ';
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Contact', value: tag, iconName: 'fas fa-user-circle' });
		return markerPopup;
	};
	var listed_parser = function(tags) {
		var tag = '', label = '', icon = '', planningLink = '';
		markerPopup = '';
		if (tags['ref:planningapp']) planningLink = '<a href="https://planweb01.rother.gov.uk/OcellaWeb/planningDetails?reference=' + tags['ref:planningapp'] + '" target="_blank" rel="noopener">' + tags['ref:planningapp'] + '</a>';
		else if (tags['ref:historicplanningapp']) planningLink = '<a href="https://planweb01.rother.gov.uk/OcellaWeb/historyDetails?reference=' + tags['ref:historicplanningapp'] + '" target="_blank" rel="noopener">' + tags['ref:historicplanningapp'] + '</a>';
		if (tags.building) {
			label = 'Building';
			icon = 'fas fa-building';
			if (tags['building:architecture']) tag += '<span title="Architecture">' + titleCase(tags['building:architecture']) + '</span>, ';
			if (tags.architect) tag += '<span title="Architect">Arch. ' + tags.architect + '</span>, ';
			if (tags.builder) tag += '<span title="Builder">Bldr. ' + tags.builder + '</span>, ';
			if (tags.start_date) {
				tag += '<span title="Start date">' + date_parser(tags.start_date, 'short') + '</span>';
				if (tags.end_date) tag += ' to <span title="End date">' + date_parser(tags.end_date, 'short') + '</span>';
				tag += ', ';
			}
			if (tags.height) tag += '<span title="Height in metres">' + tags.height + 'm</span>, ';
			if (planningLink) tag += '<span class="nowrap" title="Planning application">' + planningLink + '</span>, ';
		}
		else {
			label = 'Listed';
			icon = 'fas fa-file';
			if (tags.date) markerPopup += L.Util.template(tagTmpl, { tag: 'Event date', value: date_parser(tags.date, 'long'), iconName: 'fas fa-calendar-alt' });
			if (tags.start_date) markerPopup += L.Util.template(tagTmpl, { tag: 'Start date', value: date_parser(tags.start_date, 'long'), iconName: 'fas fa-calendar-alt' });
			if (tags.end_date) markerPopup += L.Util.template(tagTmpl, { tag: 'End date', value: date_parser(tags.end_date, 'long'), iconName: 'fas fa-calendar-alt' });
			if (tags.architect) markerPopup += L.Util.template(tagTmpl, { tag: 'Architect', value: tags.architect, iconName: 'fas fa-user' });
			if (planningLink) markerPopup += L.Util.template(tagTmpl, { tag: 'Planning application', value: planningLink, iconName: 'fas fa-file' });
		}
		if (tags.HE_ref) {
			var listedStatus = tags.listed_status || tags.HE_ref;
			tag += '<a href="https://historicengland.org.uk/listing/the-list/list-entry/' + tags.HE_ref + '" title="Historic England entry" target="_blank" rel="noopener">' + listedStatus + '</a>, ';
		}
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup = L.Util.template(tagTmpl, { tag: label + ' details', value: tag, iconName: icon }) + markerPopup;
		}
		return markerPopup;
	};
	var facility_parser = function(tags) {
		var tag = '';
		markerPopup = '';
		if (tags.disused === 'yes') tag += '<i class="facNo fas fa-house-damage fa-fw" title="disused: yes"></i>';
		if (tags.indoor === 'yes') tag += '<i class="facYes fas fa-door-closed fa-fw" title="indoor: yes"></i>';
		if (tags.wheelchair === 'yes') tag += '<i class="facYes fas fa-wheelchair fa-fw" title="wheelchair: yes"></i>';
		else if (tags.wheelchair === 'limited') tag += '<i class="facLtd fas fa-wheelchair fa-fw" title="wheelchair: limited"></i>';
		else if (tags.wheelchair === 'no') tag += '<i class="facNo fas fa-wheelchair fa-fw" title="wheelchair: no"></i>';
		if (tags['hearing_impaired:induction_loop'] === 'yes') tag += '<i class="facYes fas fa-deaf fa-fw" title="Induction loop: yes"></i>';
		if (tags['tactile_writing:braille'] === 'yes') tag += '<i class="facYes fas fa-braille fa-fw" title="Braille: yes"></i>';
		if (tags.dog === 'yes') tag += '<i class="facYes fas fa-dog fa-fw" title="dog: yes"></i>';
		else if (tags.dog === 'no') tag += '<i class="facNo fas fa-dog fa-fw" title="dog: no"></i>';
		if (tags.internet_access === 'wlan') tag += '<i class="facYes fas fa-wifi fa-fw" title="internet: wireless"></i>';
		else if (tags.internet_access === 'terminal') tag += '<i class="facYes fas fa-desktop fa-fw" title="internet: terminal"></i>';
		if (tags['drinking_water:refill'] === 'yes') tag += '<i class="fas fa-tint fa-fw" style="color:#0082ff;" title="drinking water refills: yes"></i>';
		if (tags.live_music === 'yes') tag += '<i class="facYes fas fa-music fa-fw" title="live music: yes"></i>';
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
			if (tags.changing_table === 'yes') tag += '<i class="facYes fas fa-baby fa-fw" title="baby changing: yes"></i>';
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
		if (Object.keys(tags).some(function(k){ return ~k.indexOf('payment:'); })) {
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
		if (tags.fee) {
			var feeTag = '';
			if (tags.fee.indexOf(':') > 0 && tags.charge) feeTag = tags.fee + ': ' + tags.charge;
			else {
				feeTag = tags.charge || tags.fee;
				if (feeTag === 'yes') feeTag = '<i class="fas fa-check fa-fw"></i>';
				else if (feeTag === 'no') feeTag = '<i class="fas fa-times fa-fw"></i>';
			}
			markerPopup += L.Util.template(tagTmpl, { tag: 'Fee', value: feeTag.replace(/;/g, ', '), iconName: 'fas fa-pound-sign' });
		}
		if (Object.keys(tags).some(function(k){ return ~k.indexOf('diet:'); })) {
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
	var street_parser = function(tags) {
		var tag = '';
		markerPopup = '';
		if (tags.highway && eName) {
			// get street history through xml file lookup
			$.ajax({
				async: false,
				url: 'assets/data/streetnames.xml',
				dataType: 'xml',
				cache: true,
				success: function(xml) {
					var street = $(xml).find('name').filter(function() { return $(this).text() === tags.name; }).closest('street');
					var streetDate = $('date', street).text();
					var streetDesc = $('desc', street).text();
					if (streetDate && !tags.start_date) markerPopup += L.Util.template(tagTmpl, { tag: 'Start date', value: streetDate, iconName: 'fas fa-calendar-alt' });
					if (streetDesc) markerPopup += '<span class="popup-longDesc">' + L.Util.template(tagTmpl, { tag: 'Street history', value: streetDesc, iconName: 'fas fa-book' }) + '</span>';
					if (markerPopup) {
						var sourceLink = $(xml).find('url').text();
						var sourceAuthor = $(xml).find('author').text();
						markerPopup += '<span class="popup-streetSource"><a href="' + sourceLink + '" target="_blank" rel="noopener" title="' + sourceLink + '">&copy; ' + sourceAuthor + '</a></span>';
					}
					if ($('#inputDebug').is(':checked')) console.debug('Street-names:', xml);
				},
				error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR STREET-NAMES:', this.url); }
			});
			if (tags.unadopted === 'yes') tag += 'unadopted; ';
			if (tags.surface) tag += tags.surface + '; ';
			if (tags.maxspeed) tag += tags.maxspeed + '; ';
			if (tags.maxwidth) tag += tags.maxwidth + '; ';
			if (tags.lit === 'yes') tag += 'lit; ';
			if (tags.oneway === 'yes') tag += 'oneway; ';
			if (tags.bridge === 'yes') tag += 'bridge; ';
			if (tag) {
				tag = tag.substring(0, tag.length - 2);
				markerPopup += L.Util.template(tagTmpl, { tag: 'Highway details', value: tag, iconName: 'fas fa-road' });
			}
		}
		return markerPopup;
	};
	var furtherreading_parser = function(tags) {
		var tag = '';
		markerPopup = '';
		if ((tags.building === 'apartments' || tags.building === 'bungalow' || tags.building === 'house') && tags['addr:street'])
			tag += '<a onclick="searchAddr(\'' + tags['addr:street'] + '\');" title="Lookup street">Street history</a>; ';
		if (tags.wikipedia || tags['site:wikipedia']) {
			var w = tags.wikipedia || tags['site:wikipedia'];
			tag += '<a href="https://' + w.split(':')[0] + '.wikipedia.org/wiki/' + w.split(':')[1] + '" title="Wikipedia" target="_blank" rel="noopener">Wikipedia</a>; ';
		}
		if (tags['url:bexhillhistorytrail'])
			tag += '<a class="nowrap" href="' + tags['url:bexhillhistorytrail'] + '" title="The Bexhill History Trail" target="_blank" rel="noopener">History Trail</a>; ';
		if (tags['ref:thekeep'])
			tag += '<a class="nowrap" href="https://www.thekeep.info/collections/getrecord/' + tags['ref:thekeep'] + '" title="The Keep" target="_blank" rel="noopener">The Keep</a>; ';
		if (tags['ref:edubase'])
			tag += '<a class="nowrap" href="https://get-information-schools.service.gov.uk/Establishments/Establishment/Details/' + tags['ref:edubase'] + '" title="Department for Education" target="_blank" rel="noopener">URN ' + tags['ref:edubase'] + '</a>; ';
		if (tags['ref:charity'])
			tag += '<a class="nowrap" href="https://beta.charitycommission.gov.uk/charity-details/?regId=' + tags['ref:charity'] + '" title="Charity Commission" target="_blank" rel="noopener">Charity ' + tags['ref:charity'] + '</a>; ';
		if (tags.tpuk_ref)
			tag += '<a href="http://trigpointing.uk/trig/' + tags.tpuk_ref.split('TP')[1] + '" title="TrigpointingUK" target="_blank" rel="noopener">TrigpointingUK</a>; ';
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup = L.Util.template(tagTmpl, { tag: 'Further reading', value: tag, iconName: 'fas fa-book' });
		}
		return markerPopup;
	};
	var image_parser = function(tags) {
		// get images
		var lID = 0;
		markerPopup = '';
		if (tags.wikimedia_commons && tags.wikimedia_commons.indexOf('File:') === 0) {
			// support semicolon separated commons images
			var multiCommons =
				(tags.wikimedia_commons +
				(tags.wikimedia_commons_1 ? ';' + tags.wikimedia_commons_1 : '') +
				(tags.wikimedia_commons_2 ? ';' + tags.wikimedia_commons_2 : '')
			).split(';');
			for (x = 0; x < multiCommons.length; x++) if (multiCommons[x].indexOf('File:') === 0) {
				markerPopup += generic_img_parser(multiCommons[x], lID, '');
				lID++;
			}
		}
		if (tags.image) {
			markerPopup += generic_img_parser(tags.image, lID, tags['source:image'] ? '&copy; ' + tags['source:image'] : '');
			lID++;
			if (tags.image_1) {
				// support up to 5 additional image tags
				for (x = 1; x <= 5; x++) if (tags['image_' + x]) {
					markerPopup += generic_img_parser(tags['image_' + x], lID, tags['source:image_' + x] ? '&copy; ' + tags['source:image_' + x] : '');
					lID++;
				}
			}
		}
		if (lID > 1) markerPopup += show_img_controls(lID, tags['image:pano']);
		return markerPopup;
	};
	// https://github.com/opening-hours/opening_hours.js
	var opening_hours_parser = function(tags) {
		markerPopup = '';
		if (tags.opening_date) markerPopup += L.Util.template(tagTmpl, { tag: 'Opening date', value: date_parser(tags.opening_date, 'long'), iconName: 'fas fa-calendar-alt' });
		var drawTable = function(oh, date_today) {
			var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			var weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
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
						weekdays[table[row].date.getDay()] + ', ' + table[row].date.getDate() + ' ' + months[table[row].date.getMonth()] +
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
				else if (oh.getNextChange().toLocaleDateString(navigator.language) === dateTomorrow.toLocaleDateString(navigator.language))
					strNextChange = (nextTime === '00:00') ? 'Midnight' : 'Tomorrow ' + nextTime;
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
			var ohTable = drawTable(oh, new Date()), minWidth = ohTable ? '270px' : '100px';
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
			if (tags.opening_hours && $('#inputDebug').is(':checked')) console.debug('ERROR: Object "' + eName + '" cannot parse hours:', tags.opening_hours + '. ' + err);
		}
		return markerPopup;
	};
	functions = [
		{callback: generic_tag_parser, tag: 'official_name', label: 'Official name'},
		{callback: generic_tag_parser, tag: 'loc_name', label: 'Local name'},
		{callback: generic_tag_parser, tag: 'alt_name', label: 'Alternative name'},
		{callback: generic_tag_parser, tag: 'old_name', label: 'Old name'},
		{callback: generic_tag_parser, tag: 'operator', label: 'Operator', iconName: 'fas fa-user-tie'},
		{callback: address_parser},
		{callback: listed_parser},
		{callback: phone_parser},
		{callback: website_parser},
		{callback: contact_parser},
		{callback: generic_tag_parser, tag: 'access', label: 'Access', iconName: 'fas fa-sign-in-alt'},
		{callback: generic_tag_parser, tag: 'description', label: 'Description', iconName: 'fas fa-clipboard'},
		{callback: street_parser},
		{callback: furtherreading_parser},
		{callback: facility_parser}
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
	if ($('#inputDebug').is(':checked') && data.elements.length) console.debug('Overpass callback:', data);
	var type, name, iconName, markerPopup;
	// push data to results list
	var setPoiList = function() {
		// get openhrs colour
		marker.ohState = ohState;
		marker.ctState = ctState;
		// get facilities from popup
		marker.facilities = $('.popup-facilities', $(markerPopup))[0] ? $('.popup-facilities', $(markerPopup))[0].innerHTML : '';
		poiList.push(marker);
	};
	// https://github.com/jfirebaugh/leaflet-osm
	// https://wiki.openstreetmap.org/wiki/API_v0.6
	var getOsmOutline = function(type, id) {
		if (type !== 'node') {
			// check if cached
			if (eleCache['VEC' + type + id]) areaOutline.addLayer(new L.OSM.DataLayer(eleCache['VEC' + type + id])).addTo(map);
			else $.ajax({
				url: 'https://www.openstreetmap.org/api/0.6/' + type + '/' + id + '/full',
				dataType: 'xml',
				success: function(xml) {
					areaOutline.addLayer(new L.OSM.DataLayer(xml)).addTo(map);
					eleCache['VEC' + type + id] = xml;
					if ($('#inputDebug').is(':checked')) console.debug('OSM outline:', xml);
				},
				error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR OSM-OUTLINE:', this.url); }
			});
		}
	};
	// define poi elements
	for (var c in data.elements) {
		var e = data.elements[c];
		// check tags exist
		if (!e.tags || e.id in this.instance._ids) continue;
		this.instance._ids[e.id] = true;
		var pos = (e.type === 'node') ? new L.LatLng(e.lat, e.lon) : new L.LatLng(e.center.lat, e.center.lon);
		var eName = e.tags['name:en'] || e.tags.name || undefined;
		if (eName && e.tags.ref) eName += ' (' + e.tags.ref + ')';
		name = type = iconName = ohState = ctState = undefined;
		if (e.tags.construction) {
			name = e.tags.construction + ' construction';
			type = 'construction';
			if (!eName) eName = e.tags['ref:planningapp'];
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
						name += (e.tags.amenity === 'restaurant' && e.tags.takeaway === 'only') ? ' takeaway' : ' ' + e.tags.amenity;
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
							case 'sandwich': iconName = 'sandwich'; break;
							case 'seafood': iconName = 'restaurant_fish'; break;
							case 'spanish': iconName = 'restaurant_tapas'; break;
							case 'steak_house': iconName = 'restaurant_steakhouse'; break;
							case 'thai': iconName = 'restaurant_thai'; break;
							case 'turkish': iconName = 'restaurant_turkish'; break;
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
				case 'college': type = 'school'; break;
				case 'fire_station': type = 'police'; iconName = 'firetruck'; break;
				case 'place_of_worship': if (e.tags.religion) name = e.tags.religion; break;
				case 'public_bookcase': type = 'library'; break;
				case 'nightclub': type = 'bar'; break;
				case 'post_box': name = (e.tags['post_box:type'] || '') + ' ' + name; break;
				case 'post_depot':
				case 'post_office': name = ' ' + e.tags.amenity; type = 'post_box'; iconName = 'postoffice'; break; // [ascii 32] force to top of results
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
				case 'shelter': if (e.tags.shelter_type)
					name = e.tags.shelter_type;
					if (name.indexOf('shelter') === -1) name += ' shelter';
					break;
				case 'social_centre':
					if (e.tags.club) {
						name = (e.tags.sport ? e.tags.sport : e.tags.club) + ' club';
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
					case 'barrier':
						iconName = 'tanktrap';
						name = 'historic ' + e.tags.barrier;
						break;
				}
			}
			switch (e.tags.historic) {
				case 'anchor': iconName = 'anchor'; break;
				case 'beacon': iconName = 'landmark'; break;
				case 'boundary_stone':
				case 'milestone':
				case 'stone': iconName = pois.boundary_stone.iconName; break;
				case 'folly': iconName = 'tower'; break;
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
			if (type === 'water_tap') type = 'drinking_water';
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
			else if (e.tags.second_hand === 'yes') type = 'second_hand';
			switch (e.tags.shop) {
				case 'beauty': if (e.tags.beauty) name = e.tags.beauty + ' ' + e.tags.shop; break;
				case 'bathroom_furnishing':
				case 'interior_decoration':
				case 'kitchen': type = 'houseware'; break;
				case 'butcher': type = 'deli'; iconName = 'butcher-2'; break;
				case 'books': name = (e.tags.second_hand ? 'second hand ' + e.tags.shop : e.tags.shop); break;
				case 'car_parts': type = 'car_repair'; break;
				case 'department_store': iconName = 'departmentstore';
					/* fall through */
				case 'boutique': type = 'clothes';
					/* fall through */
				case 'clothes': if (e.tags.clothes && e.tags.clothes.indexOf(';') === -1) name = e.tags.clothes + ' ' + name; break;
				case 'collector': type = 'games'; break;
				case 'craft': if (e.tags.craft) name = e.tags.craft; break;
				case 'e-cigarette': type = 'tobacco'; break;
				case 'frozen_food': type = 'supermarket'; break;
				case 'garden_centre': type = 'florist'; break;
				case 'hairdresser':
					if (e.tags.male === 'yes') { name = 'male barber'; iconName = 'hairmale'; }
					else if (e.tags.female === 'yes') { name = 'female hairdresser'; iconName = 'hairfemale'; }
					else if (e.tags.unisex === 'yes') name = 'unisex hairdresser';
					break;
				case 'hardware': type = 'doityourself'; break;
				case 'hearing_aids': type = 'mobility'; iconName = 'hoergeraeteakustiker_22px'; break;
				case 'laundry': type = 'dry_cleaning'; break;
				case 'pet_grooming': type = 'pet'; break;
				case 'signs': type = 'copyshop'; break;
				case 'trade': if (e.tags.trade) name = e.tags.trade + ' ' + e.tags.shop; break;
				case 'window_blind': type = 'curtain'; break;
				case 'vacant': name = e.tags.shop + ' shop'; type = ''; break;
			}
			if (e.tags['service:bicycle:retail'] === 'yes') type = 'bicycle';
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
							case 'board':
								if (e.tags.board_type) name = e.tags.board_type + ' ' + name;
								iconName = 'board';
								break;
							case 'guidepost': iconName = 'signpost-3'; name = e.tags.tourism + ' ' + e.tags.information; break; // [ascii 255] force to bottom of results
							case 'map':
								if (e.tags.map_size) name = e.tags.map_size + ' ' + name;
								if (e.tags.map_type && e.tags.map_type === 'toposcope') type = 'artwork';
								iconName = 'map';
								break;
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
				case 'nature_reserve': type = 'park'; break;
				case 'fitness_station': type = 'fitness_centre'; break;
				case 'garden': iconName = 'urbanpark'; break;
				case 'golf_course': type = 'recreation'; iconName = 'golfing'; break;
				case 'horse_riding': type = 'recreation'; iconName = 'horseriding'; break;
				case 'sports_centre':
					type = 'recreation';
					iconName = (e.tags.sport === 'swimming') ? 'swimming2' : 'indoor-arena';
					break;
			}
		}
		if (e.tags.surveillance) {
			if (!type) type = e.tags.surveillance;
			if (type !== 'webcam') name = e.tags.surveillance + ' ' + e.tags['surveillance:type'];
		}
		if (e.tags.emergency) {
			if (!name) name = e.tags.emergency;
			if (!type) type = e.tags.emergency;
			switch (type) {
				case 'ambulance_station': type = 'police'; iconName = 'ambulance'; break;
				case 'coast_guard': type = 'police'; iconName = 'helicopter'; break;
			}
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
			if (!name || type === 'shelter') {
				if (e.tags.building && e.tags.building !== 'yes' && e.tags.building !== 'commercial' && e.tags.building !== 'public' && e.tags.building !== 'hut') name = e.tags.building;
				else if (e.tags.barrier && e.tags.barrier !== 'yes') name = e.tags.barrier;
				if (name) name = 'heritage-listed ' + name;
			}
			if (!type || type === 'shelter' || type === 'company') type = 'listed_status';
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
		var poi = pois[type];
		if (!iconName) {
			if (poi) iconName = poi.iconName;
			else if (e.tags.shop) iconName = 'shop';
			else if (e.tags.building) {
				if (e.tags.building === 'house' || e.tags.building === 'bungalow') iconName = 'bighouse';
				else if (e.tags.building === 'hut') iconName = 'hut';
				else if (e.tags.building === 'service') iconName = 'powersubstation';
				else iconName = 'apartment-3';
			}
			else iconName = '000blank';
		}
		var marker = L.marker(pos, {
			// do not bounce marker: when single poi, in debug mode, over 50 markers
			bounceOnAdd: (!rQuery && !$('#inputDebug').is(':checked') && (data.elements.length < 50)),
			icon: L.icon({
				iconUrl: 'assets/img/icons/' + iconName + '.png',
				iconSize: [32, 37],
				iconAnchor: [16, 37],
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
			else if (e.tags.building === 'yes') name = 'building';
			else if (e.tags.building) name = e.tags.building;
			else if (e.tags.ref) name = e.tags.ref;
			else if (e.tags['addr:housename']) name = e.tags['addr:housename'];
			else name = '&hellip;';
		}
		if (name != '&hellip;') name = titleCase(name);
		marker._leaflet_id = e.type.slice(0, 1) + e.id;
		// tooltip
		var customTOptions = {
			direction: 'right',
			offset: [15, 2],
			interactive: poi ? poi.permTooltip : 0,
			permanent: poi ? poi.permTooltip : 0,
			opacity: (noTouch || (poi && poi.permTooltip)) ? 1 : 0
		};
		var toolTip = '<b>' + name + '</b>';
		if (eName) toolTip += '<br><i>' + eName + '</i>';
		else if (e.tags['addr:street']) {
			if (e.tags['addr:housename']) toolTip += '<br><i>' + e.tags['addr:housename'] + ', ' + e.tags['addr:street'] + '</i>';
			else if (e.tags['addr:housenumber']) toolTip += '<br><i>' + e.tags['addr:housenumber'] + ' ' + e.tags['addr:street'] + '</i>';
			else if (e.tags['addr:unit']) toolTip += '<br><i>Unit ' + e.tags['addr:unit'] + ', ' + e.tags['addr:street'] + '</i>';
			else toolTip += '<br><i>' + e.tags['addr:street'] + '</i>';
		}
		else if (e.tags['addr:place']) toolTip += '<br><i>' + e.tags['addr:place'] + '</i>';
		else if (e.tags.ref) toolTip += '<br><i>' + e.tags.ref + '</i>';
		else if (e.tags.operator) toolTip += '<br><i>' + e.tags.operator + '</i>';
		if (e.tags.image || e.tags.wikimedia_commons) toolTip += ' <i class="tooltip-icons fas fa-image fa-fw" title="Image(s)"></i>';
		if (e.tags['image:pano']) toolTip += ' <i class="tooltip-icons fa fa-street-view fa-fw" title="Panoramic view"></i>';
		// popup
		var customPOptions = {
			maxWidth: $(window).width() >= 512 ? imgSize + 30 : imgSize,
			minWidth: (e.tags.image || e.tags.wikimedia_commons) ? imgSize : '',
			autoPanPaddingBottomRight: [5, 50],
			autoPan: noPermalink ? true : false
		};
		// check if already defined poi
		if (poi) {
			// create tooltip / popup
			markerPopup = poi.tagParser ? poi.tagParser(e, name) : parse_tags(e, name, []);
			customTOptions.className = (ohState !== undefined) ? 'openColor-list-' + ohState : 'openColor-list-' + ctState;
			// show tooltip / popup
			marker.bindPopup(markerPopup, customPOptions);
			marker.bindTooltip(toolTip, customTOptions);
			if (rQuery) {
				if ($(window).width() < 768 && !$('.sidebar.collapsed').length) $('.sidebar-close:visible').click();
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
			if ($(window).width() < 768 && !$('.sidebar.collapsed').length) $('.sidebar-close:visible').click();
			marker.addTo(this.instance).openPopup();
			setPoiList();
			markerId = marker._leaflet_id;
			getOsmOutline(e.type, e.id);
		}
		else if (oQuery || $('#inputDebug').is(':checked')) {
			// custom overpass query
			markerPopup = parse_tags(e, name, []);
			customTOptions.className = (ohState !== undefined) ? 'openColor-list-' + ohState : 'openColor-list-' + ctState;
			marker.bindPopup(markerPopup, customPOptions);
			marker.bindTooltip(toolTip, customTOptions);
			marker.addTo(this.instance);
			setPoiList();
			getOsmOutline(e.type, e.id);
			oQuery = false;
		}
	}
	// output list of pois in sidebar
	if (poiList.length) setTimeout(pushPoiList, 250);
	if (spinner > 0) spinner--;
	if (spinner === 0) {
		$('.spinner').fadeOut(200);
		$('.poi-checkbox').removeClass('poi-loading');
	}
	permalinkSet();
}
// push markers into poi list
function pushPoiList(customSort) {
	// check if location active and get distance
	if (lc._active && lc._event) for (c = 0; c < poiList.length; c++) poiList[c].distance = map.distance(lc._event.latlng, poiList[c]._origLatlng || poiList[c]._latlng);
	// sort by distance / custom / name
	poiList.sort(function(a, b) {
		if (a.distance) return (a.distance > b.distance) ? 1 : -1;
		else if (customSort) return (eval('a.' + customSort) > eval('b.' + customSort)) ? 1 : -1;
		else return (a._tooltip._content > b._tooltip._content) ? 1 : -1;
	});
	var poiResultsList = '<table>';
	for (c = 0; c < poiList.length; c++) {
		var state = (poiList[c].ohState !== undefined) ? poiList[c].ohState : poiList[c].ctState;
		var openColorTitle = (state === true || state === false) ? ' title="' + (state === true ? 'Open' : 'Closed') + '"' : '';
		var poiIcon = '';
		if (poiList[c]._icon) poiIcon = '<img src="' + poiList[c]._icon.src + '">';
		else if (poiList[c].options.color)
			poiIcon = '<i style="-webkit-text-stroke:3px ' + poiList[c].options.color + ';color:' + poiList[c].options.fillColor + ';" class="fas fa-circle fa-lg fa-fw" title=' + poiList[c].desc + '></i>';
		poiResultsList += '<tr id="' + poiList[c]._leaflet_id + '">' +
			'<td class="openColor-list-' + state + '"' + openColorTitle + '>' + poiIcon + '</td>' +
			'<td>' + poiList[c]._tooltip._content + '</td>' +
			'<td>' + (poiList[c].facilities ? poiList[c].facilities : '') + '</td>';
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
	$('#poi-results-list').html(poiResultsList).fadeTo(0, 1);
	$('#poi-results-list td:nth-child(3) i').tooltip(tooltipDef);
	$('#poi-results').slideDown(400, function() {
		// keep checkbox in view
		if ($('.poi-checkbox input:checked').length === 1) $('#poi-icons')
			.scrollTop(0)
			.animate({ scrollTop: $('.poi-checkbox input:checked').parent().position().top - 50 }, 100);
	}).css('pointer-events', 'auto');
	$('.sidebar-tabs ul li [href="#pois"] .sidebar-notif').text(poiList.length).show();
	// interact with map
	if (noTouch) $('#poi-results-list tr').hover(
		function() { map._layers[this.id].openTooltip(); },
		function() { if (!map._layers[this.id]._tooltip.options.permanent) map._layers[this.id].closeTooltip(); }
	);
	$('#poi-results-list tr').click(function() {
		if ($('#inputWw2').length) $('#inputWw2 input').val($('#inputWw2 input')[0].max).change();
		map._layers[this.id].closePopup().openPopup();
		if ($(window).width() < 768) $('.sidebar-close:visible').click();
		else {
			// focus 150px above marker to allow room for popup
			var px = map.project(map._layers[this.id]._latlng);
			map.stop().flyTo(map.unproject([px.x, px.y -= 150]));
		}
	});
	$('#poi-results h3').html(
		poiList.length + ' results' + ($('#inputOpen').is(':checked') ? ' (open)' : '') +
			(customSort ? '' : '<i style="color:#777;" class="fas fa-sort-' + (poiList[0].distance ? 'numeric' : 'alpha') + '-down fa-fw"></i>')
	);
	if (poiList.length === maxOpResults) {
		$('#poi-results h3').append('<br>(maximum number of results)');
		setMsgStatus('fas fa-info-circle', 'Max Results', 'Maximum number of results shown (' + maxOpResults + ').', 1);
	}
}

// templates
var tagTmpl = '<div class="popup-tagContainer"><i class="popup-tagIcon {iconName} fa-fw"></i><span class="popup-tagValue"><strong>{tag}:</strong> {value}</span></div>';
function generic_header_parser(header, subheader, fhrs, osmId) {
	var markerPopup = '<div class="popup-header"><h3>' + header + '</h3>';
	if (subheader) markerPopup += '<span class="popup-header-sub">' + subheader + '</span>';
	if (!$('#inputAttic').val()) {
		if (fhrs) markerPopup += '<span class="popup-fhrs" fhrs-key="' + fhrs + '"><img title="Loading hygiene rating..." src="assets/img/loader.gif"></span>';
		if (osmId) {
			if (noIframe && window.localStorage) markerPopup += '<a class="popup-bookm" title="Bookmark"><i class="far fa-bookmark fa-fw"></i></a>';
			markerPopup += '<a class="popup-edit" title="Edit with OpenStreetMap"><i class="fas fa-edit fa-fw"></i></a>';
		}
	}
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
function generic_img_parser(img, id, attrib) {
	var url, imgTmpl;
	if (img.indexOf('File:') === 0) {
		url = img;
		img = 'https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=' + encodeURIComponent(img);
		imgTmpl = '<div id="img{id}" class="popup-imgContainer">' +
			'<a data-fancybox="gallery" href="{img}" data-srcset="{img}&width=1280 1280w, {img}&width=800 800w, {img}&width=640 640w">' +
			'<img data-url="{url}" alt="Loading image..." style="max-height:{maxheight}px;" src="{img}&width=' + imgSize + '"></a>' +
			'<div class="popup-imgAttrib">Loading attribution...</div>' +
		'</div>';
	}
	else imgTmpl = '<div id="img{id}" class="popup-imgContainer">' +
			'<a data-fancybox="gallery" data-caption="' + $('<span>' + attrib + '</span>').text() + '" href="{img}">' +
			'<img alt="Loading image..." style="max-height:{maxheight}px;" src="{img}"></a>' +
			'<div class="popup-imgAttrib">{attrib}</div>' +
		'</div>';
	return L.Util.template(imgTmpl, { id: id, url: url, maxheight: Math.round(imgSize / 1.5), img: img, attrib: attrib });
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
		{callback: generic_tag_parser, tag: 'artwork_subject', label: 'Artwork subject', iconName: 'fas fa-pen-square'},
		{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist', iconName: 'far fa-user'},
		{callback: generic_tag_parser, tag: 'inscription', label: 'Inscription', iconName: 'fas fa-pen-square'},
		{callback: generic_tag_parser, tag: 'material', label: 'Material', iconName: 'fas fa-cube'}
	]);
}
function bikepark_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'bicycle_parking', label: 'Type', iconName: 'fas fa-lock'},
		{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'fas fa-bicycle'},
	]);
}
function bikeshop_parser(tags, titlePopup) {
	var bikeservices_parser = function(tags) {
		var markerPopup = '', tag = '';
		for (var key in tags) if (key.indexOf('service:bicycle:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[2] + ', ';
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
	var nextbus_parser = function(tags) {
		var markerPopup = '', bearing;
		if (tags['naptan:Bearing']) {
			switch (tags['naptan:Bearing']) {
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
		if (tags['naptan:AtcoCode']) markerPopup += '<div class="popup-bsTable" style="width:' + imgSize + 'px" naptan-key="' + tags['naptan:AtcoCode'] + '">' +
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
	var maxstay_parser = function(tags) {
		var markerPopup = '';
		if (tags.maxstay) markerPopup += L.Util.template(tagTmpl, { tag: 'Max stay', value: time_parser(tags.maxstay), iconName: 'fas fa-clock' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'capacity', label: 'Spaces', iconName: 'fas fa-car'},
		{callback: generic_tag_parser, tag: 'capacity:disabled', label: 'Disabled spaces', iconName: 'fas fa-wheelchair'},
		{callback: generic_tag_parser, tag: 'capacity:parent', label: 'Parent spaces', iconName: 'fas fa-child'},
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
		{callback: generic_tag_parser, tag: 'maxspeed', label: 'Max speed', iconName: 'fas fa-video'},
		{callback: generic_tag_parser, tag: 'surveillance:zone', label: 'Surveillance zone', iconName: 'fas fa-eye'},
		{callback: generic_tag_parser, tag: 'camera:mount', label: 'Camera mount', iconName: 'fas fa-video'},
		{callback: generic_tag_parser, tag: 'camera:type', label: 'Camera type', iconName: 'fas fa-video'}
	]);
}
function clock_parser(tags, titlePopup) {
	var clockDetail = function(tags) {
		var markerPopup = '', tag = '';
		if (tags.display) tag += tags.display + ', ';
		if (tags.support) tag += tags.support + ', ';
		tag += (tags.faces >= 2) ? tags.faces + ' faces, ' : '1 face, ';
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
function defib_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'defibrillator:location', label: 'Location', iconName: 'fas fa-location-arrow'},
	]);
}
function food_parser(tags, titlePopup) {
	var cuisine_parser = function(tags) {
		var markerPopup = '', tag = '';
		if (tags.cuisine) tag += tags.cuisine + ', ';
		if (tags.fair_trade === 'yes') tag += 'fairtrade, ';
		if (tags.breakfast === 'yes') tag += 'breakfast, ';
		if (tags.lunch === 'yes') tag += 'lunch, ';
		if (tags.ice_cream === 'yes') tag += 'ice cream, ';
		if (tags.real_ale === 'yes') tag += 'real ale, ';
		if (tags.real_cider === 'yes') tag += 'real cider, ';
		for (var key in tags) if (key.indexOf('diet:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[1] + ' options, ';
		if (tag) {
			tag = tag.replace(/_/g, '-');
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Cuisine', value: tag, iconName: 'fas fa-utensils' });
		}
		return markerPopup;
	};
	var service_parser = function(tags) {
		var tag = '', markerPopup = '';
		if (tags.takeaway === 'yes') tag += 'takeaway, ';
		else if (tags.takeaway === 'only') tag += 'takeaway only, ';
		if (tags.delivery === 'yes') tag += 'delivery, ';
		if (tags.capacity) tag += 'seats ' + tags.capacity + ', ';
		if (tags.beer_garden === 'yes') tag += 'beer garden, ';
		else if (tags.outdoor_seating === 'yes') tag += 'outdoor seating, ';
		if (tags.reservation === 'yes') tag += 'takes reservation, ';
		else if (tags.reservation === 'required') tag += 'needs reservation, ';
		if (tags['url:just_eat']) tag += '<a href="' + tags['url:just_eat'] + '" title="just-eat.com" target="_blank" rel="noopener">just-eat</a>, ';
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
	var fuel_parser = function(tags) {
		var markerPopup = '', tag = '';
		for (var key in tags) if (key.indexOf('fuel:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[1] + ', ';
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
function historic_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'bunker_type', label: 'Bunker type', iconName: 'fas fa-cube'},
		{callback: generic_tag_parser, tag: 'artist_name', label: 'Artist', iconName: 'fas fa-user'},
		{callback: generic_tag_parser, tag: 'material', label: 'Material', iconName: 'fas fa-cube'},
		{callback: generic_tag_parser, tag: 'inscription', label: 'Inscription', iconName: 'fas fa-pen-square'},
		{callback: generic_tag_parser, tag: 'wreck:date_sunk', label: 'Date sunk', iconName: 'fas fa-ship'},
		{callback: generic_tag_parser, tag: 'wreck:visible_at_low_tide', label: 'Visible at low tide', iconName: 'fas fa-ship'}
	]);
}
function hotel_parser(tags, titlePopup) {
	var hotelservices_parser = function(tags) {
		var markerPopup = '', tag = '';
		if (tags.stars) {
			var result = '<a href="https://www.visitengland.com/plan-your-visit/quality-assessment-and-star-ratings/visitengland-star-ratings" title="' + tags.stars + ' stars" target="_blank" rel="noopener">';
			for (var c = 0; c < tags.stars; c++) result += '<i class="far fa-star fa-fw"></i>';
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
		// set booking.com affiliate link in config.js
		if (tags['url:booking_com']) markerPopup += L.Util.template(tagTmpl, { tag: 'Check avalibility', value: '<a href="https://www.booking.com/hotel/gb/' + tags['url:booking_com'] + '.en.html?aid=' + BOSM.bookingCom + '&no_rooms=1&group_adults=1" title="booking.com" target="_blank" rel="noopener"><img alt="booking.com" class="popup-imgBooking" src="assets/img/booking_com.png"></a>', iconName: 'fas fa-file' });
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
function post_parser(tags, titlePopup) {
	var postcypher_parser = function(tags) {
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
	var collection_parser = function(tags) {
		var markerPopup = '';
		if (tags.collection_times) {
			var strNextChange, ct = new opening_hours(tags.collection_times, { 'address':{ 'state':'England', 'country_code':'gb' } }, 1).getNextChange();
			if (ct.getDate() === new Date().getDate()) strNextChange = 'Today in ' + time_parser((ct - new Date()) / 60000) + ' (' + ct.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) + ')';
			else if (ct.getDate() === new Date(new Date().getDate() + 1).getDate()) strNextChange = 'Tomorrow ' + ct.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
			else if (ct.getDate() > new Date(new Date().getDate() + 1).getDate()) strNextChange = ct.toLocaleDateString(navigator.language, { weekday: 'long' }) + ' ' + ct.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
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
function socialf_parser(tags, titlePopup) {
	var socialfservices_parser = function(tags) {
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
	return parse_tags(tags, titlePopup, [
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
function vending_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'brand', label: 'Brand'},
		{callback: generic_tag_parser, tag: 'biometric', label: 'Biometric', iconName: 'fas fa-fingerprint'},
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
	if ($(id[0]).find('img').data('url') && $(id[0]).find('img').data('url').indexOf('File:') === 0) {
		var img = $(id[0]).find('img').data('url');
		$.ajax({
			url: 'https://commons.wikimedia.org/w/api.php',
			dataType: 'jsonp',
			cache: true,
			data: { action: 'query', prop: 'imageinfo', iiprop: 'extmetadata', titles: img, format: 'json' },
			success: function(result) {
				if (!result.query.pages[-1]) {
					var imgAttrib = result.query.pages[Object.keys(result.query.pages)[0]].imageinfo['0'].extmetadata;
					var imgArtist = $(imgAttrib.Artist.value).text() || imgAttrib.Artist.value;
					var imgDate = imgAttrib.DateTimeOriginal ? imgAttrib.DateTimeOriginal.value : imgAttrib.DateTime.value;
					imgDate = $('<span>' + (new Date(imgDate.split(' ')[0]).getFullYear() || imgDate) + '</span>')[0].firstChild.data;
					var imgAttribUrl = '<a href="https://commons.wikimedia.org/wiki/' + img + '" title="Wikimedia Commons" target="_blank" rel="noopener">' + imgDate + ' | &copy; ' + imgArtist;
					id.find($('.popup-imgAttrib')).html(imgAttribUrl + ' | ' + imgAttrib.LicenseShortName.value + '</a>');
					$(id[0]).find('a').data('caption', 'Wikimedia Commons: ' + imgAttribUrl + ' | ' + imgAttrib.UsageTerms.value + '</a>');
				}
				else id.find($('.popup-imgAttrib')).html('Error: Attribution not found');
				id.find($('.popup-imgAttrib')).addClass('attribd');
				if ($('#inputDebug').is(':checked')) console.debug('Wikimedia-attrib:', result);
			},
			error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR WIKIMEDIA-ATTRIB:', this.url); }
		});
	}
}
function show_img_controls(imgMax, img360) {
	// add image navigation controls to popup
	var ctrlTmpl = '<div class="navigateItem">';
	if (img360 && img360.indexOf('File:') === 0) ctrlTmpl +=
		'<a title="Panoramic view" data-fancybox data-type="iframe" data-animation-effect="circular" data-caption="Wikimedia Commons: Bexhill-OSM" data-src="https://tools.wmflabs.org/panoviewer/#' + encodeURIComponent(img360.split(':')[1]) + '" href="javascript:;">' +
		'<i style="min-width:25px" class="fas fa-street-view fa-fw jump"></i></a>';
	if (imgMax > 1) ctrlTmpl +=
		'<span class="theme navigateItemPrev"><a title="Previous image" onclick="navImg(0);"><i class="fas fa-caret-square-left fa-fw"></i></a></span>' +
		'<i class="fas fa-images fa-fw" title="Gallery (1 of ' + imgMax + ')"></i>' +
		'<span class="theme navigateItemNext"><a title="Next image" onclick="navImg(1);"><i class="fas fa-caret-square-right fa-fw"></i></a></span>';
	return ctrlTmpl + '</div>';
}
function navImg(direction) {
	if (!$('.popup-imgContainer').is(':animated')) {
		// get the current and last image
		var cID = parseInt($('.popup-imgContainer:visible').attr('id').split('img')[1]);
		var lID = parseInt($('.popup-imgContainer:last').attr('id').split('img')[1]);
		// get the next image
		var swapImg = function(nID) {
			$('.popup-imgContainer#img' + cID).hide(300);
			$('.popup-imgContainer#img' + nID).show(300);
			$('.navigateItem > .fa-images').attr('title', 'Gallery (' + parseInt(nID+1) + ' of ' + parseInt(lID+1) + ')');
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
	else return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
function date_parser(dtStr, style) {
	// parse ISO 8601 dates
	if (dtStr.indexOf('T') === 10) dtStr = new Date(dtStr).toISOString().replace('T', ' ').substring(0, 16);
	var tm, dt, dtFrmt = dtStr.split('-').length - 1;
	// check for time
	tm = (dtStr.indexOf(':') > -1) ? tm = new Date(dtStr).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) : '';
	if (tm === 'Invalid Date') tm = '';
	else if (tm) {
		tm = ', ' + tm;
		dtStr = dtStr.split(' ')[0];
	}
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
