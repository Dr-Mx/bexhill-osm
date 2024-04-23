// parse tags and marker popup

let spinner = 0, markerId, ohState, ctState, poiList = [];
function parse_tags(element, titlePopup, poiParser) {
	let eName = element.tags.name || element.tags['addr:housename'] || undefined;
	if (eName && element.tags.ref) eName += ' (' + element.tags.ref + ')';
	let markerPopup = '';
	// global callback parsers
	const address_parser = function(tags) {
		markerPopup = '';
		if (tags['addr:street'] || tags['addr:place']) {
			let addrVal = '';
			if (tags.level > 0 && tags.level <= 10) addrVal += '<span title="Level">' + ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'][tags.level] + '-floor</span>, ';
			else if (tags.level === '-1') addrVal += '<span title="Level">Basement</span>, ';
			if (tags['addr:unit']) addrVal += 'Unit ' + tags['addr:unit'] + ', ';
			if (tags['addr:flats']) addrVal += 'Flats ' + tags['addr:flats'] + ', ';
			if (tags['addr:housename'] && tags['addr:housename'] !== element.tags.name) addrVal += '<span title="House name">' + tags['addr:housename'] + '</span>, ';
			if (tags['addr:housenumber']) addrVal += '<span title="House number">' + tags['addr:housenumber'] + '</span> ';
			if (tags['addr:street']) addrVal += '<span title="Street">' + tags['addr:street'] + '</span>';
			else if (tags['addr:place']) addrVal += '<span title="Place">' + tags['addr:place'] + '</span>';
			if (tags['addr:suburb']) addrVal += ', <span title="Suburb">' + tags['addr:suburb'] + '</span>';
			else if (tags['addr:hamlet']) addrVal += ', <span title="Hamlet">' + tags['addr:hamlet'] + '</span>';
			if (tags['addr:city'] && tags['addr:city'] !== 'Bexhill-on-Sea') addrVal += ', <span title="City">' + tags['addr:city'] + '</span>';
			if (tags['addr:postcode']) addrVal += ', <span class="theme-nowrap" title="Postcode">' + tags['addr:postcode'] + '</span>';
			markerPopup += L.Util.template(tagTmpl, { key: 'Address', keyVal: addrVal, iconName: 'fa-solid fa-location-pin' });
		}
		return markerPopup;
	};
	const site_parser = function(tags) {
		let siteVal = '', planningVal = '', siteType = [];
		markerPopup = '';
		if (tags.bunker_type) siteVal += '<span title="Bunker type">' + tags.bunker_type + '</span>; ';
		if (tags['building:architecture']) siteVal += '<span title="Architecture">' + titleCase(tags['building:architecture']) + '</span>; ';
		if (tags.architect) siteVal += '<span title="Architect">Arch. ' + tags.architect + '</span>; ';
		if (tags.artist_name) siteVal += '<span title="Artist">Artst. ' + tags.artist_name + '</span>; ';
		if (tags.manufacturer) siteVal += '<span title="Manufacturer">Mfr. ' + tags.manufacturer + '</span>; ';
		if (tags.display) siteVal += '<span title="Clock display">' + tags.display + '</span>; ';
		if (tags.support) siteVal += '<span title="Clock support">' + tags.support + '</span>; ';
		if (tags.faces) siteVal += '<span title="Clock faces">' + ((tags.faces >= 2) ? tags.faces + ' faces' : '1 face') + '</span>; ';
		if (tags.material) siteVal += '<span title="Material">Mtrl. ' + tags.material + '</span>; ';
		if (tags.start_date) {
			siteVal += '<span title="Start date">' + dateFormat(tags.start_date, 'short') + '</span>';
			if (tags.end_date) siteVal += ' to <span title="End date">' + dateFormat(tags.end_date, 'short') + '</span>';
			siteVal += '; ';
		}
		if (tags['wreck:date_sunk']) siteVal += '<span title="Date sunk">Sunk: ' + dateFormat(tags['wreck:date_sunk'], 'short') + '</span>; ';
		if (tags['ref:planningapp']) planningVal = '<a href="https://planweb01.rother.gov.uk/OcellaWeb/planningDetails?reference=' + encodeURI(tags['ref:planningapp']) + '" target="_blank" rel="noopener">' + tags['ref:planningapp'] + '</a>';
		else if (tags['ref:historicplanningapp']) planningVal = '<a href="https://planweb01.rother.gov.uk/OcellaWeb/historyDetails?reference=' + encodeURI(tags['ref:historicplanningapp']) + '" target="_blank" rel="noopener">' + tags['ref:historicplanningapp'] + '</a>';
		if (planningVal) siteVal += '<span class="theme-nowrap" title="Planning application">' + planningVal + '</span>; ';
		if (tags.HE_ref) siteVal += '<a class="theme-nowrap" href="https://historicengland.org.uk/listing/the-list/list-entry/' + encodeURI(tags.HE_ref) + '?section=official-list-entry" title="Historic England Listing" target="_blank" rel="noopener">Listed ' + (tags.listed_status || tags.HE_ref) + '</a>; ';
		if (tags.disused) siteVal += '<span title="Disused">Currently disused</span>; ';
		if (tags.building) {
			if (tags.building === 'garage') siteType = ['Garage', 'warehouse'];
			else if (tags.building === 'house' || tags.building === 'bungalow' || tags.building === 'detached') siteType = ['House', 'house-chimney'];
			else if (tags.building === 'hut') siteType = ['Structure', 'person-shelter'];
			else if (tags.building === 'warehouse') siteType = ['Warehouse', 'warehouse'];
			else siteType = ['Building', 'building'];
		}
		else siteType = ['Site', 'monument'];
		if (siteVal) markerPopup = L.Util.template(tagTmpl, { key: siteType[0] + ' details', keyVal: listTidy(siteVal, true), iconName: 'fa-solid fa-' + siteType[1] }) + markerPopup;
		return markerPopup;
	};
	const phone_parser = function(tags) {
		const phoneTag = tags.phone || tags['phone:GB'] || tags['contact:phone'] || tags['contact:phone:GB'];
		let phoneVal = '';
		markerPopup = '';
		if (phoneTag) phoneVal = '<a href="tel:' + encodeURI(phoneTag) + '" title="Telephone">' + phoneTag + '</a>';
		if (tags['contact:mobile']) phoneVal = (phoneVal ? phoneVal + ' / ' : '') + '<a href="tel:' + encodeURI(tags['contact:mobile']) + '" title="Mobile">' + tags['contact:mobile'] + '</a>';
		if (phoneVal) markerPopup += L.Util.template(tagTmpl, { key: 'Phone', keyVal: (navigator.language === lang ? phoneVal.replaceAll('+44 ', '0') : phoneVal), iconName: 'fa-solid fa-phone' });
		return markerPopup;
	};
	const contact_parser = function(tags) {
		let contactVal = '';
		const tagMail = tags.email || tags['contact:email'], tagFb = tags.facebook || tags['contact:facebook'], tagTwit = tags.twitter || tags['contact:twitter'], tagInstg = tags['contact:instagram'], tagYtube = tags['contact:youtube'];
		markerPopup = '';
		if (tagMail) contactVal += '<a href="mailto:' + encodeURI(tagMail) + '"><i class="fa-solid fa-envelope fa-fw" title="E-mail: ' + tagMail + '"></i></a> ';
		if (tagFb) contactVal += '<a href="' + encodeURI(tagFb) + '" target="_blank" rel="noopener nofollow"><i class="fa-brands fa-facebook fa-fw" title="Facebook: ' + tagFb + '" style="color:#3b5998;"></i></a> ';
		if (tagTwit) contactVal += '<a href="https://twitter.com/' + encodeURI(tagTwit) + '" target="_blank" rel="noopener nofollow"><i class="fa-brands fa-x-twitter fa-fw" title="X-twitter: @' + tagTwit + '" style="color:#000000;"></i></a> ';
		if (tagInstg) contactVal += '<a href="https://instagram.com/' + encodeURI(tagInstg) + '" target="_blank" rel="noopener nofollow"><i class="fa-brands fa-instagram fa-fw" title="Instagram: ' + tagInstg + '" style="color:#d93175;"></i></a> ';
		if (tagYtube) contactVal += '<a href="' + encodeURI(tagYtube) + '" target="_blank" rel="noopener nofollow"><i class="fa-brands fa-youtube fa-fw" title="YouTube: ' + tagYtube + '" style="color:#ff0000;"></i></a> ';
		if (contactVal) markerPopup += L.Util.template(tagTmpl, { key: 'Contact', keyVal: contactVal, iconName: 'fa-solid fa-circle-user' });
		return markerPopup;
	};
	const street_parser = function(tags) {
		let streetVal = '';
		markerPopup = '';
		if (tags.highway && eName && element.type === 'way' && LBounds.contains(element.center)) {
			// get street history through xml file lookup
			$.ajax({
				async: false,
				url: 'tour/itemStreetNames/streetnames.xml',
				dataType: 'xml',
				cache: true,
				success: function(xml) {
					const street = $(xml).find('name').filter(function() { return $(this).text() === tags.name; }).closest('street');
					const streetDate = $('date', street).text();
					const streetDesc = $('desc', street).text();
					if (streetDate && !tags.start_date) markerPopup += L.Util.template(tagTmpl, { key: 'Start date', keyVal: streetDate, iconName: 'fa-solid fa-calendar' });
					if (streetDesc) markerPopup += '<span class="popup-tag-long theme-scroll">' + L.Util.template(tagTmpl, { key: 'Etymology', keyVal: '<i>' + streetDesc + '</i>', iconName: 'fa-solid fa-book' }) +
						'<span class="popup-comment"><a onclick="popupWindow(\'streetbook\');" title="' + $(xml).find('url').text() + '">' + $(xml).find('title').text() + '</a></span>' +
					'</span>';
					if ($('#settings-debug').is(':checked')) console.debug('Street-names:', xml);
				},
				error: function() { if ($('#settings-debug').is(':checked')) console.debug('ERROR STREET-NAMES:', encodeURI(this.url)); }
			});
			if (tags.maxspeed) streetVal += tags.maxspeed + '; ';
			if (tags.maxwidth) streetVal += tags.maxwidth + '; ';
			if (tags.access === 'private') streetVal += 'private; ';
			if (tags.unadopted === 'yes') streetVal += 'unadopted; ';
			if (tags.designation) streetVal += 'designated ' + tags.designation + '; ';
			if (tags.surface) streetVal += tags.surface + '; ';
			if (tags.narrow === 'yes') streetVal += 'narrow; ';
			if (tags.cutting === 'yes') streetVal += 'cutting; ';
			if (tags.sidewalk === 'no') streetVal += 'no pavement; ';
			if (tags.incline) streetVal += 'incline; ';
			if (tags.lit === 'yes') streetVal += 'lit; ';
			if (tags.oneway === 'yes') streetVal += 'oneway; ';
			if (tags.bridge === 'yes') streetVal += 'bridge; ';
			if (streetVal) markerPopup += L.Util.template(tagTmpl, { key: 'Highway details', keyVal: listTidy(streetVal, true), iconName: 'fa-solid fa-road' });
			if (tags.prow_ref) markerPopup += L.Util.template(tagTmpl, { key: 'Public Right of Way', keyVal: tags.prow_ref, iconName: 'fa-solid fa-person-hiking' });
		}
		return markerPopup;
	};
	const furtherreading_parser = function(tags) {
		const streetDirs = 'https://www.bexhillmuseum.org.uk/access-centre/bexhill-street-directories/?wdt_column_filter[road]=';
		let readingVal = '';
		markerPopup = '';
		if ((tags.building === 'apartments' || tags.building === 'bungalow' || tags.building === 'house') && tags['addr:street'] && LBounds.contains(element.center)) {
			readingVal += '<a onclick="searchAddr(\'' + tags['addr:street'].replace('\'', '') + '\');" title="The Story of Bexhill Street Names">Street history</a>; ';
			readingVal += '<a href="' + streetDirs + encodeURI(tags['addr:street'].replace('\'', '')) + '#main" title="Bexhill Museum Street Directories 1886-1931" target="_blank" rel="noopener">Street directories</a>; ';
		}
		if (tags.highway && eName && element.type === 'way' && LBounds.contains(element.center)) readingVal += '<a href="' + streetDirs + encodeURI(eName.replace('\'', '')) + '#main" title="Bexhill Museum Street Directories" target="_blank" rel="noopener">Street directories</a>; ';
		if (tags.wikipedia || tags['site:wikipedia']) {
			const w = tags.wikipedia || tags['site:wikipedia'];
			readingVal += '<a href="https://' + encodeURI(w.split(':')[0]) + '.wikipedia.org/wiki/' + encodeURI(w.split(':')[1]) + '" title="The Free Encyclopaedia" target="_blank" rel="noopener">Wikipedia</a>; ';
		}
		if (tags['ref:esher'])
			readingVal += '<a class="theme-nowrap" href="https://www.heritagegateway.org.uk/Gateway/Results_Single.aspx?uid=' + encodeURI(tags['ref:esher']) + '&resourceID=1026#content" title="East Sussex Historic Environment Record" target="_blank" rel="noopener">ESHER</a>; ';
		if (tags['ref:publicsculpturesofsussex'])
			readingVal += '<a class="theme-nowrap" href="https://publicsculpturesofsussex.co.uk/index.php/object?id=' + encodeURI(tags['ref:publicsculpturesofsussex']) + '" title="Public Sculptures of Sussex" target="_blank" rel="noopener">Public Sculptures</a>; ';
		if (tags['ref:iwm'])
			readingVal += '<a class="theme-nowrap" href="https://www.iwm.org.uk/memorials/item/memorial/' + encodeURI(tags['ref:iwm']) + '" title="Imperial War Museum: War Memorials Register" target="_blank" rel="noopener">IWM</a>; ';
		if (tags['url:bexhillhistorytrail'])
			readingVal += '<a class="theme-nowrap" href="https://thebexhillhistorytrail.wordpress.com/' + encodeURI(tags['url:bexhillhistorytrail']) + '" title="The Bexhill History Trail" target="_blank" rel="noopener">History Trail</a>; ';
		if (tags['url:bexhillnature'])
			readingVal += '<a class="theme-nowrap" href="https://bexhillnature.uk/places/' + encodeURI(tags['url:bexhillnature']) + '.php" title="Wild animals and plants" target="_blank" rel="noopener">Bexhill Nature</a>; ';
		if (tags['ref:edubase'])
			readingVal += '<a class="theme-nowrap" href="https://get-information-schools.service.gov.uk/Establishments/Establishment/Details/' + encodeURI(tags['ref:edubase']) + '" title="Department for Education" target="_blank" rel="noopener">URN ' + tags['ref:edubase'] + '</a>; ';
		if (tags['ref:charity'])
			readingVal += '<a class="theme-nowrap" href="https://register-of-charities.charitycommission.gov.uk/charity-details/?regId=' + encodeURI(tags['ref:charity']) + '&subId=0" title="Charity Commission" target="_blank" rel="noopener">Charity ' + tags['ref:charity'] + '</a>; ';
		if (tags.tpuk_ref)
			readingVal += '<a class="theme-nowrap" href="http://trigpointing.uk/trig/' + encodeURI(tags.tpuk_ref.split('TP')[1]) + '" title="TrigpointingUK" target="_blank" rel="noopener">TrigpointingUK</a>; ';
		if (readingVal) {
			readingVal = readingVal.substring(0, readingVal.length - 2);
			markerPopup = L.Util.template(tagTmpl, { key: 'Further reading', keyVal: readingVal, iconName: 'fa-solid fa-book' });
		}
		return markerPopup;
	};
	const facility_parser = function(tags) {
		let facVal = '';
		markerPopup = '';
		if (tags.indoor === 'yes') facVal += '<i class="popup-tag-value-limited fa-solid fa-door-closed fa-fw" title="place is indoors"></i>';
		if (tags.wheelchair === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-wheelchair fa-fw" title="wheelchair access"></i>';
		else if (tags.wheelchair === 'limited') facVal += '<i class="popup-tag-value-limited fa-solid fa-wheelchair fa-fw" title="limited wheelchair access"></i>';
		else if (tags.wheelchair === 'no') facVal += '<i class="popup-tag-value-no fa-solid fa-wheelchair fa-fw" title="no wheelchair access"></i>';
		if (tags.elevator === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-elevator fa-fw" title="lift access"></i>';
		if (tags['hearing_impaired:induction_loop'] === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-ear-deaf fa-fw" title="induction loop"></i>';
		if (tags['tactile_writing:braille'] === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-braille fa-fw" title="braille"></i>';
		if (tags.dog === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-dog fa-fw" title="dogs allowed"></i>';
		else if (tags.dog === 'no') facVal += '<i class="popup-tag-value-no fa-solid fa-dog fa-fw" title="no dogs allowed"></i>';
		else if (tags.dog === 'leashed') facVal += '<i class="popup-tag-value-limited fa-solid fa-dog-leashed fa-fw" title="leashed dogs only"></i>';
		if (tags.internet_access === 'wlan') facVal += '<i class="popup-tag-value-yes fa-solid fa-wifi fa-fw" title="wireless internet"></i>';
		else if (tags.internet_access === 'terminal') facVal += '<i class="popup-tag-value-yes fa-solid fa-desktop fa-fw" title="internet terminal"></i>';
		if (tags['drinking_water:refill'] === 'yes') facVal += '<i class="fa-solid fa-bottle-droplet fa-fw" style="color:#0082ff;" title="free drinking water refills"></i>';
		if (tags.membership === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-id-card fa-fw" title="membership available"></i>';
		if (tags.membership === 'required') facVal += '<i class="popup-tag-value-no fa-solid fa-id-card fa-fw" title="membership required"></i>';
		if (tags.live_music === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-music fa-fw" title="live music"></i>';
		if (tags.shelter === 'yes' || tags.covered === 'yes' || tags.covered === 'booth') facVal += '<i class="popup-tag-value-yes fa-solid fa-umbrella fa-fw" title="sheltered"></i>';
		if (tags.highway === 'bus_stop') {
			if (tags.bench === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-chair fa-fw" title="seating"></i>';
			if (tags.bin === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-trash-can fa-fw" title="rubbish bin"></i>';
		}
		if (tags.amenity === 'telephone') {
			if (tags.internet_access === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-at fa-fw" title="internet access"></i>';
			if (tags.sms === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-comment-sms fa-fw" title="sms"></i>';
		}
		if (tags.amenity === 'toilets') {
			if (tags.unisex === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-restroom fa-fw" title="unisex"></i>';
			if (tags.male === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-person fa-fw" title="male"></i>';
			if (tags.female === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-person-dress fa-fw" title="female"></i>';
			if (tags.changing_table === 'yes') facVal += '<i class="popup-tag-value-yes fa-solid fa-baby fa-fw" title="baby changing"></i>';
		}
		if (facVal) facVal = '<span class="popup-tag-value-facility">' + facVal + '</span>';
		if (tags.amenity === 'recycling') {
			let recycTag = '', recycList = '';
			const recycIcon = {
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
			for (let recycKey in tags) {
				let recyc = '';
				if (recycKey.startsWith('recycling:') && (tags[recycKey] === 'yes')) {
					recyc = recycKey.split(':')[1];
					recycList += recyc + ', ';
				}
				if (recycIcon[recyc]) recycTag += '<i class="' + recycIcon[recyc] + ' fa-fw" title="' + recyc + '"></i>';
			}
			if (recycList) markerPopup += L.Util.template(tagTmpl, { key: 'Recycling options', keyVal: listTidy(recycList, true), iconName: 'fa-solid fa-recycle' });
			if (recycTag) facVal += '<span class="popup-tag-value-recycling"' + (facVal ? ' style="padding-left:10px;"' : '') + '>' + recycTag + '</span>';
		}
		if (Object.keys(tags).some(function(k){ return ~k.indexOf('payment:'); })) {
			let payTag = '', payList = '';
			const payIcon = {
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
			for (let payKey in tags) {
				let pay = '';
				if (payKey.startsWith('payment:') && tags[payKey] === 'yes') {
					pay = payKey.split(':')[1];
					payList += pay + ', ';
				}
				if (payIcon[pay]) payTag += '<i class="' + payIcon[pay] + ' fa-fw" title="' + pay + '"></i>';
			}
			if (payList) markerPopup += L.Util.template(tagTmpl, { key: 'Payment options', keyVal: listTidy(payList, true), iconName: 'fa-solid fa-cash-register' });
			if (payTag) facVal += '<span class="popup-tag-value-payment"' + (facVal ? ' style="padding-left:10px;"' : '') + '>' + payTag + '</span>';
		}
		if (tags.fee) {
			let feeTag = '';
			if (tags['fee:conditional'] && tags.charge) feeTag = tags['fee:conditional'] + ': ' + tags.charge;
			else {
				feeTag = tags.charge || tags['fee:conditional'] || tags.fee;
				if (feeTag === 'yes') feeTag = '<i class="fa-solid fa-check fa-fw"></i>';
				else if (feeTag === 'no') feeTag = '<i class="fa-solid fa-xmark fa-fw"></i>';
			}
			markerPopup += L.Util.template(tagTmpl, { key: 'Fee', keyVal: listTidy(feeTag), iconName: 'fa-solid fa-sterling-sign' });
		}
		if (Object.keys(tags).some(function(k){ return ~k.indexOf('diet:'); })) {
			let dietTag = '';
			const dietIcon = {
				pescetarian: 'fa-solid fa-fish',
				vegetarian: 'fa-solid fa-carrot',
				vegan: 'fa-solid fa-leaf',
				fruitarian: 'fa-solid fa-apple'
			};
			for (let dietKey in tags) {
				let diet = '';
				if (dietKey.startsWith('diet:') && tags[dietKey] === 'yes') diet = dietKey.split(':')[1];
				if (dietIcon[diet]) dietTag += '<i class="' + dietIcon[diet] + ' fa-fw" title="' + diet + ' options"></i>';
			}
			if (dietTag) facVal += '<span class="popup-tag-value-diet"' + (facVal ? ' style="padding-left:10px;"' : '') + '>' + dietTag + '</span>';
		}
		if (facVal) markerPopup += L.Util.template(tagTmpl, { key: 'Facilities', keyVal: '<span class="popup-facilities">' + facVal + '</span>', iconName: 'fa-solid fa-circle-info' });
		return markerPopup;
	};
	// https://github.com/opening-hours/opening_hours.js
	const opening_hours_parser = function(tags) {
		markerPopup = '';
		const drawTable = function(oh, date_today) {
			const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
			date_today = new Date(date_today);
			date_today.setHours(0, 0, 0, 0);
			const date = new Date(date_today);
			let table = [];
			date.setDate(date.getDate() - 1);
			for (let row = 0; row < 7; row++) {
				date.setDate(date.getDate() + 1);
				let ohState = oh.getState(date), prevdate = date, curdate = date;
				table[row] = {
					date: new Date(date),
					text: []
				};
				while (curdate.getTime() - date.getTime() < 24*60*60*1000) {
					curdate = oh.getNextChange(curdate);
					if (typeof curdate === 'undefined') return '';
					if (ohState) {
						let text = pad(prevdate.getHours()) + ':' + pad(prevdate.getMinutes()) + '-';
						if (prevdate.getDay() !== curdate.getDay()) text += '24:00';
						else text += pad(curdate.getHours()) + ':' + pad(curdate.getMinutes());
						if (oh.getComment(prevdate)) text += '<br>' + oh.getComment(prevdate);
						table[row].text.push(text);
					}
					prevdate = curdate;
					ohState = !ohState;
				}
			}
			let ret = '<table>';
			for (let row = 0; row < table.length; row++) {
				const today = table[row].date.getDay() == date_today.getDay();
				const endweek = ((table[row].date.getDay() + 1) % 7) == date_today.getDay();
				const cl = today ? ' class="today"' : endweek ? ' class="endweek"' : '';
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
			let openhrsState = [];
			const oh = new opening_hours(tags.opening_hours, { 'lat': mapCentre[0].toFixed(5), 'lon': mapCentre[1].toFixed(5), 'address':{ 'country_code':'gb', 'state':'England' } });
			const comment = (oh.getComment() || oh.getComment(oh.getNextChange()) || '');
			let strNextChange;
			ohState = oh.getState();
			if (oh.getUnknown()) {
				ohState = (oh.getComment(new Date()) && oh.getNextChange() !== undefined) ? true : 'depends';
				strNextChange = '"' + comment + '"';
			}
			else strNextChange = oh.prettifyValue();
			if (oh.getNextChange()) {
				const nextTime = oh.getNextChange().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
				const dateTomorrow = new Date(), dateWeek = new Date();
				dateTomorrow.setDate(new Date().getDate() + 1);
				dateWeek.setDate(new Date().getDate() + 7);
				// display 'today'
				if (oh.getNextChange().toLocaleDateString(lang) === new Date().toLocaleDateString(lang)) {
					strNextChange = nextTime;
				}
				// display 'tomorrow'
				else if (oh.getNextChange().toLocaleDateString(lang) === dateTomorrow.toLocaleDateString(lang))
					strNextChange = (nextTime === '00:00') ? 'Midnight' : 'Tomorrow ' + nextTime;
				// display day name if within a week
				else if (oh.getNextChange().getTime() > dateTomorrow.getTime() && oh.getNextChange().getTime() < dateWeek.getTime()) {
					strNextChange = oh.getNextChange().toLocaleDateString(lang, { weekday: 'long' });
					if (nextTime !== '00:00') strNextChange += ' ' + nextTime;
				}
				// otherwise display date
				else strNextChange = dateFormat(oh.getNextChange().toLocaleDateString(lang), 'short');
				if (comment) strNextChange += ' (' + comment + ')';
			}
			// create readable table
			let ohTable = drawTable(oh, new Date());
			if (tags.opening_hours.indexOf('PH ') === -1 && ohTable) ohTable += '<div class="popup-comment">Holiday periods may differ.</div>';
			// show tag and collapsible accordion
			if (ohState === true) openhrsState = 'Open until';
			else if (ohState === false) openhrsState = 'Closed until';
			else if (ohState === 'depends') openhrsState = 'Depends on';
			if (openhrsState) {	markerPopup =
				'<div style="min-width:' + (ohTable ? '270px;" class="popup-openhrs' : '100px;') + '">' +
					'<span class="popup-tag" title="' + tags.opening_hours.replaceAll('"', '\'') + '">' +
						'<i class="popup-tag-icon popup-openhrs-color-' + ohState + ' fa-solid fa-clock fa-fw"></i>' +
						'<span class="popup-tag-value"><strong>' + openhrsState + ':</strong>' + strNextChange + '</span>' +
					'</span>' +
					'<div class="popup-openhrs-table">' + ohTable + '</div>' +
				'</div>';
			}
		}
		catch(err) {
			if (tags.opening_hours && $('#settings-debug').is(':checked')) console.debug('ERROR: Object "' + eName + '" cannot parse hours:', tags.opening_hours + '. ' + err);
		}
		if (tags.opening_date && new Date(tags.opening_date).valueOf() > new Date().valueOf()) markerPopup = L.Util.template(tagTmpl, { key: 'Opening date', keyVal: dateFormat(tags.opening_date, 'long'), iconName: 'fa-solid fa-calendar' });
		return markerPopup;
	};
	const image_parser = function(tags) {
		// get images
		let imgCount = 0, multiPano = [], multiVid = [];
		markerPopup = '';
		if (tags.image) {
			// support semicolon separated images
			const multiImage =
				(tags.image +
				(tags['image:1'] ? ';' + tags['image:1'] : '') +
				(tags['image:2'] ? ';' + tags['image:2'] : '')
			).split(';');
			const multiImageSource = tags['source:image'] ?
				(tags['source:image'] +
				(tags['source:image_1'] ? ';' + tags['source:image_1'] : '') +
				(tags['source:image_2'] ? ';' + tags['source:image_2'] : '')
			).split(';') : '';
			for (let x = 0; x < multiImage.length; x++) if (multiImage[x].startsWith('http')) {
				markerPopup += generic_img_parser(multiImage[x], imgCount, multiImageSource[x] ? '&copy; ' + multiImageSource[x] : '');
				imgCount++;
			}
		}
		if (tags.wikimedia_commons) {
			// support semicolon separated commons images
			const multiCommons =
				(tags.wikimedia_commons +
				(tags['wikimedia_commons:1'] ? ';' + tags['wikimedia_commons:1'] : '') +
				(tags['wikimedia_commons:2'] ? ';' + tags['wikimedia_commons:2'] : '')
			).split(';');
			/* CATEGORIES SUPPORT TODO
			if (multiCommons[0].startsWith('Category:')) {
				$.ajax({
					url: 'https://commons.wikimedia.org/w/api.php',
					dataType: 'jsonp',
					cache: true,
					data: { action: 'query', list: 'categorymembers', cmtype: 'file', cmtitle: multiCommons[0], format: 'json' },
					success: function(result) {
						if (!result.query.categorymembers[-1]) for (x = 0; x < result.query.categorymembers.length; x++) if (result.query.categorymembers[x].title.startsWith('File:')) {
							markerPopup += generic_img_parser(result.query.categorymembers[x].title, imgCount, '');
							imgCount++;
						}
						if ($('#settings-debug').is(':checked')) console.debug('Wikimedia-categories:', result);
					},
					error: function() { if ($('#settings-debug').is(':checked')) console.debug('ERROR WIKIMEDIA-CATEGORIES:', encodeURI(this.url)); }
				});
			} else */
			for (let x = 0; x < multiCommons.length; x++) if (multiCommons[x].startsWith('File:')) {
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
		if (imgCount > 0) markerPopup = '<div class="popup-img">' + markerPopup + '</div>';
		return markerPopup;
	};
	const functions = [
		{callback: generic_tag_parser, tag: 'official_name', label: 'Off. name'},
		{callback: generic_tag_parser, tag: 'loc_name', label: 'Loc. name'},
		{callback: generic_tag_parser, tag: 'alt_name', label: 'Alt. name'},
		{callback: generic_tag_parser, tag: 'old_name', label: 'Old name'},
		{callback: generic_tag_parser, tag: 'operator', label: 'Operator', iconName: 'fa-solid fa-user-tie'},
		{callback: address_parser},
		{callback: site_parser},
		{callback: phone_parser},
		{callback: generic_website_parser, tag: 'website', label: 'Website', iconName: 'fa-solid fa-globe'},
		{callback: generic_website_parser, tag: 'contact:website', label: 'Website', iconName: 'fa-solid fa-globe'},
		{callback: generic_website_parser, tag: 'website:booking', label: 'Booking', iconName: 'fa-solid fa-receipt'},
		{callback: contact_parser},
		{callback: street_parser},
		{callback: furtherreading_parser},
		{callback: facility_parser},
		{callback: generic_tag_parser, tag: 'substance', label: 'Substance', iconName: 'fa-solid fa-droplet'},
		{callback: generic_tag_parser, tag: 'artwork_subject', label: ' ', iconName: 'fa-solid fa-palette'},
		{callback: generic_tag_parser, tag: 'inscription', label: ' ', iconName: 'fa-solid fa-quote-left'},
		{callback: generic_tag_parser, tag: 'description', label: ' ', iconName: 'fa-solid fa-clipboard'}
	].concat(
		poiParser,
		{callback: opening_hours_parser},
		{callback: image_parser}
	);
	for (let c = 0; c < functions.length; c++) {
		const data = functions[c];
		if (data.tag && data.label) markerPopup += data.callback(element.tags, data.tag, data.label, (data.iconName || 'fa-solid fa-tag'));
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
	if ($('#settings-debug').is(':checked') && data.elements.length) console.debug('Overpass callback:', data);
	let title, type, iconName, markerPopup;
	// define poi elements
	for (let c = 0; c < data.elements.length; c++) {
		const e = data.elements[c];
		// check tags exist
		if (!e.tags || e.id in this.instance._ids) continue;
		this.instance._ids[e.id] = true;
		// get geometry outlines
		if (e.type !== 'node') {
			let outline, mems = [], optsPolygon = {
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
		let eName = e.tags['name:en'] || e.tags.name || undefined;
		if (eName && e.tags.ref) eName += ' (' + e.tags.ref + ')';
		title = type = iconName = ohState = ctState = undefined;
		if (e.tags.construction) {
			title = e.tags.construction + ' construction';
			type = 'construction';
			if (!eName) eName = e.tags['ref:planningapp'];
		}
		if (e.tags.amenity) {
			if (!title) title = e.tags.amenity;
			if (!type) type = e.tags.amenity;
			switch (e.tags.amenity) {
				case 'animal_boarding': type = 'animal_shelter'; break;
				case 'arts_centre': type = 'attraction'; iconName = 'theater'; break;
				case 'bicycle_repair_station': type = 'bicycle'; break;
				case 'cafe':
				case 'fast_food':
				case 'restaurant':
					if (e.tags.cuisine) {
						title = e.tags.cuisine;
						title += (e.tags.amenity === 'restaurant' && e.tags.takeaway === 'only') ? ' takeaway' : ' ' + e.tags.amenity;
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
						title = e.tags.display;
						iconName = 'sundial';
					}
					else if (e.tags.display) title = e.tags.display + ' ' + e.tags.amenity;
					break;
				case 'college': type = 'school'; break;
				case 'fire_station': type = 'police'; iconName = 'firetruck'; break;
				case 'place_of_worship':
					if (e.tags.religion) {
						title = e.tags.religion + (e.tags.denomination ? ' ' +  e.tags.denomination : '');
						switch (e.tags.religion) {
							case 'christian': iconName = 'church-2'; break;
							case 'buddhist': iconName = 'bouddha'; break;
							case 'muslim': iconName = 'mosquee'; break;
						}
					}
					break;
				case 'public_bookcase': type = 'library'; iconName = 'bookcase'; break;
				case 'nightclub': type = 'bar'; break;
				case 'post_box': title = (e.tags['post_box:type'] || '') + ' ' + title; break;
				case 'post_depot':
				case 'post_office': title = ' ' + e.tags.amenity; type = 'post_box'; iconName = 'postoffice'; break; // [ascii 32] force to top of results
				case 'pub': if (e.tags.microbrewery) title = 'Microbrewery'; break;
				case 'recycling':
					if (e.tags.recycling_type) {
						title = e.tags.amenity + ' ' + e.tags.recycling_type;
						if (e.tags.recycling_type === 'container') iconName = 'recyclecon';
					}
					break;
				case 'retirement_home':
				case 'social_facility':
					type = 'social_facility';
					title = e.tags.social_facility;
					if (e.tags['social_facility:for']) title = e.tags['social_facility:for'] + ' ' + title;
					break;
				case 'shelter': if (e.tags.shelter_type)
					title = e.tags.shelter_type;
					if (title.indexOf('shelter') === -1) title += ' shelter';
					break;
				case 'social_centre':
					if (e.tags.club) {
						title = (e.tags.sport ? e.tags.sport : e.tags.club) + ' club';
						type = 'club';
					}
					break;
				case 'table':
					if (e.tags.sport) {
						title = e.tags.sport + ' table';
						type = 'sport';
						iconName = 'chess';
					}
					break;
				case 'taxi':
					if (!e.tags.building) {
						title = e.tags.amenity + ' rank';
						iconName = 'taxirank';
					}
					break;
				case 'training':
					if (e.tags.training) {
						title = e.tags.training + ' ' + e.tags.amenity;
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
					title = e.tags.highway;
					iconName = 'trafficcamera';
					break;
			}
		}
		if (e.tags.historic || e.tags['historic:railway']) {
			if (e.tags['historic:railway']) e.tags.historic = 'railway_station';
			if (!title) title = 'historic ' + e.tags.historic;
			if (!type) type = 'historic';
			if (e.tags.ruins) {
				iconName = 'ruins-2';
				title = title + ' ruins';
			}
			if (e.tags.military) {
				iconName = 'war';
				switch (e.tags.military) {
					case 'bunker': iconName = 'bunker-2-2'; break;
					case 'barrier':
						iconName = 'tanktrap';
						title = 'historic ' + e.tags.barrier;
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
						title = 'memorial ' + e.tags.memorial;
						if (!iconName) {
							switch (e.tags.memorial) {
								case 'plaque': iconName = 'plaque'; break;
								case 'clock': iconName = 'clock'; break;
								case 'statue': iconName = 'statue-2'; break;
								case 'war_memorial': title = 'war memorial'; iconName = 'war_memorial'; break;
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
			if (!title) title = e.tags.man_made;
			if (!type) type = e.tags.man_made;
			if (type === 'water_tap') type = 'drinking_water';
			if (type === 'survey_point') {
				title = e.tags['survey_point:structure'];
				switch (e.tags['survey_point:structure']) {
					case 'block': iconName = 'sppillar'; break;
					case 'bracket': iconName = 'spbracket'; break;
					case 'indented_pin':
					case 'pin': iconName = 'sprivet'; break;
				}
			}
			if (type === 'outfall') iconName = 'outfall';
		}
		if (e.tags.power) {
			title = 'power ' + e.tags.power;
			iconName = 'powersubstation';
		}
		if (e.tags.shop) {
			if (e.tags.shop === 'yes') title = 'shop';
			if (!title) title = e.tags.shop;
			if (!type) type = e.tags.shop;
			if (title !== 'charity' && (e.tags.second_hand === 'yes' || e.tags.second_hand === 'only')) title = 'second hand ' + title;
			switch (e.tags.shop) {
				case 'beauty': if (e.tags.beauty) title = e.tags.beauty + ' ' + title; break;
				case 'bathroom_furnishing':
				case 'interior_decoration':
				case 'kitchen': type = 'houseware'; break;
				case 'butcher': type = 'deli'; iconName = 'butcher-2'; break;
				case 'car_parts': type = 'car_repair'; break;
				case 'department_store': iconName = 'departmentstore';
					/* fall through */
				case 'clothes': title = (e.tags.clothes && e.tags.clothes.indexOf(';') === -1 ? e.tags.clothes + ' ' : '') + title; break;
				case 'collector': type = 'games'; break;
				case 'craft': if (e.tags.craft) title = e.tags.craft; break;
				case 'e-cigarette': type = 'tobacco'; break;
				case 'frozen_food': type = 'supermarket'; break;
				case 'furniture': title = (e.tags.furniture ? e.tags.furniture + ' ' : '') + title; break;
				case 'garden_centre': type = 'florist'; break;
				case 'hairdresser':
					if (e.tags.male === 'yes') { title = 'male barber'; iconName = 'hairmale'; }
					else if (e.tags.female === 'yes') { title = 'female hairdresser'; iconName = 'hairfemale'; }
					else if (e.tags.unisex === 'yes') title = 'unisex hairdresser';
					break;
				case 'hardware': type = 'doityourself'; break;
				case 'hearing_aids': type = 'mobility'; iconName = 'hoergeraeteakustiker_22px'; break;
				case 'laundry': type = 'dry_cleaning'; break;
				case 'pet_grooming': type = 'pet'; break;
				case 'signs': type = 'copyshop'; break;
				case 'trade': if (e.tags.trade) title = e.tags.trade + ' ' + title; break;
				case 'window_blind': type = 'curtain'; break;
				case 'vacant': title = title + ' shop'; type = ''; break;
			}
			if (e.tags['service:bicycle:retail'] === 'yes') type = 'bicycle';
		}
		if (e.tags.craft) {
			if (!title) title = e.tags.craft;
			if (!type) type = e.tags.craft;
		}
		if (e.tags.tourism) {
			if (!title) title = e.tags.tourism;
			if (!type) type = e.tags.tourism;
			switch (e.tags.tourism) {
				case 'apartment': type = 'guest_house'; iconName = 'villa'; break;
				case 'artwork': if (e.tags.artwork_type) title = e.tags.artwork_type + ' ' + e.tags.tourism; break;
				case 'caravan_site': type = 'guest_house'; iconName = 'campingcar'; break;
				case 'camp_site': type = 'guest_house'; iconName = 'tents'; break;
				case 'gallery': type = 'artwork'; iconName = 'museum_paintings'; break;
				case 'hotel': type = 'guest_house'; iconName = 'hotel_0star'; break;
				case 'information':
					if (e.tags.information) {
						title = e.tags.tourism + ' ' + e.tags.information;
						switch (e.tags.information) {
							case 'board':
								if (e.tags.board_type) title = e.tags.board_type + ' ' + title;
								iconName = 'board';
								break;
							case 'guidepost': iconName = 'signpost-3'; title = e.tags.tourism + ' ' + e.tags.information; break; // [ascii 255] force to bottom of results
							case 'map':
								if (e.tags.map_size) title = e.tags.map_size + ' ' + title;
								if (e.tags.map_type && e.tags.map_type === 'toposcope') type = 'artwork';
								iconName = 'map';
								break;
							case 'office': title = ' ' + title; break; // [ascii 32] force to top of results
						}
					}
					break;
			}
		}
		if (e.tags.leisure) {
			if (!title) title = e.tags.leisure;
			if (!type) type = e.tags.leisure;
			if (e.tags.sport) {
				type = 'sport';
				title = e.tags.sport + ' ' + e.tags.leisure;
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
			if (!title) title = e.tags.natural;
			if (!type) type = e.tags.natural;
			if (type === 'peak') iconName = 'hill';
			if (type === 'wood') iconName = 'forest2';
		}
		if (e.tags.surveillance) {
			if (!type) type = e.tags.surveillance;
			if (e.tags.surveillance === 'webcam') title = type = 'webcam';
			if (type !== 'webcam') title = e.tags.surveillance + ' ' + e.tags['surveillance:type'];
		}
		if (e.tags.emergency) {
			if (!title) title = e.tags.emergency;
			if (!type) type = e.tags.emergency;
			switch (type) {
				case 'ambulance_station': type = 'police'; iconName = 'ambulance'; break;
				case 'coast_guard': type = 'police'; iconName = 'helicopter'; break;
				case 'lifeguard': type = 'police'; iconName = 'lifeguard-2'; break;
			}
		}
		if (e.tags.office) {
			if (!title && e.tags.government) title = e.tags.government + ' office';
			else if (!title) title = (e.tags.office !== 'yes') ? e.tags.office + ' office' : 'office';
			if (!type) type = e.tags.office;
			switch (type) {
				case 'financial': type = 'accountant'; break;
				case 'property_management': type = 'estate_agent'; break;
			}
		}
		if (e.tags.healthcare) {
			if (!title && e.tags['healthcare:speciality']) title = e.tags['healthcare:speciality'];
			else if (!title) title = e.tags.healthcare;
			if (!type) type = 'healthcare';
		}
		if (e.tags.listed_status) {
			if (!title || type === 'shelter') {
				if (e.tags.building && e.tags.building !== 'yes' && e.tags.building !== 'commercial' && e.tags.building !== 'public' && e.tags.building !== 'hut') title = e.tags.building;
				else if (e.tags.barrier && e.tags.barrier !== 'yes') title = e.tags.barrier;
				if (title) title = 'heritage-listed ' + title;
			}
			if (!type || type === 'shelter' || type === 'company') type = 'listed_status';
		}
		if (e.tags.route === 'bus') {
			type = e.tags.route;
			title = e.tags.route + ' route';
		}
		if (e.tags.landuse) {
			if (!title) title = e.tags.landuse;
			if (!type) type = e.tags.landuse;
			switch (e.tags.landuse) {
				case 'cemetery': iconName = 'cemetery'; break;
				case 'recreation_ground': type = 'park'; iconName = 'recreation'; break;
			}
		}
		if (e.tags.cemetery) {
			if (!title) title = e.tags.cemetery;
			switch (e.tags.cemetery) {
				case 'grave': if (!iconName) iconName = 'headstone-2'; break;
				case 'sector': iconName = 'administrativeboundary'; break;
			}
		}
		if (e.tags.boundary) {
			if (!title) title = e.tags.protection_title;
			if (!type) type = e.tags.boundary;
			if (type === 'historic') {
				iconName = 'administrativeboundary';
				title = 'historic boundary';
			}
		}
		if (e.tags.place) {
			title = e.tags.place;
			iconName = 'smallcity';
		}
		// set marker options
		const poi = pois[type];
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
		const marker = L.marker((e.type === 'node') ? new L.LatLng(e.lat, e.lon) : new L.LatLng(e.center.lat, e.center.lng), {
			// do not bounce marker: when single poi, in debug mode, over 50 markers
			bounceOnAdd: (!rQuery && !$('#settings-debug').is(':checked') && (data.elements.length < 50)),
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
		if (!title || (poi && title === poi.name.toLowerCase())) {
			if (poi) title = poi.name;
			else if (e.tags.highway) title = (e.tags.highway === 'bus_stop') ? e.tags.highway : e.tags.highway + ' highway';
			else if (e.tags.railway) title = 'railway ' + e.tags.railway;
			else if (e.tags.building === 'yes') title = 'building';
			else if (e.tags.building) title = e.tags.building;
			else if (e.tags.ref) title = e.tags.ref;
			else if (e.tags['addr:housename']) title = e.tags['addr:housename'];
			else title = '&hellip;';
		}
		if (title != '&hellip;') title = titleCase(title);
		marker._leaflet_id = e.type.slice(0, 1) + e.id;
		// tooltip
		const customTOptions = {
			direction: 'top',
			offset: [0, -40],
			interactive: poi ? poi.permTooltip : 0,
			permanent: poi ? poi.permTooltip : 0,
			opacity: (noTouch || (poi && poi.permTooltip)) ? 1 : 0
		};
		let toolTip = '<div>';
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
		toolTip += '</div><i>' + title + '</i>';
		if (e.tags.image || e.tags.wikimedia_commons) {
			const imgIcon = ((e.tags.image && e.tags.wikimedia_commons) || (e.tags.image && e.tags.image.indexOf(';') > -1) || (e.tags.wikimedia_commons && e.tags.wikimedia_commons.indexOf(';') > -1)) ? 'images' : 'image';
			toolTip += ' <i class="tooltip-icons fa-solid fa-' + imgIcon + ' fa-fw" title="' + titleCase(imgIcon) + '"></i>';
		}
		if (e.tags['wikimedia_commons:video']) toolTip += ' <i class="tooltip-icons fa fa-film fa-fw" title="Video"></i>';
		if (e.tags['wikimedia_commons:pano']) toolTip += ' <i class="tooltip-icons fa fa-street-view fa-fw" title="Photosphere view"></i>';
		// popup and tooltip
		const customPOptions = {
			maxWidth: $(window).width() >= 512 ? imgSize + 30 : imgSize,
			minWidth: (e.tags.image || e.tags.wikimedia_commons) ? imgSize : '',
			autoPan: noPermalink ? true : false,
			autoPanPaddingTopLeft: ($(window).width() < 1024) ? [20, 40] : [sidebar.width() + 50, 5],
			autoPanPaddingBottomRight: [5, 50]
		};
		markerPopup = (poi && poi.tagParser) ? poi.tagParser(e, title) : parse_tags(e, title, []);
		customTOptions.className = (ohState !== undefined) ? 'openhrs-color-' + ohState : 'openhrs-color-' + ctState;
		marker.bindPopup(markerPopup, customPOptions);
		marker.bindTooltip(toolTip, customTOptions);
		marker.addTo(iconLayer);
		// single poi
		if (rQuery) {
			if ($(window).width() < 768 && !$('.sidebar.collapsed').length) $('.sidebar-close:visible').trigger('click');
			marker.openPopup();
			markerId = marker._leaflet_id;
			setPageTitle($(marker._popup._container).find($('.popup-header h3')).text());
		}
		else if (marker._leaflet_id === markerId) marker.openPopup().stopBounce();
		// push data to results list
		marker.ohState = ohState;
		marker.ctState = ctState;
		// get facilities from popup
		marker.facilities = $('.popup-facilities', $(markerPopup))[0] ? $('.popup-facilities', $(markerPopup))[0].innerHTML : '';
		poiList.push(marker);
	}
	noPermalink = true;
	// output list of pois in sidebar
	if (poiList.length) setTimeout(pushPoiList, 250);
	if (spinner > 0) spinner--;
	else {
		$('.spinner').fadeOut(200);
		// timeout to stop double-clicking on fast loads
		setTimeout(function() { $('.pois-checkbox').removeClass('pois-loading'); }, 250);
	}
	permalinkSet();
}
// push markers into poi list
function pushPoiList(customSort) {
	let c;
	// check if location active and get distance
	if (lc._active && lc._event) for (c = 0; c < poiList.length; c++) poiList[c].distance = map.distance(lc._event.latlng, poiList[c]._origLatlng || poiList[c]._latlng);
	// sort by distance / custom / name
	poiList.sort(function(a, b) {
		if (a.distance) return (a.distance > b.distance) ? 1 : -1;
		else if (customSort) return (eval('a.' + customSort) > eval('b.' + customSort)) ? 1 : -1;
		else return (a._tooltip._content > b._tooltip._content) ? 1 : -1;
	});
	let poiResultsList = '<table>';
	for (c = 0; c < poiList.length; c++) {
		const state = (poiList[c].ohState !== undefined) ? poiList[c].ohState : poiList[c].ctState;
		const openColorTitle = (state === true || state === false) ? ' title="' + (state === true ? 'Open' : 'Closed') + '"' : '';
		let poiIcon = '';
		if (poiList[c]._icon) poiIcon = '<img alt="" src="' + poiList[c]._icon.src + '">';
		else if (poiList[c].options.className === 'circleMarker')
			poiIcon = '<i class="pois-results-circleMarker fa-solid fa-circle fa-lg fa-fw" title=' + (poiList[c].desc ? poiList[c].desc : '') + '></i>';
		else if (poiList[c].options.color)
			poiIcon = '<i style="-webkit-text-stroke:2px ' + poiList[c].options.color + ';color:' + poiList[c].options.fillColor + ';" class="fa-solid fa-circle fa-lg fa-fw" title=' + (poiList[c].desc ? poiList[c].desc : '') + '></i>';
		poiResultsList += '<tr id="' + poiList[c]._leaflet_id + '">' +
			'<td class="openhrs-color-' + state + '"' + openColorTitle + '>' + poiIcon + '</td>' +
			'<td>' + poiList[c]._tooltip._content + '</td>' +
			'<td>' + (poiList[c].facilities ? poiList[c].facilities : '') + '</td>';
		if (poiList[c].distance) {
			if ($('#settings-unit').is(':checked')) {
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
	$('#pois-results-list').html(poiResultsList).show();
	$('#pois-results').slideDown(400, function() {
		$('#pois-results-list').css('opacity', 1);
		$('#pois-results button').prop('disabled', false);
		$(this).css('pointer-events', 'auto').trigger('scroll');
		// keep checkbox in view
		if ($('.pois-checkbox input:checked').length === 1) $('.pois-checkbox input:checked').parent()[0].scrollIntoView({ block: 'center' });
	});
	$('#pois-results-list td:nth-child(3) i').tooltip(tooltipDef);
	$('.sidebar-tabs ul li [href="#pois"] .sidebar-notif').text(poiList.length).show();
	// interact with map
	$('#pois-results-list tr')
		.on('mouseenter', function() { map._layers[this.id].openTooltip(); })
		.on('mouseleave', function() { if (!map._layers[this.id]._tooltip.options.permanent) map._layers[this.id].closeTooltip(); });
	$('#pois-results-list tr').on('click', function() {
		if ($('#control-ww2').length) $('#control-ww2 input').val($('#control-ww2 input')[0].max).trigger('change');
		map._layers[this.id].openPopup();
		if ($(window).width() < 768) $('.sidebar-close:visible').trigger('click');
		else if (map._layers[this.id]._latlng) {
			// get bounds of area, focus 150px above marker and find sidebar-width to allow room for popup
			let zm = areaOutline.getLayer('o_' + this.id) ? map.getBoundsZoom(areaOutline.getLayer('o_' + this.id)._bounds.pad(0.5)) : map.getZoom();
			if (zm > 18) zm = 18;
			const px = map.project(map._layers[this.id]._latlng, zm);
			map.stop().flyTo(map.unproject([px.x -= ($(window).width() >= 1024 ? Math.round(sidebar.width()/2) : 0), px.y -= 150], zm), zm);
		}
	});
	// results table header
	const sortBy = poiList[0].distance ? '1-9' : 'a-z';
	$('#pois-results h3').html(
		poiList.length + ' result' + (poiList.length > 1 ? 's' : '') +
			($('#settings-overpass-attic').val() ? ' from ' + dateFormat($('#settings-overpass-attic').val(), 'short') : '') +
			((!customSort || poiList[0].distance) && poiList.length > 1 ? ' <i id="pois-results-sort" class="fa-solid fa-arrow-down-' + sortBy + ' fa-fw" title="Sort" onclick="poi_list_reverse(\'' + sortBy + '\')"></i>' : '')
	);
	if (poiList.length === maxOpResults) {
		$('#pois-results h3').append('<br>(maximum number of results)');
		setMsgStatus('fa-solid fa-circle-info', 'Max Results', 'Maximum number of results shown (' + maxOpResults + ').', 4);
	}
}

// templates
// main header | sub header | food hygiene rating id | osm id | wikidata id
function generic_header_parser(header, subheader, fhrs, osmId, wikidata) {
	let markerPopup = '<div class="popup-header">';
	if (osmId && !$('#settings-overpass-attic').val()) {
		markerPopup += '<a class="popup-edit popup-header-button" title="Edit on OpenStreetMap"><i class="fa-solid fa-pen-to-square fa-fw"></i></a>';
		if (wikidata) markerPopup += '<a class="popup-header-button" title="Edit Wikidata" href="https://www.wikidata.org/wiki/' + encodeURI(wikidata) + '" target="_blank" rel="noopener"><i class="fa-solid fa-barcode fa-fw"></i></a>';
		if (noIframe && localStorageAvail()) markerPopup += '<a class="popup-bookmark popup-header-button" title="Bookmark"><i class="fa-regular fa-bookmark fa-fw"></i></a>';
		if (fhrs) markerPopup += '<span class="popup-fhrs notloaded" data-fhrs="' + fhrs + '"><i class="fa-solid fa-spinner fa-spin-pulse"></i></span>';
	}
	if (header || fhrs) markerPopup += '<h3>' + (header !== undefined ? header : '&hellip;') + '</h3>';
	if (subheader) markerPopup += '<span class="popup-header-sub">' + subheader + '</span>';
	return markerPopup + '</div>';
}
const tagTmpl = '<div class="popup-tag"><i class="popup-tag-icon {iconName} fa-fw"></i><span class="popup-tag-value"><strong>{key}:</strong>{keyVal}</span></div>';
// tags | key | label | icon
function generic_tag_parser(tags, key, label, iconName) {
	let markerPopup = '', resultVal;
	// ignore implied access
	if (tags[key] && key === 'access' && tags[key] === 'yes') return markerPopup;
	else if (tags[key]) {
		if (tags[key] === 'yes') resultVal = '<i class="fa-solid fa-check fa-fw" title="yes"></i>';
		else if (tags[key] === 'no') resultVal = '<i class="fa-solid fa-xmark fa-fw" title="no"></i>';
		else if (key.indexOf('_date') > -1 || key.indexOf('date_') > -1) resultVal = dateFormat(tags[key], 'long');
		else resultVal = listTidy(tags[key]);
		markerPopup += L.Util.template(tagTmpl, { key: label, keyVal: resultVal, iconName: iconName }).replaceAll('<strong> :</strong>', '');
	}
	if ((key === 'description' || key === 'inscription' || key === 'artwork_subject') && markerPopup) markerPopup = '<span style="font-style:italic;" class="popup-tag-long theme-scroll">' + markerPopup + '</span>';
	return markerPopup;
}
function generic_website_parser(tags, key, label, iconName) {
	let markerPopup = '', websiteVal;
	if (tags[key]) {
		websiteVal = (tags[key].indexOf('://www.') > 0) ? tags[key].split('://www.')[1] : ((tags[key].indexOf('://') > 0) ? tags[key].split('://')[1] : tags[key]);
		websiteVal = websiteVal.endsWith('/') ? websiteVal.slice(0, -1) : websiteVal;
		websiteVal = '<a class="popup-tag-value-truncate" style="max-width:' + ($(window).width() >= 512 ? imgSize - 70 : imgSize - 100) + 'px;" href="' + encodeURI(tags[key]) + '" title="' + tags[key] + '" target="_blank" rel="noopener nofollow">' + websiteVal + '</a>';
		markerPopup += L.Util.template(tagTmpl, { key: label, keyVal: websiteVal, iconName: iconName });
	}
	return markerPopup;
}
// image name | image number | attribution
function generic_img_parser(img, id, attrib) {
	let url, imgTmpl;
	// if (img.startsWith('Category:')) imgTmpl = '<div class="popup-img-item">' + img + '</div>'; else
	if (img.startsWith('File:')) {
		url = img;
		img = 'https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=' + encodeURIComponent(img);
		imgTmpl = '<div id="img{id}" class="popup-img-item' + (+id === 0 ? ' notloaded' : '') + '">' +
			'<a data-fancybox="gallery" href="{img}" data-srcset="{img}&width=2560 1280w, {img}&width=1280 800w, {img}&width=800 640w"><img data-url="{url}"></a>' +
			'<div class="popup-img-attrib notloaded"><span>Image loading...</span></div>' +
		'</div>';
	}
	else imgTmpl = '<div id="img{id}" class="popup-img-item' + (+id === 0 ? ' notloaded' : '') + '">' +
			'<a data-fancybox="gallery" data-caption="' + $('<span>' + attrib + '</span>').text() + '" href="{img}"><img></a>' +
			(attrib ? '<div class="popup-img-attrib"><span>{attrib}</span></div>' : '') +
		'</div>';
	return L.Util.template(imgTmpl, { id: id, url: url, img: img, attrib: attrib });
}

// poi callback parsers
function allotment_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'user', label: 'Point of contact', iconName: 'fa-solid fa-circle-user'},
		{callback: generic_tag_parser, tag: 'plots', label: 'Plots', iconName: 'fa-solid fa-table-cells-large'},
	]);
}
function bike_parser(tags, titlePopup) {
	const bikeservices_parser = function(tags) {
		let markerPopup = '', bikeVal = '';
		for (let bikeKey in tags) if (bikeKey.startsWith('service:bicycle:') && (tags[bikeKey] === 'yes')) bikeVal += bikeKey.split(':')[2] + ', ';
		if (bikeVal) markerPopup += L.Util.template(tagTmpl, { key: 'Bicycle services', keyVal: listTidy(bikeVal, true), iconName: 'fa-solid fa-bicycle' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: bikeservices_parser},
		{callback: generic_tag_parser, tag: 'bicycle_parking', label: 'Type', iconName: 'fa-solid fa-lock'},
		{callback: generic_tag_parser, tag: 'capacity', label: 'Capacity', iconName: 'fa-solid fa-bicycle'},
	]);
}
function busstop_parser(tags, titlePopup) {
	const nextbus_parser = function(tags) {
		let markerPopup = '';
		const bearing = {
			N: 'North', E: 'East', S: 'South', W: 'West',
			NE: 'North-east', NW: 'North-west', SE: 'South-east', SW: 'South-west'
		}[tags['naptan:Bearing']];
		if (bearing) markerPopup += L.Util.template(tagTmpl, { key: 'Bearing', keyVal: bearing, iconName: 'fa-solid fa-compass' });
		if (tags['naptan:AtcoCode']) markerPopup += '<div class="popup-bustime-table theme-scroll notloaded" style="width:' + imgSize + 'px;" data-naptan="' + tags['naptan:AtcoCode'] + '">' +
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
		{callback: generic_tag_parser, tag: 'capacity:charging', label: 'EV charging spaces', iconName: 'fa-solid fa-charging-station'},
		{callback: generic_tag_parser, tag: 'maxstay', label: 'Max stay', iconName: 'fa-solid fa-hourglass'}
	]);
}
function carshop_parser(tags, titlePopup) {
	const carservices_parser = function(tags) {
		let markerPopup = '', carVal = '';
		for (let carKey in tags) if (carKey.startsWith('service:vehicle:') && (tags[carKey] === 'yes')) carVal += carKey.split(':')[2] + ', ';
		if (carVal) markerPopup += L.Util.template(tagTmpl, { key: 'Repair services', keyVal: listTidy(carVal, true), iconName: 'fa-solid fa-car' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: carservices_parser}
	]);
}
function cctv_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_website_parser, tag: 'contact:webcam', label: 'Webcam', iconName: 'fa-solid fa-camera'},
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
	const cuisine_parser = function(tags) {
		let markerPopup = '', cuisineVal = '';
		if (tags.cuisine) cuisineVal += tags.cuisine + ', ';
		if (tags.fair_trade === 'yes') cuisineVal += 'fairtrade, ';
		if (tags.breakfast === 'yes') cuisineVal += 'breakfast, ';
		if (tags.lunch === 'yes') cuisineVal += 'lunch, ';
		if (tags.ice_cream === 'yes') cuisineVal += 'ice cream, ';
		if (tags.real_ale === 'yes') cuisineVal += 'real ale, ';
		if (tags.real_cider === 'yes') cuisineVal += 'real cider, ';
		for (let cuisineKey in tags) if (cuisineKey.startsWith('diet:') && (tags[cuisineKey] === 'yes')) cuisineVal += cuisineKey.split(':')[1] + ' options, ';
		if (cuisineVal) markerPopup += L.Util.template(tagTmpl, { key: 'Cuisine', keyVal: listTidy(cuisineVal, true), iconName: 'fa-solid fa-utensils' });
		return markerPopup;
	};
	const service_parser = function(tags) {
		let markerPopup = '', serviceVal = '';
		if (tags.takeaway === 'yes') serviceVal += 'takeaway, ';
		else if (tags.takeaway === 'only') serviceVal += 'takeaway only, ';
		if (tags.delivery === 'yes') serviceVal += 'delivery, ';
		if (tags.capacity) serviceVal += 'seats ' + tags.capacity + ', ';
		if (tags.beer_garden === 'yes') serviceVal += 'beer garden, ';
		else if (tags.outdoor_seating === 'yes') serviceVal += 'outdoor seating, ';
		if (tags.reservation === 'yes') serviceVal += 'takes reservation, ';
		else if (tags.reservation === 'required') serviceVal += 'needs reservation, ';
		if (tags['website:orders']) serviceVal += '<a href="' + encodeURI(tags['website:orders']) + '" title="Ordering" target="_blank" rel="noopener">online ordering</a>, ';
		if (serviceVal) {
			serviceVal = serviceVal.substring(0, serviceVal.length - 2);
			markerPopup += L.Util.template(tagTmpl, { key: 'Service', keyVal: serviceVal, iconName: 'fa-solid fa-bag-shopping' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: cuisine_parser},
		{callback: service_parser}
	]);
}
function fuelstation_parser(tags, titlePopup) {
	const fuel_parser = function(tags) {
		let markerPopup = '', fuelVal = '';
		for (let fuelKey in tags) if (fuelKey.startsWith('fuel:') && (tags[fuelKey] === 'yes')) fuelVal += fuelKey.split(':')[1] + ', ';
		if (fuelVal) markerPopup += L.Util.template(tagTmpl, { key: 'Fuel options', keyVal: listTidy(fuelVal, true), iconName: 'fa-solid fa-oil-can' });
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'shop', label: 'Shop', iconName: 'fa-solid fa-shop'},
		{callback: fuel_parser}
	]);
}
function hotel_parser(tags, titlePopup) {
	const hotelservices_parser = function(tags) {
		let markerPopup = '', hotelVal = '';
		if (tags.stars) {
			let result = '<a href="https://www.visitengland.com/plan-your-visit/quality-assessment-and-star-ratings/visitengland-star-ratings" title="' + tags.stars + ' stars" target="_blank" rel="noopener">';
			for (let c = 0; c < tags.stars; c++) result += '<i class="fa-regular fa-star fa-fw"></i>';
			result += '</a>';
			markerPopup += L.Util.template(tagTmpl, { key: 'VisitEngland rating', keyVal: result, iconName: 'fa-solid fa-star' });
		}
		if (tags.view) hotelVal += tags.view + ' view, ';
		if (tags.balcony) hotelVal += 'balcony, ';
		if (tags.cooking) hotelVal += 'self-catering, ';
		if (tags.rooms) hotelVal += tags.rooms + ' rooms, ';
		if (hotelVal) {
			hotelVal = hotelVal.substring(0, hotelVal.length - 2);
			markerPopup += L.Util.template(tagTmpl, { key: 'Accomodation', keyVal: hotelVal, iconName: 'fa-solid fa-bed' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup,	[
		{callback: hotelservices_parser}
	]);
}
function hospital_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'emergency', label: 'Emergency', iconName: 'fa-solid fa-truck-medical'}
	]);
}
function post_parser(tags, titlePopup) {
	const postcypher_parser = function(tags) {
		let markerPopup = '';
		const royalcypher = {
			VR: 'Victoria (1837-1901)',
			EVIIR: 'Edward VII (1901-1910)',
			GR: 'George V (1910-1936)',
			EVIIIR: 'Edward VIII (1936)',
			GVIR: 'George VI (1936-1952)',
			EIIR: 'Elizabeth II (1952+)',
			no: 'none'
		}[tags.royal_cypher];
		if (royalcypher) markerPopup += L.Util.template(tagTmpl, { key: 'Royal cypher', keyVal: royalcypher, iconName: 'fa-solid fa-signature' });
		return markerPopup;
	};
	const collection_parser = function(tags) {
		let markerPopup = '';
		if (tags.collection_times) {
			let strNextChange;
			const ct = new opening_hours(tags.collection_times, { 'address':{ 'state':'England', 'country_code':'gb' } }, 1).getNextChange();
			if (ct.getDate() === new Date().getDate()) strNextChange = 'Today in ' + minToTime((ct - new Date()) / 60000) + ' (' + ct.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + ')';
			else if (ct.getDate() === new Date(new Date().getDate() + 1).getDate()) strNextChange = 'Tomorrow ' + ct.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
			else if (ct.getDate() > new Date(new Date().getDate() + 1).getDate()) strNextChange = ct.toLocaleDateString(lang, { weekday: 'long' }) + ' ' + ct.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
			ctState = (ct.getDate() === new Date().getDate() && ct.getDate() >= new Date().getDate()) ? true : false;
			markerPopup += L.Util.template(tagTmpl, { key: 'Next collection', keyVal: strNextChange + '<br><span class="comment">(' + tags.collection_times + ')</span>', iconName: 'popup-openhrs-color-' + ctState + ' fa-solid fa-clock' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: postcypher_parser},
		{callback: generic_tag_parser, tag: 'post_box:mounting', label: 'Mounted on', iconName: 'fa-solid fa-box-archive'},
		{callback: collection_parser}
	]);
}
function socialf_parser(tags, titlePopup) {
	const socialfservices_parser = function(tags) {
		let markerPopup = '', socialVal = '';
		if (tags.capacity) socialVal += tags.capacity + ' capacity; ';
		if (socialVal) {
			socialVal = socialVal.replaceAll('_', ' ').substring(0, socialVal.length - 2);
			markerPopup += L.Util.template(tagTmpl, { key: 'Social facility', keyVal: socialVal, iconName: 'fa-solid fa-users' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: socialfservices_parser}
	]);
}
function surveyp_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'ref', label: 'Bracket number', iconName: 'fa-solid fa-hashtag'},
		{callback: generic_tag_parser, tag: 'ele', label: 'Elevation (m above sea)', iconName: 'fa-solid fa-arrow-up'},
		{callback: generic_tag_parser, tag: 'height', label: 'Height (m above ground)', iconName: 'fa-solid fa-arrow-up'},
		{callback: generic_tag_parser, tag: 'survey_point:levelling_date', label: 'Levelling date', iconName: 'fa-solid fa-calendar'},
		{callback: generic_tag_parser, tag: 'survey_point:verified_date', label: 'Verified date', iconName: 'fa-solid fa-calendar'}
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
	const eduinfo_parser = function(tags) {
		let markerPopup = '', eduVal = '';
		if (tags.min_age && tags.max_age) eduVal += 'Ages ' + tags.min_age + '-' + tags.max_age + ', ';
		if (tags.capacity) eduVal += 'Capacity ' + tags.capacity + ', ';
		if (tags["school:type"]) eduVal += titleCase(tags["school:type"]) + ', ';
		if (tags.denomination) eduVal += titleCase(tags.denomination) + ', ';
		if (eduVal) {
			eduVal = eduVal.substring(0, eduVal.length - 2);
			markerPopup += L.Util.template(tagTmpl, { key: 'Education details', keyVal: eduVal, iconName: 'fa-solid fa-school' });
		}
		return markerPopup;
	};
	return parse_tags(tags, titlePopup, [
		{callback: eduinfo_parser}
	]);
}
function worship_parser(tags, titlePopup) {
	return parse_tags(tags, titlePopup, [
		{callback: generic_tag_parser, tag: 'service_times', label: 'Service times', iconName: 'fa-solid fa-clock'}
	]);
}

// popup image elements
function getWikiAttrib(element) {
	// https://commons.wikimedia.org/wiki/Commons:API
	// get image attribution
	if (element.find('img').data('url') && element.find('img').data('url').startsWith('File:')) {
		const img = element.find('img').data('url');
		$.ajax({
			url: 'https://commons.wikimedia.org/w/api.php',
			dataType: 'jsonp',
			cache: true,
			data: { action: 'query', prop: 'imageinfo', iiprop: 'extmetadata', titles: img, format: 'json' },
			success: function(result) {
				if (!result.query.pages[-1]) {
					const imgAttrib = result.query.pages[Object.keys(result.query.pages)[0]].imageinfo['0'].extmetadata;
					const imgArtist = $('<span>' + imgAttrib.Artist.value + '</span>').text();
					const imgDate = new Date(imgAttrib.DateTimeOriginal ? imgAttrib.DateTimeOriginal.value : imgAttrib.DateTime.value).getFullYear();
					const imgAttribUrl = '<a href="https://commons.wikimedia.org/wiki/' + encodeURI(img) + '" title="Wikimedia Commons" target="_blank" rel="noopener">' +
						(imgDate ? imgDate + ' | ' : '') + '&copy; ' + imgArtist + ' | ';
					element.find($('.popup-img-attrib')).html(imgAttribUrl + imgAttrib.LicenseShortName.value + '</a>');
					element.find('a').data('caption', 'Wikimedia Commons: ' + imgAttribUrl + imgAttrib.UsageTerms.value + '</a>');
				}
				else element.find($('.popup-img-attrib')).html('Error: Attribution not found');
				element.find($('.popup-img-attrib')).removeClass('notloaded');
				// set the popup content so it includes dynamically loaded content
				if (markerId && !element.find($('.notloaded')).length) map._layers[markerId].setPopupContent();
				if ($('#settings-debug').is(':checked')) console.debug('Wikimedia-attrib:', result);
			},
			error: function() { if ($('#settings-debug').is(':checked')) console.debug('ERROR WIKIMEDIA-ATTRIB:', encodeURI(this.url)); }
		});
	}
}
function show_img_controls(imgMax, img360, vid) {
	// add image navigation controls to popup
	// check if user has already seen bouncing icons
	const bouncedicon = (localStorageAvail() && window.localStorage.tutorial.indexOf('bouncedicon') === -1) ? ' fa-bounce' : '';
	let ctrlTmpl = '<div class="popup-navigate">', x;
	if (vid && vid.length) for (x = 0; x < vid.length; x++) {
		if (vid[x].startsWith('File:') && vid[x].endsWith('webm')) ctrlTmpl +=
			'<a class="vid notloaded" title="Video" style="display:' + ((x === 0) ? 'initial' : 'none') + ';" data-caption="' + vid[x] + '" data-fancybox="vid" data-base-class="noslideshow" data-loop="false"' +
				'data-type="iframe" data-animation-effect="circular" href="https://commons.wikimedia.org/wiki/' + encodeURIComponent(vid[x]) + '?embedplayer=yes">' +
				'<i style="min-width:25px;" class="fa-solid fa-film fa-fw' + bouncedicon + '"></i>' +
			'</a>';
	}
	if (img360 && img360.length) for (x = 0; x < img360.length; x++) {
		if (img360[x].startsWith('File:')) ctrlTmpl +=
			'<a class="pano notloaded" title="Photosphere" style="display:' + ((x === 0) ? 'initial' : 'none') + ';" data-caption="' + img360[x] + '" data-fancybox="pano" data-base-class="noslideshow" data-loop="false"' +
				'data-type="iframe" data-animation-effect="circular" data-src="assets/pannellum/pannellum.htm#config=config.json&panorama=' + encodeURIComponent(img360[x]) + '" href="javascript:;">' +
				'<i style="min-width:25px;" class="fa-solid fa-street-view fa-fw' + bouncedicon + '"></i>' +
			'</a>';
	}
	if (imgMax > 1) ctrlTmpl +=
		'<span class="theme-color"><a title="Previous image" onclick="navImg(0);"><i class="fa-solid fa-square-caret-left fa-fw"></i></a></span>' +
		'<i class="popup-navigate-count fa-solid fa-1 fa-fw"></i>/<i class="fa-solid fa-' + imgMax + ' fa-fw"></i>' +
		'<span class="theme-color"><a title="Next image" onclick="navImg(1);"><i class="fa-solid fa-square-caret-right fa-fw"></i></a></span>';
	return ctrlTmpl + '</div>';
}
function navImg(direction) {
	if (!$('.popup-img-item').is(':animated')) {
		// get the current and last image
		const cID = parseInt($('.popup-img-item:visible').attr('id').split('img')[1]);
		const lID = parseInt($('.popup-img-item').last().attr('id').split('img')[1]);
		// get the next image
		const swapImg = function(nID) {
			$('.popup-img-item#img' + cID).fadeOut(200, function() { $('.popup-img-item#img' + nID).fadeIn(200); });
			$('.popup-navigate-count').removeClass().addClass('popup-navigate-count fa-solid fa-fw fa-' + parseInt(nID+1));
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
	str = str.replaceAll(';', ', ').replaceAll('_', ' ');
	if (str === str.toUpperCase() && force === undefined) return str;
	else return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
function listTidy(str, trunc) {
	// truncate trail end, replace semi-colon non-spaced lists with spaced commas, replace underscores with dashes
	if (trunc) str = str.substring(0, str.length - 2);
	return str.replace(/;(?=\S)/g, ', ').replaceAll('_', '-');
}
function dateFormat(dtStr, style) {
	// parse ISO 8601 dates using local offset
	if (dtStr.indexOf('T') === 10) dtStr = new Date(new Date(dtStr).setHours(new Date(dtStr).getHours()-new Date(dtStr).getTimezoneOffset()/60)).toISOString().replace('T', ' ').substring(0, 16);
	const dtFrmt = dtStr.split('-').length - 1;
	let tm, dt = new Date(dtStr);
	// check for time
	tm = (dtStr.indexOf(':') > -1) ? tm = new Date(dtStr).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) : '';
	if (tm === 'Invalid Date') tm = '';
	else if (tm) {
		tm = ', ' + tm;
		dtStr = dtStr.split(' ')[0];
	}
	if (style === 'long') {
		if (dtFrmt === 2) dt = dt.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
		else if (dtFrmt === 1) dt = dt.toLocaleDateString(lang, { month: 'long', year: 'numeric' });
		else dt = dtStr;
		if (dt.indexOf('/') > -1) style = 'short';
	}
	if (style === 'short') {
		if (dtFrmt === 2) dt = dt.toLocaleDateString(lang);
		else if (dtFrmt === 1) dt = dt.toLocaleDateString(lang).slice(-7, 10);
		else dt = dtStr;
	}
	if (dt === 'Invalid Date' || dt === undefined) dt = dtStr;
	return dt + tm;
}
function minToTime(tmStr) {
	// parse minutes to hours and minutes
	tmStr = Math.round(tmStr);
	const m = tmStr % 60;
	const h = (tmStr - m) / 60;
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
function confirmDialog(e) {
	return window.confirm('This will open an external website:\n\n' + $(e).attr('href'));
}
