// all group POIs that show up on tab
// comments below indicate group and colour-codes of icons, non-specific poi colour - eaecee (all for use on mapicons.mapsmarker.com)
// array name must be used in query key (e.g. VIEWPOINT: {query: 'nwr[tourism=VIEWPOINT]'})

var pois = {

	// LEISURE-TOURISM - 99a3a4 - 874ea0 - e74d3c - 239b56 - 2e86c1
	
	attraction: {
		name: 'Attraction',
		query: 'way[name~"^De La Warr Pavilion$|^Bexhill Museum$|^Egerton Park$|^Murmurations Gallery$|^Manor Gardens$|^Galley Hill Open Space$"];',
		iconName: 'star-3',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'attraction']
	},

	viewpoint: {
		name: 'Viewpoint',
		query: 'node[tourism=viewpoint];',
		iconName: 'panoramicview',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'viewpoint']
	},

	webcam: {
		name: 'Webcam',
		query: 'node[surveillance=webcam];',
		iconName: 'webcam',
		catName: 'Leisure-Tourism',
		tagKeyword: ['webcam', 'surveillance']
	},

	bus: {
		name: 'Bus Routes',
		query: 'relation[route=bus];',
		iconName: 'bus',
		catName: 'Leisure-Tourism',
		tagKeyword: ['community', 'bus', 'route'],
		hide: 1
	},

	information: {
		name: 'Information',
		query: 'nwr[information][information!~guidepost][~"^ref$|^name$"~"."];',
		iconName: 'information',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'information'],
		tagParser: info_parser,
		hide: 1
	},

	guest_house: {
		name: 'Where to stay',
		query: 'nwr[tourism~"guest_house|hotel|apartment|caravan_site"];',
		iconName: 'bed_breakfast1-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'apartment', 'self-cater', 'bed-and-breakfast', 'hotel', 'guest-house', 'lodge', 'sleep', 'caravan-site', 'camp'],
		tagParser: hotel_parser
	},

	museum: {
		name: 'Museum',
		query: 'nwr[tourism=museum];',
		iconName: 'museum_archeological',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'museum'],
		hide: 1
	},

	artwork: {
		name: 'Public Artwork',
		query: 'nwr[tourism~"artwork|gallery"];nwr[map_type=toposcope];',
		iconName: 'publicart',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'artwork', 'sculpture'],
		tagParser: artwork_parser
	},

	historic: {
		name: 'Historic',
		query: 'nwr[historic][historic!~boundary_stone];',
		iconName: 'historic',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'historic', 'memorial', 'plaque'],
		tagParser: historic_parser
	},

	listed_status: {
		name: 'Heritage-Listed',
		query: 'nwr[HE_ref];',
		iconName: 'house',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'listed', 'historic', 'heritage']
	},

	park: {
		name: 'Park',
		query: 'way[leisure~"park|common|nature_reserve"];',
		iconName: 'urbanpark',
		catName: 'Leisure-Tourism',
		tagKeyword: ['park', 'common', 'open-space', 'green', 'nature-reserve']
	},

	playground: {
		name: 'Playground',
		query: 'nwr[leisure=playground][name];',
		iconName: 'playground',
		catName: 'Leisure-Tourism',
		tagKeyword: ['playground', 'park', 'open-space', 'kids', 'children'],
		hide: 1
	},

	picnic_table: {
		name: 'Picnic-Table',
		query: 'node[leisure=picnic_table];',
		iconName: 'picnic-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['picnic'],
		hide: 1
	},

	shelter: {
		name: 'Shelter',
		query: 'nwr[amenity=shelter];',
		iconName: 'shelter',
		catName: 'Leisure-Tourism',
		tagKeyword: ['picnic', 'shelter'],
		tagParser: shelter_parser,
		hide: 1
	},

	allotments: {
		name: 'Allotment',
		query: 'way[landuse=allotments];',
		iconName: 'soil',
		catName: 'Leisure-Tourism',
		tagKeyword: ['allotment', 'garden'],
		tagParser: allotment_parser,
		hide: 1
	},

	club: {
		name: 'Club',
		query: 'nwr[club];',
		iconName: 'conversation-map-icon',
		catName: 'Leisure-Tourism',
		tagKeyword: ['hobby', 'social', 'events', 'venue', 'sport', 'club'],
		tagParser: club_parser,
		hide: 1
	},

	recreation: {
		name: 'Recreation',
		query: 'way[~"."~"^recreation_ground$|^golf_course$|^sports_centre$|^horse_riding$"][name][!club][access!~private];',
		iconName: 'recreation',
		catName: 'Leisure-Tourism',
		tagKeyword: ['recreation', 'sport', 'football', 'golf', 'cricket', 'swimming pool', 'horse riding', 'motocross', 'park', 'open-space', 'green'],
		hide: 1
	},

	fitness_centre: {
		name: 'Fitness Gym',
		query: 'nwr[leisure~"fitness_centre|fitness_station"];',
		iconName: 'weights',
		catName: 'Leisure-Tourism',
		tagKeyword: ['fitness', 'leisure', 'gym', 'sport', 'weight-lifting'],
		hide: 1
	},

	boat_rental: {
		name: 'Boat Rental',
		query: 'nwr[amenity=boat_rental];',
		iconName: 'rowboat',
		catName: 'Leisure-Tourism',
		tagKeyword: ['boat', 'rental'],
		hide: 1
	},

	amusement_arcade: {
		name: 'Amusement Arcade',
		query: 'nwr[leisure=amusement_arcade];',
		iconName: 'casino-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['amusement-arcade', 'gamble'],
		hide: 1
	},

	// AMENITIES - 85929e - 7e5109 - 2980b9 - d4ac0d - 45b39d

	dog: {
		name: 'Dog Friendly',
		query: 'nwr[dog=yes];',
		iconName: 'dogs_leash',
		catName: 'Amenities',
		tagKeyword: ['dog'],
		hide: 1
	},

	fairtrade: {
		name: 'Fairtrade',
		query: 'nwr[fair_trade=yes];',
		iconName: 'fairtrade',
		catName: 'Amenities',
		tagKeyword: ['fairtrade'],
		hide: 1
	},

	cafe: {
		name: 'Cafe',
		query: 'nwr[amenity=cafe];',
		iconName: 'coffee',
		catName: 'Amenities',
		tagKeyword: ['cafe', 'tea', 'coffee', 'food', 'eat', 'breakfast', 'lunch', 'sandwich', 'cake', 'snacks', 'drink'],
		tagParser: food_parser
	},

	restaurant: {
		name: 'Restaurant',
		query: 'nwr[amenity=restaurant];',
		iconName: 'restaurant',
		catName: 'Amenities',
		tagKeyword: ['restaurant', 'food', 'eat', 'takeaway', 'dine', 'lunch'],
		tagParser: food_parser
	},

	fast_food: {
		name: 'Fast-Food',
		query: 'nwr[amenity=fast_food];',
		iconName: 'fastfood',
		catName: 'Amenities',
		tagKeyword: ['fast-food', 'eat', 'burger', 'chips', 'kebab', 'pizza'],
		tagParser: food_parser
	},

	ice_cream: {
		name: 'Ice-Cream',
		query: 'nwr[ice_cream=yes];',
		iconName: 'icecream',
		catName: 'Amenities',
		tagKeyword: ['ice-cream']
	},

	pub: {
		name: 'Pub',
		query: 'nwr[amenity=pub];',
		iconName: 'bar',
		catName: 'Amenities',
		tagKeyword: ['pub', 'drink', 'beer', 'alcohol', 'food', 'snacks', 'microbrewery'],
		tagParser: food_parser
	},

	bar: {
		name: 'Bar/Nightclub',
		query: 'nwr[amenity~"bar|nightclub"];',
		iconName: 'bar_coktail',
		catName: 'Amenities',
		tagKeyword: ['bar', 'nightclub', 'cocktail', 'drink', 'dance', 'alcohol', 'wine']
	},

	marketplace: {
		name: 'Marketplace',
		query: 'nwr[amenity=marketplace];',
		iconName: 'market',
		catName: 'Amenities',
		tagKeyword: ['market', 'greengrocer', 'fruit', 'vegetables', 'cheese', 'meat'],
		hide: 1
	},

	toilets: {
		name: 'Public Toilets',
		query: 'nwr[amenity=toilets];',
		iconName: 'toilets',
		catName: 'Amenities',
		tagKeyword: ['toilet', 'water-closet', 'restroom', 'baby-change', 'lavatory', 'bog'],
		tagParser: toilet_parser
	},

	atm: {
		name: 'ATM',
		query: 'node[amenity=atm];',
		iconName: 'atm_pound',
		catName: 'Amenities',
		tagKeyword: ['ATM', 'bank', 'money', 'cash-point'],
		tagParser: atm_parser
	},

	telephone: {
		name: 'Telephone-Box',
		query: 'node[amenity=telephone];',
		iconName: 'telephone',
		catName: 'Amenities',
		tagKeyword: ['telephone', 'emergency', 'help'],
		tagParser: telephone_parser,
		hide: 1
	},

	post_box: {
		name: 'Post-Box/Office',
		query: 'node[amenity~"post_box|post_office"];',
		iconName: 'postal',
		catName: 'Amenities',
		tagKeyword: ['post', 'letter', 'mail'],
		tagParser: post_parser,
		hide: 1
	},

	water_tap: {
		name: 'Water-Tap',
		query: 'node[man_made=water_tap][access!~private];',
		iconName: 'drinkingwater',
		catName: 'Amenities',
		tagKeyword: ['drink', 'tap', 'water'],
		tagParser: tap_parser,
		hide: 1
	},

	recycling: {
		name: 'Recycling',
		query: 'nwr[amenity=recycling];',
		iconName: 'recycle',
		catName: 'Amenities',
		tagKeyword: ['recycle', 'dump', 'refuse', 'rubbish', 'waste'],
		hide: 1
	},

	defibrillator: {
		name: 'Defibrillator',
		query: 'node[emergency=defibrillator];',
		iconName: 'aed-2',
		catName: 'Amenities',
		tagKeyword: ['defibrillator', 'AED', 'emergency', 'help'],
		tagParser: defib_parser,
		hide: 1
	},

	grit_bin: {
		name: 'Grit-Bin',
		query: 'node[amenity=grit_bin];',
		iconName: 'roadtype_gravel',
		catName: 'Amenities',
		tagKeyword: ['grit-bin', 'snow'],
		hide: 1
	},

	parking: {
		name: 'Car-Parking',
		query: 'nwr[amenity=parking][access=yes];',
		iconName: 'parking',
		catName: 'Amenities',
		tagKeyword: ['car-parking', 'motor'],
		tagParser: carpark_parser
	},

	bicycle_parking: {
		name: 'Bicycle-Parking',
		query: 'node[amenity=bicycle_parking];',
		iconName: 'parking_bicycle',
		catName: 'Amenities',
		tagKeyword: ['bike-parking', 'bicycle'],
		tagParser: bikepark_parser,
		hide: 1
	},

	taxi: {
		name: 'Taxi',
		query: 'nwr[amenity=taxi];',
		iconName: 'taxi',
		catName: 'Amenities',
		tagKeyword: ['taxi', 'transport'],
		tagParser: taxi_parser,
		hide: 1
	},

	fuel: {
		name: 'Fuel',
		query: 'nwr[amenity=fuel];',
		iconName: 'fillingstation',
		catName: 'Amenities',
		tagKeyword: ['fuel', 'gas', 'petrol', 'unleaded', 'diesel', 'motor', 'station'],
		tagParser: fuelstation_parser,
		hide: 1
	},

	car_repair: {
		name: 'Car-Repair/MOT',
		query: 'nwr[shop=car_repair];',
		iconName: 'carrepair',
		catName: 'Amenities',
		tagKeyword: ['repair', 'garage', 'tyres', 'mechanic', 'motor', 'car', 'parts'],
		tagParser: carshop_parser,
		hide: 1
	},

	car_rental: {
		name: 'Car-Rental',
		query: 'nwr[amenity=car_rental];',
		iconName: 'carrental',
		catName: 'Amenities',
		tagKeyword: ['car-rental', 'motor'],
		hide: 1
	},

	car_wash: {
		name: 'Car-Wash',
		query: 'nwr[amenity=car_wash];',
		iconName: 'carwash',
		catName: 'Amenities',
		tagKeyword: ['car-wash', 'motor'],
		hide: 1
	},

	veterinary: {
		name: 'Veterinary',
		query: 'nwr[amenity=veterinary];',
		iconName: 'veterinary',
		catName: 'Amenities',
		tagKeyword: ['veterinary', 'pet', 'animals'],
		hide: 1
	},

	animal_shelter: {
		name: 'Animal Kennel',
		query: 'nwr[amenity~"animal_shelter|animal_boarding"];',
		iconName: 'animal-shelter-export',
		catName: 'Amenities',
		tagKeyword: ['kennel', 'shelter', 'board', 'pet', 'cat', 'dog', 'animal'],
		hide: 1
	},

	// SERVICES - 2874a6 - a04000 - 1abc9c - af7ac5

	police: {
		name: 'Emergency',
		query: 'nwr[~"^amenity$|^emergency$"~"^police$|^fire_station$|^ambulance_station$"];',
		iconName: 'police2',
		catName: 'Services',
		tagKeyword: ['police', 'fire', 'ambulance', 'help', 'emergency']
	},

	townhall: {
		name: 'Town-Hall',
		query: 'nwr[amenity=townhall];',
		iconName: 'townhouse',
		catName: 'Services',
		tagKeyword: ['townhall', 'administration', 'council', 'government'],
		hide: 1
	},

	community_centre: {
		name: 'Community-Centre',
		query: 'nwr[amenity=community_centre];',
		iconName: 'communitycentre',
		catName: 'Services',
		tagKeyword: ['community-centre', 'meet', 'events-venue', 'social'],
		hide: 1
	},

	bank: {
		name: 'Bank',
		query: 'nwr[amenity=bank];',
		iconName: 'bank_pound',
		catName: 'Services',
		tagKeyword: ['bank', 'money'],
		hide: 1
	},

	library: {
		name: 'Library',
		query: 'nwr[amenity~"library|public_bookcase"];',
		iconName: 'library',
		catName: 'Services',
		tagKeyword: ['library', 'books', 'read', 'bookcase']
	},

	jobcentre: {
		name: 'Job Centre',
		query: 'nwr[amenity=jobcentre];',
		iconName: 'workoffice',
		catName: 'Services',
		tagKeyword: ['job', 'employment'],
		hide: 1
	},

	school: {
		name: 'Education',
		query: 'nwr[amenity~"school|college"][name];',
		iconName: 'school2',
		catName: 'Services',
		tagKeyword: ['school', 'college', 'education'],
		tagParser: school_parser,
		hide: 1
	},

	kindergarten: {
		name: 'Nursery',
		query: 'nwr[amenity=kindergarten];',
		iconName: 'daycare',
		catName: 'Services',
		tagKeyword: ['daycare', 'kindergarten', 'nursery'],
		tagParser: school_parser,
		hide: 1
	},

	place_of_worship: {
		name: 'Place of Worship',
		query: 'nwr[amenity=place_of_worship];',
		iconName: 'prayer',
		catName: 'Services',
		tagKeyword: ['church', 'mosque', 'worship', 'prayer', 'religion'],
		tagParser: worship_parser
	},

	social_facility: {
		name: 'Social-Facility',
		query: 'nwr[amenity~"social_facility|retirement_home"];',
		iconName: 'sozialeeinrichtung',
		catName: 'Services',
		tagKeyword: ['care', 'retirement', 'nurse', 'home', 'social-facility', 'sheltered-house'],
		tagParser: socialf_parser,
		hide: 1
	},

	events_venue: {
		name: 'Events-Venue',
		query: 'nwr[amenity=events_venue];',
		iconName: 'dancinghall',
		catName: 'Services',
		tagKeyword: ['hire', 'events-venue', 'rent'],
		hide: 1
	},

	hospital: {
		name: 'Hospital',
		query: 'nwr[amenity=hospital];',
		iconName: 'hospital-building',
		catName: 'Services',
		tagKeyword: ['hospital', 'help', 'medical'],
		tagParser: hospital_parser
	},

	doctors: {
		name: 'Doctor',
		query: 'nwr[amenity=doctors];',
		iconName: 'medicine',
		catName: 'Services',
		tagKeyword: ['doctor', 'help', 'medical'],
		hide: 1
	},

	dentist: {
		name: 'Dentist',
		query: 'nwr[amenity=dentist];',
		iconName: 'dentist',
		catName: 'Services',
		tagKeyword: ['dentist', 'teeth'],
		hide: 1
	},

	healthcare: {
		name: 'Healthcare',
		query: 'nwr[healthcare];',
		iconName: 'medicalstore',
		catName: 'Services',
		tagKeyword: ['healthcare', 'medical', 'therapy', 'clinic', 'chiropractic', 'osteopathy'],
		tagParser: healthcare_parser,
		hide: 1
	},

	pharmacy: {
		name: 'Pharmacy',
		query: 'nwr[amenity=pharmacy];',
		iconName: 'drugstore',
		catName: 'Services',
		tagKeyword: ['pharmacy', 'chemist', 'drugstore']
	},

	mobility: {
		name: 'Mobility/Hearing',
		query: 'nwr[shop~"mobility|hearing_aids"];',
		iconName: 'retirement_home',
		catName: 'Services',
		tagKeyword: ['mobility', 'wheelchair', 'deaf', 'disabled'],
		hide: 1
	},

	funeral_directors: {
		name: 'Funeral Directors',
		query: 'nwr[shop=funeral_directors];',
		iconName: 'crematorium',
		catName: 'Services',
		tagKeyword: ['funeral-directors'],
		hide: 1
	},

	estate_agent: {
		name: 'Property',
		query: 'nwr[office~"estate_agent|property_management"];',
		iconName: 'apartment-2',
		catName: 'Services',
		tagKeyword: ['estate-agent', 'property'],
		hide: 1
	},

	accountant: {
		name: 'Accountant',
		query: 'nwr[office~"accountant|financial"];',
		iconName: 'coins',
		catName: 'Services',
		tagKeyword: ['accountant', 'financial', 'money'],
		hide: 1
	},

	insurance: {
		name: 'Insurance',
		query: 'nwr[office=insurance];',
		iconName: 'umbrella-2',
		catName: 'Services',
		tagKeyword: ['insurance'],
		hide: 1
	},

	lawyer: {
		name: 'Solicitor',
		query: 'nwr[office=lawyer];',
		iconName: 'court',
		catName: 'Services',
		tagKeyword: ['lawyer', 'solicitor'],
		hide: 1
	},

	// SHOPS - 1b4f72 - e74c3c - 117864 - a06464 - 52be80 - b9770e

	supermarket: {
		name: 'Supermarket',
		query: 'nwr[shop=supermarket];',
		iconName: 'supermarket',
		catName: 'Shops',
		tagKeyword: ['supermarket', 'food']
	},

	convenience: {
		name: 'Convenience',
		query: 'nwr[shop=convenience];',
		iconName: 'conveniencestore',
		catName: 'Shops',
		tagKeyword: ['convenience', 'corner-shop']
	},

	newsagent: {
		name: 'Newsagent',
		query: 'nwr[shop=newsagent];',
		iconName: 'newsagent',
		catName: 'Shops',
		tagKeyword: ['newsagent', 'corner-shop']
	},

	greengrocer: {
		name: 'Greengrocer',
		query: 'nwr[shop=greengrocer];',
		iconName: 'fruits',
		catName: 'Shops',
		tagKeyword: ['greengrocer', 'fruit', 'vegetables'],
		hide: 1
	},

	bakery: {
		name: 'Bakery',
		query: 'nwr[shop=bakery];',
		iconName: 'bread',
		catName: 'Shops',
		tagKeyword: ['bakery', 'bread', 'cake']
	},

	deli: {
		name: 'Butcher/Deli',
		query: 'nwr[shop~"deli|butcher"];',
		iconName: 'farmstand',
		catName: 'Shops',
		tagKeyword: ['butcher', 'meat', 'delicatessen'],
		hide: 1
	},

	seafood: {
		name: 'Seafood',
		query: 'nwr[shop=seafood];',
		iconName: 'shop_fish',
		catName: 'Shops',
		tagKeyword: ['seafood', 'fish'],
		hide: 1
	},

	confectionery: {
		name: 'Confectionery',
		query: 'nwr[shop=confectionery];',
		iconName: 'candy',
		catName: 'Shops',
		tagKeyword: ['sugar', 'sweets', 'candy', 'confectionery'],
		hide: 1
	},

	alcohol: {
		name: 'Alcohol',
		query: 'nwr[shop=alcohol];',
		iconName: 'liquor',
		catName: 'Shops',
		tagKeyword: ['alcohol', 'liquor', 'beer', 'wine', 'spirits', 'drink'],
		hide: 1
	},

	tobacco: {
		name: 'Cigarettes',
		query: 'nwr[shop~"tobacco|e-cigarette"];',
		iconName: 'smoking',
		catName: 'Shops',
		tagKeyword: ['tobacco', 'e-cigarette', 'smoke', 'vape'],
		hide: 1
	},

	bookmaker: {
		name: 'Betting',
		query: 'nwr[shop=bookmaker];',
		iconName: 'cup',
		catName: 'Shops',
		tagKeyword: ['bookmaker', 'bet', 'gamble'],
		hide: 1
	},

	variety_store: {
		name: 'Variety-Store',
		query: 'nwr[shop=variety_store];',
		iconName: 'mall',
		catName: 'Shops',
		tagKeyword: ['variety', 'pound', '99p', 'supplies', 'toys', 'confectionery'],
		hide: 1
	},

	copyshop: {
		name: 'Printers',
		query: 'nwr[shop~"copyshop|signs"];',
		iconName: 'printer-2',
		catName: 'Shops',
		tagKeyword: ['copyshop', 'printers', 'signs'],
		hide: 1
	},

	stationery: {
		name: 'Stationery',
		query: 'nwr[shop=stationery];',
		iconName: 'pens',
		catName: 'Shops',
		tagKeyword: ['stationery', 'supplies'],
		hide: 1
	},

	doityourself: {
		name: 'DIY/Hardware',
		query: 'nwr[shop~"doityourself|hardware"];',
		iconName: 'tools',
		catName: 'Shops',
		tagKeyword: ['doityourself', 'hardware', 'diy', 'tools'],
		hide: 1
	},

	clothes: {
		name: 'Clothes',
		query: 'nwr[shop~"clothes|boutique|department_store"];',
		iconName: 'clothers_female',
		catName: 'Shops',
		tagKeyword: ['clothes', 'boutique', 'department-store'],
		tagParser: clothes_parser
	},

	tailor: {
		name: 'Tailor',
		query: 'nwr[shop=tailor];',
		iconName: 'tailor',
		catName: 'Shops',
		tagKeyword: ['clothes', 'tailor'],
		hide: 1
	},

	charity: {
		name: 'Charity',
		query: 'nwr[shop=charity];nwr[charity=yes];',
		iconName: 'charity',
		catName: 'Shops',
		tagKeyword: ['charity', 'clothes', 'books', 'toys', 'furniture', 'crafts', 'second-hand'],
		hide: 1
	},

	shoes: {
		name: 'Shoes',
		query: 'nwr[shop=shoes];',
		iconName: 'shoes',
		catName: 'Shops',
		tagKeyword: ['shoes', 'footwear'],
		hide: 1
	},

	houseware: {
		name: 'House/Decoration',
		query: 'nwr[shop~"houseware|interior_decoration|bathroom_furnishing|kitchen"];',
		iconName: 'kitchen',
		catName: 'Shops',
		tagKeyword: ['interior-decoration', 'houseware', 'bathroom', 'kitchen'],
		hide: 1
	},

	furniture: {
		name: 'Furniture',
		query: 'nwr[shop=furniture];',
		iconName: 'homecenter',
		catName: 'Shops',
		tagKeyword: ['furniture'],
		hide: 1
	},

	carpet: {
		name: 'Carpet-Store',
		query: 'nwr[shop=carpet];',
		iconName: 'textiles',
		catName: 'Shops',
		tagKeyword: ['carpet', 'floor'],
		hide: 1
	},

	bed: {
		name: 'Bed-Store',
		query: 'nwr[shop=bed];',
		iconName: 'lodging-2',
		catName: 'Shops',
		tagKeyword: ['bed', 'mattress'],
		hide: 1
	},

	curtain: {
		name: 'Curtain/Blind',
		query: 'nwr[shop~"curtain|window_blind"];',
		iconName: 'curtain',
		catName: 'Shops',
		tagKeyword: ['curtain', 'blinds', 'windows'],
		hide: 1
	},
	
	glaziery: {
		name: 'Glaziery',
		query: 'nwr[shop=glaziery];',
		iconName: 'glazer',
		catName: 'Shops',
		tagKeyword: ['windows', 'glazier'],
		hide: 1
	},

	jewelry: {
		name: 'Jewellery',
		query: 'nwr[shop=jewelry];',
		iconName: 'jewelry',
		catName: 'Shops',
		tagKeyword: ['jewellery', 'watches', 'rings']
	},

	bag: {
		name: 'Bag',
		query: 'nwr[shop=bag];',
		iconName: 'bags',
		catName: 'Shops',
		tagKeyword: ['handbag'],
		hide: 1
	},

	watches: {
		name: 'Watches',
		query: 'nwr[shop=watches];',
		iconName: 'watch',
		catName: 'Shops',
		tagKeyword: ['watches', 'clock'],
		hide: 1
	},

	hairdresser: {
		name: 'Hairdresser',
		query: 'nwr[shop=hairdresser];',
		iconName: 'hair',
		catName: 'Shops',
		tagKeyword: ['barber', 'hairdresser', 'trim', 'shave'],
	},

	beauty: {
		name: 'Beauty',
		query: 'nwr[shop=beauty];',
		iconName: 'beautysalon',
		catName: 'Shops',
		tagKeyword: ['hairdresser', 'beauty', 'massage', 'nails', 'tan'],
		hide: 1
	},

	massage: {
		name: 'Massage',
		query: 'nwr[shop=massage];',
		iconName: 'massage',
		catName: 'Shops',
		tagKeyword: ['massage', 'beauty'],
		hide: 1
	},

	optician: {
		name: 'Optician',
		query: 'nwr[shop=optician];',
		iconName: 'glasses',
		catName: 'Shops',
		tagKeyword: ['optician', 'glasses', 'spectacles'],
		hide: 1
	},

	tattoo: {
		name: 'Tattoo',
		query: 'nwr[shop=tattoo];',
		iconName: 'tattoo',
		catName: 'Shops',
		tagKeyword: ['tattoo', 'pierce'],
		hide: 1
	},

	dry_cleaning: {
		name: 'Laundry/Dry-Cleaning',
		query: 'nwr[shop~"dry_cleaning|laundry"];',
		iconName: 'laundromat',
		catName: 'Shops',
		tagKeyword: ['laundry', 'clean', 'wash'],
		hide: 1
	},

	travel_agency: {
		name: 'Travel-Agency',
		query: 'nwr[shop=travel_agency];',
		iconName: 'travel_agency',
		catName: 'Shops',
		tagKeyword: ['travel-agency', 'holiday'],
		hide: 1
	},

	florist: {
		name: 'Florist/Garden Centre',
		query: 'nwr[shop~"florist|garden_centre"];',
		iconName: 'garden',
		catName: 'Shops',
		tagKeyword: ['florist', 'garden-centre', 'flowers', 'plants'],
		hide: 1
	},

	art: {
		name: 'Art',
		query: 'nwr[shop=art];',
		iconName: 'museum_paintings',
		catName: 'Shops',
		tagKeyword: ['art-gallery']
	},

	books: {
		name: 'Books',
		query: 'nwr[shop=books];',
		iconName: 'book',
		catName: 'Shops',
		tagKeyword: ['books', 'read']
	},

	antiques: {
		name: 'Antiques',
		query: 'nwr[shop=antiques];',
		iconName: 'gavel-auction-fw',
		catName: 'Shops',
		tagKeyword: ['antiques', 'furniture', 'second-hand', 'thrift']
	},

	second_hand: {
		name: 'Second-Hand',
		query: 'nwr[shop=second_hand];',
		iconName: '2hand',
		catName: 'Shops',
		tagKeyword: ['second-hand', 'clothes', 'books', 'toys', 'confectionery', 'furniture', 'crafts', 'thrift', 'bric-a-brac'],
		hide: 1
	},

	craft: {
		name: 'Craft',
		query: 'nwr[shop=craft];',
		iconName: 'craftstore',
		catName: 'Shops',
		tagKeyword: ['crafts', 'photographer', 'handi', 'models', 'art'],
		tagParser: craft_parser
	},

	frame: {
		name: 'Picture Framing',
		query: 'nwr[shop=frame];',
		iconName: 'museum_art',
		catName: 'Shops',
		tagKeyword: ['picture', 'artwork', 'frame'],
		hide: 1
	},

	gift: {
		name: 'Gift',
		query: 'nwr[shop=gift];',
		iconName: 'gifts',
		catName: 'Shops',
		tagKeyword: ['gift', 'presents']
	},

	toys: {
		name: 'Toys',
		query: 'nwr[shop=toys];',
		iconName: 'toys',
		catName: 'Shops',
		tagKeyword: ['toys', 'gift'],
		hide: 1
	},

	fishing: {
		name: 'Fishing',
		query: 'nwr[shop=fishing];',
		iconName: 'fishingstore',
		catName: 'Shops',
		tagKeyword: ['fish', 'angling'],
		hide: 1
	},

	pet: {
		name: 'Pet',
		query: 'nwr[shop=pet];',
		iconName: 'pets',
		catName: 'Shops',
		tagKeyword: ['pet', 'cat', 'dog', 'animals'],
		hide: 1
	},

	music: {
		name: 'Music',
		query: 'nwr[shop=music];',
		iconName: 'music',
		catName: 'Shops',
		tagKeyword: ['music', 'cds', 'vinyl'],
		hide: 1
	},

	musical_instrument: {
		name: 'Musical-Instrument',
		query: 'nwr[shop=musical_instrument];',
		iconName: 'music_rock',
		catName: 'Shops',
		tagKeyword: ['musical', 'instrument'],
		hide: 1
	},

	electronics: {
		name: 'Electronics',
		query: 'nwr[shop=electronics];',
		iconName: 'outlet1',
		catName: 'Shops',
		tagKeyword: ['electronics', 'washing-machine', 'fridge', 'microwave', 'oven', 'camera', 'hifi', 'mobile-phone'],
		hide: 1
	},

	computer: {
		name: 'Computer',
		query: 'nwr[shop=computer];',
		iconName: 'computers',
		catName: 'Shops',
		tagKeyword: ['computer', 'repair'],
		hide: 1
	},

	games: {
		name: 'Games/Collector',
		query: 'nwr[shop~"games|collector"];',
		iconName: 'poker',
		catName: 'Shops',
		tagKeyword: ['collectables', 'games'],
		hide: 1
	},

	mobile_phone: {
		name: 'Mobile-Phone',
		query: 'nwr[shop=mobile_phone];',
		iconName: 'phones',
		catName: 'Shops',
		tagKeyword: ['mobile-phone', 'repair'],
		hide: 1
	},

	bicycle: {
		name: 'Bicycle',
		query: 'nwr[shop=bicycle];',
		iconName: 'bicycle_shop',
		catName: 'Shops',
		tagKeyword: ['bicycle', 'bike'],
		tagParser: bikeshop_parser
	},

	car: {
		name: 'Car-Sales',
		query: 'nwr[shop=car];',
		iconName: 'car',
		catName: 'Shops',
		tagKeyword: ['car-sales', 'second-hand'],
		hide: 1
	},
	
	// OTHER - eaecee
	
	political: {
		name: 'Ward',
		query: 'relation[political_division=ward];',
		iconName: 'politicalboundary',
		catName: 'Other',
		tagKeyword: ['ward', 'politcal-area', 'voting'],
		permTooltip: 1
	},

	protected_area: {
		name: 'Protected Area',
		query: 'way[boundary=protected_area];',
		iconName: 'administrativeboundary',
		catName: 'Other',
		tagKeyword: ['conservation', 'protected-area'],
		permTooltip: 1
	},

	construction: {
		name: 'Construction',
		query: 'nwr[construction];',
		iconName: 'construction',
		catName: 'Other',
		tagKeyword: ['construction'],
		tagParser: construction_parser,
		hide: 1
	},

	surveillance: {
		name: 'Surveillance',
		query: 'node[~"^highway$|^man_made$"~"^speed_camera$|^surveillance$"];',
		iconName: 'cctv',
		catName: 'Other',
		tagKeyword: ['surveillance', 'cctv', 'security', 'camera'],
		tagParser: cctv_parser,
		hide: 1
	},

	// UNLISTED
	
	bus_stop: {
		name: 'Bus Stop',
		tagParser: busstop_parser
	},

	clock: {
		name: 'Clock',
		query: 'node[amenity=clock];',
		iconName: 'clock',
		tagParser: clock_parser
	},
	
	boundary_stone: {
		name: 'Boundary Stone',
		query: 'node[historic=boundary_stone];',
		iconName: 'boundary'
	},

	survey_point: {
		name: 'Survey Point',
		query: 'node[man_made=survey_point];',
		iconName: 'spbenchmark',
		tagParser: surveyp_parser
	}

};
