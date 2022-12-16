// all group POIs that show up on tab
// comments below indicate group and colour-codes of icons, non-specific poi colour - eaecee (all for use on mapicons.mapsmarker.com)
// array name must be used in query key (e.g. VIEWPOINT: {query: 'nwr[tourism=VIEWPOINT]'})

const pois = {

	// LEISURE-TOURISM - 99a3a4 - e74d3c - 874ea0 - 239b56 - 2e86c1

	attraction: {
		name: 'Attractions',
		query: 'way[name~"^De La Warr Pavilion$|^Bexhill Museum$|^Egerton Park$|^Manor Gardens$|^Galley Hill Open Space$"];',
		iconName: 'pinother',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'attraction']
	},

	viewpoint: {
		name: 'Viewpoints',
		query: 'node[tourism=viewpoint];',
		iconName: 'panoramicview',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'viewpoint']
	},

	webcam: {
		name: 'Webcams',
		query: 'node[surveillance=webcam];',
		iconName: 'webcam',
		catName: 'Leisure-Tourism',
		tagKeyword: ['webcam', 'surveillance'],
		tagParser: cctv_parser
	},

	bus: {
		name: 'Bus Routes',
		query: 'relation[route=bus];',
		iconName: 'bus',
		catName: 'Leisure-Tourism',
		tagKeyword: ['community', 'bus', 'route']
	},

	information: {
		name: 'Information',
		query: 'nwr[information][information!~"^guidepost$"][~"ref|name"~"."];',
		iconName: 'information',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'information']
	},

	guest_house: {
		name: 'Where to stay',
		query: 'nwr[tourism~"^guest_house$|^hotel$|^apartment$|^caravan_site$"];',
		iconName: 'bed_breakfast1-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'apartment', 'self-cater', 'bed-and-breakfast', 'hotel', 'guest-house', 'lodge', 'sleep', 'caravan-site', 'camp'],
		tagParser: hotel_parser
	},

	museum: {
		name: 'Museums',
		query: 'nwr[tourism=museum];',
		iconName: 'museum_archeological',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'museum']
	},

	artwork: {
		name: 'Public Artworks',
		query: 'nwr[tourism~"^artwork$|^gallery$"];nwr[map_type=toposcope];',
		iconName: 'publicart',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'artwork', 'sculpture']
	},

	historic: {
		name: 'Historic Sites',
		query: 'nwr[historic][historic!~"^district$|^boundary_stone$"];node["historic:railway"];node[board_type=history];',
		iconName: 'historic',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'historic', 'memorial', 'plaque', 'war']
	},

	listed_status: {
		name: 'Heritage Listings',
		query: 'nwr[HE_ref];',
		iconName: 'house',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'listed', 'historic', 'heritage']
	},

	park: {
		name: 'Parks/Recreation',
		query: 'nwr[leisure~"^park$|^nature_reserve$"];nwr[landuse=recreation_ground][name][access!~"^private$"];',
		iconName: 'urbanpark',
		catName: 'Leisure-Tourism',
		tagKeyword: ['park', 'common', 'open-space', 'green', 'nature-reserve', 'recreation']
	},

	playground: {
		name: 'Playgrounds',
		query: 'nwr[leisure=playground][name];',
		iconName: 'playground',
		catName: 'Leisure-Tourism',
		tagKeyword: ['playground', 'park', 'open-space', 'kids', 'children']
	},

	picnic_table: {
		name: 'Picnic Tables',
		query: 'node[leisure=picnic_table];',
		iconName: 'picnic-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['picnic']
	},

	shelter: {
		name: 'Shelters',
		query: 'nwr[amenity=shelter];',
		iconName: 'shelter',
		catName: 'Leisure-Tourism',
		tagKeyword: ['picnic', 'shelter']
	},

	allotments: {
		name: 'Allotments',
		query: 'way[landuse=allotments];',
		iconName: 'soil',
		catName: 'Leisure-Tourism',
		tagKeyword: ['allotment', 'garden'],
		tagParser: allotment_parser
	},

	sport: {
		name: 'Sports/Fitness',
		query: 'nwr[leisure~"^pitch$|^track$|^golf_course$|^sports_centre$|^horse_riding$|^fitness"][access!~"^private$"];',
		iconName: 'recreation',
		catName: 'Leisure-Tourism',
		tagKeyword: ['sport', 'football', 'golf', 'cricket', 'swimming-pool', 'horse-riding', 'equestrian', 'basketball', 'tennis', 'skate', 'bmx', 'gym', 'fitness']
	},
	
	club: {
		name: 'Clubs',
		query: 'nwr[club];',
		iconName: 'conversation-map-icon',
		catName: 'Leisure-Tourism',
		tagKeyword: ['hobby', 'social', 'events', 'venue', 'sport', 'club']
	},

	boat_rental: {
		name: 'Boat Rentals',
		query: 'nwr[amenity=boat_rental];',
		iconName: 'rowboat',
		catName: 'Leisure-Tourism',
		tagKeyword: ['boat', 'hire', 'rental', 'children']
	},

	amusement_arcade: {
		name: 'Amusement Arcades',
		query: 'nwr[leisure=amusement_arcade];',
		iconName: 'casino-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['amusement-arcade', 'gamble', 'children']
	},

	// AMENITIES - 85929e - 7e5109 - 2980b9 - d4ac0d - 45b39d

	dog: {
		name: 'Dog Friendly Places',
		query: 'nwr[dog=yes];',
		iconName: 'dogs_leash',
		catName: 'Amenities',
		tagKeyword: ['dog']
	},

	fairtrade: {
		name: 'Fairtrade Business',
		query: 'nwr[fair_trade=yes];',
		iconName: 'fairtrade',
		catName: 'Amenities',
		tagKeyword: ['fairtrade']
	},

	cafe: {
		name: 'Cafés',
		query: 'nwr[amenity=cafe];',
		iconName: 'coffee',
		catName: 'Amenities',
		tagKeyword: ['cafe', 'tea', 'coffee', 'food', 'eat', 'breakfast', 'lunch', 'sandwich', 'cake', 'snacks', 'drink'],
		tagParser: food_parser
	},

	restaurant: {
		name: 'Restaurants',
		query: 'nwr[amenity=restaurant];',
		iconName: 'restaurant',
		catName: 'Amenities',
		tagKeyword: ['restaurant', 'food', 'eat', 'takeaway', 'dine', 'lunch'],
		tagParser: food_parser
	},

	fast_food: {
		name: 'Fast-foods',
		query: 'nwr[amenity=fast_food];',
		iconName: 'fastfood',
		catName: 'Amenities',
		tagKeyword: ['fast-food', 'eat', 'burger', 'chips', 'kebab', 'pizza'],
		tagParser: food_parser
	},

	pub: {
		name: 'Pubs',
		query: 'nwr[amenity=pub];',
		iconName: 'bar',
		catName: 'Amenities',
		tagKeyword: ['pub', 'drink', 'beer', 'alcohol', 'food', 'snacks', 'microbrewery'],
		tagParser: food_parser
	},

	bar: {
		name: 'Bars/Nightclubs',
		query: 'nwr[amenity~"^bar$|^nightclub$"];',
		iconName: 'bar_coktail',
		catName: 'Amenities',
		tagKeyword: ['bar', 'nightclub', 'cocktail', 'drink', 'dance', 'alcohol', 'wine']
	},

	marketplace: {
		name: 'Markets',
		query: 'nwr[amenity=marketplace];',
		iconName: 'market',
		catName: 'Amenities',
		tagKeyword: ['market', 'greengrocer', 'fruit', 'vegetables', 'cheese', 'meat']
	},

	toilets: {
		name: 'Public Toilets',
		query: 'nwr[amenity=toilets][access~"^yes$|^permissive$"];',
		iconName: 'toilets',
		catName: 'Amenities',
		tagKeyword: ['toilet', 'water-closet', 'restroom', 'baby-change', 'lavatory', 'bog']
	},

	atm: {
		name: 'ATMs',
		query: 'node[amenity=atm];',
		iconName: 'atm_pound',
		catName: 'Amenities',
		tagKeyword: ['atm', 'bank', 'money', 'cash-point'],
		tagParser: vending_parser
	},

	photo_booth: {
		name: 'Photo Booths',
		query: 'node[amenity=photo_booth];',
		iconName: 'photobooth',
		catName: 'Amenities',
		tagKeyword: ['photobooth', 'picture', 'passport'],
		tagParser: vending_parser
	},

	telephone: {
		name: 'Telephone Boxes',
		query: 'node[amenity=telephone];',
		iconName: 'telephone',
		catName: 'Amenities',
		tagKeyword: ['telephone', 'emergency', 'help']
	},

	post_box: {
		name: 'Post-boxes/Offices',
		query: 'nwr[amenity~"^post_"];',
		iconName: 'postal',
		catName: 'Amenities',
		tagKeyword: ['post', 'letter', 'mail'],
		tagParser: post_parser
	},

	drinking_water: {
		name: 'Drinking Water',
		query: 'node[amenity=drinking_water];node[man_made=water_tap][drinking_water=yes];nwr["drinking_water:refill"=yes];',
		iconName: 'drinkingwater',
		catName: 'Amenities',
		tagKeyword: ['drink', 'tap', 'water', 'refill'],
		tagParser: tap_parser
	},

	recycling: {
		name: 'Recycling Centres',
		query: 'nwr[amenity=recycling];',
		iconName: 'recycle',
		catName: 'Amenities',
		tagKeyword: ['recycle', 'dump', 'refuse', 'rubbish', 'waste']
	},

	defibrillator: {
		name: 'Defibrillators',
		query: 'node[emergency=defibrillator];',
		iconName: 'aed-2',
		catName: 'Amenities',
		tagKeyword: ['defibrillator', 'AED', 'emergency', 'help'],
		tagParser: defib_parser
	},

	grit_bin: {
		name: 'Grit-bins',
		query: 'node[amenity=grit_bin];',
		iconName: 'roadtype_gravel',
		catName: 'Amenities',
		tagKeyword: ['grit-bin', 'snow']
	},

	parking: {
		name: 'Car Parking',
		query: 'nwr[amenity=parking][access=yes];',
		iconName: 'parking',
		catName: 'Amenities',
		tagKeyword: ['car-parking', 'motor'],
		tagParser: carpark_parser
	},

	bicycle_parking: {
		name: 'Bicycle Parking',
		query: 'node[amenity=bicycle_parking][access!~"^private$"];',
		iconName: 'parking_bicycle',
		catName: 'Amenities',
		tagKeyword: ['bike-parking', 'bicycle'],
		tagParser: bike_parser
	},

	taxi: {
		name: 'Taxis',
		query: 'nwr[amenity=taxi];',
		iconName: 'taxi',
		catName: 'Amenities',
		tagKeyword: ['taxi', 'transport'],
		tagParser: taxi_parser
	},

	fuel: {
		name: 'Fuel Stations',
		query: 'nwr[amenity=fuel];',
		iconName: 'fillingstation',
		catName: 'Amenities',
		tagKeyword: ['fuel', 'gas', 'petrol', 'unleaded', 'diesel', 'motor', 'station'],
		tagParser: fuelstation_parser
	},

	car_repair: {
		name: 'Car Repairs/Parts',
		query: 'nwr[shop~"^car_repair$|^car_parts$"];',
		iconName: 'carrepair',
		catName: 'Amenities',
		tagKeyword: ['repair', 'garage', 'tyres', 'mechanic', 'motor', 'car', 'parts', 'MOT'],
		tagParser: carshop_parser
	},

	car_rental: {
		name: 'Car Rentals',
		query: 'nwr[amenity=car_rental];',
		iconName: 'carrental',
		catName: 'Amenities',
		tagKeyword: ['car-rental', 'hire', 'motor']
	},

	car_wash: {
		name: 'Car Washing',
		query: 'nwr[amenity=car_wash];',
		iconName: 'carwash',
		catName: 'Amenities',
		tagKeyword: ['car-wash', 'motor']
	},

	veterinary: {
		name: 'Veterinarians',
		query: 'nwr[amenity=veterinary];',
		iconName: 'veterinary',
		catName: 'Amenities',
		tagKeyword: ['veterinary', 'pet', 'animals']
	},

	animal_shelter: {
		name: 'Animal Kennels',
		query: 'nwr[amenity~"^animal_"];',
		iconName: 'animal-shelter-export',
		catName: 'Amenities',
		tagKeyword: ['kennel', 'shelter', 'board', 'pet', 'cat', 'dog', 'animal']
	},

	// SERVICES - 2874a6 - a04000 - 1abc9c - af7ac5

	police: {
		name: 'Emergency Services',
		query: 'nwr[~"^amenity$|^emergency$"~"^police$|^fire_station$|^ambulance_station$|^coast_guard$|^lifeguard$"];',
		iconName: 'police2',
		catName: 'Services',
		tagKeyword: ['police', 'fire', 'ambulance', 'coastguard', 'help', 'emergency']
	},

	townhall: {
		name: 'Town Hall',
		query: 'nwr[amenity=townhall];',
		iconName: 'townhouse',
		catName: 'Services',
		tagKeyword: ['townhall', 'administration', 'council', 'government']
	},

	community_centre: {
		name: 'Community Centres',
		query: 'nwr[amenity=community_centre];',
		iconName: 'communitycentre',
		catName: 'Services',
		tagKeyword: ['community-centre', 'meet', 'events-venue', 'social']
	},

	bank: {
		name: 'Banks',
		query: 'nwr[amenity=bank];',
		iconName: 'bank_pound',
		catName: 'Services',
		tagKeyword: ['bank', 'money']
	},

	library: {
		name: 'Libraries',
		query: 'nwr[amenity~"^library$|^public_bookcase$"];',
		iconName: 'library',
		catName: 'Services',
		tagKeyword: ['library', 'books', 'read']
	},

	jobcentre: {
		name: 'Job Centres',
		query: 'nwr[amenity=jobcentre];',
		iconName: 'workoffice',
		catName: 'Services',
		tagKeyword: ['job', 'employment']
	},

	school: {
		name: 'Education Institutions',
		query: 'nwr[amenity~"^school$|^college$"];nwr[amenity=training];',
		iconName: 'school2',
		catName: 'Services',
		tagKeyword: ['school', 'college', 'education', 'training'],
		tagParser: education_parser
	},

	kindergarten: {
		name: 'Nurseries',
		query: 'nwr[amenity=kindergarten];',
		iconName: 'daycare',
		catName: 'Services',
		tagKeyword: ['daycare', 'kindergarten', 'nursery', 'children']
	},

	place_of_worship: {
		name: 'Places of Worship',
		query: 'nwr[amenity=place_of_worship];',
		iconName: 'prayer',
		catName: 'Services',
		tagKeyword: ['church', 'mosque', 'worship', 'prayer', 'religion'],
		tagParser: worship_parser
	},

	social_facility: {
		name: 'Social-facilities',
		query: 'nwr[amenity~"^social_facility$|^retirement_home$"];',
		iconName: 'sozialeeinrichtung',
		catName: 'Services',
		tagKeyword: ['care', 'retirement', 'nurse', 'home', 'social-facility', 'sheltered-house'],
		tagParser: socialf_parser
	},

	events_venue: {
		name: 'Events-venues',
		query: 'nwr[amenity=events_venue];',
		iconName: 'dancinghall',
		catName: 'Services',
		tagKeyword: ['hire', 'events-venue', 'rent']
	},

	hospital: {
		name: 'Hospitals',
		query: 'nwr[amenity=hospital];',
		iconName: 'hospital-building',
		catName: 'Services',
		tagKeyword: ['hospital', 'help', 'medical'],
		tagParser: hospital_parser
	},

	doctors: {
		name: 'Doctors',
		query: 'nwr[amenity=doctors];',
		iconName: 'medicine',
		catName: 'Services',
		tagKeyword: ['doctor', 'help', 'medical']
	},

	dentist: {
		name: 'Dentists',
		query: 'nwr[amenity=dentist];',
		iconName: 'dentist',
		catName: 'Services',
		tagKeyword: ['dentist', 'teeth']
	},

	healthcare: {
		name: 'Healthcare Services',
		query: 'nwr[healthcare];',
		iconName: 'medicalstore',
		catName: 'Services',
		tagKeyword: ['healthcare', 'medical', 'therapy', 'clinic', 'chiropractic', 'osteopathy']
	},

	pharmacy: {
		name: 'Pharmacies',
		query: 'nwr[amenity=pharmacy];',
		iconName: 'drugstore',
		catName: 'Services',
		tagKeyword: ['pharmacy', 'chemist', 'drugstore']
	},

	mobility: {
		name: 'Mobility/Hearing Aids',
		query: 'nwr[shop~"^mobility$|^hearing_aids$"];',
		iconName: 'retirement_home',
		catName: 'Services',
		tagKeyword: ['mobility', 'wheelchair', 'deaf', 'disability']
	},

	funeral_directors: {
		name: 'Funeral Directors',
		query: 'nwr[shop=funeral_directors];',
		iconName: 'crematorium',
		catName: 'Services',
		tagKeyword: ['funeral-directors']
	},

	estate_agent: {
		name: 'Property Agents',
		query: 'nwr[office~"^estate_agent$|^property_management$"];',
		iconName: 'apartment-2',
		catName: 'Services',
		tagKeyword: ['estate-agent', 'property']
	},

	accountant: {
		name: 'Accountants',
		query: 'nwr[office~"^accountant$|^financial$"];',
		iconName: 'coins',
		catName: 'Services',
		tagKeyword: ['accountant', 'financial', 'money']
	},

	insurance: {
		name: 'Insurers',
		query: 'nwr[office=insurance];',
		iconName: 'umbrella-2',
		catName: 'Services',
		tagKeyword: ['insurance']
	},

	lawyer: {
		name: 'Solicitors',
		query: 'nwr[office=lawyer];',
		iconName: 'court',
		catName: 'Services',
		tagKeyword: ['lawyer', 'solicitor']
	},

	// SHOPS - 1b4f72 - e74c3c - 117864 - a06464 - 52be80 - b9770e

	supermarket: {
		name: 'Supermarkets',
		query: 'nwr[shop~"^supermarket$|^frozen_food$"];',
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
		name: 'Newsagents',
		query: 'nwr[shop=newsagent];',
		iconName: 'newsagent',
		catName: 'Shops',
		tagKeyword: ['newsagent', 'corner-shop']
	},

	greengrocer: {
		name: 'Greengrocers',
		query: 'nwr[shop=greengrocer];',
		iconName: 'fruits',
		catName: 'Shops',
		tagKeyword: ['greengrocer', 'fruit', 'vegetables']
	},

	bakery: {
		name: 'Bakeries',
		query: 'nwr[shop=bakery];',
		iconName: 'bread',
		catName: 'Shops',
		tagKeyword: ['bakery', 'bread', 'cake']
	},

	deli: {
		name: 'Butchers/Delicatessens',
		query: 'nwr[shop~"^deli$|^butcher$"];',
		iconName: 'farmstand',
		catName: 'Shops',
		tagKeyword: ['butcher', 'meat', 'delicatessen']
	},

	seafood: {
		name: 'Fishmongers',
		query: 'nwr[shop=seafood];',
		iconName: 'shop_fish',
		catName: 'Shops',
		tagKeyword: ['seafood', 'fish']
	},

	confectionery: {
		name: 'Confectioners',
		query: 'nwr[shop=confectionery];',
		iconName: 'candy',
		catName: 'Shops',
		tagKeyword: ['sugar', 'sweets', 'candy', 'confectionery']
	},

	alcohol: {
		name: 'Off-licences',
		query: 'nwr[shop=alcohol];',
		iconName: 'liquor',
		catName: 'Shops',
		tagKeyword: ['alcohol', 'liquor', 'beer', 'wine', 'spirits', 'drink', 'off-licence']
	},

	tobacco: {
		name: 'Tobacconists/Vaping',
		query: 'nwr[shop~"^tobacco$|^e-cigarette$"];',
		iconName: 'smoking',
		catName: 'Shops',
		tagKeyword: ['tobacco', 'e-cigarette', 'smoke', 'vape']
	},

	bookmaker: {
		name: 'Bookmakers',
		query: 'nwr[shop=bookmaker];',
		iconName: 'cup',
		catName: 'Shops',
		tagKeyword: ['bookmaker', 'bet', 'gamble']
	},

	variety_store: {
		name: 'Variety',
		query: 'nwr[shop=variety_store];',
		iconName: 'mall',
		catName: 'Shops',
		tagKeyword: ['variety', 'pound', 'supplies', 'toys', 'confectionery']
	},

	copyshop: {
		name: 'Printers',
		query: 'nwr[shop~"^copyshop$|^signs$"];',
		iconName: 'printer-2',
		catName: 'Shops',
		tagKeyword: ['copyshop', 'printers', 'signs']
	},

	stationery: {
		name: 'Stationers',
		query: 'nwr[shop=stationery];',
		iconName: 'pens',
		catName: 'Shops',
		tagKeyword: ['stationery', 'supplies']
	},

	doityourself: {
		name: 'DIY/Hardware',
		query: 'nwr[shop~"^doityourself$|^hardware$"];',
		iconName: 'tools',
		catName: 'Shops',
		tagKeyword: ['doityourself', 'hardware', 'diy', 'tools']
	},

	clothes: {
		name: 'Clothes',
		query: 'nwr[shop~"^clothes$|^boutique$|^department_store$"];',
		iconName: 'clothers_female',
		catName: 'Shops',
		tagKeyword: ['clothes', 'boutique', 'department-store'],
		tagParser: clothes_parser
	},

	tailor: {
		name: 'Tailors',
		query: 'nwr[shop=tailor];',
		iconName: 'tailor',
		catName: 'Shops',
		tagKeyword: ['clothes', 'tailor']
	},

	charity: {
		name: 'Charities',
		query: 'nwr[shop=charity];nwr[charity=yes];',
		iconName: 'charity',
		catName: 'Shops',
		tagKeyword: ['charity', 'second-hand']
	},

	shoes: {
		name: 'Shoes',
		query: 'nwr[shop=shoes];',
		iconName: 'shoes',
		catName: 'Shops',
		tagKeyword: ['shoes', 'footwear']
	},

	houseware: {
		name: 'Interior Decorations',
		query: 'nwr[shop~"^houseware$|^interior_decoration$|^bathroom_furnishing$|^kitchen$"];',
		iconName: 'kitchen',
		catName: 'Shops',
		tagKeyword: ['interior-decoration', 'houseware', 'bathroom', 'kitchen']
	},

	furniture: {
		name: 'Furniture',
		query: 'nwr[shop=furniture];',
		iconName: 'homecenter',
		catName: 'Shops',
		tagKeyword: ['furniture']
	},

	carpet: {
		name: 'Carpets',
		query: 'nwr[shop=carpet];',
		iconName: 'textiles',
		catName: 'Shops',
		tagKeyword: ['carpet', 'floor']
	},

	bed: {
		name: 'Beds',
		query: 'nwr[shop=bed];',
		iconName: 'lodging-2',
		catName: 'Shops',
		tagKeyword: ['bed', 'mattress']
	},

	curtain: {
		name: 'Curtains/Blinds',
		query: 'nwr[shop~"^curtain$|^window_blind$"];',
		iconName: 'curtain',
		catName: 'Shops',
		tagKeyword: ['curtain', 'blinds', 'windows']
	},

	glaziery: {
		name: 'Glaziers',
		query: 'nwr[shop=glaziery];',
		iconName: 'glazer',
		catName: 'Shops',
		tagKeyword: ['windows', 'glazier']
	},

	jewelry: {
		name: 'Jewellers',
		query: 'nwr[shop=jewelry];',
		iconName: 'jewelry',
		catName: 'Shops',
		tagKeyword: ['jewellery', 'watches', 'rings']
	},

	bag: {
		name: 'Bags',
		query: 'nwr[shop=bag];',
		iconName: 'bags',
		catName: 'Shops',
		tagKeyword: ['handbag']
	},

	watches: {
		name: 'Watches',
		query: 'nwr[shop=watches];',
		iconName: 'watch',
		catName: 'Shops',
		tagKeyword: ['watches', 'clock', 'repair']
	},

	hairdresser: {
		name: 'Hairdressers',
		query: 'nwr[shop=hairdresser];',
		iconName: 'hair',
		catName: 'Shops',
		tagKeyword: ['barber', 'hairdresser', 'shave'],
	},

	beauty: {
		name: 'Beauticians',
		query: 'nwr[shop=beauty];',
		iconName: 'beautysalon',
		catName: 'Shops',
		tagKeyword: ['hairdresser', 'beauty', 'massage', 'nails', 'tan']
	},

	massage: {
		name: 'Massage Parlours',
		query: 'nwr[shop=massage];',
		iconName: 'massage',
		catName: 'Shops',
		tagKeyword: ['massage', 'beauty']
	},

	optician: {
		name: 'Opticians',
		query: 'nwr[shop=optician];',
		iconName: 'glasses',
		catName: 'Shops',
		tagKeyword: ['optician', 'glasses', 'spectacles']
	},

	tattoo: {
		name: 'Tattoo Artists',
		query: 'nwr[shop=tattoo];',
		iconName: 'tattoo',
		catName: 'Shops',
		tagKeyword: ['tattoo', 'pierce']
	},

	dry_cleaning: {
		name: 'Laundrettes/Dry-Cleaners',
		query: 'nwr[shop~"^dry_cleaning$|^laundry$"];',
		iconName: 'laundromat',
		catName: 'Shops',
		tagKeyword: ['laundry', 'clean', 'wash']
	},

	travel_agency: {
		name: 'Travel Agents',
		query: 'nwr[shop=travel_agency];',
		iconName: 'travel_agency',
		catName: 'Shops',
		tagKeyword: ['travel-agency', 'holiday']
	},

	florist: {
		name: 'Florist/Garden',
		query: 'nwr[shop~"^florist$|^garden_centre$"];',
		iconName: 'garden',
		catName: 'Shops',
		tagKeyword: ['florist', 'garden-centre', 'flowers', 'plants']
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
		tagKeyword: ['books', 'reading']
	},

	antiques: {
		name: 'Antiques',
		query: 'nwr[shop=antiques];',
		iconName: 'gavel-auction-fw',
		catName: 'Shops',
		tagKeyword: ['antiques', 'furniture', 'second-hand', 'thrift']
	},

	second_hand: {
		name: 'Second-hand',
		query: 'nwr[shop=second_hand];nwr[second_hand~"^yes$|^only$"];',
		iconName: '2hand',
		catName: 'Shops',
		tagKeyword: ['second-hand', 'thrift', 'bric-a-brac']
	},

	craft: {
		name: 'Craft Supplies',
		query: 'nwr[shop=craft];',
		iconName: 'craftstore',
		catName: 'Shops',
		tagKeyword: ['crafts', 'photographer', 'handi', 'models', 'art']
	},

	frame: {
		name: 'Picture Framers',
		query: 'nwr[shop=frame];',
		iconName: 'museum_art',
		catName: 'Shops',
		tagKeyword: ['picture', 'artwork', 'frame']
	},

	gift: {
		name: 'Gifts',
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
		tagKeyword: ['toys', 'gift']
	},

	fishing: {
		name: 'Fishing',
		query: 'nwr[shop=fishing];',
		iconName: 'fishingstore',
		catName: 'Shops',
		tagKeyword: ['fish', 'angling']
	},

	pet: {
		name: 'Pets',
		query: 'nwr[shop~"^pet"];',
		iconName: 'pets',
		catName: 'Shops',
		tagKeyword: ['pet', 'cat', 'dog', 'animals', 'grooming']
	},

	music: {
		name: 'Records',
		query: 'nwr[shop=music];',
		iconName: 'music',
		catName: 'Shops',
		tagKeyword: ['music', 'cds', 'vinyl']
	},

	musical_instrument: {
		name: 'Musical Instruments',
		query: 'nwr[shop=musical_instrument];',
		iconName: 'music_rock',
		catName: 'Shops',
		tagKeyword: ['musical', 'instrument']
	},

	electronics: {
		name: 'Electronics',
		query: 'nwr[shop=electronics];',
		iconName: 'outlet1',
		catName: 'Shops',
		tagKeyword: ['electronics', 'washing-machine', 'fridge', 'microwave', 'oven', 'camera', 'hifi', 'mobile-phone']
	},

	computer: {
		name: 'Computers',
		query: 'nwr[shop=computer];',
		iconName: 'computers',
		catName: 'Shops',
		tagKeyword: ['computer', 'repair']
	},

	games: {
		name: 'Games/Collectors',
		query: 'nwr[shop~"^games$|^collector$"];',
		iconName: 'poker',
		catName: 'Shops',
		tagKeyword: ['collectables', 'games']
	},

	mobile_phone: {
		name: 'Mobile Phones',
		query: 'nwr[shop=mobile_phone];',
		iconName: 'phones',
		catName: 'Shops',
		tagKeyword: ['mobile', 'cell', 'phone', 'repair']
	},

	bicycle: {
		name: 'Bicycles',
		query: 'nwr[shop=bicycle];nwr["service:bicycle:retail"];nwr[amenity=bicycle_repair_station];',
		iconName: 'bicycle_shop',
		catName: 'Shops',
		tagKeyword: ['bicycle', 'bike'],
		tagParser: bike_parser
	},

	car: {
		name: 'Car Sales',
		query: 'nwr[shop=car];',
		iconName: 'car',
		catName: 'Shops',
		tagKeyword: ['car-sales', 'second-hand']
	},

	// OTHER - eaecee

	political: {
		name: 'Wards',
		query: 'relation[political_division=ward];',
		iconName: 'politicalboundary',
		catName: 'Other',
		tagKeyword: ['ward', 'political-area', 'voting', 'boundary'],
		permTooltip: true
	},

	protected_area: {
		name: 'Protected Areas',
		query: 'nwr[boundary=protected_area];',
		iconName: 'administrativeboundary',
		catName: 'Other',
		tagKeyword: ['conservation', 'protected-area', 'boundary']
	},

	construction: {
		name: 'Construction',
		query: 'nwr[construction]["ref:planningapp"];',
		iconName: 'construction',
		catName: 'Other',
		tagKeyword: ['construction', 'development']
	},

	surveillance: {
		name: 'Surveillance',
		query: 'node[~"^highway$|^man_made$"~"^speed_camera$|^surveillance$"][surveillance!~"^webcam$"];',
		iconName: 'cctv',
		catName: 'Other',
		tagKeyword: ['surveillance', 'cctv', 'security', 'camera'],
		tagParser: cctv_parser
	},

	// unlisted from categories but used elsewhere

	boundary_stone: {
		name: 'Boundary Stones',
		query: 'node[historic=boundary_stone];relation(9825836);relation(12268775);',
		iconName: 'boundary'
	},

	bus_stop: {
		name: 'Bus Stop',
		tagParser: busstop_parser
	},

	clock: {
		name: 'Public Clocks',
		query: 'node[amenity=clock];',
		iconName: 'clock'
	},
	
	survey_point: {
		name: 'Survey Points',
		query: 'node[man_made=survey_point];',
		iconName: 'spbenchmark',
		tagParser: surveyp_parser
	}

};
