// parse tags and marker popup
var test;
var spinner = 0, markerId, ohState, ctState, poiList = [];
function parse_tags(element, titlePopup, poiParser) {
	var eName = element.tags.name || element.tags['addr:housename'] || undefined;
	if (eName && element.tags.ref) eName += ' (' + element.tags.ref + ')';
	var markerPopup = '';
	// global callback parsers
	var address_parser = function(tags) {
		markerPopup = '';
		if (tags['addr:street'] || tags['addr:place']) {
			var addr = '';
			if (tags.level > 0 && tags.level <= 10) addr += '<span title="Level">' + ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'][tags.level] + '-floor</span>, ';
			if (tags['addr:unit']) addr += 'Unit ' + tags['addr:unit'] + ', ';
			if (tags['addr:flats']) addr += 'Flats ' + tags['addr:flats'] + ', ';
			if (tags['addr:housename'] && tags['addr:housename'] !== element.tags.name) addr += '<span title="House name">' + tags['addr:housename'] + '</span>, ';
			if (tags['addr:housenumber']) addr += '<span title="House number">' + tags['addr:housenumber'] + '</span> ';
			if (tags['addr:street']) addr += '<span title="Street">' + tags['addr:street'] + '</span>';
			else if (tags['addr:place']) addr += '<span title="Place">' + tags['addr:place'] + '</span>';
			if (tags['addr:suburb']) addr += ', <span title="Suburb">' + tags['addr:suburb'] + '</span>';
			else if (tags['addr:hamlet']) addr += ', <span title="Hamlet">' + tags['addr:hamlet'] + '</span>';
			if (tags['addr:city'] && tags['addr:city'] !== 'Bexhill-on-Sea') addr += ', <span title="City">' + tags['addr:city'] + '</span>';
			if (tags['addr:postcode']) addr += ', <span class="nowrap" title="Postcode">' + tags['addr:postcode'] + '</span>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Address', value: addr, iconName: 'fa-solid fa-location-pin' });
		}
		return markerPopup;
	};
	var phone_parser = function(tags) {
		var tagPhone = tags.phone || tags['phone:GB'] || tags['contact:phone'] || tags['contact:phone:GB'], linkPhone = '';
		markerPopup = '';
		if (tagPhone) linkPhone = '<a href="tel:' + tagPhone + '" title="Telephone">' + tagPhone + '</a>';
		if (tags['contact:mobile']) linkPhone = (linkPhone ? linkPhone + ' / ' : '') + '<a href="tel:' + tags['contact:mobile'] + '" title="Mobile">' + tags['contact:mobile'] + '</a>';
		if (linkPhone) {
			if (navigator.language === 'en-GB') linkPhone = linkPhone.replaceAll('+44 ', '0');
			markerPopup += L.Util.template(tagTmpl, { tag: 'Phone', value: linkPhone, iconName: 'fa-solid fa-phone' });
		}
		return markerPopup;
	};
	var website_parser = function(tags) {
		var tagWebsite = tags.website || tags['contact:website'] || tags['contact:webcam'];
		markerPopup = '';
		if (tagWebsite) {
			var strWebsite = (tagWebsite.indexOf('://www.') > 0) ? tagWebsite.split('://www.')[1] : ((tagWebsite.indexOf('://') > 0) ? tagWebsite.split('://')[1] : tagWebsite);
			if (strWebsite.slice(-1) === '/') strWebsite = strWebsite.slice(0, -1);
			var linkWebsite = '<a class="popup-truncate" style="max-width:' + ($(window).width() >= 512 ? imgSize - 70 : imgSize - 100) + 'px;" href="' + tagWebsite + '" title="' + tagWebsite + '" target="_blank" rel="noopener nofollow">' + strWebsite + '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'Website', value: linkWebsite, iconName: 'fa-solid fa-globe' });
		}
		return markerPopup;
	};
	var contact_parser = function(tags) {
		var tag = '';
		markerPopup = '';
		var tagMail = tags.email || tags['contact:email'], tagFb = tags.facebook || tags['contact:facebook'], tagTwit = tags.twitter || tags['contact:twitter'], tagInstg = tags['contact:instagram'], tagYtube = tags['contact:youtube'];
		if (tagMail) tag += '<a href="mailto:' + tagMail + '"><i class="fa-solid fa-envelope fa-fw" title="E-mail: ' + tagMail + '"></i></a> ';
		if (tagFb) tag += '<a href="' + tagFb + '" target="_blank" rel="noopener nofollow"><i class="fa-brands fa-facebook fa-fw" title="Facebook: ' + tagFb + '" style="color:#3b5998;"></i></a> ';
		if (tagTwit) tag += '<a href="https://twitter.com/' + tagTwit + '" target="_blank" rel="noopener nofollow"><i class="fa-brands fa-twitter fa-fw" title="Twitter: @' + tagTwit + '" style="color:#1da1f2;"></i></a> ';
		if (tagInstg) tag += '<a href="https://instagram.com/' + tagInstg + '" target="_blank" rel="noopener nofollow"><i class="fa-brands fa-instagram fa-fw" title="Instagram: ' + tagInstg + '" style="color:#d93175;"></i></a> ';
		if (tagYtube) tag += '<a href="' + tagYtube + '" target="_blank" rel="noopener nofollow"><i class="fa-brands fa-youtube fa-fw" title="YouTube: ' + tagYtube + '" style="color:#ff0000;"></i></a> ';
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Contact', value: tag, iconName: 'fa-solid fa-circle-user' });
		return markerPopup;
	};
	var site_parser = function(tags) {
		var tag = '', planningLink = '', siteType = [];
		markerPopup = '';
		if (tags.bunker_type) tag += '<span title="Bunker type">' + tags.bunker_type + '</span>; ';
		if (tags['building:architecture']) tag += '<span title="Architecture">' + titleCase(tags['building:architecture']) + '</span>; ';
		if (tags.architect) tag += '<span title="Architect">Arch. ' + tags.architect + '</span>; ';
		if (tags.artist_name) tag += '<span title="Artist">Artst. ' + tags.artist_name + '</span>; ';
		if (tags.builder) tag += '<span title="Builder">Bldr. ' + tags.builder + '</span>; ';
		if (tags.display) tag += '<span title="Clock display">' + tags.display + '</span>; ';
		if (tags.support) tag += '<span title="Clock support">' + tags.support + '</span>; ';
		if (tags.faces) tag += '<span title="Clock faces">' + ((tags.faces >= 2) ? tags.faces + ' faces' : '1 face') + '</span>; ';
		if (tags.material) tag += '<span title="Material">Mtrl. ' + tags.material + '</span>; ';
		if (tags.start_date) {
			tag += '<span title="Start date">' + date_parser(tags.start_date, 'short') + '</span>';
			if (tags.end_date) tag += ' to <span title="End date">' + date_parser(tags.end_date, 'short') + '</span>';
			tag += '; ';
		}
		if (tags['wreck:date_sunk']) tag += '<span title="Date sunk">Sunk: ' + date_parser(tags['wreck:date_sunk'], 'short') + '</span>; ';
		if (tags['ref:planningapp']) planningLink = '<a href="https://planweb01.rother.gov.uk/OcellaWeb/planningDetails?reference=' + tags['ref:planningapp'] + '" target="_blank" rel="noopener">' + tags['ref:planningapp'] + '</a>';
		else if (tags['ref:historicplanningapp']) planningLink = '<a href="https://planweb01.rother.gov.uk/OcellaWeb/historyDetails?reference=' + tags['ref:historicplanningapp'] + '" target="_blank" rel="noopener">' + tags['ref:historicplanningapp'] + '</a>';
		if (planningLink) tag += '<span class="nowrap" title="Planning application">' + planningLink + '</span>; ';
		if (tags.HE_ref) {
			var listedStatus = tags.listed_status || tags.HE_ref;
			tag += '<a href="https://historicengland.org.uk/listing/the-list/list-entry/' + tags.HE_ref + '?section=official-list-entry" title="Historic England" target="_blank" rel="noopener">' + listedStatus + '</a>; ';
		}
		if (tags.disused) tag+= '<span title="Disused">Currently disused</span>; ';
		if (tags.building) {
			if (tags.building === 'garage') siteType = ['Garage', 'warehouse'];
			else if (tags.building === 'house' || tags.building === 'bungalow' || tags.building === 'detached') siteType = ['House', 'house-chimney'];
			else if (tags.building === 'hut') siteType = ['Structure', 'person-shelter'];
			else if (tags.building === 'warehouse') siteType = ['Warehouse', 'warehouse'];
			else siteType = ['Building', 'building'];
		}
		else siteType = ['Site', 'monument'];
		if (tag) markerPopup = L.Util.template(tagTmpl, { tag: siteType[0] + ' details', value: listTidy(tag, true), iconName: 'fa-solid fa-' + siteType[1] }) + markerPopup;
		return markerPopup;
	};
	var facility_parser = function(tags) {
		var tag = '';
		markerPopup = '';
		if (tags.indoor === 'yes') tag += '<i class="facYes fa-solid fa-door-closed fa-fw" title="place is indoors"></i>';
		if (tags.wheelchair === 'yes') tag += '<i class="facYes fa-solid fa-wheelchair fa-fw" title="wheelchair access"></i>';
		else if (tags.wheelchair === 'limited') tag += '<i class="facLtd fa-solid fa-wheelchair fa-fw" title="limited wheelchair access"></i>';
		else if (tags.wheelchair === 'no') tag += '<i class="facNo fa-solid fa-wheelchair fa-fw" title="no wheelchair access"></i>';
		if (tags.elevator === 'yes') tag += '<i class="facYes fa-solid fa-elevator fa-fw" title="lift access"></i>';
		if (tags['hearing_impaired:induction_loop'] === 'yes') tag += '<i class="facYes fa-solid fa-ear-deaf fa-fw" title="induction loop"></i>';
		if (tags['tactile_writing:braille'] === 'yes') tag += '<i class="facYes fa-solid fa-braille fa-fw" title="braille"></i>';
		if (tags.dog === 'yes') tag += '<i class="facYes fa-solid fa-dog fa-fw" title="dogs allowed"></i>';
		else if (tags.dog === 'no') tag += '<i class="facNo fa-solid fa-dog fa-fw" title="no dogs allowed"></i>';
		else if (tags.dog === 'leashed') tag += '<i class="facYes fa-solid fa-dog-leashed fa-fw" title="leashed dogs only"></i>';
		if (tags.internet_access === 'wlan') tag += '<i class="facYes fa-solid fa-wifi fa-fw" title="wireless internet"></i>';
		else if (tags.internet_access === 'terminal') tag += '<i class="facYes fa-solid fa-desktop fa-fw" title="internet terminal"></i>';
		if (tags['drinking_water:refill'] === 'yes') tag += '<i class="fa-solid fa-bottle-droplet fa-fw" style="color:#0082ff;" title="free drinking water refills"></i>';
		if (tags.live_music === 'yes') tag += '<i class="facYes fa-solid fa-music fa-fw" title="live music"></i>';
		if (tags.shelter === 'yes' || tags.covered === 'yes' || tags.covered === 'booth') tag += '<i class="facYes fa-solid fa-umbrella fa-fw" title="sheltered"></i>';
		if (tags.highway === 'bus_stop') {
			if (tags.bench === 'yes') tag += '<i class="facYes fa-solid fa-chair fa-fw" title="seating"></i>';
			if (tags.bin === 'yes') tag += '<i class="facYes fa-solid fa-trash-can fa-fw" title="rubbish bin"></i>';
		}
		if (tags.amenity === 'telephone') {
			if (tags.internet_access === 'yes') tag += '<i class="facYes fa-solid fa-at fa-fw" title="internet access"></i>';
			if (tags.sms === 'yes') tag += '<i class="facYes fa-solid fa-comment-sms fa-fw" title="sms"></i>';
		}
		if (tags.amenity === 'toilets') {
			if (tags.unisex === 'yes') tag += '<i class="facYes fa-solid fa-restroom fa-fw" title="unisex"></i>';
			if (tags.male === 'yes') tag += '<i class="facYes fa-solid fa-person fa-fw" title="male"></i>';
			if (tags.female === 'yes') tag += '<i class="facYes fa-solid fa-person-dress fa-fw" title="female"></i>';
			if (tags.changing_table === 'yes') tag += '<i class="facYes fa-solid fa-baby fa-fw" title="baby changing"></i>';
		}
		if (tag) tag = '<span class="facGen">' + tag + '</span>';
		if (tags.amenity === 'recycling') {
			var recycTag = '', recycList = '', recycIcon = {
				aerosol_cans: 'fa-solid fa-spray-can',
				animal_waste: 'fa-solid fa-poop',
				batteries: 'fa-solid fa-battery-full',
				bicycles: 'fa-solid fa-bicycles',
				books: 'fa-solid fa-book',
				cans: 'fa-solid fa-prescription-bottle',
				car_batteries: 'fa-solid fa-car-battery',
				cardboard: 'fa-solid fa-box',
				cds: 'fa-solid fa-compact-disc',
				clothes: 'fa-solid fa-shirt',
				cooking_oil: 'fa-solid fa-bottle-droplet',
				computers: 'fa-solid fa-laptop',
				tv_monitor: 'fa-solid fa-tv',
				electrical_appliances: 'fa-solid fa-tv',
				engine_oil: 'fa-solid fa-oil-can',
				furniture: 'fa-solid fa-couch',
				glass: 'fa-solid fa-wine-glass',
				glass_bottles: 'fa-solid fa-wine-bottle',
				green_waste: 'fa-solid fa-leaf',
				christmas_trees: 'fa-solid fa-tree',
				wood: 'fa-solid fa-tree',
				hazardous_waste: 'fa-solid fa-biohazard',
				low_energy_bulbs: 'fa-solid fa-lightbulb',
				mobile_phones: 'fa-solid fa-mobile-screen-button',
				organic: 'fa-solid fa-drumstick-bite',
				paint: 'fa-solid fa-fill-drip',
				pallets: 'fa-solid fa-pallet',
				magazines: 'fa-solid fa-newspaper',
				newspaper: 'fa-solid fa-newspaper',
				paper: 'fa-solid fa-newspaper',
				pens: 'fa-solid fa-pen-clip',
				plastic_bottles: 'fa-solid fa-bottle-water',
				printer_cartridges: 'fa-solid fa-print',
				scrap_metal: 'fa-solid fa-gear',
				shoes: 'fa-solid fa-shoe-prints',
				small_appliances: 'fa-solid fa-blender',
				waste: 'fa-solid fa-dumpster'
			};
			for (var recycKey in tags) {
				var recyc = '';
				if (recycKey.indexOf('recycling:') === 0 && (tags[recycKey] === 'yes')) {
					recyc = recycKey.split(':')[1];
					recycList += recyc + ', ';
				}
				if (recycIcon[recyc]) recycTag += '<i class="' + recycIcon[recyc] + ' fa-fw" title="' + recyc + '"></i>';
			}
			if (recycList) markerPopup += L.Util.template(tagTmpl, { tag: 'Recycling options', value: listTidy(recycList, true), iconName: 'fa-solid fa-recycle' });
			if (recycTag) tag += '<span class="facRecyc"' + (tag ? ' style="padding-left:10px;"' : '') + '>' + recycTag + '</span>';
		}
		if (Object.keys(tags).some(function(k){ return ~k.indexOf('payment:'); })) {
			var payTag = '', payList = '', payIcon = {
				cash: 'fa-solid fa-coins',
				coins: 'fa-solid fa-coins',
				notes: 'fa-solid fa-money-bill',
				cheque: 'fa-solid fa-money-check',
				credit_cards: 'fa-regular fa-credit-card',
				debit_cards: 'fa-solid fa-credit-card',
				american_express: 'fa-brands fa-cc-amex',
				discover: 'fa-brands fa-cc-discover',
				diners_club: 'fa-brands fa-cc-diners-club',
				mastercard: 'fa-brands fa-cc-mastercard',
				visa_electron: 'fa-brands fa-cc-visa',
				visa_debit: 'fa-brands fa-cc-visa',
				visa: 'fa-brands fa-cc-visa',
				sms: 'fa-solid fa-comment-sms',
				bitcoin: 'fa-brands fa-bitcoin',
				google_pay: 'fa-brands fa-google-wallet',
				apple_pay: 'fa-brands fa-apple-pay',
				gift_card: 'fa-solid fa-gift'
			};
			for (var payKey in tags) {
				var pay = '';
				if (payKey.indexOf('payment:') === 0 && tags[payKey] === 'yes') {
					pay = payKey.split(':')[1];
					payList += pay + ', ';
				}
				if (payIcon[pay]) payTag += '<i class="' + payIcon[pay] + ' fa-fw" title="' + pay + '"></i>';
			}
			if (payList) markerPopup += L.Util.template(tagTmpl, { tag: 'Payment options', value: listTidy(payList, true), iconName: 'fa-solid fa-cash-register' });
			if (payTag) tag += '<span class="facPay"' + (tag ? ' style="padding-left:10px;"' : '') + '>' + payTag + '</span>';
		}
		if (tags.fee) {
			var feeTag = '';
			if (tags['fee:conditional'] && tags.charge) feeTag = tags['fee:conditional'] + ': ' + tags.charge;
			else {
				feeTag = tags.charge || tags['fee:conditional'] || tags.fee;
				if (feeTag === 'yes') feeTag = '<i class="fa-solid fa-check fa-fw"></i>';
				else if (feeTag === 'no') feeTag = '<i class="fa-solid fa-xmark fa-fw"></i>';
			}
			markerPopup += L.Util.template(tagTmpl, { tag: 'Fee', value: listTidy(feeTag), iconName: 'fa-solid fa-sterling-sign' });
		}
		if (Object.keys(tags).some(function(k){ return ~k.indexOf('diet:'); })) {
			var dietTag = '', dietIcon = {
				pescetarian: 'fa-solid fa-fish',
				vegetarian: 'fa-solid fa-carrot',
				vegan: 'fa-solid fa-leaf',
				fruitarian: 'fa-solid fa-apple'
			};
			for (var dietKey in tags) {
				var diet = '';
				if (dietKey.indexOf('diet:') === 0 && tags[dietKey] === 'yes') diet = dietKey.split(':')[1];
				if (dietIcon[diet]) dietTag += '<i class="' + dietIcon[diet] + ' fa-fw" title="' + diet + ' options"></i>';
			}
			if (dietTag) tag += '<span class="facDiet"' + (tag ? ' style="padding-left:10px;"' : '') + '>' + dietTag + '</span>';
		}
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Facilities', value: '<span class="popup-facilities">' + tag + '</span>', iconName: 'fa-solid fa-circle-info' });
		return markerPopup;
	};
	var street_parser = function(tags) {
		var tag = '';
		markerPopup = '';
		if (tags.highway && eName && element.type === 'way' && LBounds.contains(element.center)) {
			// get street history through xml file lookup
			$.ajax({
				async: false,
				url: 'tour/itemStreetNames/streetnames.xml',
				dataType: 'xml',
				cache: true,
				success: function(xml) {
					var street = $(xml).find('name').filter(function() { return ($(this).text() === tags.name || $(this).text() === tags.alt_name); }).closest('street');
					var streetDate = $('date', street).text();
					var streetDesc = $('desc', street).text();
					if (streetDate && !tags.start_date) markerPopup += L.Util.template(tagTmpl, { tag: 'Start date', value: streetDate, iconName: 'fa-solid fa-calendar-days' });
					if (streetDesc) markerPopup += '<span class="popup-longDesc custscroll">' + L.Util.template(tagTmpl, { tag: 'Street history', value: streetDesc, iconName: 'fa-solid fa-book' }) + '</span>';
					if (markerPopup) {
						var sourceLink = $(xml).find('url').text();
						var sourceTitle = $(xml).find('title').text();
						markerPopup += '<span class="popup-streetSource"><a onclick="popupWindow(\'streetBook\');" title="' + sourceLink + '">' + sourceTitle + '</a></span>';
					}
					if ($('#inputDebug').is(':checked')) console.debug('Street-names:', xml);
				},
				error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR STREET-NAMES:', encodeURI(this.url)); }
			});
			if (tags.maxspeed) tag += tags.maxspeed + '; ';
			if (tags.maxwidth) tag += tags.maxwidth + '; ';
			if (tags.access === 'private') tag += 'private; ';
			if (tags.unadopted === 'yes') tag += 'unadopted; ';
			if (tags.designation) tag += 'designated ' + tags.designation + '; ';
			if (tags.surface) tag += tags.surface + '; ';
			if (tags.narrow === 'yes') tag += 'narrow; ';
			if (tags.cutting === 'yes') tag += 'cutting; ';
			if (tags.sidewalk === 'no') tag += 'no pavement; ';
			if (tags.incline) tag += 'incline; ';
			if (tags.lit === 'yes') tag += 'lit; ';
			if (tags.oneway === 'yes') tag += 'oneway; ';
			if (tags.bridge === 'yes') tag += 'bridge; ';
			if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Highway details', value: listTidy(tag, true), iconName: 'fa-solid fa-road' });
			if (tags.prow_ref) markerPopup += L.Util.template(tagTmpl, { tag: 'Public Right of Way', value: tags.prow_ref, iconName: 'fa-solid fa-person-hiking' });
		}
		return markerPopup;
	};
	var furtherreading_parser = function(tags) {
		var tag = '';
		markerPopup = '';
		if ((tags.building === 'apartments' || tags.building === 'bungalow' || tags.building === 'house') && tags['addr:street'] && LBounds.contains(element.center))
			tag += '<a onclick="searchAddr(\'' + tags['addr:street'].replace('\'', '') + '\');" title="Lookup street">Street history</a>; ';
		if (tags.wikipedia || tags['site:wikipedia']) {
			var w = tags.wikipedia || tags['site:wikipedia'];
			tag += '<a href="https://' + w.split(':')[0] + '.wikipedia.org/wiki/' + w.split(':')[1] + '" title="The Free Encyclopaedia" target="_blank" rel="noopener">Wikipedia</a>; ';
		}
		if (tags['ref:esher'])
			tag += '<a class="nowrap" href="https://www.heritagegateway.org.uk/Gateway/Results_Single.aspx?uid=' + tags['ref:esher'] + '&resourceID=1026#content" title="East Sussex Historic Environment Record" target="_blank" rel="noopener">ESHER</a>; ';
		if (tags['ref:publicsculpturesofsussex'])
			tag += '<a class="nowrap" href="https://publicsculpturesofsussex.co.uk/index.php/object?id=' + tags['ref:publicsculpturesofsussex'] + '" title="Public Sculptures of Sussex" target="_blank" rel="noopener">Public Sculptures</a>; ';
		if (tags['url:bexhillhistorytrail'])
			tag += '<a class="nowrap" href="https://thebexhillhistorytrail.wordpress.com/' + tags['url:bexhillhistorytrail'] + '" title="The Bexhill History Trail" target="_blank" rel="noopener">History Trail</a>; ';
		if (tags['url:bexhillnature'])
			tag += '<a class="nowrap" href="https://bexhillnature.uk/places/' + tags['url:bexhillnature'] + '.php" title="Wild animals and plants" target="_blank" rel="noopener">Bexhill Nature</a>; ';
		if (tags['ref:edubase'])
			tag += '<a class="nowrap" href="https://get-information-schools.service.gov.uk/Establishments/Establishment/Details/' + tags['ref:edubase'] + '" title="Department for Education" target="_blank" rel="noopener">URN ' + tags['ref:edubase'] + '</a>; ';
		if (tags['ref:charity'])
			tag += '<a class="nowrap" href="https://register-of-charities.charitycommission.gov.uk/charity-details/?regId=' + tags['ref:charity'] + '&subId=0" title="Charity Commission" target="_blank" rel="noopener">Charity ' + tags['ref:charity'] + '</a>; ';
		if (tags.tpuk_ref)
			tag += '<a href="http://trigpointing.uk/trig/' + tags.tpuk_ref.split('TP')[1] + '" title="TrigpointingUK" target="_blank" rel="noopener">TrigpointingUK</a>; ';
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup = L.Util.template(tagTmpl, { tag: 'Further reading', value: tag, iconName: 'fa-solid fa-book' });
		}
		return markerPopup;
	};
	var image_parser = function(tags) {
		// get images
		var imgCount = 0, multiPano = [], multiVid = [];
		markerPopup = '';
		if (tags.image) {
			// support semicolon separated images
			var multiImage =
				(tags.image +
				(tags.image_1 ? ';' + tags.image_1 : '') +
				(tags.image_2 ? ';' + tags.image_2 : '')
			).split(';');
			var multiImageSource = tags['source:image'] ?
				(tags['source:image'] +
				(tags['source:image_1'] ? ';' + tags['source:image_1'] : '') +
				(tags['source:image_2'] ? ';' + tags['source:image_2'] : '')
			).split(';') : '';
			for (x = 0; x < multiImage.length; x++) if (multiImage[x].indexOf('http') === 0) {
				markerPopup += generic_img_parser(multiImage[x], imgCount, multiImageSource[x] ? '&copy; ' + multiImageSource[x] : '');
				imgCount++;
			}
		}
		if (tags.wikimedia_commons) {
			// support semicolon separated commons images
			var multiCommons =
				(tags.wikimedia_commons +
				(tags.wikimedia_commons_1 ? ';' + tags.wikimedia_commons_1 : '') +
				(tags.wikimedia_commons_2 ? ';' + tags.wikimedia_commons_2 : '')
			).split(';');
			/* CATEGORIES SUPPORT TODO
			if (multiCommons[0].indexOf('Category:') === 0) {
				$.ajax({
					url: 'https://commons.wikimedia.org/w/api.php',
					dataType: 'jsonp',
					cache: true,
					data: { action: 'query', list: 'categorymembers', cmtype: 'file', cmtitle: multiCommons[0], format: 'json' },
					success: function(result) {
						if (!result.query.categorymembers[-1]) for (x = 0; x < result.query.categorymembers.length; x++) if (result.query.categorymembers[x].title.indexOf('File:') === 0) {
							markerPopup += generic_img_parser(result.query.categorymembers[x].title, imgCount, '');
							imgCount++;
						}
						if ($('#inputDebug').is(':checked')) console.debug('Wikimedia-categories:', result);
					},
					error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR WIKIMEDIA-CATEGORIES:', encodeURI(this.url)); }
				});
			} else */
			for (x = 0; x < multiCommons.length; x++) if (multiCommons[x].indexOf('File:') === 0) {
				markerPopup += generic_img_parser(multiCommons[x], imgCount, '');
				imgCount++;
			}
		}
		if (tags['wikimedia_commons:pano']) {
			multiPano =
				(tags['wikimedia_commons:pano'] +
				(tags['wikimedia_commons:pano_1'] ? ';' + tags['wikimedia_commons:pano_1'] : '') +
				(tags['wikimedia_commons:pano_2'] ? ';' + tags['wikimedia_commons:pano_2'] : '')
			).split(';');
		}
		if (tags['wikimedia_commons:video']) {
			multiVid =
				(tags['wikimedia_commons:video'] +
				(tags['wikimedia_commons:video_1'] ? ';' + tags['wikimedia_commons:video_1'] : '') +
				(tags['wikimedia_commons:video_2'] ? ';' + tags['wikimedia_commons:video_2'] : '')
			).split(';');
		}
		if (imgCount > 1 || multiPano.length || multiVid.length) markerPopup += show_img_controls(imgCount, multiPano, multiVid);
		return markerPopup;
	};
	// https://github.com/opening-hours/opening_hours.js
	var opening_hours_parser = function(tags) {
		markerPopup = '';
		if (tags.opening_date) markerPopup += L.Util.template(tagTmpl, { tag: 'Opening date', value: date_parser(tags.opening_date, 'long'), iconName: 'fa-solid fa-calendar-days' });
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
						if (oh.getComment(prevdate)) text += '<br/>' + oh.getComment(prevdate);
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
				strNextChange = '"' + comment + '"';
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
			var ohTable = drawTable(oh, new Date());
			if (tags.opening_hours.indexOf('PH ') === -1 && ohTable) ohTable += '<div class="comment" style="font-size:80%;text-align:left;padding-top:5px;">Holiday periods may differ.</div>';
			// show tag and collapsible accordion
			if (ohState === true) openhrsState = 'Open until';
			else if (ohState === false) openhrsState = 'Closed until';
			else if (ohState === 'depends') openhrsState = 'Depends on';
			if (openhrsState) {	markerPopup =
				'<div style="min-width:' + (ohTable ? '270px;" class="popup-ohContainer' : '100px;') + '">' +
					'<span class="popup-tagContainer" title="' + tags.opening_hours.replace(/"/g, '\'') + '">' +
						'<i class="popup-tagIcon popup-openhrsState openColor-' + ohState + ' fa-solid fa-circle fa-fw"></i>' +
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
		{callback: generic_tag_parser, tag: 'operator', label: 'Operator', iconName: 'fa-solid fa-user-tie'},
		{callback: address_parser},
		{callback: site_parser},
		{callback: phone_parser},
		{callback: website_parser},
		{callback: contact_parser},
		{callback: generic_tag_parser, tag: 'artwork_subject', label: 'Subject', iconName: 'fa-solid fa-palette'},
		{callback: generic_tag_parser, tag: 'description', label: 'Description', iconName: 'fa-solid fa-clipboard'},
		{callback: generic_tag_parser, tag: 'inscription', label: 'Inscription', iconName: 'fa-solid fa-square-pen'},
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
			var iconName = data.iconName || 'fa-solid fa-tag';
			markerPopup += data.callback(element.tags, data.tag, data.label, iconName);
		}
		else markerPopup += data.callback(element.tags);
	}
	// display all tags if poi has no callback
	if (!markerPopup) {
		if (titlePopup === '&hellip;') {
			eName = element.type;
			titlePopup = element.id;
		}
		$.each(element.tags, function(e) { markerPopup += generic_tag_parser(element.tags, e, e, 'fa-solid fa-tag'); });
		markerPopup = '<i>' + markerPopup + '</i>';
	}
	return generic_header_parser((eName || element.tags.ref), titlePopup, element.tags['fhrs:id'], true, element.tags.wikidata) + '<div class="popup-body">' + markerPopup + '</div>';
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
	// define poi elements
	for (var c in data.elements) {
		var e = data.elements[c];
		// check tags exist
		if (!e.tags || e.id in this.instance._ids) continue;
		this.instance._ids[e.id] = true;
		// get geometry outlines
		if (e.type !== 'node') {
			var outline, mems = [], optsPolygon = {
				color: $('html').css('--second-color'),
				opacity: 0.3,
				weight: 4,
				fillColor: $('html').css('--second-color'),
				fillOpacity: 0.3,
				interactive: false
			}, optsPolyline = {
				color: e.tags.colour || $('html').css('--second-color'),
				opacity: 0.3,
				weight: 10,
				interactive: false
			}, optsPolylineThin = {
				color: e.tags.colour || $('html').css('--second-color'),
				opacity: 0.7,
				weight: 4,
				interactive: false
			};
			if (e.type === 'relation') {
				if (e.tags.type === 'multipolygon' || e.tags.leisure) {
					e.members.forEach(x => mems.push(x.geometry));
					outline = L.polygon([mems], optsPolygon);
				}
				else {
					e.members.forEach(x => { if (x.type === 'way') mems.push(x.geometry); });
					outline = L.polyline([mems], e.tags.type === 'boundary' ? optsPolylineThin : optsPolyline);
				}
			}
			else if (e.geometry) {
				// if area
				if (Object.values(e.geometry[0]).toString() === Object.values(e.geometry[e.geometry.length-1]).toString()) outline = L.polygon(e.geometry, optsPolygon);
				// else assume way
				else outline = L.polyline(e.geometry, optsPolyline);
			}
			outline._leaflet_id = 'o_' + e.type.slice(0, 1) + e.id;
			e.center = outline.getBounds().getCenter();
			areaOutline.addLayer(outline).addTo(map);
		}
		var pos = (e.type === 'node') ? new L.LatLng(e.lat, e.lon) : new L.LatLng(e.center.lat, e.center.lng);
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
				case 'bicycle_repair_station': type = 'bicycle'; break;
				case 'cafe':
				case 'fast_food':
				case 'restaurant':
					if (e.tags.cuisine) {
						name = e.tags.cuisine;
						name += (e.tags.amenity === 'restaurant' && e.tags.takeaway === 'only') ? ' takeaway' : ' ' + e.tags.amenity;
						switch (e.tags.cuisine) {
							case 'chinese': iconName = 'restaurant_chinese'; break;
							case 'fish_and_chips': iconName = 'fishchips'; break;
							case 'greek': iconName = 'restaurant_greek'; break;
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
				case 'taxi':
					if (!e.tags.building) {
						name = e.tags.amenity + ' rank';
						iconName = 'taxirank';
					}
					break;
				case 'training':
					if (e.tags.training) {
						name = e.tags.training + ' ' + e.tags.amenity;
						iconName = 'presentation';
					}
					break;
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
		if (e.tags.historic || e.tags['historic:railway']) {
			if (e.tags['historic:railway']) e.tags.historic = 'railway_station';
			if (!name) name = 'historic ' + e.tags.historic;
			if (!type) type = 'historic';
			if (e.tags.ruins) {
				iconName = 'ruins-2';
				name = name + ' ruins';
			}
			if (e.tags.military) {
				iconName = 'war';
				switch (e.tags.military) {
					case 'bunker': iconName = 'bunker-2-2'; break;
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
				case 'cemetery': iconName = 'cemetery1'; break;
				case 'farm': iconName = 'farm-2'; break;
				case 'folly': iconName = 'tower'; break;
				case 'memorial':
					if (e.tags.memorial) {
						name = 'memorial ' + e.tags.memorial;
						if (!iconName) {
							switch (e.tags.memorial) {
								case 'plaque': iconName = 'plaque'; break;
								case 'clock': iconName = 'clock'; break;
								case 'statue': iconName = 'statue-2'; break;
								case 'war_memorial': name = 'war memorial'; iconName = 'war_memorial'; break;
							}
						}
					}
					if (!iconName) iconName = 'memorial';
					break;
				case 'mill': iconName = 'windmill-2'; break;
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
				name = e.tags['survey_point:structure'];
				switch (e.tags['survey_point:structure']) {
					case 'block': iconName = 'sppillar'; break;
					case 'bracket': iconName = 'spbracket'; break;
					case 'indented_pin':
					case 'pin': iconName = 'sprivet'; break;
				}
			}
		}
		if (e.tags.power) {
			name = 'power ' + e.tags.power;
			iconName = 'powersubstation';
		}
		if (e.tags.shop) {
			if (e.tags.shop === 'yes') name = 'shop';
			if (!name) name = e.tags.shop;
			if (!type) type = e.tags.shop;
			if (name !== 'charity' && (e.tags.second_hand === 'yes' || e.tags.second_hand === 'only')) name = 'second hand ' + name;
			switch (e.tags.shop) {
				case 'beauty': if (e.tags.beauty) name = e.tags.beauty + ' ' + name; break;
				case 'bathroom_furnishing':
				case 'interior_decoration':
				case 'kitchen': type = 'houseware'; break;
				case 'butcher': type = 'deli'; iconName = 'butcher-2'; break;
				case 'car_parts': type = 'car_repair'; break;
				case 'department_store': iconName = 'departmentstore';
					/* fall through */
				case 'boutique': type = 'clothes';
					/* fall through */
				case 'clothes': name = (e.tags.clothes && e.tags.clothes.indexOf(';') === -1 ? e.tags.clothes + ' ' : '') + name; break;
				case 'collector': type = 'games'; break;
				case 'craft': if (e.tags.craft) name = e.tags.craft; break;
				case 'e-cigarette': type = 'tobacco'; break;
				case 'frozen_food': type = 'supermarket'; break;
				case 'furniture': name = (e.tags.furniture ? e.tags.furniture + ' ' : '') + name; break;
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
				case 'trade': if (e.tags.trade) name = e.tags.trade + ' ' + name; break;
				case 'window_blind': type = 'curtain'; break;
				case 'vacant': name = name + ' shop'; type = ''; break;
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
			if (e.tags.sport) {
				type = 'sport';
				name = e.tags.sport + ' ' + e.tags.leisure;
			}
			switch (type) {
				case 'fitness_centre':
				case 'fitness_station': iconName = 'weights'; break;
				case 'garden': iconName = 'urbanpark'; break;
				case 'golf_course': iconName = 'golfing'; break;
				case 'horse_riding': iconName = 'horseriding'; break;
				case 'nature_reserve': type = 'park'; break;
			}
			switch (e.tags.sport) {
				case 'basketball': iconName = 'basketballfield'; break;
				case 'billiards': iconName = 'billiard-2'; break;
				case 'bmx': iconName = 'bike_rising'; break;
				case 'boules': iconName = 'boccia'; break;
				case 'bowls': iconName = 'bowls'; break;
				case 'boxing': iconName = 'boxing'; break;
				case 'cricket': iconName = 'cricket'; break;
				case 'fishing': iconName = 'fishing'; break;
				case 'martial_arts': iconName = 'karate'; break;
				case 'model_aerodrome':
				case 'rc_car': iconName = 'videogames'; break;
				case 'rowing': iconName = 'rowboat'; break;
				case 'sailing': iconName = 'sailing'; break;
				case 'skateboard': iconName = 'rollerskate'; break;
				case 'soccer': iconName = 'soccerfield'; break;
				case 'swimming': iconName = 'swimming2'; break;
				case 'racquet':
				case 'tennis': iconName = 'tenniscourt'; break;
			}
		}
		if (e.tags.natural) {
			if (!name) name = e.tags.natural;
			if (!type) type = e.tags.natural;
			if (type === 'peak') iconName = 'hill';
			if (type === 'wood') iconName = 'forest2';
		}
		if (e.tags.surveillance) {
			if (!type) type = e.tags.surveillance;
			if (e.tags.surveillance === 'webcam') name = type = 'webcam';
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
			if (!name && e.tags.government) name = e.tags.government + ' office';
			else if (!name) name = (e.tags.office !== 'yes') ? e.tags.office + ' office' : 'office';
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
			switch (e.tags.landuse) {
				case 'cemetery': iconName = 'cemetery'; break;
				case 'recreation_ground': type = 'park'; iconName = 'recreation'; break;
			}
		}
		if (e.tags.cemetery) {
			if (!name) name = e.tags.cemetery;
			switch (e.tags.cemetery) {
				case 'grave': if (!iconName) iconName = 'headstone-2'; break;
				case 'sector': iconName = 'administrativeboundary'; break;
			}
		}
		if (e.tags.boundary) {
			if (!name) name = e.tags.protection_title;
			if (!type) type = e.tags.boundary;
			if (type === 'historic') {
				iconName = 'administrativeboundary';
				name = 'historic boundary';
			}
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
				else iconName = 'apartment-3';
			}
			else if (e.tags.entrance) iconName = 'entrance';
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
				popupAnchor: [0, -24]
			}),
			keyboard: false,
			riseOnHover: true
		}).on('click', function(e) {
			// enable autopan after initial permalink popup, check if sidebar is open
			e.sourceTarget._popup.options.autoPan = true;
			e.sourceTarget._popup.options.autoPanPaddingTopLeft = ($(window).width() < 1024) ? [20, 40] : [sidebar.width() + 50, 5];
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
			direction: 'top',
			offset: [0, -40],
			interactive: poi ? poi.permTooltip : 0,
			permanent: poi ? poi.permTooltip : 0,
			opacity: (noTouch || (poi && poi.permTooltip)) ? 1 : 0
		};
		var toolTip = '<div>';
		if (eName) toolTip += '<b>' + eName + '</b>';
		else if (e.tags['addr:street']) {
			if (e.tags['addr:housename']) toolTip += e.tags['addr:housename'] + ', ' + e.tags['addr:street'];
			else if (e.tags['addr:housenumber']) toolTip += e.tags['addr:housenumber'] + ' ' + e.tags['addr:street'];
			else if (e.tags['addr:unit']) toolTip += 'Unit ' + e.tags['addr:unit'] + ', ' + e.tags['addr:street'];
			else toolTip += e.tags['addr:street'];
		}
		else if (e.tags['addr:place']) toolTip += e.tags['addr:place'];
		else if (e.tags.ref) toolTip += e.tags.ref;
		else if (e.tags.operator) toolTip += e.tags.operator;
		toolTip += '</div><i>' + name + '</i>';
		if (e.tags.image || e.tags.wikimedia_commons) {
			var imgIcon = ((e.tags.image && e.tags.wikimedia_commons) || (e.tags.image && e.tags.image.indexOf(';') > -1) || (e.tags.wikimedia_commons && e.tags.wikimedia_commons.indexOf(';') > -1)) ? 'images' : 'image';
			toolTip += ' <i class="tooltip-icons fa-solid fa-' + imgIcon + ' fa-fw" title="' + titleCase(imgIcon) + '"></i>';
		}
		if (e.tags['wikimedia_commons:video']) toolTip += ' <i class="tooltip-icons fa fa-film fa-fw" title="Video"></i>';
		if (e.tags['wikimedia_commons:pano']) toolTip += ' <i class="tooltip-icons fa fa-street-view fa-fw" title="Photosphere view"></i>';
		// popup and tooltip
		var customPOptions = {
			maxWidth: $(window).width() >= 512 ? imgSize + 30 : imgSize,
			minWidth: (e.tags.image || e.tags.wikimedia_commons) ? imgSize : '',
			autoPan: noPermalink ? true : false,
			autoPanPaddingTopLeft: ($(window).width() < 1024) ? [20, 40] : [sidebar.width() + 50, 5],
			autoPanPaddingBottomRight: [5, 50]
		};
		markerPopup = (poi && poi.tagParser) ? poi.tagParser(e, name) : parse_tags(e, name, []);
		customTOptions.className = (ohState !== undefined) ? 'openColor-list-' + ohState : 'openColor-list-' + ctState;
		marker.bindPopup(markerPopup, customPOptions);
		marker.bindTooltip(toolTip, customTOptions);
		marker.addTo(iconLayer);
		// single poi
		if (rQuery) {
			if ($(window).width() < 768 && !$('.sidebar.collapsed').length) $('.sidebar-close:visible').click();
			marker.openPopup();
			markerId = marker._leaflet_id;
			setPageTitle($(marker._popup._container).find($('.popup-header h3')).text());
		}
		else if (marker._leaflet_id === markerId) marker.openPopup().stopBounce();
		setPoiList();
	}
	noPermalink = true;
	// output list of pois in sidebar
	if (poiList.length) setTimeout(pushPoiList, 250);
	if (spinner > 0) spinner--;
	else {
		$('.spinner').fadeOut(200);
		// timeout to stop double-clicking on fast loads
		setTimeout(function() { $('.poi-checkbox').removeClass('poi-loading'); }, 250);
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
		if (poiList[c]._icon) poiIcon = '<img src="' + poiList[c]._icon.src + '"/>';
		else if (poiList[c].options.color)
			poiIcon = '<i style="-webkit-text-stroke:2px ' + poiList[c].options.color + ';color:' + poiList[c].options.fillColor + ';" class="fa-solid fa-circle fa-lg fa-fw" title=' + poiList[c].desc + '></i>';
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
	$('#poi-results-list').html(poiResultsList).show();
	$('#poi-results').slideDown(400, function() {
		$('#poi-results-list').css('opacity', 1);
		$('#poi-results button').prop('disabled', false);
		$(this).css('pointer-events', 'auto');
		// keep checkbox in view
		if ($('.poi-checkbox input:checked').length === 1) $('.poi-checkbox input:checked').parent()[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
	});
	$('#poi-results-list td:nth-child(3) i').tooltip(tooltipDef);
	$('.sidebar-tabs ul li [href="#pois"] .sidebar-notif').text(poiList.length).show();
	// interact with map
	if (noTouch) $('#poi-results-list tr').hover(
		function() { map._layers[this.id].openTooltip(); },
		function() { if (!map._layers[this.id]._tooltip.options.permanent) map._layers[this.id].closeTooltip(); }
	);
	$('#poi-results-list tr').click(function() {
		if ($('#inputWw2').length) $('#inputWw2 input').val($('#inputWw2 input')[0].max).change();
		map._layers[this.id].openPopup();
		if ($(window).width() < 768) $('.sidebar-close:visible').click();
		else if (map._layers[this.id]._latlng) {
			// get bounds of area, focus 150px above marker to allow room for popup
			var zm = areaOutline.getLayer('o_' + this.id) ? map.getBoundsZoom(areaOutline.getLayer('o_' + this.id)._bounds.pad(0.5)) : map.getZoom();
			if (zm > 18) zm = 18;
			var px = map.project(map._layers[this.id]._latlng, zm);
			map.stop().flyTo(map.unproject([px.x, px.y -= 150], zm), zm);
		}
	});
	$('#poi-results h3').html(
		poiList.length + ' result' + (poiList.length > 1 ? 's' : '') +
			($('#inputAttic').val() ? ' from ' + date_parser($('#inputAttic').val(), 'short') : '') +
			(customSort ? '' : ' <i style="color:#777;" class="fa-solid fa-sort-' + (poiList[0].distance ? 'numeric' : 'alpha') + '-down fa-fw"></i>')
	);
	if (poiList.length === maxOpResults) {
		$('#poi-results h3').append('<br/>(maximum number of results)');
		setMsgStatus('fa-solid fa-circle-info', 'Max Results', 'Maximum number of results shown (' + maxOpResults + ').', 4);
	}
}

// templates
var tagTmpl = '<div class="popup-tagContainer"><i class="popup-tagIcon {iconName} fa-fw"></i><span class="popup-tagValue"><strong>{tag}:</strong> {value}</span></div>';
function generic_header_parser(header, subheader, fhrs, osmId, wikidata) {
	var markerPopup = '<div class="popup-header">';
	if (osmId && !$('#inputAttic').val()) {
		markerPopup += '<a class="popup-edit popup-header-button" title="Edit on OpenStreetMap"><i class="fa-solid fa-pen-to-square fa-fw"></i></a>';
		if (wikidata) markerPopup += '<a class="popup-header-button" title="Edit Wikidata" href="https://www.wikidata.org/wiki/' + wikidata + '" target="_blank" rel="noopener"><i class="fa-solid fa-barcode fa-fw"></i></a>';
		if (noIframe && localStorageAvail()) markerPopup += '<a class="popup-bookm popup-header-button" title="Bookmark"><i class="fa-regular fa-bookmark fa-fw"></i></a>';
		if (fhrs) markerPopup += '<span class="popup-fhrs notloaded" fhrs-key="' + fhrs + '"><i class="fa-solid fa-spinner fa-spin-pulse"></i></span>';
	}
	if (header || fhrs) markerPopup += '<h3>' + (header !== undefined ? header : '&hellip;') + '</h3>';
	if (subheader) markerPopup += '<span class="popup-header-sub">' + subheader + '</span>';
	return markerPopup + '</div>';
}
function generic_tag_parser(tags, tag, label, iconName) {
	var markerPopup = '', result;
	// ignore implied access
	if (tags[tag] && tag === 'access' && tags[tag] === 'yes') return markerPopup;
	else if (tags[tag]) {
		if (tags[tag] === 'yes') result = '<i class="fa-solid fa-check fa-fw" title="yes"></i>';
		else if (tags[tag] === 'no') result = '<i class="fa-solid fa-xmark fa-fw" title="no"></i>';
		else if (tag.indexOf('_date') > -1 || tag.indexOf('date_') > -1) result = date_parser(tags[tag], 'long');
		else result = listTidy(tags[tag]);
		markerPopup += L.Util.template(tagTmpl, { tag: label, value: result, iconName: iconName });
	}
	if ((tags.description || tags.inscription || tags.artwork_subject) && markerPopup) markerPopup = '<span class="popup-longDesc custscroll">' + markerPopup + '</span>';
	return markerPopup;
}
function generic_img_parser(img, id, attrib) {
	var url, imgTmpl;
	if (img.indexOf('Category:') === 0) imgTmpl = '<div class="popup-imgContainer">' + img + '</div>';
	else if (img.indexOf('File:') === 0) {
		url = img;
		img = 'https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=' + encodeURIComponent(img);
		imgTmpl = '<div id="img{id}" class="popup-imgContainer">' +
			'<a data-fancybox="gallery" href="{img}" data-srcset="{img}&width=2560 1280w, {img}&width=1280 800w, {img}&width=800 640w">' +
			'<img data-url="{url}" alt="Loading image..." style="max-height:{maxheight}px;"/></a>' +
			'<div class="popup-imgAttrib notloaded">Loading attribution...</div>' +
		'</div>';
	}
	else imgTmpl = '<div id="img{id}" class="popup-imgContainer">' +
			'<a data-fancybox="gallery" data-caption="' + $('<span>' + attrib + '</span>').text() + '" href="{img}">' +
			'<img alt="Loading image..." style="max-height:{maxheight}px;"/></a>' +
			'<div class="popup-imgAttrib">{attrib}</div>' +
		'</div>';
	return L.Util.template(imgTmpl, { id: id, url: url, maxheight: Math.round(imgSize / 1.5), img: img, attrib: attrib });
}

// poi callback parsers
function allotment_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'user', label: 'Point of contact', iconName: 'fa-solid fa-circle-user'},
		{callback: generic_tag_parser, tag: 'plots', label: 'Plots', iconName: 'fa-solid fa-table-cells-large'},
	]);
}
function bike_parser(tags, titlePopup) {
	var bikeservices_parser = function(tags) {
		var markerPopup = '', tag = '';
		for (var key in tags) if (key.indexOf('service:bicycle:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[2] + ', ';
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Bicycle services', value: listTidy(tag, true), iconName: 'fa-solid fa-bicycle' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: bikeservices_parser},
		{callback: generic_tag_parser, tag: 'bicycle_parking', label: 'Type', iconName: 'fa-solid fa-lock'},
		{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'fa-solid fa-bicycle'},
	]);
}
function busstop_parser(tags, titlePopup) {
	var nextbus_parser = function(tags) {
		var markerPopup = '';
		var bearing = {
			N: 'North', E: 'East', S: 'South', W: 'West',
			NE: 'North-east', NW: 'North-west', SE: 'South-east', SW: 'South-west'
		}[tags['naptan:Bearing']];
		if (bearing) markerPopup += L.Util.template(tagTmpl, { tag: 'Bearing', value: bearing, iconName: 'fa-solid fa-compass' });
		if (tags['naptan:AtcoCode']) markerPopup += '<div class="popup-bsTable custscroll notloaded" style="width:' + imgSize + 'px;" naptan-key="' + tags['naptan:AtcoCode'] + '">' +
				'<i class="fa-solid fa-spinner fa-spin-pulse"></i></div>';
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: generic_tag_parser, tag: 'ref', label: 'Stop ID', iconName: 'fa-solid fa-bus'},
		{callback: generic_tag_parser, tag: 'naptan:Street', label: 'Street', iconName: 'fa-solid fa-road'},
		{callback: nextbus_parser}
	]);
}
function carpark_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'capacity', label: 'Spaces', iconName: 'fa-solid fa-car'},
		{callback: generic_tag_parser, tag: 'capacity:disabled', label: 'Disabled spaces', iconName: 'fa-solid fa-wheelchair'},
		{callback: generic_tag_parser, tag: 'capacity:parent', label: 'Parent spaces', iconName: 'fa-solid fa-child'},
		{callback: generic_tag_parser, tag: 'maxstay', label: 'Max stay', iconName: 'fa-solid fa-hourglass'}
	]);
}
function carshop_parser(tags, titlePopup) {
	var carservices_parser = function(tags) {
		var markerPopup = '', tag = '';
		for (var key in tags) if (key.indexOf('service:vehicle:') === 0 && (tags[key] === 'yes')) tag += key.split(':')[2] + ', ';
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Repair services', value: listTidy(tag, true), iconName: 'fa-solid fa-car' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: carservices_parser}
	]);
}
function cctv_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'maxspeed', label: 'Max speed', iconName: 'fa-solid fa-gauge-simple'},
		{callback: generic_tag_parser, tag: 'surveillance:zone', label: 'Surveillance zone', iconName: 'fa-solid fa-eye'},
		{callback: generic_tag_parser, tag: 'camera:mount', label: 'Camera mount', iconName: 'fa-solid fa-video'},
		{callback: generic_tag_parser, tag: 'camera:type', label: 'Camera type', iconName: 'fa-solid fa-video'}
	]);
}
function clothes_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'clothes', label: 'Clothes type', iconName: 'fa-solid fa-shirt'},
		{callback: generic_tag_parser, tag: 'second_hand', label: 'Second hand', iconName: 'fa-solid fa-shirt'}
	]);
}
function defib_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'defibrillator:location', label: 'Location', iconName: 'fa-solid fa-location-arrow'},
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
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Cuisine', value: listTidy(tag, true), iconName: 'fa-solid fa-utensils' });
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
		if (tags['url:ordering']) tag += '<a href="' + tags['url:ordering'] + '" title="Ordering" target="_blank" rel="noopener">online ordering</a>, ';
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Service', value: tag, iconName: 'fa-solid fa-bag-shopping' });
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
		if (tag) markerPopup += L.Util.template(tagTmpl, { tag: 'Fuel options', value: listTidy(tag, true), iconName: 'fa-solid fa-oil-can' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'shop', label: 'Shop', iconName: 'fa-solid fa-shop'},
		{callback: fuel_parser}
	]);
}
function hotel_parser(tags, titlePopup) {
	var hotelservices_parser = function(tags) {
		var markerPopup = '', tag = '';
		if (tags.stars) {
			var result = '<a href="https://www.visitengland.com/plan-your-visit/quality-assessment-and-star-ratings/visitengland-star-ratings" title="' + tags.stars + ' stars" target="_blank" rel="noopener">';
			for (var c = 0; c < tags.stars; c++) result += '<i class="fa-regular fa-star fa-fw"></i>';
			result += '</a>';
			markerPopup += L.Util.template(tagTmpl, { tag: 'VisitEngland rating', value: result, iconName: 'fa-solid fa-star' });
		}
		if (tags.view) tag += tags.view + ' view, ';
		if (tags.balcony) tag += 'balcony, ';
		if (tags.cooking) tag += 'self-catering, ';
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Accomodation', value: tag, iconName: 'fa-solid fa-bed' });
		}
		if (tags['url:booking_com']) markerPopup += L.Util.template(tagTmpl, { tag: 'Check avalibility', value: '<a href="https://www.booking.com/hotel/gb/' + tags['url:booking_com'] + '.en-gb.html" title="booking.com" target="_blank" rel="noopener"><img alt="booking.com" class="popup-imgBooking" src="assets/img/booking_com.png"/></a>', iconName: 'fa-solid fa-file' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: hotelservices_parser},
		{callback: generic_tag_parser, tag: 'rooms', label: 'Rooms', iconName: 'fa-solid fa-bed'}
	]);
}
function hospital_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'emergency', label: 'Emergency', iconName: 'fa-solid fa-truck-medical'}
	]);
}
function post_parser(tags, titlePopup) {
	var postcypher_parser = function(tags) {
		var markerPopup = '';
		var royalcypher = {
			VR: 'Victoria (1837-1901)',
			EVIIR: 'Edward VII (1901-1910)',
			GR: 'George V (1910-1936)',
			EVIIIR: 'Edward VIII (1936)',
			GVIR: 'George VI (1936-1952)',
			EIIR: 'Elizabeth II (1952+)',
			no: 'none'
		}[tags.royal_cypher];
		if (royalcypher) markerPopup += L.Util.template(tagTmpl, { tag: 'Royal cypher', value: royalcypher, iconName: 'fa-solid fa-signature' });
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
			markerPopup += L.Util.template(tagTmpl, { tag: 'Next collection', value: '<span title="' + tags.collection_times + '">' + strNextChange + '</span>', iconName: 'openColor-' + ctState + ' fa-solid fa-circle' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: postcypher_parser},
		{callback: generic_tag_parser, tag: 'post_box:mounting', label: 'Mounted on', iconName: 'fa-solid fa-box-archive'},
		{callback: generic_tag_parser, tag: 'collection_times', label: 'Collection times', iconName: 'fa-solid fa-clock'},
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
			markerPopup += L.Util.template(tagTmpl, { tag: 'Social facility', value: tag, iconName: 'fa-solid fa-users' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: socialfservices_parser},
		{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'fa-solid fa-users'}
	]);
}
function surveyp_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'ref', label: 'Bracket number', iconName: 'fa-solid fa-hashtag'},
		{callback: generic_tag_parser, tag: 'ele', label: 'Elevation (m above sea)', iconName: 'fa-solid fa-arrow-up'},
		{callback: generic_tag_parser, tag: 'height', label: 'Height (m above ground)', iconName: 'fa-solid fa-arrow-up'},
		{callback: generic_tag_parser, tag: 'survey_point:levelling_date', label: 'Levelling date', iconName: 'fa-solid fa-calendar-days'},
		{callback: generic_tag_parser, tag: 'survey_point:verified_date', label: 'Verified date', iconName: 'fa-solid fa-calendar-days'}
	]);
}
function tap_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'drinking_water', label: 'Drinking water', iconName: 'fa-solid fa-faucet'},
		{callback: generic_tag_parser, tag: 'bottle', label: 'Bottle refill', iconName: 'fa-solid fa-bottle-droplet'}
	]);
}
function taxi_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'capacity', label: 'Taxi rank capacity', iconName: 'fa-solid fa-taxi'}
	]);
}
function vending_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'brand', label: 'Brand'},
		{callback: generic_tag_parser, tag: 'biometric', label: 'Biometric', iconName: 'fa-solid fa-fingerprint'},
	]);
}
function education_parser(tags, titlePopup) {
	var eduinfo_parser = function(tags) {
		var markerPopup = '', tag = '';
		if (tags.min_age && tags.max_age) tag += 'Ages ' + tags.min_age + '-' + tags.max_age + ', ';
		if (tags.capacity) tag += 'Capacity ' + tags.capacity + ', ';
		if (tags["school:type"]) tag += titleCase(tags["school:type"]) + ', ';
		if (tags.denomination) tag += titleCase(tags.denomination) + ', ';
		if (tag) {
			tag = tag.substring(0, tag.length - 2);
			markerPopup += L.Util.template(tagTmpl, { tag: 'Education details', value: tag, iconName: 'fa-solid fa-school' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: eduinfo_parser}
	]);
}
function worship_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'denomination', label: 'Denomination', iconName: 'fa-solid fa-place-of-worship'},
		{callback: generic_tag_parser, tag: 'service_times', label: 'Service times', iconName: 'fa-solid fa-clock'}
	]);
}

