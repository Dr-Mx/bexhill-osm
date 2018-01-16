// all group POIs that show up on tab
// comments below indicate group and colour-codes of icons, non-specific poi colour - eaecee (all for use on mapicons.mapsmarker.com)
// array name must be used in query key (e.g. VIEWPOINT: {query: '[tourism=VIEWPOINT]'})
// prefixing the query with 'relation', 'node' or 'way' bypasses the default of node and way

var pois = {

	// LEISURE-TOURISM - 99a3a4 - 874ea0 - 239b56 - 2e86c1 - e74d3c
	
	attraction: {
		name: 'Attraction',
		query: 'way["name"~"^De La Warr Pavilion$|^Bexhill Museum$|^Egerton Park$|^Murmurations Gallery$|^Manor Gardens$|^Galley Hill Open Space$"]',
		iconName: 'star-3',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'attraction']
	},

	viewpoint: {
		name: 'Viewpoint',
		query: 'node[tourism=viewpoint]',
		iconName: 'panoramicview',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'viewpoint']
	},

	bus: {
		name: 'Community Bus',
		query: 'relation[route=bus]',
		iconName: 'bus',
		catName: 'Leisure-Tourism',
		tagKeyword: ['community', 'bus', 'route']
	},

	information: {
		name: 'Information',
		query: '[tourism=information]',
		iconName: 'information',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'information'],
		tagParser: info_parser
	},

	museum: {
		name: 'Museum',
		query: '[tourism=museum]',
		iconName: 'museum_archeological',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'museum']
	},

	artwork: {
		name: 'Public Artwork',
		query: '["tourism"~"artwork|gallery"]',
		iconName: 'publicart',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'artwork', 'sculpture'],
		tagParser: artwork_parser
	},

	historic: {
		name: 'Historic',
		query: '["historic"]',
		iconName: 'historic',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'historic', 'memorial', 'plaque'],
		tagParser: historic_parser
	},

	listed_status: {
		name: 'Heritage-Listed',
		query: '["HE_ref"]',
		iconName: 'house',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'listed', 'historic', 'heritage']
	},

	park: {
		name: 'Park',
		query: 'way["leisure"~"park|common|nature_reserve"]',
		iconName: 'urbanpark',
		catName: 'Leisure-Tourism',
		tagKeyword: ['park', 'common', 'open-space', 'green', 'nature-reserve']
	},

	recreation_ground: {
		name: 'Recreation Area',
		query: 'way[~"."~"recreation_ground|golf_course"]',
		iconName: 'soccer',
		catName: 'Leisure-Tourism',
		tagKeyword: ['recreation', 'sport', 'football', 'golf', 'park', 'open-space', 'green']
	},

	playground: {
		name: 'Playground',
		query: '[leisure=playground]',
		iconName: 'playground',
		catName: 'Leisure-Tourism',
		tagKeyword: ['playground', 'park', 'open-space', 'kids', 'children']
	},

	picnic_table: {
		name: 'Picnic-Table',
		query: 'node[leisure=picnic_table]',
		iconName: 'picnic-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['picnic']
	},

	shelter: {
		name: 'Shelter',
		query: '[amenity=shelter]',
		iconName: 'shelter',
		catName: 'Leisure-Tourism',
		tagKeyword: ['picnic', 'shelter'],
		tagParser: shelter_parser
	},

	allotments: {
		name: 'Allotment',
		query: 'way[landuse=allotments]',
		iconName: 'soil',
		catName: 'Leisure-Tourism',
		tagKeyword: ['allotment', 'garden'],
		tagParser: allotment_parser
	},

	social_centre: {
		name: 'Social Club',
		query: '[amenity=social_centre]',
		iconName: 'conversation-map-icon',
		catName: 'Leisure-Tourism',
		tagKeyword: ['organisation', 'social', 'events', 'venue', 'sport', 'club'],
		tagParser: club_parser
	},

	fitness_centre: {
		name: 'Fitness',
		query: '[leisure~"fitness_centre|fitness_station"]',
		iconName: 'weights',
		catName: 'Leisure-Tourism',
		tagKeyword: ['fitness', 'leisure', 'gym', 'sport']
	},

	swimming_pool: {
		name: 'Swimming-Pool',
		query: '[leisure=swimming_pool]',
		iconName: 'swimming2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['swim', 'leisure', 'sport', 'pool']
	},

	boat_rental: {
		name: 'Boat Rental',
		query: '[amenity=boat_rental]',
		iconName: 'rowboat',
		catName: 'Leisure-Tourism',
		tagKeyword: ['boat', 'rental']
	},

	amusement_arcade: {
		name: 'Amusement Arcade',
		query: '[leisure=amusement_arcade]',
		iconName: 'casino-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['amusement-arcade', 'gamble']
	},

	guest_house: {
		name: 'Hotel/Guest-House',
		query: '["tourism"~"guest_house|hotel"]',
		iconName: 'bed_breakfast1-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'bed-and-breakfast', 'hotel', 'guest-house', 'lodge', 'sleep'],
		tagParser: hotel_parser
	},

	apartment: {
		name: 'Rental Apartment',
		query: '[tourism=apartment]',
		iconName: 'villa',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'apartment', 'self-cater', 'lodge', 'sleep', 'bed'],
		tagParser: hotel_parser
	},

	caravan_site: {
		name: 'Caravan Site',
		query: '[tourism=caravan_site]',
		iconName: 'campingcar',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'caravan-site', 'camp', 'sleep']
	},

	// AMENITIES - 85929e - 7e5109 - 2980b9 - d4ac0d - 45b39d

	dog: {
		name: 'Dog Friendly',
		query: '[dog=yes]',
		iconName: 'dogs_leash',
		catName: 'Amenities',
		tagKeyword: ['dog']
	},

	fairtrade: {
		name: 'Fairtrade',
		query: '[fair_trade=yes]',
		iconName: 'fairtrade',
		catName: 'Amenities',
		tagKeyword: ['fairtrade']
	},

	cafe: {
		name: 'Cafe',
		query: '[amenity=cafe]',
		iconName: 'coffee',
		catName: 'Amenities',
		tagKeyword: ['cafe', 'tea', 'coffee', 'food', 'eat', 'breakfast', 'lunch', 'sandwich', 'cake', 'snacks', 'drink'],
		tagParser: food_parser
	},

	restaurant: {
		name: 'Restaurant',
		query: '[amenity=restaurant]',
		iconName: 'restaurant',
		catName: 'Amenities',
		tagKeyword: ['restaurant', 'food', 'eat', 'takeaway', 'dine', 'lunch'],
		tagParser: food_parser
	},

	fast_food: {
		name: 'Fast-Food',
		query: '[amenity=fast_food]',
		iconName: 'fastfood',
		catName: 'Amenities',
		tagKeyword: ['fast-food', 'eat', 'burger', 'chips', 'kebab', 'pizza'],
		tagParser: food_parser
	},

	ice_cream: {
		name: 'Ice-Cream',
		query: '[ice_cream=yes]',
		iconName: 'icecream',
		catName: 'Amenities',
		tagKeyword: ['ice-cream']
	},

	pub: {
		name: 'Pub',
		query: '[amenity=pub]',
		iconName: 'bar',
		catName: 'Amenities',
		tagKeyword: ['pub', 'drink', 'beer', 'alcohol', 'food', 'snacks'],
		tagParser: food_parser
	},

	bar: {
		name: 'Bar/Nightclub',
		query: '["amenity"~"bar|nightclub"]',
		iconName: 'bar_coktail',
		catName: 'Amenities',
		tagKeyword: ['bar', 'nightclub', 'cocktail', 'drink', 'dance', 'alcohol', 'wine']
	},

	marketplace: {
		name: 'Marketplace',
		query: '[amenity=marketplace]',
		iconName: 'market',
		catName: 'Amenities',
		tagKeyword: ['market', 'greengrocer', 'fruit', 'vegetables', 'cheese', 'meat']
	},

	toilets: {
		name: 'Public Toilets',
		query: '[amenity=toilets]',
		iconName: 'toilets',
		catName: 'Amenities',
		tagKeyword: ['toilet', 'water-closet', 'restroom', 'baby-change', 'lavatory', 'bog'],
		tagParser: toilet_parser
	},

	atm: {
		name: 'ATM',
		query: 'node[amenity=atm]',
		iconName: 'atm_pound',
		catName: 'Amenities',
		tagKeyword: ['ATM', 'bank', 'money', 'cash-point'],
		tagParser: atm_parser
	},

	telephone: {
		name: 'Telephone-Box',
		query: 'node[amenity=telephone]',
		iconName: 'telephone',
		catName: 'Amenities',
		tagKeyword: ['telephone', 'emergency', 'help'],
		tagParser: telephone_parser
	},

	post_box: {
		name: 'Post-Box/Office',
		query: 'node[amenity~"post_box|post_office"]',
		iconName: 'postal',
		catName: 'Amenities',
		tagKeyword: ['post', 'letter', 'mail'],
		tagParser: post_parser
	},

	water_tap: {
		name: 'Water-Tap',
		query: 'node[man_made=water_tap]',
		iconName: 'drinkingwater',
		catName: 'Amenities',
		tagKeyword: ['drink', 'tap', 'water'],
		tagParser: tap_parser
	},

	recycling: {
		name: 'Recycling',
		query: '[amenity=recycling]',
		iconName: 'recycle',
		catName: 'Amenities',
		tagKeyword: ['recycle', 'dump', 'refuse', 'rubbish', 'waste'],
		tagParser: recyclecentre_parser
	},

	defibrillator: {
		name: 'Defibrillator',
		query: 'node[emergency=defibrillator]',
		iconName: 'aed-2',
		catName: 'Amenities',
		tagKeyword: ['defibrillator', 'AED', 'emergency', 'help'],
		tagParser: defib_parser
	},

	grit_bin: {
		name: 'Grit-Bin',
		query: 'node[amenity=grit_bin]',
		iconName: 'roadtype_gravel',
		catName: 'Amenities',
		tagKeyword: ['grit-bin', 'snow']
	},

	dog_excrement: {
		name: 'Dog Waste-Bin',
		query: 'node[waste=dog_excrement]',
		iconName: 'dogs_waste',
		catName: 'Amenities',
		tagKeyword: ['dog', 'poo', 'excrement', 'waste-bin']
	},

	parking: {
		name: 'Car-Parking',
		query: '[amenity=parking]',
		iconName: 'parking',
		catName: 'Amenities',
		tagKeyword: ['car-parking', 'motor'],
		tagParser: carpark_parser
	},

	bicycle_parking: {
		name: 'Bicycle-Parking',
		query: '[amenity=bicycle_parking]',
		iconName: 'parking_bicycle',
		catName: 'Amenities',
		tagKeyword: ['bike-parking', 'bicycle'],
		tagParser: bikepark_parser
	},

	taxi: {
		name: 'Taxi',
		query: '[amenity=taxi]',
		iconName: 'taxi',
		catName: 'Amenities',
		tagKeyword: ['taxi', 'transport'],
		tagParser: taxi_parser
	},

	fuel: {
		name: 'Fuel',
		query: '[amenity=fuel]',
		iconName: 'fillingstation',
		catName: 'Amenities',
		tagKeyword: ['fuel', 'gas', 'petrol', 'unleaded', 'diesel', 'motor', 'station'],
		tagParser: fuelstation_parser
	},

	car_repair: {
		name: 'Car-Repair/MOT',
		query: '[shop=car_repair]',
		iconName: 'carrepair',
		catName: 'Amenities',
		tagKeyword: ['repair', 'garage', 'tyres', 'mechanic', 'motor', 'car', 'parts'],
		tagParser: carshop_parser
	},

	car_rental: {
		name: 'Car-Rental',
		query: '[amenity=car_rental]',
		iconName: 'carrental',
		catName: 'Amenities',
		tagKeyword: ['car-rental', 'motor']
	},

	car_wash: {
		name: 'Car-Wash',
		query: '[amenity=car_wash]',
		iconName: 'carwash',
		catName: 'Amenities',
		tagKeyword: ['car-wash', 'motor']
	},

	veterinary: {
		name: 'Veterinary',
		query: '[amenity=veterinary]',
		iconName: 'veterinary',
		catName: 'Amenities',
		tagKeyword: ['veterinary', 'pet', 'animals']
	},

	animal_shelter: {
		name: 'Animal Kennel',
		query: '["amenity"~"animal_shelter|animal_boarding"]',
		iconName: 'animal-shelter-export',
		catName: 'Amenities',
		tagKeyword: ['kennel', 'shelter', 'board', 'pet', 'cat', 'dog', 'animal']
	},

	// SERVICES - 2874a6 - a04000 - 1abc9c - af7ac5

	police: {
		name: 'Emergency',
		query: '[~"."~"police|fire_station|ambulance_station"]',
		iconName: 'police2',
		catName: 'Services',
		tagKeyword: ['police', 'fire', 'ambulance', 'help', 'emergency']
	},

	townhall: {
		name: 'Town-Hall',
		query: '[amenity=townhall]',
		iconName: 'townhouse',
		catName: 'Services',
		tagKeyword: ['townhall', 'administration', 'council', 'government']
	},

	community_centre: {
		name: 'Community-Centre',
		query: '[amenity=community_centre]',
		iconName: 'communitycentre',
		catName: 'Services',
		tagKeyword: ['community-centre', 'meet', 'events-venue', 'social']
	},

	bank: {
		name: 'Bank',
		query: '[amenity=bank]',
		iconName: 'bank_pound',
		catName: 'Services',
		tagKeyword: ['bank', 'money']
	},

	library: {
		name: 'Library',
		query: '[amenity=library]',
		iconName: 'library',
		catName: 'Services',
		tagKeyword: ['library', 'books', 'read']
	},

	jobcentre: {
		name: 'Job Centre',
		query: '[amenity=jobcentre]',
		iconName: 'workoffice',
		catName: 'Services',
		tagKeyword: ['job', 'employment']
	},

	school: {
		name: 'Education',
		query: '["amenity"~"school|college"]',
		iconName: 'school2',
		catName: 'Services',
		tagKeyword: ['school', 'college', 'education'],
		tagParser: school_parser
	},

	kindergarten: {
		name: 'Nursery',
		query: '[amenity=kindergarten]',
		iconName: 'daycare',
		catName: 'Services',
		tagKeyword: ['daycare', 'kindergarten', 'nursery'],
		tagParser: school_parser
	},

	place_of_worship: {
		name: 'Place of Worship',
		query: '[amenity=place_of_worship]',
		iconName: 'prayer',
		catName: 'Services',
		tagKeyword: ['church', 'mosque', 'worship', 'prayer', 'religion'],
		tagParser: worship_parser
	},

	social_facility: {
		name: 'Social-Facility',
		query: '["amenity"~"social_facility|retirement_home"]',
		iconName: 'sozialeeinrichtung',
		catName: 'Services',
		tagKeyword: ['care', 'retirement', 'nurse', 'home', 'social-facility', 'sheltered-house'],
		tagParser: socialf_parser
	},

	events_venue: {
		name: 'Events-Venue',
		query: '[amenity=events_venue]',
		iconName: 'dancinghall',
		catName: 'Services',
		tagKeyword: ['hire', 'events-venue', 'rent']
	},

	hospital: {
		name: 'Hospital',
		query: '[amenity=hospital]',
		iconName: 'hospital-building',
		catName: 'Services',
		tagKeyword: ['hospital', 'help', 'medical'],
		tagParser: hospital_parser
	},

	doctors: {
		name: 'Doctor',
		query: '[amenity=doctors]',
		iconName: 'medicine',
		catName: 'Services',
		tagKeyword: ['doctor', 'help', 'medical']
	},

	dentist: {
		name: 'Dentist',
		query: '[amenity=dentist]',
		iconName: 'dentist',
		catName: 'Services',
		tagKeyword: ['dentist', 'teeth']
	},

	healthcare: {
		name: 'Healthcare',
		query: '["healthcare"]',
		iconName: 'medicalstore',
		catName: 'Services',
		tagKeyword: ['healthcare', 'medical', 'therapy', 'clinic', 'chiropractic', 'osteopathy'],
		tagParser: healthcare_parser
	},

	pharmacy: {
		name: 'Pharmacy',
		query: '[amenity=pharmacy]',
		iconName: 'drugstore',
		catName: 'Services',
		tagKeyword: ['pharmacy', 'chemist', 'drugstore']
	},

	mobility: {
		name: 'Mobility/Hearing',
		query: '["shop"~"mobility|hearing_aids"]',
		iconName: 'retirement_home',
		catName: 'Services',
		tagKeyword: ['mobility', 'wheelchair', 'deaf', 'disabled']
	},

	funeral_directors: {
		name: 'Funeral Directors',
		query: '[shop=funeral_directors]',
		iconName: 'crematorium',
		catName: 'Services',
		tagKeyword: ['funeral-directors']
	},

	estate_agent: {
		name: 'Estate Agent',
		query: '[office=estate_agent]',
		iconName: 'apartment-2',
		catName: 'Services',
		tagKeyword: ['estate-agent', 'property']
	},

	accountant: {
		name: 'Accountant',
		query: '["office"~"accountant|financial"]',
		iconName: 'coins',
		catName: 'Services',
		tagKeyword: ['accountant', 'financial', 'money']
	},

	insurance: {
		name: 'Insurance',
		query: '[office=insurance]',
		iconName: 'umbrella-2',
		catName: 'Services',
		tagKeyword: ['insurance']
	},

	lawyer: {
		name: 'Solicitor',
		query: '[office=lawyer]',
		iconName: 'court',
		catName: 'Services',
		tagKeyword: ['lawyer', 'solicitor']
	},

	// SHOPS - 1b4f72 - e74c3c - 117864 - 8e44ad - 52be80 - b9770e

	supermarket: {
		name: 'Supermarket',
		query: '[shop=supermarket]',
		iconName: 'supermarket',
		catName: 'Shops',
		tagKeyword: ['supermarket', 'food']
	},

	convenience: {
		name: 'Convenience',
		query: '[shop=convenience]',
		iconName: 'conveniencestore',
		catName: 'Shops',
		tagKeyword: ['convenience', 'corner-shop']
	},

	newsagent: {
		name: 'Newsagent',
		query: '[shop=newsagent]',
		iconName: 'newsagent',
		catName: 'Shops',
		tagKeyword: ['newsagent', 'corner-shop']
	},

	greengrocer: {
		name: 'Greengrocer',
		query: '[shop=greengrocer]',
		iconName: 'fruits',
		catName: 'Shops',
		tagKeyword: ['greengrocer', 'fruit', 'vegetables']
	},

	bakery: {
		name: 'Bakery',
		query: '[shop=bakery]',
		iconName: 'bread',
		catName: 'Shops',
		tagKeyword: ['bakery', 'bread', 'cake']
	},

	deli: {
		name: 'Butcher/Deli',
		query: '["shop"~"deli|butcher"]',
		iconName: 'farmstand',
		catName: 'Shops',
		tagKeyword: ['butcher', 'meat', 'delicatessen']
	},

	seafood: {
		name: 'Seafood',
		query: '[shop=seafood]',
		iconName: 'shop_fish',
		catName: 'Shops',
		tagKeyword: ['seafood', 'fish']
	},

	confectionery: {
		name: 'Confectionery',
		query: '[shop=confectionery]',
		iconName: 'candy',
		catName: 'Shops',
		tagKeyword: ['sugar', 'sweets', 'candy', 'confectionery']
	},

	alcohol: {
		name: 'Alcohol',
		query: '[shop=alcohol]',
		iconName: 'liquor',
		catName: 'Shops',
		tagKeyword: ['alcohol', 'liquor', 'beer', 'wine', 'spirits', 'drink']
	},

	tobacco: {
		name: 'Smoking',
		query: '["shop"~"tobacco|e-cigarette"]',
		iconName: 'smoking',
		catName: 'Shops',
		tagKeyword: ['tobacco', 'e-cigarette', 'smoke', 'vape']
	},

	bookmaker: {
		name: 'Betting',
		query: '[shop=bookmaker]',
		iconName: 'cup',
		catName: 'Shops',
		tagKeyword: ['bookmaker', 'bet', 'gamble']
	},

	variety_store: {
		name: 'Variety-Store',
		query: '[shop=variety_store]',
		iconName: 'mall',
		catName: 'Shops',
		tagKeyword: ['variety', 'pound', '99p', 'supplies', 'toys', 'confectionery']
	},

	copyshop: {
		name: 'Printers',
		query: '["shop"~"copyshop|signs"]',
		iconName: 'printer-2',
		catName: 'Shops',
		tagKeyword: ['copyshop', 'printers', 'signs']
	},

	stationery: {
		name: 'Stationery',
		query: '[shop=stationery]',
		iconName: 'pens',
		catName: 'Shops',
		tagKeyword: ['stationery', 'supplies']
	},

	doityourself: {
		name: 'DIY/Hardware',
		query: '["shop"~"doityourself|hardware"]',
		iconName: 'tools',
		catName: 'Shops',
		tagKeyword: ['doityourself', 'hardware', 'diy', 'tools']
	},

	clothes: {
		name: 'Clothes',
		query: '["shop"~"clothes|boutique|department_store"]',
		iconName: 'clothers_female',
		catName: 'Shops',
		tagKeyword: ['clothes', 'boutique', 'department-store'],
		tagParser: clothes_parser
	},

	tailor: {
		name: 'Tailor',
		query: '[shop=tailor]',
		iconName: 'tailor',
		catName: 'Shops',
		tagKeyword: ['clothes', 'tailor']
	},

	charity: {
		name: 'Charity',
		query: '[shop=charity]',
		iconName: 'charity',
		catName: 'Shops',
		tagKeyword: ['charity', 'clothes', 'books', 'toys', 'confectionery', 'furniture', 'crafts', 'second-hand']
	},

	shoes: {
		name: 'Shoes',
		query: '[shop=shoes]',
		iconName: 'shoes',
		catName: 'Shops',
		tagKeyword: ['shoes', 'footwear']
	},

	houseware: {
		name: 'House/Decoration',
		query: '["shop"~"houseware|interior_decoration|bathroom_furnishing|kitchen"]',
		iconName: 'kitchen',
		catName: 'Shops',
		tagKeyword: ['interior-decoration', 'houseware', 'bathroom', 'kitchen']
	},

	furniture: {
		name: 'Furniture',
		query: '[shop=furniture]',
		iconName: 'homecenter',
		catName: 'Shops',
		tagKeyword: ['furniture']
	},

	carpet: {
		name: 'Carpet-Store',
		query: '[shop=carpet]',
		iconName: 'textiles',
		catName: 'Shops',
		tagKeyword: ['carpet', 'floor']
	},

	bed: {
		name: 'Bed-Store',
		query: '[shop=bed]',
		iconName: 'lodging-2',
		catName: 'Shops',
		tagKeyword: ['bed', 'mattress']
	},

	curtain: {
		name: 'Curtain/Blind',
		query: '["shop"~"curtain|window_blind"]',
		iconName: 'curtain',
		catName: 'Shops',
		tagKeyword: ['curtain', 'blinds', 'windows']
	},

	jewelry: {
		name: 'Jewellery',
		query: '[shop=jewelry]',
		iconName: 'jewelry',
		catName: 'Shops',
		tagKeyword: ['jewellery', 'watches', 'rings']
	},

	bag: {
		name: 'Bag',
		query: '[shop=bag]',
		iconName: 'bags',
		catName: 'Shops',
		tagKeyword: ['handbag']
	},

	watches: {
		name: 'Watches',
		query: '[shop=watches]',
		iconName: 'watch',
		catName: 'Shops',
		tagKeyword: ['watches', 'clock']
	},

	hairdresser: {
		name: 'Hairdresser',
		query: '[shop=hairdresser]',
		iconName: 'barber',
		catName: 'Shops',
		tagKeyword: ['barber', 'hairdresser']
	},

	beauty: {
		name: 'Beauty',
		query: '[shop=beauty]',
		iconName: 'beautysalon',
		catName: 'Shops',
		tagKeyword: ['hairdresser', 'beauty', 'massage', 'nails', 'tan']
	},

	massage: {
		name: 'Massage',
		query: '[shop=massage]',
		iconName: 'massage',
		catName: 'Shops',
		tagKeyword: ['massage', 'beauty']
	},

	optician: {
		name: 'Optician',
		query: '[shop=optician]',
		iconName: 'glasses',
		catName: 'Shops',
		tagKeyword: ['optician', 'glasses']
	},

	tattoo: {
		name: 'Tattoo',
		query: '[shop=tattoo]',
		iconName: 'tattoo',
		catName: 'Shops',
		tagKeyword: ['tattoo', 'pierce']
	},

	dry_cleaning: {
		name: 'Laundry/Dry-Cleaning',
		query: '["shop"~"dry_cleaning|laundry"]',
		iconName: 'laundromat',
		catName: 'Shops',
		tagKeyword: ['laundry', 'clean', 'wash']
	},

	travel_agency: {
		name: 'Travel-Agency',
		query: '[shop=travel_agency]',
		iconName: 'travel_agency',
		catName: 'Shops',
		tagKeyword: ['travel-agency', 'holiday']
	},

	florist: {
		name: 'Florist/Garden Centre',
		query: '["shop"~"florist|garden_centre"]',
		iconName: 'garden',
		catName: 'Shops',
		tagKeyword: ['florist', 'garden-centre', 'flowers', 'plants']
	},

	art: {
		name: 'Art',
		query: '[shop=art]',
		iconName: 'museum_paintings',
		catName: 'Shops',
		tagKeyword: ['art-gallery']
	},

	books: {
		name: 'Books',
		query: '[shop=books]',
		iconName: 'book',
		catName: 'Shops',
		tagKeyword: ['books', 'read']
	},

	antiques: {
		name: 'Antiques',
		query: '[shop=antiques]',
		iconName: 'gavel-auction-fw',
		catName: 'Shops',
		tagKeyword: ['antiques', 'furniture', 'second-hand', 'thrift']
	},

	second_hand: {
		name: 'Second-Hand',
		query: '[shop=second_hand]',
		iconName: '2hand',
		catName: 'Shops',
		tagKeyword: ['second-hand', 'clothes', 'books', 'toys', 'confectionery', 'furniture', 'crafts', 'thrift', 'bric-a-brac']
	},

	craft: {
		name: 'Craft',
		query: '[shop=craft]',
		iconName: 'craftstore',
		catName: 'Shops',
		tagKeyword: ['crafts', 'photographer', 'handi', 'models', 'art'],
		tagParser: craft_parser
	},

	frame: {
		name: 'Picture Framing',
		query: '[shop=frame]',
		iconName: 'museum_art',
		catName: 'Shops',
		tagKeyword: ['picture', 'artwork', 'frame']
	},

	gift: {
		name: 'Gift',
		query: '[shop=gift]',
		iconName: 'gifts',
		catName: 'Shops',
		tagKeyword: ['gift', 'presents']
	},

	toys: {
		name: 'Toys',
		query: '[shop=toys]',
		iconName: 'toys',
		catName: 'Shops',
		tagKeyword: ['toys', 'gift']
	},

	fishing: {
		name: 'Fishing',
		query: '[shop=fishing]',
		iconName: 'fishingstore',
		catName: 'Shops',
		tagKeyword: ['fish', 'angling']
	},

	pet: {
		name: 'Pet',
		query: '[shop=pet]',
		iconName: 'pets',
		catName: 'Shops',
		tagKeyword: ['pet', 'cat', 'dog', 'animals']
	},

	music: {
		name: 'Music',
		query: '[shop=music]',
		iconName: 'music',
		catName: 'Shops',
		tagKeyword: ['music', 'cds', 'vinyl']
	},

	musical_instrument: {
		name: 'Musical-Instrument',
		query: '[shop=musical_instrument]',
		iconName: 'music_rock',
		catName: 'Shops',
		tagKeyword: ['musical', 'instrument']
	},

	electronics: {
		name: 'Electronics',
		query: '[shop=electronics]',
		iconName: 'outlet1',
		catName: 'Shops',
		tagKeyword: ['electronics', 'washing-machine', 'fridge', 'microwave', 'oven', 'camera', 'hifi', 'mobile-phone']
	},

	computer: {
		name: 'Computer',
		query: '[shop=computer]',
		iconName: 'computers',
		catName: 'Shops',
		tagKeyword: ['computer', 'repair']
	},

	games: {
		name: 'Games',
		query: '[shop=games]',
		iconName: 'poker',
		catName: 'Shops',
		tagKeyword: ['collectables', 'games']
	},

	mobile_phone: {
		name: 'Mobile-Phone',
		query: '[shop=mobile_phone]',
		iconName: 'phones',
		catName: 'Shops',
		tagKeyword: ['mobile-phone', 'repair']
	},

	bicycle: {
		name: 'Bicycle',
		query: '[shop=bicycle]',
		iconName: 'bicycle_shop',
		catName: 'Shops',
		tagKeyword: ['bicycle', 'bike'],
		tagParser: bikeshop_parser
	},

	car: {
		name: 'Car-Sales',
		query: '[shop=car]',
		iconName: 'car',
		catName: 'Shops',
		tagKeyword: ['car-sales', 'second-hand']
	},
	
	// OTHER
	
	construction: {
		name: 'Construction',
		query: '[construction]',
		iconName: 'construction',
		catName: 'Other',
		tagKeyword: ['construction'],
		tagParser: construction_parser
	},

	surveillance: {
		name: 'Surveillance',
		query: 'node[~"."~"speed_camera|surveillance"]',
		iconName: 'cctv',
		catName: 'Other',
		tagKeyword: ['surveillance', 'cctv', 'security', 'camera'],
		tagParser: cctv_parser
	},

	// UNLISTED
	
	clock: {
		name: 'Clock',
		query: 'node[amenity=clock]',
		iconName: 'clock',
		tagParser: clock_parser
	}
	
};
