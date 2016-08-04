// All the POIs shown in the map
// Comments below indicate tabs and colour-codes of icons (for use on mapicons.mapsmarker.com)

var pois = {

//SHOPS - 5ec8bd - 5e8ac7 - 5fc78a - 6b46f2 - 99cf43 - cfaf44
	
    supermarket: {
	name: 'Supermarket',
	query: '[shop=supermarket]',
	iconName: 'supermarket',
	tabName: 'shops',
	tagKeyword: ['supermarket', 'shopping']
    },
	
    convenience: {
	name: 'Convenience',
	query: '[shop=convenience]',
	iconName: 'conveniencestore',
	tabName: 'shops',
	tagKeyword: ['convenience', 'corner-shop']
    },

    newsagent: {
	name: 'Newsagent',
	query: '[shop=newsagent]',
	iconName: 'newsagent',
	tabName: 'shops',
	tagKeyword: ['newsagent', 'corner-shop']
    },

    greengrocer: {
	name: 'Greengrocer',
	query: '[shop=greengrocer]',
	iconName: 'fruits',
	tabName: 'shops',
	tagKeyword: ['greengrocer', 'fruit', 'vegetables']
    },

    bakery: {
	name: 'Bakery',
	query: '[shop=bakery]',
	iconName: 'bread',
	tabName: 'shops',
	tagKeyword: ['bakery', 'bread', 'cake']
    },

    confectionery: {
	name: 'Confectionery',
	query: '[shop=confectionery]',
	iconName: 'patisserie',
	tabName: 'shops',
	tagKeyword: ['sugar', 'sweets', 'confectionery', 'cake']
    },

    butcher: {
	name: 'Butcher',
	query: '[shop=butcher]',
	iconName: 'butcher-2',
	tabName: 'shops',
	tagKeyword: ['butcher', 'meat']
    },

    seafood: {
	name: 'Seafood',
	query: '[shop=seafood]',
	iconName: 'restaurant_fish',
	tabName: 'shops',
	tagKeyword: ['seafood', 'fish']
    },

    alcohol: {
	name: 'Alcohol',
	query: '[shop=alcohol]',
	iconName: 'liquor',
	tabName: 'shops',
	tagKeyword: ['alcohol', 'liquor', 'beer', 'wine', 'spirits', 'drink']
    },

    tobacco: {
	name: 'Cigarettes',
	query: '["shop"~"tobacco|e-cigarette"]',
	iconName: 'smoking',
	tabName: 'shops',
	tagKeyword: ['tobacco', 'e-cigarette', 'smoking', 'vaping']
    },

    bookmaker: {
	name: 'Betting',
	query: '[shop=bookmaker]',
	iconName: 'cup',
	tabName: 'shops',
	tagKeyword: ['bookmaker', 'betting', 'gambling']
    },

    department_store: {
	name: 'Department-Store',
	query: '[shop=department_store]',
	iconName: 'departmentstore',
	tabName: 'shops',
	tagKeyword: ['department-store', 'clothing']
    },

    variety_store: {
	name: 'Variety-Store',
	query: '[shop=variety_store]',
	iconName: 'mall',
	tabName: 'shops',
	tagKeyword: ['variety-store', 'pound-store', '99p', 'supplies', 'toys', 'confectionery']
    },
	
    stationery: {
	name: 'Stationery',
	query: '[shop=stationery]',
	iconName: 'pens',
	tabName: 'shops',
	tagKeyword: ['stationery', 'office-supplies']
    },
	
    doityourself: {
	name: 'DIY & Hardware',
	query: '["shop"~"doityourself|hardware"]',
	iconName: 'tools',
	tabName: 'shops',
	tagKeyword: ['doityourself', 'hardware', 'diy', 'tools']
    },

    religion: {
	name: 'Religion',
	query: '[shop=religion]',
	iconName: 'prayer',
	tabName: 'shops',
	tagKeyword: ['religion']
    },

    clothes: {
	name: 'Clothes',
	query: '[shop=clothes]',
	iconName: 'clothers_female',
	tabName: 'shops',
	tagKeyword: ['clothing', 'boutique']
    },

    tailor: {
	name: 'Tailor',
	query: '[shop=tailor]',
	iconName: 'tailor',
	tabName: 'shops',
	tagKeyword: ['clothing', 'tailor']
    },

    charity: {
	name: 'Charity',
	query: '[shop=charity]',
	iconName: 'charity',
	tabName: 'shops',
	tagKeyword: ['charity', 'clothing', 'books', 'toys', 'confectionery', 'furniture', 'crafts', 'second-hand']
    },

    shoes: {
	name: 'Shoes',
	query: '[shop=shoes]',
	iconName: 'shoes',
	tabName: 'shops',
	tagKeyword: ['shoes', 'footwear']
    },
	
    houseware: {
	name: 'House & Decor',
	query: '["shop"~"houseware|interior_decoration|bathroom_furnishing"]',
	iconName: 'kitchen',
	tabName: 'shops',
	tagKeyword: ['interior-decoration', 'houseware', 'bathroom']
    },

    furniture: {
	name: 'Furniture',
	query: '[shop=furniture]',
	iconName: 'homecenter',
	tabName: 'shops',
	tagKeyword: ['furniture']
    },

    carpet: {
	name: 'Carpet-Store',
	query: '[shop=carpet]',
	iconName: 'textiles',
	tabName: 'shops',
	tagKeyword: ['carpet', 'flooring']
    },

    bed: {
	name: 'Bed-Store',
	query: '[shop=bed]',
	iconName: 'bed',
	tabName: 'shops',
	tagKeyword: ['bed', 'mattress']
    },

    curtain: {
	name: 'Curtain & Blinds',
	query: '["shop"~"curtain|window_blind"]',
	iconName: 'curtains',
	tabName: 'shops',
	tagKeyword: ['curtain', 'blinds', 'windows']
    },

    jewelry: {
	name: 'Jewellery',
	query: '[shop=jewelry]',
	iconName: 'jewelry',
	tabName: 'shops',
	tagKeyword: ['jewellery', 'watches', 'rings', 'necklaces']
    },

    bag: {
	name: 'Bag',
	query: '[shop=bag]',
	iconName: 'bags',
	tabName: 'shops',
	tagKeyword: ['bag', 'handbag']
    },

    watches: {
	name: 'Watches',
	query: '[shop=watches]',
	iconName: 'chronometer',
	tabName: 'shops',
	tagKeyword: ['watches', 'clock']
    },

    beauty: {
	name: 'Beauty & Hair',
	query: '["shop"~"beauty|hairdresser"]',
	iconName: 'barber',
	tabName: 'shops',
	tagKeyword: ['barber', 'hairdresser', 'beauty', 'massage']
    },
	
    massage: {
	name: 'Massage',
	query: '[shop=massage]',
	iconName: 'massage',
	tabName: 'shops',
	tagKeyword: ['massage', 'beauty']
    },

    optician: {
	name: 'Optician',
	query: '[shop=optician]',
	iconName: 'glasses',
	tabName: 'shops',
	tagKeyword: ['optician', 'glasses']
    },

    tattoo: {
	name: 'Tattoo',
	query: '[shop=tattoo]',
	iconName: 'acupuncture',
	tabName: 'shops',
	tagKeyword: ['tattoo', 'piercing']
    },
	
    dry_cleaning: {
	name: 'Laundry & Dry-Clean',
	query: '["shop"~"dry_cleaning|laundry"]',
	iconName: 'laundromat',
	tabName: 'shops',
	tagKeyword: ['laundry', 'dry-cleaning', 'washing']
    },

    travel_agency: {
	name: 'Travel-Agency',
	query: '[shop=travel_agency]',
	iconName: 'travel_agency',
	tabName: 'shops',
	tagKeyword: ['travel-agency', 'holiday']
    },
	
    florist: {
	name: 'Florist & Garden',
	query: '["shop"~"florist|garden_centre"]',
	iconName: 'garden',
	tabName: 'shops',
	tagKeyword: ['florist', 'garden-centre', 'flowers', 'plants']
    },

    art: {
	name: 'Art',
	query: '[shop=art]',
	iconName: 'artgallery',
	tabName: 'shops',
	tagKeyword: ['art-gallery', 'gallery']
    },

    books: {
	name: 'Books',
	query: '[shop=books]',
	iconName: 'book',
	tabName: 'shops',
	tagKeyword: ['books', 'reading']
    },

    antiques: {
	name: 'Antiques',
	query: '[shop=antiques]',
	iconName: 'antiques',
	tabName: 'shops',
	tagKeyword: ['antiques', 'furniture', 'second-hand']
    },

    second_hand: {
	name: 'Second-Hand',
	query: '[shop=second_hand]',
	iconName: '2hand',
	tabName: 'shops',
	tagKeyword: ['second-hand', 'clothing', 'books', 'toys', 'confectionery', 'furniture', 'crafts']
	},

    craft: {
	name: 'Craft',
	query: '[shop=craft]',
	iconName: 'craftstore',
	tabName: 'shops',
	tagKeyword: ['crafts', 'photographer', 'handicraft', 'models', 'art'],
	tagParser: craft_parser
    },

    frame: {
	name: 'Picture Framing',
	query: '[shop=frame]',
	iconName: 'frame',
	tabName: 'shops',
	tagKeyword: ['picture-framing', 'artwork-framing']
    },

    gift: {
	name: 'Gift',
	query: '[shop=gift]',
	iconName: 'gifts',
	tabName: 'shops',
	tagKeyword: ['gift', 'presents']
    },

    toys: {
	name: 'Toys',
	query: '[shop=toys]',
	iconName: 'toys',
	tabName: 'shops',
	tagKeyword: ['toys', 'gift']
    },

    fishing: {
	name: 'Fishing',
	query: '[shop=fishing]',
	iconName: 'fishingstore',
	tabName: 'shops',
	tagKeyword: ['fishing', 'angling']
    },

    pet: {
	name: 'Pet',
	query: '[shop=pet]',
	iconName: 'pets',
	tabName: 'shops',
	tagKeyword: ['pet', 'cat', 'dog']
    },

    music: {
	name: 'Music',
	query: '[shop=music]',
	iconName: 'music',
	tabName: 'shops',
	tagKeyword: ['music', 'cds', 'vinyl']
    },

    musical_instrument: {
	name: 'Musical-Instrument',
	query: '[shop=musical_instrument]',
	iconName: 'music_rock',
	tabName: 'shops',
	tagKeyword: ['musical-instrument', 'instrument']
    },

    electronics: {
	name: 'Electronics',
	query: '[shop=electronics]',
	iconName: 'outlet1',
	tabName: 'shops',
	tagKeyword: ['electronics', 'washing-machine', 'fridge', 'microwave', 'oven', 'computer', 'camera', 'hifi', 'mobile-phone']
    },

    computer: {
	name: 'Computer',
	query: '[shop=computer]',
	iconName: 'computers',
	tabName: 'shops',
	tagKeyword: ['computer', 'mobile-phone', 'telephone']
    },

    games: {
	name: 'Games',
	query: '[shop=games]',
	iconName: 'poker',
	tabName: 'shops',
	tagKeyword: ['collectables', 'computer-games']
    },

    mobile_phone: {
	name: 'Mobile-Phone',
	query: '[shop=mobile_phone]',
	iconName: 'phones',
	tabName: 'shops',
	tagKeyword: ['mobile-phone']
    },

    bicycle: {
	name: 'Bicycle',
	query: '[shop=bicycle]',
	iconName: 'bicycle_shop',
	tabName: 'shops',
	tagKeyword: ['bicycle', 'cycling', 'bike'],
	tagParser: bike_parser
    },

    car: {
	name: 'Car-Sales',
	query: '[shop=car]',
	iconName: 'car',
	tabName: 'shops',
	tagKeyword: ['car-sales', 'second-hand']
    },

//AMENITY - a8a8a8 - f34648 - 876759 - 3875d7 - baba06 - 128e4e

    wheelchair: {
	name: 'Wheelchair Access',
	query: '[wheelchair=yes]',
	iconName: 'disability',
	tabName: 'amenities',
	tagKeyword: ['wheelchair', 'disability'],
    },

    dog: {
	name: 'Dog Friendly',
	query: '[dog=yes]',
	iconName: 'dogs_leash',
	tabName: 'amenities',
	tagKeyword: ['dog friendly', 'pet friendly'],
    },

    school: {
	name: 'Education',
	query: '["amenity"~"school|college"]',
	iconName: 'school',
	tabName: 'amenities',
	tagKeyword: ['school', 'college', 'education'],
	tagParser: school_parser
    },

    school: {
	name: 'Education',
	query: '["amenity"~"school|college"]',
	iconName: 'school',
	tabName: 'amenities',
	tagKeyword: ['school', 'college', 'education'],
	tagParser: school_parser
    },

	kindergarten: {
	name: 'Nursery',
	query: '[amenity=kindergarten]',
	iconName: 'daycare',
	tabName: 'amenities',
	tagKeyword: ['daycare', 'kindergarten', 'nursery', 'child-care']
	},

    place_of_worship: {
	name: 'Place of Worship',
	query: '[amenity=place_of_worship]',
	iconName: 'church-2',
	tabName: 'amenities',
	tagKeyword: ['church', 'worship', 'prayer', 'religion'],
	tagParser: worship_parser
    },

    social_facility: {
	name: 'Social-Facility',
	query: '["amenity"~"social_facility|retirement_home"]',
	iconName: 'social',
	tabName: 'amenities',
	tagKeyword: ['care-home', 'retirement-home', 'nursing-home', 'social-facility', 'sheltered-housing'],
	tagParser: socialf_parser
    },

    events_venue: {
	name: 'Events-Venue',
	query: '[amenity=events_venue]',
	iconName: 'dancinghall',
	tabName: 'amenities',
	tagKeyword: ['hire', 'events-venue', 'rent']
    },

    cafe: {
	name: 'Cafe',
	query: '[amenity=cafe]',
	iconName: 'coffee',
	tabName: 'amenities',
	tagKeyword: ['cafe', 'tea', 'coffee', 'food', 'eat', 'breakfast', 'lunch', 'sandwich', 'cake', 'snacks', 'drink'],
	tagParser: food_parser
    },

    ice_cream: {
	name: 'Ice-Cream',
	query: '[amenity=ice_cream]',
	iconName: 'icecream',
	tabName: 'amenities',
	tagKeyword: ['ice-cream']
    },

    bar: {
	name: 'Bar & Nightclub',
	query: '["amenity"~"bar|nightclub"]',
	iconName: 'bar_coktail',
	tabName: 'amenities',
	tagKeyword: ['bar', 'nightclub', 'cocktail', 'drink', 'dancing', 'alcohol', 'wine']
    },

    fast_food: {
	name: 'Fast-Food',
	query: '[amenity=fast_food]',
	iconName: 'fastfood',
	tabName: 'amenities',
	tagKeyword: ['fast-food', 'eat', 'burger', 'chips', 'kebab', 'pizza'],
	tagParser: food_parser
    },

    restaurant: {
	name: 'Restaurant',
	query: '[amenity=restaurant]',
	iconName: 'restaurant',
	tabName: 'amenities',
	tagKeyword: ['restaurant', 'food', 'eat', 'take-away', 'dining', 'lunch'],
	tagParser: food_parser
    },

    pub: {
	name: 'Pub',
	query: '[amenity=pub]',
	iconName: 'bar',
	tabName: 'amenities',
	tagKeyword: ['pub', 'drink', 'beer', 'alcohol', 'food', 'snacks']
    },

    marketplace: {
	name: 'Marketplace',
	query: '[amenity=marketplace]',
	iconName: 'market',
	tabName: 'amenities',
	tagKeyword: ['market-place', 'greengrocer', 'fruit', 'vegetables', 'cheese', 'meat']
    },

    bank: {
	name: 'Bank',
	query: '[amenity=bank]',
	iconName: 'bank_pound',
	tabName: 'amenities',
	tagKeyword: ['bank', 'money']
    },

    atm: {
	name: 'ATM',
	query: '[amenity=atm]',
	iconName: 'atm_pound',
	tabName: 'amenities',
	tagKeyword: ['atm', 'bank', 'money', 'cash-point']
    },

    telephone: {
	name: 'Telephone-Box',
	query: '[amenity=telephone]',
	iconName: 'telephone',
	tabName: 'amenities',
	tagKeyword: ['telephone-box', 'phone-box']
    },

    post_box: {
	name: 'Post-Box & Office',
	query: '[amenity~"post_box|post_office"]',
	iconName: 'postal',
	tabName: 'amenities',
	tagKeyword: ['post-box', 'letter', 'mail', 'post-office'],
	tagParser: post_parser
    },

    recycling: {
	name: 'Recycling',
	query: '[amenity=recycling]',
	iconName: 'recycle',
	tabName: 'amenities',
	tagKeyword: ['recycling'],
	tagParser: recycle_parser
    },

    grit_bin: {
	name: 'Grit-Bin',
	query: '[amenity=grit_bin]',
	iconName: 'roadtype_gravel',
	tabName: 'amenities',
	tagKeyword: ['grit-bin']
    },

	drinking_water: {
	name: 'Drinking-Water',
	query: '[amenity=drinking_water]',
	iconName: 'drinkingwater',
	tabName: 'amenities',
	tagKeyword: ['drink', 'tap', 'water']
    },

    taxi: {
	name: 'Taxi',
	query: '[amenity=taxi]',
	iconName: 'taxi',
	tabName: 'amenities',
	tagKeyword: ['taxi', 'transport'],
	tagParser: taxi_parser
    },

    fuel: {
	name: 'Fuel',
	query: '[amenity=fuel]',
	iconName: 'fillingstation',
	tabName: 'amenities',
	tagKeyword: ['fuel', 'gas-station', 'petrol-station', 'unleaded', 'diesel', 'motoring'],
	tagParser: fuel_parser
    },

    car_repair: {
	name: 'Car-Mechanic',
	query: '["shop"~"car_repair|tyres"]',
	iconName: 'carrepair',
	tabName: 'amenities',
	tagKeyword: ['car-repair', 'garage', 'tyres', 'mechanic', 'motoring']
    },

    car_rental: {
	name: 'Car-Rental',
	query: '[amenity=car_rental]',
	iconName: 'carrental',
	tabName: 'amenities',
	tagKeyword: ['car-rental', 'rental', 'motoring']
    },

    car_wash: {
	name: 'Car-Wash',
	query: '[amenity=car_wash]',
	iconName: 'carwash',
	tabName: 'amenities',
	tagKeyword: ['car-wash', 'motoring']
    },

    parking: {
	name: 'Car-Parking',
	query: '[amenity=parking]',
	iconName: 'parking',
	tabName: 'amenities',
	tagKeyword: ['car-parking', 'motoring'],
	tagParser: carpark_parser
    },
	
    bicycle_parking: {
	name: 'Bicycle-Parking',
	query: '[amenity=bicycle_parking]',
	iconName: 'parking_bicycle',
	tabName: 'amenities',
	tagKeyword: ['bicycle-parking', 'cycling', 'bike'],
	tagParser: bikepark_parser
    },

    veterinary: {
	name: 'Veterinary',
	query: '[amenity=veterinary]',
	iconName: 'veterinary',
	tabName: 'amenities',
	tagKeyword: ['veterinary', 'pet', 'animals']
    },

    animal_shelter: {
	name: 'Animal-Shelter',
	query: '[amenity=animal_shelter]',
	iconName: 'animal-shelter-export',
	tabName: 'amenities',
	tagKeyword: ['animal-shelter', 'pet']
    },

//SERVICES - 3875d7 - f34648 - 5ec8bd - 6b46f2

    townhall: {
	name: 'Town-Hall',
	query: '[amenity=townhall]',
	iconName: 'townhouse',
	tabName: 'services',
	tagKeyword: ['townhall', 'administration']
    },

	community_centre: {
	name: 'Community-Centre',
	query: '[amenity=community_centre]',
	iconName: 'communitycentre',
	tabName: 'services',
	tagKeyword: ['community-centre', 'meeting', 'events-venue', 'social']
    },

    police: {
	name: 'Police',
	query: '[amenity=police]',
	iconName: 'police2',
	tabName: 'services',
	tagKeyword: ['police', 'help', 'emergency']
    },

    fire_station: {
	name: 'Fire-Station',
	query: '[amenity=fire_station]',
	iconName: 'firemen',
	tabName: 'services',
	tagKeyword: ['fire', 'help', 'emergency']
    },

    hospital: {
	name: 'Hospital',
	query: '[amenity=hospital]',
	iconName: 'hospital-building',
	tabName: 'services',
	tagKeyword: ['hospital', 'help', 'medical'],
	tagParser: hospital_parser
    },

    doctors: {
	name: 'Doctor',
	query: '[amenity=doctors]',
	iconName: 'medicine',
	tabName: 'services',
	tagKeyword: ['doctor', 'help', 'medical']
    },

    dentist: {
	name: 'Dentist',
	query: '[amenity=dentist]',
	iconName: 'dentist',
	tabName: 'services',
	tagKeyword: ['dentist', 'teeth', 'dentures']
    },

    healthcare: {
	name: 'Healthcare',
	query: '["healthcare"~"."]',
	iconName: 'medicalstore',
	tabName: 'services',
	tagKeyword: ['healthcare', 'medical', 'therapy', 'clinic', 'chiropractic', 'osteopathy'],
	tagParser: healthcare_parser
    },

	pharmacy: {
	name: 'Pharmacy',
	query: '[amenity=pharmacy]',
	iconName: 'drugstore',
	tabName: 'services',
	tagKeyword: ['pharmacy', 'chemist', 'drugstore']
    },
	
	mobility: {
	name: 'Mobility & Hearing',
	query: '["shop"~"mobility|hearing_aids"]',
	iconName: 'mobility',
	tabName: 'services',
	tagKeyword: ['mobility', 'wheelchair', 'hearing', 'disability']
    },
	
    defibrillator: {
	name: 'Defibrillator',
	query: '[emergency=defibrillator]',
	iconName: 'aed-2',
	tabName: 'services',
	tagKeyword: ['defibrillator', 'aed', 'emergency', 'help'],
	tagParser: defib_parser
    },

    funeral_directors: {
	name: 'Funeral Directors',
	query: '[shop=funeral_directors]',
	iconName: 'crematorium',
	tabName: 'services',
	tagKeyword: ['funeral-directors']
    },

    jobcentre: {
	name: 'Job Centre',
	query: '[amenity=jobcentre]',
	iconName: 'workoffice',
	tabName: 'services',
	tagKeyword: ['job-centre', 'employment-office']
    },

    library: {
	name: 'Library',
	query: '[amenity=library]',
	iconName: 'library',
	tabName: 'services',
	tagKeyword: ['library', 'books']
    },

    toilets: {
	name: 'Public Toilets',
	query: '[amenity=toilets]',
	iconName: 'toilets',
	tabName: 'services',
	tagKeyword: ['toilet', 'wc', 'restroom', 'baby-changing', 'lavatory'],
	tagParser: toilet_parser
    },
	
	estate_agent: {
	name: 'Estate Agent',
	query: '[office=estate_agent]',
	iconName: 'apartment-3',
	tabName: 'services',
	tagKeyword: ['estate-agent', 'property', 'housing']
	},
	
	accountant: {
	name: 'Accountant',
	query: '["office"~"accountant|financial"]',
	iconName: 'coins',
	tabName: 'services',
	tagKeyword: ['accountant', 'financial', 'money']
	},
	
	insurance: {
	name: 'Insurance',
	query: '[office=insurance]',
	iconName: 'umbrella-2',
	tabName: 'services',
	tagKeyword: ['insurance']
	},

	lawyer: {
	name: 'Solicitor',
	query: '[office=lawyer]',
	iconName: 'court',
	tabName: 'services',
	tagKeyword: ['lawyer', 'solicitor']
	},
	
//LEISURE - 67c547 - 3875d7 - a8a8a8 - c259b6 - c47848
	
    park: {
	name: 'Park',
	query: '["leisure"~"park|common"]',
	iconName: 'urbanpark',
	tabName: 'leisure',
	tagKeyword: ['park', 'common']
    },

    allotments: {
	name: 'Allotment',
	query: '[landuse=allotments]',
	iconName: 'soil',
	tabName: 'leisure',
	tagKeyword: ['allotment']
    },

    recreation_ground: {
	name: 'Recreation Ground',
	query: '[landuse=recreation_ground]',
	iconName: 'soccer',
	tabName: 'leisure',
	tagKeyword: ['recreation-ground', 'sport', 'park']
    },

    playground: {
	name: 'Playground',
	query: '[leisure=playground]',
	iconName: 'playground',
	tabName: 'leisure',
	tagKeyword: ['playground', 'park']
    },

    picnic_table: {
	name: 'Picnic-Table',
	query: '[leisure=picnic_table]',
	iconName: 'picnic-2',
	tabName: 'leisure',
	tagKeyword: ['picnic']
    },

	boat_rental: {
	name: 'Boat Rental',
	query: '[amenity=boat_rental]',
	iconName: 'rowboat',
	tabName: 'leisure',
	tagKeyword: ['boat-rental']
	},

    club: {
	name: 'Organisation Club',
	query: '[amenity=club]',
	iconName: 'conversation-map-icon',
	tabName: 'leisure',
	tagKeyword: ['club', 'organisation', 'social', 'events-venue'],
	tagParser: club_parser
    },

    fitness_centre: {
	name: 'Fitness-Centre',
	query: '[leisure=fitness_centre]',
	iconName: 'weights',
	tabName: 'leisure',
	tagKeyword: ['fitness-centre', 'leisure-centre', 'gym', 'sport']
    },

    swimming_pool: {
	name: 'Swimming-Pool',
	query: '[leisure=swimming_pool]',
	iconName: 'swimming2',
	tabName: 'leisure',
	tagKeyword: ['swimming-pool', 'leisure-centre', 'sport']
    },

    amusement_arcade: {
	name: 'Amusement-Arcade',
	query: '[leisure=amusement_arcade]',
	iconName: 'casino-2',
	tabName: 'leisure',
	tagKeyword: ['amusement-arcade', 'arcade', 'gambling']
    },
	
    attraction: {
	name: 'Attraction',
	query: '[tourism=attraction]',
	iconName: 'star-3',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'attraction', 'sight-seeing']
    },

    information: {
	name: 'Information',
	query: '[tourism=information]',
	iconName: 'information',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'information', 'sight-seeing'],
	tagParser: info_parser
    },

    viewpoint: {
	name: 'Viewpoint',
	query: '[tourism=viewpoint]',
	iconName: 'panoramicview',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'viewpoint', 'sight-seeing']
    },

    museum: {
	name: 'Museum',
	query: '[tourism=museum]',
	iconName: 'museum_archeological',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'museum', 'sight-seeing']
    },

    artwork: {
	name: 'Public Artwork',
	query: '[tourism=artwork]',
	iconName: 'publicart',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'artwork', 'sculpture', 'sight-seeing'],
	tagParser: artwork_parser
    },

    historic: {
	name: 'Historical',
	query: '["historic"~"."]',
	iconName: 'ruins-2',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'historical', 'memorial', 'sight-seeing'],
	tagParser: historic_parser
    },

    listed_status: {
	name: 'Heritage-Listed',
	query: '["listed_status"~"."]',
	iconName: 'house',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'listed-building', 'historical', 'sight-seeing'],
	tagParser: listed_parser
    },

    hotel: {
	name: 'Hotel',
	query: '[tourism=hotel]',
	iconName: 'hotel_0star',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'hotel', 'lodging', 'sleep', 'bed']
    },

    guest_house: {
	name: 'Guest-House',
	query: '[tourism=guest_house]',
	iconName: 'bed_breakfast1-2',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'bed-and-breakfast', 'guest-house', 'lodging', 'sleep']
    },

    caravan_site: {
	name: 'Caravan-Site',
	query: '[tourism=caravan_site]',
	iconName: 'campingcar',
	tabName: 'leisure',
	tagKeyword: ['tourism', 'caravan-site', 'camping', 'sleep']
    },

}