// popup image elements
function getWikiAttrib(element) {
	// https://commons.wikimedia.org/wiki/Commons:API
	// get image attribution
	if (element.find('img').data('url') && element.find('img').data('url').indexOf('File:') === 0) {
		var img = element.find('img').data('url');
		$.ajax({
			url: 'https://commons.wikimedia.org/w/api.php',
			dataType: 'jsonp',
			cache: true,
			data: { action: 'query', prop: 'imageinfo', iiprop: 'extmetadata', titles: img, format: 'json' },
			success: function(result) {
				if (!result.query.pages[-1]) {
					var imgAttrib = result.query.pages[Object.keys(result.query.pages)[0]].imageinfo['0'].extmetadata;
					var imgArtist = $('<span>' + imgAttrib.Artist.value + '</span>').text();
					var imgDate = new Date(imgAttrib.DateTimeOriginal ? imgAttrib.DateTimeOriginal.value : imgAttrib.DateTime.value).getFullYear();
					var imgAttribUrl = '<a href="https://commons.wikimedia.org/wiki/' + img + '" title="Wikimedia Commons" target="_blank" rel="noopener">' +
						(imgDate ? imgDate + ' | ' : '') + '&copy; ' + imgArtist + ' | ';
					element.find($('.popup-imgAttrib')).html(imgAttribUrl + imgAttrib.LicenseShortName.value + '</a>');
					element.find('a').data('caption', 'Wikimedia Commons: ' + imgAttribUrl + imgAttrib.UsageTerms.value + '</a>');
				}
				else element.find($('.popup-imgAttrib')).html('Error: Attribution not found');
				element.find($('.popup-imgAttrib')).removeClass('notloaded');
				// set the popup content so it includes dynamically loaded content
				if (markerId && !element.find($('.notloaded')).length) map._layers[markerId].setPopupContent();
				if ($('#inputDebug').is(':checked')) console.debug('Wikimedia-attrib:', result);
			},
			error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR WIKIMEDIA-ATTRIB:', encodeURI(this.url)); }
		});
	}
}
function show_img_controls(imgMax, img360, vid) {
	// add image navigation controls to popup
	// check if user has already seen bouncing icons
	var bouncedicon = (localStorageAvail() && window.localStorage.tutorial.indexOf('bouncedicon') === -1) ? ' fa-bounce' : '';
	var ctrlTmpl = '<div class="navigateItem">';
	if (vid && vid.length) for (x = 0; x < vid.length; x++) {
		if (vid[x].indexOf('File:') === 0 && vid[x].indexOf('webm') === vid[x].length-4) ctrlTmpl +=
			'<a class="vid notloaded" title="Video" style="display:' + ((x === 0) ? 'initial' : 'none') + ';" data-caption="' + vid[x] + '" data-fancybox="vid" data-base-class="noslideshow" data-loop="false"' +
				'data-type="iframe" data-animation-effect="circular" href="https://commons.wikimedia.org/wiki/' + encodeURIComponent(vid[x]) + '?embedplayer=yes">' +
				'<i style="min-width:25px;" class="fa-solid fa-film fa-fw' + bouncedicon + '"></i>' +
			'</a>';
	}
	if (img360 && img360.length) for (x = 0; x < img360.length; x++) {
		if (img360[x].indexOf('File:') === 0) ctrlTmpl +=
			'<a class="pano notloaded" title="Photosphere" style="display:' + ((x === 0) ? 'initial' : 'none') + ';" data-caption="' + img360[x] + '" data-fancybox="pano" data-base-class="noslideshow" data-loop="false"' +
				'data-type="iframe" data-animation-effect="circular" data-src="assets/pannellum/pannellum.htm#config=config.json&panorama=' + encodeURIComponent(img360[x]) + '" href="javascript:;">' +
				'<i style="min-width:25px;" class="fa-solid fa-street-view fa-fw' + bouncedicon + '"></i>' +
			'</a>';
	}
	if (imgMax > 1) ctrlTmpl +=
		'<span class="theme navigateItemPrev"><a title="Previous image" onclick="navImg(0);"><i class="fa-solid fa-square-caret-left fa-fw"></i></a></span>' +
		'<i class="fa-solid fa-images fa-fw" title="Gallery (1 of ' + imgMax + ')"></i>' +
		'<span class="theme navigateItemNext"><a title="Next image" onclick="navImg(1);"><i class="fa-solid fa-square-caret-right fa-fw"></i></a></span>';
	return ctrlTmpl + '</div>';
}
function navImg(direction) {
	if (!$('.popup-imgContainer').is(':animated')) {
		// get the current and last image
		var cID = parseInt($('.popup-imgContainer:visible').attr('id').split('img')[1]);
		var lID = parseInt($('.popup-imgContainer').last().attr('id').split('img')[1]);
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
function titleCase(str, force) {
	// remove underscore, replace semi-colon with comma, convert to title-case
	str = str.replace(/;/g, ', ').replace(/_/g, ' ');
	if (str === str.toUpperCase() && force === undefined) return str;
	else return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
function listTidy(str, trunc) {
	// truncate trail end, replace semi-colon non-spaced lists with spaced commas, replace underscores with dashes
	if (trunc) str = str.substring(0, str.length - 2);
	return str.replace(/;(?=\S)/g, ', ').replace(/_/g, '-');
}
function date_parser(dtStr, style) {
	// parse ISO 8601 dates using local offset
	if (dtStr.indexOf('T') === 10) dtStr = new Date(new Date(dtStr).setHours(new Date(dtStr).getHours()-new Date(dtStr).getTimezoneOffset()/60)).toISOString().replace('T', ' ').substring(0, 16);
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
	return {
		n: 'node',
		w: 'way',
		r: 'relation'
	}[e.toLowerCase().slice(0, 1)];
}
