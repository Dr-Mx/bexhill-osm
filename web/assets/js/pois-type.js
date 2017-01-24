// all the POIs available to the map
// comments below indicate tabs and colour-codes of icons (for use on mapicons.mapsmarker.com)
// array name must be same as query

var pois = {

	//SHOPS - 5ec8bd - 5e8ac7 - 5fc78a - 6b46f2 - 99cf43 - cfaf44

	supermarket: {
		name: 'Supermarket',
		query: '[shop=supermarket]',
		iconName: 'supermarket',
		catName: 'Shops',
		tagKeyword: ['supermarket', 'shopping']
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

	butcher: {
		name: 'Butcher/Deli',
		query: '["shop"~"butcher|deli"]',
		iconName: 'butcher',
		catName: 'Shops',
		tagKeyword: ['butcher', 'meat', 'delicatessen']
	},

	seafood: {
		name: 'Seafood',
		query: '[shop=seafood]',
		iconName: 'restaurant_fish',
		catName: 'Shops',
		tagKeyword: ['seafood', 'fish']
	},

	confectionery: {
		name: 'Confectionery',
		query: '[shop=confectionery]',
		iconName: 'patisserie',
		catName: 'Shops',
		tagKeyword: ['sugar', 'sweets', 'confectionery', 'cake']
	},

	alcohol: {
		name: 'Alcohol',
		query: '[shop=alcohol]',
		iconName: 'liquor',
		catName: 'Shops',
		tagKeyword: ['alcohol', 'liquor', 'beer', 'wine', 'spirits', 'drink']
	},

	tobacco: {
		name: 'Cigarettes',
		query: '["shop"~"tobacco|e-cigarette"]',
		iconName: 'smoking',
		catName: 'Shops',
		tagKeyword: ['tobacco', 'e-cigarette', 'smoking', 'vaping']
	},

	bookmaker: {
		name: 'Betting',
		query: '[shop=bookmaker]',
		iconName: 'cup',
		catName: 'Shops',
		tagKeyword: ['bookmaker', 'betting', 'gambling']
	},

	department_store: {
		name: 'Department-Store',
		query: '[shop=department_store]',
		iconName: 'departmentstore',
		catName: 'Shops',
		tagKeyword: ['department-store']
	},

	variety_store: {
		name: 'Variety-Store',
		query: '[shop=variety_store]',
		iconName: 'mall',
		catName: 'Shops',
		tagKeyword: ['variety-store', 'pound-store', '99p', 'supplies', 'toys', 'confectionery']
	},

	stationery: {
		name: 'Stationery',
		query: '[shop=stationery]',
		iconName: 'pens',
		catName: 'Shops',
		tagKeyword: ['stationery', 'office-supplies']
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
		query: '["shop"~"clothes|boutique"]',
		iconName: 'clothers_female',
		catName: 'Shops',
		tagKeyword: ['clothing', 'boutique'],
		tagParser: clothes_parser
	},

	tailor: {
		name: 'Tailor',
		query: '[shop=tailor]',
		iconName: 'tailor',
		catName: 'Shops',
		tagKeyword: ['clothing', 'tailor']
	},

	charity: {
		name: 'Charity',
		query: '[shop=charity]',
		iconName: 'charity',
		catName: 'Shops',
		tagKeyword: ['charity', 'clothing', 'books', 'toys', 'confectionery', 'furniture', 'crafts', 'second-hand']
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
		tagKeyword: ['carpet', 'flooring']
	},

	bed: {
		name: 'Bed-Store',
		query: '[shop=bed]',
		iconName: 'bed',
		catName: 'Shops',
		tagKeyword: ['bed', 'mattress']
	},

	curtain: {
		name: 'Curtain/Blinds',
		query: '["shop"~"curtain|window_blind"]',
		iconName: 'curtains',
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
		tagKeyword: ['bag', 'handbag']
	},

	watches: {
		name: 'Watches',
		query: '[shop=watches]',
		iconName: 'chronometer',
		catName: 'Shops',
		tagKeyword: ['watches', 'clock']
	},

	hairdresser: {
		name: 'Hairdresser',
		query: '[shop=hairdresser]',
		iconName: 'barber',
		catName: 'Shops',
		tagKeyword: ['barber', 'hairdresser'],
		tagParser: hairdresser_parser
	},

	beauty: {
		name: 'Beauty',
		query: '[shop=beauty]',
		iconName: 'beautysalon',
		catName: 'Shops',
		tagKeyword: ['hairdresser', 'beauty', 'massage', 'nails', 'tanning']
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
		iconName: 'acupuncture',
		catName: 'Shops',
		tagKeyword: ['tattoo', 'piercing']
	},

	dry_cleaning: {
		name: 'Laundry/Dry-Cleaning',
		query: '["shop"~"dry_cleaning|laundry"]',
		iconName: 'laundromat',
		catName: 'Shops',
		tagKeyword: ['laundry', 'dry-cleaning', 'washing']
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
		iconName: 'artgallery',
		catName: 'Shops',
		tagKeyword: ['art-gallery', 'gallery']
	},

	books: {
		name: 'Books',
		query: '[shop=books]',
		iconName: 'book',
		catName: 'Shops',
		tagKeyword: ['books', 'reading']
	},

	antiques: {
		name: 'Antiques',
		query: '[shop=antiques]',
		iconName: 'antiques',
		catName: 'Shops',
		tagKeyword: ['antiques', 'furniture', 'second-hand']
	},

	second_hand: {
		name: 'Second-Hand',
		query: '[shop=second_hand]',
		iconName: '2hand',
		catName: 'Shops',
		tagKeyword: ['second-hand', 'clothing', 'books', 'toys', 'confectionery', 'furniture', 'crafts']
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
		iconName: 'frame',
		catName: 'Shops',
		tagKeyword: ['picture-framing', 'artwork-framing']
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
		tagKeyword: ['fishing', 'angling']
	},

	pet: {
		name: 'Pet',
		query: '[shop=pet]',
		iconName: 'pets',
		catName: 'Shops',
		tagKeyword: ['pet', 'cat', 'dog']
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
		tagKeyword: ['musical-instrument', 'instrument']
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
		tagKeyword: ['collectables', 'computer-games']
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
		tagKeyword: ['bicycle', 'cycling', 'bike'],
		tagParser: bikeshop_parser
	},

	car: {
		name: 'Car-Sales',
		query: '[shop=car]',
		iconName: 'car',
		catName: 'Shops',
		tagKeyword: ['car-sales', 'second-hand']
	},

	//AMENITY - a8a8a8 - f34648 - 876759 - 3875d7 - baba06 - 128e4e

	wheelchair: {
		name: 'Wheelchair Access',
		query: '[wheelchair=yes]',
		iconName: 'disability',
		catName: 'Amenities',
		tagKeyword: ['wheelchair', 'disability']
	},

	dog: {
		name: 'Dog Friendly',
		query: '[dog=yes]',
		iconName: 'dogs_leash',
		catName: 'Amenities',
		tagKeyword: ['dog friendly']
	},

	school: {
		name: 'Education',
		query: '["amenity"~"school|college"]',
		iconName: 'school',
		catName: 'Amenities',
		tagKeyword: ['school', 'college', 'education'],
		tagParser: school_parser
	},

	kindergarten: {
		name: 'Nursery',
		query: '[amenity=kindergarten]',
		iconName: 'daycare',
		catName: 'Amenities',
		tagKeyword: ['daycare', 'kindergarten', 'nursery', 'child-care']
	},

	place_of_worship: {
		name: 'Place of Worship',
		query: '[amenity=place_of_worship]',
		iconName: 'prayer',
		catName: 'Amenities',
		tagKeyword: ['church', 'mosque', 'worship', 'prayer', 'religion'],
		tagParser: worship_parser
	},

	social_facility: {
		name: 'Social-Facility',
		query: '["amenity"~"social_facility|retirement_home"]',
		iconName: 'social',
		catName: 'Amenities',
		tagKeyword: ['care-home', 'retirement-home', 'nursing-home', 'social-facility', 'sheltered-housing'],
		tagParser: socialf_parser
	},

	events_venue: {
		name: 'Events-Venue',
		query: '[amenity=events_venue]',
		iconName: 'dancinghall',
		catName: 'Amenities',
		tagKeyword: ['hire', 'events-venue', 'rent']
	},

	cafe: {
		name: 'Cafe',
		query: '[amenity=cafe]',
		iconName: 'coffee',
		catName: 'Amenities',
		tagKeyword: ['cafe', 'tea', 'coffee', 'food', 'eat', 'breakfast', 'lunch', 'sandwich', 'cake', 'snacks', 'drink'],
		tagParser: food_parser
	},

	ice_cream: {
		name: 'Ice-Cream',
		query: '[ice_cream=yes]',
		iconName: 'icecream',
		catName: 'Amenities',
		tagKeyword: ['ice-cream']
	},

	bar: {
		name: 'Bar/Nightclub',
		query: '["amenity"~"bar|nightclub"]',
		iconName: 'bar_coktail',
		catName: 'Amenities',
		tagKeyword: ['bar', 'nightclub', 'cocktail', 'drink', 'dancing', 'alcohol', 'wine']
	},

	fast_food: {
		name: 'Fast-Food',
		query: '[amenity=fast_food]',
		iconName: 'fastfood',
		catName: 'Amenities',
		tagKeyword: ['fast-food', 'eat', 'burger', 'chips', 'kebab', 'pizza'],
		tagParser: food_parser
	},

	restaurant: {
		name: 'Restaurant',
		query: '[amenity=restaurant]',
		iconName: 'restaurant',
		catName: 'Amenities',
		tagKeyword: ['restaurant', 'food', 'eat', 'take-away', 'dining', 'lunch'],
		tagParser: food_parser
	},

	pub: {
		name: 'Pub',
		query: '[amenity=pub]',
		iconName: 'bar',
		catName: 'Amenities',
		tagKeyword: ['pub', 'drink', 'beer', 'alcohol', 'food', 'snacks'],
		tagParser: pub_parser
	},

	marketplace: {
		name: 'Marketplace',
		query: '[amenity=marketplace]',
		iconName: 'market',
		catName: 'Amenities',
		tagKeyword: ['market-place', 'greengrocer', 'fruit', 'vegetables', 'cheese', 'meat']
	},

	bank: {
		name: 'Bank',
		query: '[amenity=bank]',
		iconName: 'bank_pound',
		catName: 'Amenities',
		tagKeyword: ['bank', 'money']
	},

	atm: {
		name: 'ATM',
		query: '[amenity=atm]',
		iconName: 'atm_pound',
		catName: 'Amenities',
		tagKeyword: ['atm', 'bank', 'money', 'cash-point']
	},

	telephone: {
		name: 'Telephone-Box',
		query: '[amenity=telephone]',
		iconName: 'telephone',
		catName: 'Amenities',
		tagKeyword: ['telephone-box', 'phone-box']
	},

	post_box: {
		name: 'Post-Box/Office',
		query: '[amenity~"post_box|post_office"]',
		iconName: 'postal',
		catName: 'Amenities',
		tagKeyword: ['post-box', 'letter', 'mail', 'post-office'],
		tagParser: post_parser
	},

	recycling: {
		name: 'Recycling',
		query: '[amenity=recycling]',
		iconName: 'recycle',
		catName: 'Amenities',
		tagKeyword: ['recycling'],
		tagParser: recyclecentre_parser
	},

	grit_bin: {
		name: 'Grit-Bin',
		query: '[amenity=grit_bin]',
		iconName: 'roadtype_gravel',
		catName: 'Amenities',
		tagKeyword: ['grit-bin']
	},

	drinking_water: {
		name: 'Drinking-Water',
		query: '[amenity=drinking_water]',
		iconName: 'drinkingwater',
		catName: 'Amenities',
		tagKeyword: ['drink', 'tap', 'water']
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
		tagKeyword: ['fuel', 'gas-station', 'petrol-station', 'unleaded', 'diesel', 'motoring'],
		tagParser: fuelstation_parser
	},

	car_repair: {
		name: 'Car-Repair/MOT',
		query: '["shop"~"car_repair|tyres"]',
		iconName: 'carrepair',
		catName: 'Amenities',
		tagKeyword: ['car-repair', 'garage', 'tyres', 'mechanic', 'motoring']
	},

	car_rental: {
		name: 'Car-Rental',
		query: '[amenity=car_rental]',
		iconName: 'carrental',
		catName: 'Amenities',
		tagKeyword: ['car-rental', 'rental', 'motoring']
	},

	car_wash: {
		name: 'Car-Wash',
		query: '[amenity=car_wash]',
		iconName: 'carwash',
		catName: 'Amenities',
		tagKeyword: ['car-wash', 'motoring']
	},

	parking: {
		name: 'Car-Parking',
		query: '[amenity=parking]',
		iconName: 'parking',
		catName: 'Amenities',
		tagKeyword: ['car-parking', 'motoring'],
		tagParser: carpark_parser
	},

	bicycle_parking: {
		name: 'Bicycle-Parking',
		query: '[amenity=bicycle_parking]',
		iconName: 'parking_bicycle',
		catName: 'Amenities',
		tagKeyword: ['bicycle-parking', 'cycling', 'bike'],
		tagParser: bikepark_parser
	},

	veterinary: {
		name: 'Veterinary',
		query: '[amenity=veterinary]',
		iconName: 'veterinary',
		catName: 'Amenities',
		tagKeyword: ['veterinary', 'pet', 'animals']
	},

	animal_shelter: {
		name: 'Animal-Shltr/Brding',
		query: '["amenity"~"animal_shelter|animal_boarding"]',
		iconName: 'animal-shelter-export',
		catName: 'Amenities',
		tagKeyword: ['animal-shelter', 'animal-boarding', 'pet', 'cat', 'dog']
	},

	//SERVICES - 3875d7 - f34648 - 5ec8bd - 6b46f2

	townhall: {
		name: 'Town-Hall',
		query: '[amenity=townhall]',
		iconName: 'townhouse',
		catName: 'Services',
		tagKeyword: ['townhall', 'administration']
	},

	community_centre: {
		name: 'Community-Centre',
		query: '[amenity=community_centre]',
		iconName: 'communitycentre',
		catName: 'Services',
		tagKeyword: ['community-centre', 'meeting', 'events-venue', 'social']
	},

	police: {
		name: 'Police',
		query: '[amenity=police]',
		iconName: 'police2',
		catName: 'Services',
		tagKeyword: ['police', 'help', 'emergency']
	},

	fire_station: {
		name: 'Fire-Station',
		query: '[amenity=fire_station]',
		iconName: 'firemen',
		catName: 'Services',
		tagKeyword: ['fire', 'help', 'emergency']
	},

	surveillance: {
		name: 'Surveillance',
		query: '[man_made=surveillance]',
		iconName: 'cctv',
		catName: 'Services',
		tagKeyword: ['surveillance-camera', 'cctv', 'security-camera'],
		tagParser: cctv_parser
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
		tagKeyword: ['dentist', 'teeth', 'dentures']
	},

	healthcare: {
		name: 'Healthcare',
		query: '["healthcare"~"."]',
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
		iconName: 'mobility',
		catName: 'Services',
		tagKeyword: ['mobility', 'wheelchair', 'hearing', 'disability']
	},

	defibrillator: {
		name: 'Defibrillator',
		query: '[emergency=defibrillator]',
		iconName: 'aed-2',
		catName: 'Services',
		tagKeyword: ['defibrillator', 'aed', 'emergency', 'help'],
		tagParser: defib_parser
	},

	funeral_directors: {
		name: 'Funeral Directors',
		query: '[shop=funeral_directors]',
		iconName: 'crematorium',
		catName: 'Services',
		tagKeyword: ['funeral-directors']
	},

	jobcentre: {
		name: 'Job Centre',
		query: '[amenity=jobcentre]',
		iconName: 'workoffice',
		catName: 'Services',
		tagKeyword: ['job-centre', 'employment-office']
	},

	library: {
		name: 'Library',
		query: '[amenity=library]',
		iconName: 'library',
		catName: 'Services',
		tagKeyword: ['library', 'books']
	},

	toilets: {
		name: 'Public Toilets',
		query: '[amenity=toilets]',
		iconName: 'toilets',
		catName: 'Services',
		tagKeyword: ['toilet', 'wc', 'restroom', 'baby-changing', 'lavatory'],
		tagParser: toilet_parser
	},

	estate_agent: {
		name: 'Estate Agent',
		query: '[office=estate_agent]',
		iconName: 'apartment-3',
		catName: 'Services',
		tagKeyword: ['estate-agent', 'property', 'housing']
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

	//LEISURE - a8a8a8 - c259b6 - c47848 - 67c547 - 3875d7  - 5ec8bd
	
	image: {
		name: 'Wiki Photos',
		query: '["image"~"."]',
		iconName: 'photo',
		catName: 'Leisure-Tourism',
		tagKeyword: ['photos', 'pictures', 'images']
	},
		
	attraction: {
		name: 'Attraction',
		query: '["tourism"~"attraction|museum|gallery"]',
		iconName: 'star-3',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'attraction']
	},

	information: {
		name: 'Information',
		query: '[tourism=information]',
		iconName: 'information',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'information'],
		tagParser: info_parser
	},

	viewpoint: {
		name: 'Viewpoint',
		query: '[tourism=viewpoint]',
		iconName: 'panoramicview',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'viewpoint']
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
		query: '[tourism=artwork]',
		iconName: 'publicart',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'artwork', 'sculpture'],
		tagParser: artwork_parser
	},

	historic: {
		name: 'Historic',
		query: '["historic"~"."]',
		iconName: 'ruins-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'historic', 'memorial'],
		tagParser: historic_parser
	},

	listed_status: {
		name: 'Heritage-Listed',
		query: '["HE_ref"~"."]',
		iconName: 'house',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'listed-building', 'historic', 'heritage'],
		tagParser: listed_parser
	},

	park: {
		name: 'Park',
		query: '["leisure"~"park|common"]',
		iconName: 'urbanpark',
		catName: 'Leisure-Tourism',
		tagKeyword: ['park', 'common']
	},

	allotments: {
		name: 'Allotment',
		query: '[landuse=allotments]',
		iconName: 'soil',
		catName: 'Leisure-Tourism',
		tagKeyword: ['allotment']
	},

	recreation_ground: {
		name: 'Recreation Ground',
		query: '[landuse=recreation_ground]',
		iconName: 'soccer',
		catName: 'Leisure-Tourism',
		tagKeyword: ['recreation-ground', 'sport', 'park', 'football']
	},

	playground: {
		name: 'Playground',
		query: '[leisure=playground]',
		iconName: 'playground',
		catName: 'Leisure-Tourism',
		tagKeyword: ['playground', 'park']
	},

	picnic_table: {
		name: 'Picnic-Table',
		query: '[leisure=picnic_table]',
		iconName: 'picnic-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['picnic']
	},

	shelter: {
		name: 'Shelter',
		query: '[amenity=shelter]',
		iconName: 'shelter_picnic',
		catName: 'Leisure-Tourism',
		tagKeyword: ['picnic', 'rain-shelter']
	},

	boat_rental: {
		name: 'Boat Rental',
		query: '[amenity=boat_rental]',
		iconName: 'rowboat',
		catName: 'Leisure-Tourism',
		tagKeyword: ['boat-rental']
	},

	club: {
		name: 'Organisation Club',
		query: '[amenity=club]',
		iconName: 'conversation-map-icon',
		catName: 'Leisure-Tourism',
		tagKeyword: ['organisation-club', 'social', 'events-venue', 'sports-club'],
		tagParser: club_parser
	},

	fitness_centre: {
		name: 'Fitness-Centre',
		query: '[leisure=fitness_centre]',
		iconName: 'weights',
		catName: 'Leisure-Tourism',
		tagKeyword: ['fitness-centre', 'leisure-centre', 'gym', 'sport']
	},

	swimming_pool: {
		name: 'Swimming-Pool',
		query: '[leisure=swimming_pool]',
		iconName: 'swimming2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['swimming-pool', 'leisure-centre', 'sport']
	},

	amusement_arcade: {
		name: 'Amusement-Arcade',
		query: '[leisure=amusement_arcade]',
		iconName: 'casino-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['amusement-arcade', 'arcade', 'gambling']
	},

	hotel: {
		name: 'Hotel',
		query: '[tourism=hotel]',
		iconName: 'hotel_0star',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'hotel', 'lodging', 'sleep', 'bed'],
		tagParser: hotel_parser
	},

	guest_house: {
		name: 'Guest-House',
		query: '[tourism=guest_house]',
		iconName: 'bed_breakfast1-2',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'bed-and-breakfast', 'guest-house', 'lodging', 'sleep'],
		tagParser: hotel_parser
	},

	apartment: {
		name: 'Rental Apartment',
		query: '[tourism=apartment]',
		iconName: 'villa',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'apartment', 'self-catering', 'lodging', 'sleep', 'bed'],
		tagParser: hotel_parser
	},

	caravan_site: {
		name: 'Caravan-Site',
		query: '[tourism=caravan_site]',
		iconName: 'campingcar',
		catName: 'Leisure-Tourism',
		tagKeyword: ['tourism', 'caravan-site', 'camping', 'sleep']
	}

};
