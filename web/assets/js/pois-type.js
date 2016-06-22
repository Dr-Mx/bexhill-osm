// All the POIs shown in the map

var pois = {

//SHOPS - 5ec8bd - 5e8ac7 - 5fc78a - 6b46f2 - 99cf43 - cfaf44
	
    supermarket: {
	name: 'Supermarket',
	query: '[shop=supermarket]',
	iconName: 'supermarket',
	tabName: 'shops'
    },
	
    convenience: {
	name: 'Convenience',
	query: '[shop=convenience]',
	iconName: 'conveniencestore',
	tabName: 'shops'
    },

    newsagent: {
	name: 'Newsagent',
	query: '[shop=newsagent]',
	iconName: 'newsagent',
	tabName: 'shops'
    },

    greengrocer: {
	name: 'Greengrocer',
	query: '[shop=greengrocer]',
	iconName: 'fruits',
	tabName: 'shops'
    },

    bakery: {
	name: 'Bakery',
	query: '[shop=bakery]',
	iconName: 'bread',
	tabName: 'shops'
    },

    butcher: {
	name: 'Butcher',
	query: '[shop=butcher]',
	iconName: 'butcher-2',
	tabName: 'shops'
    },

    seafood: {
	name: 'Seafood',
	query: '[shop=seafood]',
	iconName: 'restaurant_fish',
	tabName: 'shops'
    },

    alcohol: {
	name: 'Alcohol',
	query: '[shop=alcohol]',
	iconName: 'liquor',
	tabName: 'shops'
    },

    tobacco: {
	name: 'Cigarettes',
	query: '["shop"~"tobacco|e-cigarette"]',
	iconName: 'smoking',
	tabName: 'shops'
    },

    bookmaker: {
	name: 'Betting',
	query: '[shop=bookmaker]',
	iconName: 'cup',
	tabName: 'shops'
    },

    department_store: {
	name: 'Department Store',
	query: '[shop=department_store]',
	iconName: 'departmentstore',
	tabName: 'shops'
    },

    variety_store: {
	name: 'Variety Store',
	query: '[shop=variety_store]',
	iconName: 'mall',
	tabName: 'shops'
    },
	
    stationery: {
	name: 'Stationery',
	query: '[shop=stationery]',
	iconName: 'pens',
	tabName: 'shops'
    },
	
    doityourself: {
	name: 'DIY & Hardware',
	query: '["shop"~"doityourself|hardware"]',
	iconName: 'tools',
	tabName: 'shops'
    },

    clothes: {
	name: 'Clothes',
	query: '[shop=clothes]',
	iconName: 'clothers_female',
	tabName: 'shops'
    },

    charity: {
	name: 'Charity',
	query: '[shop=charity]',
	iconName: 'charity',
	tabName: 'shops'
    },

    shoes: {
	name: 'Shoes',
	query: '[shop=shoes]',
	iconName: 'shoes',
	tabName: 'shops'
    },
	
    furniture: {
	name: 'Furniture',
	query: '[shop=furniture]',
	iconName: 'homecenter',
	tabName: 'shops'
    },

    carpet: {
	name: 'Carpet Store',
	query: '[shop=carpet]',
	iconName: 'textiles',
	tabName: 'shops'
    },

    bed: {
	name: 'Bed Store',
	query: '[shop=bed]',
	iconName: 'bed',
	tabName: 'shops'
    },

    curtain: {
	name: 'Curtain & Blinds',
	query: '["shop"~"curtain|window_blind"]',
	iconName: 'curtains',
	tabName: 'shops'
    },

    jewelry: {
	name: 'Jewellery',
	query: '[shop=jewelry]',
	iconName: 'jewelry',
	tabName: 'shops'
    },

    bag: {
	name: 'Bag',
	query: '[shop=bag]',
	iconName: 'bags',
	tabName: 'shops'
    },

    watches: {
	name: 'Watches',
	query: '[shop=watches]',
	iconName: 'chronometer',
	tabName: 'shops'
    },

    beauty: {
	name: 'Beauty & Hair',
	query: '["shop"~"beauty|hairdresser"]',
	iconName: 'barber',
	tabName: 'shops'
    },
	
    massage: {
	name: 'Massage',
	query: '[shop=massage]',
	iconName: 'massage',
	tabName: 'shops'
    },

    optician: {
	name: 'Optician',
	query: '[shop=optician]',
	iconName: 'glasses',
	tabName: 'shops'
    },

    tattoo: {
	name: 'Tattoo',
	query: '[shop=tattoo]',
	iconName: 'acupuncture',
	tabName: 'shops'
    },
	
    dry_cleaning: {
	name: 'Laundry & Dry C&#39;',
	query: '["shop"~"dry_cleaning|laundry"]',
	iconName: 'laundromat',
	tabName: 'shops'
    },

    travel_agency: {
	name: 'Travel Agency',
	query: '[shop=travel_agency]',
	iconName: 'travel_agency',
	tabName: 'shops'
    },
	
    florist: {
	name: 'Florist & Garden',
	query: '["shop"~"florist|garden_centre"]',
	iconName: 'garden',
	tabName: 'shops'
    },

    art: {
	name: 'Art',
	query: '[shop=art]',
	iconName: 'artgallery',
	tabName: 'shops'
    },

    books: {
	name: 'Books',
	query: '[shop=books]',
	iconName: 'book',
	tabName: 'shops'
    },

    antiques: {
	name: 'Antiques',
	query: '[shop=antiques]',
	iconName: 'antiques',
	tabName: 'shops'
    },

    second_hand: {
	name: 'Second Hand',
	query: '[shop=second_hand]',
	iconName: '2hand',
	tabName: 'shops'
	},

    craft: {
	name: 'Craft',
	query: '[shop=craft]',
	iconName: 'craftstore',
	tabName: 'shops',
	tagParser: craft_parser
    },

    gift: {
	name: 'Gift',
	query: '[shop=gift]',
	iconName: 'gifts',
	tabName: 'shops'
    },

    toys: {
	name: 'Toys',
	query: '[shop=toys]',
	iconName: 'toys',
	tabName: 'shops'
    },

    fishing: {
	name: 'Fishing',
	query: '[shop=fishing]',
	iconName: 'fishingstore',
	tabName: 'shops'
    },

    pet: {
	name: 'Pet',
	query: '[shop=pet]',
	iconName: 'pets',
	tabName: 'shops'
    },

    music: {
	name: 'Music',
	query: '[shop=music]',
	iconName: 'music',
	tabName: 'shops'
    },

    musical_instrument: {
	name: 'Musical Instrument',
	query: '[shop=musical_instrument]',
	iconName: 'music_rock',
	tabName: 'shops'
    },

    electronics: {
	name: 'Electronics',
	query: '[shop=electronics]',
	iconName: 'outlet1',
	tabName: 'shops'
    },

    computer: {
	name: 'Computer',
	query: '[shop=computer]',
	iconName: 'computers',
	tabName: 'shops'
    },

    games: {
	name: 'Games',
	query: '[shop=games]',
	iconName: 'poker',
	tabName: 'shops'
    },

    mobile_phone: {
	name: 'Mobile Phone',
	query: '[shop=mobile_phone]',
	iconName: 'phones',
	tabName: 'shops'
    },

    bicycle: {
	name: 'Bicycle',
	query: '[shop=bicycle]',
	iconName: 'bicycle_shop',
	tabName: 'shops'
    },

    car: {
	name: 'Car Sales',
	query: '[shop=car]',
	iconName: 'car',
	tabName: 'shops'
    },

//AMENITY - f34648 - 876759 - 3875d7 - baba06 - 128e4e

    school: {
	name: 'College & School',
	query: '[amenity~"school|college"]',
	iconName: 'school',
	tabName: 'amenities',
	tagParser: school_parser
    },

	kindergarten: {
	name: 'Nursery',
	query: '[amenity=kindergarten]',
	iconName: 'daycare',
	tabName: 'amenities'
	},

    place_of_worship: {
	name: 'Place of Worship',
	query: '[amenity=place_of_worship]',
	iconName: 'church-2',
	tabName: 'amenities',
	tagParser: worship_parser
    },

    social_facility: {
	name: 'Social Facility',
	query: '[amenity~"social_facility|retirement_home"]',
	iconName: 'social',
	tabName: 'amenities'
    },

    events_venue: {
	name: 'Events Venue',
	query: '[amenity=events_venue]',
	iconName: 'dancinghall',
	tabName: 'amenities'
    },

    cafe: {
	name: 'Cafe',
	query: '[amenity=cafe]',
	iconName: 'coffee',
	tabName: 'amenities',
	tagParser: food_parser
    },

    ice_cream: {
	name: 'Ice Cream',
	query: '[amenity=ice_cream]',
	iconName: 'icecream',
	tabName: 'amenities'
    },

    bar: {
	name: 'Bar & Nightclub',
	query: '["amenity"~"bar|nightclub"]',
	iconName: 'bar_coktail',
	tabName: 'amenities'
    },

    fast_food: {
	name: 'Fast Food',
	query: '[amenity=fast_food]',
	iconName: 'fastfood',
	tabName: 'amenities',
	tagParser: food_parser
    },

    restaurant: {
	name: 'Restaurant',
	query: '[amenity=restaurant]',
	iconName: 'restaurant',
	tabName: 'amenities',
	tagParser: food_parser
    },

    pub: {
	name: 'Pub',
	query: '[amenity=pub]',
	iconName: 'bar',
	tabName: 'amenities'
    },

    marketplace: {
	name: 'Marketplace',
	query: '[amenity=marketplace]',
	iconName: 'market',
	tabName: 'amenities'
    },

    bank: {
	name: 'Bank',
	query: '[amenity=bank]',
	iconName: 'bank_pound',
	tabName: 'amenities'
    },

    atm: {
	name: 'ATM',
	query: '[amenity=atm]',
	iconName: 'atm_pound',
	tabName: 'amenities'
    },

    telephone: {
	name: 'Telephone Box',
	query: '[amenity=telephone]',
	iconName: 'telephone',
	tabName: 'amenities'
    },

    recycling: {
	name: 'Recycling',
	query: '[amenity=recycling]',
	iconName: 'recycle',
	tabName: 'amenities',
	tagParser: recycle_parser
    },

    grit_bin: {
	name: 'Grit Bin',
	query: '[amenity=grit_bin]',
	iconName: 'roadtype_gravel',
	tabName: 'amenities'
    },

	drinking_water: {
	name: 'Drinking Water',
	query: '[amenity=drinking_water]',
	iconName: 'drinkingwater',
	tabName: 'amenities'
    },

    taxi: {
	name: 'Taxi',
	query: '[amenity=taxi]',
	iconName: 'taxi',
	tabName: 'amenities',
	tagParser: taxi_parser
    },

    fuel: {
	name: 'Fuel',
	query: '[amenity=fuel]',
	iconName: 'fillingstation',
	tabName: 'amenities',
	tagParser: fuel_parser
    },

    car_repair: {
	name: 'Car Mechanic',
	query: '["shop"~"car_repair|tyres"]',
	iconName: 'carrepair',
	tabName: 'amenities'
    },

    car_rental: {
	name: 'Car Rental',
	query: '[amenity=car_rental]',
	iconName: 'carrental',
	tabName: 'amenities'
    },

    car_wash: {
	name: 'Car Wash',
	query: '[amenity=car_wash]',
	iconName: 'carwash',
	tabName: 'amenities'
    },

    parking: {
	name: 'Car Parking',
	query: '[amenity=parking]',
	iconName: 'parking',
	tabName: 'amenities',
	tagParser: carpark_parser
    },
	
    bicycle_parking: {
	name: 'Bicycle Parking',
	query: '[amenity=bicycle_parking]',
	iconName: 'parking_bicycle',
	tabName: 'amenities',
	tagParser: bikepark_parser
    },

    veterinary: {
	name: 'Veterinary',
	query: '[amenity=veterinary]',
	iconName: 'veterinary',
	tabName: 'amenities'
    },

    animal_shelter: {
	name: 'Animal Shelter',
	query: '[amenity=animal_shelter]',
	iconName: 'animal-shelter-export',
	tabName: 'amenities'
    },

//SERVICES - 3875d7 - f34648 - 5ec8bd - 6b46f2

    townhall: {
	name: 'Town Hall',
	query: '[amenity=townhall]',
	iconName: 'townhouse',
	tabName: 'services'
    },

	community_centre: {
	name: 'Community Centre',
	query: '[amenity=community_centre]',
	iconName: 'communitycentre',
	tabName: 'services'
    },

    police: {
	name: 'Police',
	query: '[amenity=police]',
	iconName: 'police2',
	tabName: 'services'
    },

    fire_station: {
	name: 'Fire Station',
	query: '[amenity=fire_station]',
	iconName: 'firemen',
	tabName: 'services'
    },

    hospital: {
	name: 'Hospital',
	query: '[amenity=hospital]',
	iconName: 'hospital-building',
	tabName: 'services',
	tagParser: hospital_parser
    },

    doctors: {
	name: 'Doctor',
	query: '[amenity=doctors]',
	iconName: 'medicine',
	tabName: 'services'
    },

    dentist: {
	name: 'Dentist',
	query: '[amenity=dentist]',
	iconName: 'dentist',
	tabName: 'services'
    },

    healthcare: {
	name: 'Healthcare',
	query: '[healthcare~"."]',
	iconName: 'medicalstore',
	tabName: 'services',
	tagParser: healthcare_parser
    },

	pharmacy: {
	name: 'Pharmacy',
	query: '[amenity=pharmacy]',
	iconName: 'drugstore',
	tabName: 'services'
    },
	
    defibrillator: {
	name: 'Defibrillator',
	query: '[emergency=defibrillator]',
	iconName: 'aed-2',
	tabName: 'services',
	tagParser: defib_parser
    },

    funeral_directors: {
	name: 'Funeral Directors',
	query: '[shop=funeral_directors]',
	iconName: 'crematorium',
	tabName: 'services'
    },

    jobcentre: {
	name: 'Job Centre',
	query: '[amenity=jobcentre]',
	iconName: 'workoffice',
	tabName: 'services'
    },

    library: {
	name: 'Library',
	query: '[amenity=library]',
	iconName: 'library',
	tabName: 'services'
    },

    toilets: {
	name: 'Public Toilets',
	query: '[amenity=toilets]',
	iconName: 'toilets',
	tabName: 'services',
	tagParser: toilet_parser
    },
	
	estate_agent: {
	name: 'Estate Agent',
	query: '[office=estate_agent]',
	iconName: 'apartment-3',
	tabName: 'services'
	},
	
	accountant: {
	name: 'Accountant',
	query: '[office~"accountant|financial"]',
	iconName: 'coins',
	tabName: 'services'
	},
	
	insurance: {
	name: 'Insurance',
	query: '[office=insurance]',
	iconName: 'umbrella-2',
	tabName: 'services'
	},

	lawyer: {
	name: 'Lawyer',
	query: '[office=lawyer]',
	iconName: 'court',
	tabName: 'services'
	},
	
//LEISURE - 67c547 - 3875d7 - a8a8a8 - c259b6 - c47848
	
    park: {
	name: 'Park',
	query: '[leisure~"park|common"]',
	iconName: 'urbanpark',
	tabName: 'leisure'
    },

    allotments: {
	name: 'Allotment',
	query: '[landuse=allotments]',
	iconName: 'soil',
	tabName: 'leisure'
    },

    recreation_ground: {
	name: 'Recreation Ground',
	query: '[landuse=recreation_ground]',
	iconName: 'soccer',
	tabName: 'leisure'
    },

    playground: {
	name: 'Playground',
	query: '[leisure=playground]',
	iconName: 'playground',
	tabName: 'leisure'
    },

    picnic_table: {
	name: 'Picnic Table',
	query: '[leisure=picnic_table]',
	iconName: 'picnic-2',
	tabName: 'leisure'
    },

	boat_rental: {
	name: 'Boat Rental',
	query: '[amenity=boat_rental]',
	iconName: 'rowboat',
	tabName: 'leisure'
	},

    club: {
	name: 'Organisation Club',
	query: '[amenity=club]',
	iconName: 'conversation-map-icon',
	tabName: 'leisure',
	tagParser: club_parser
    },

    fitness_centre: {
	name: 'Fitness Centre',
	query: '[leisure=fitness_centre]',
	iconName: 'weights',
	tabName: 'leisure'
    },

    swimming_pool: {
	name: 'Swimming Pool',
	query: '[leisure=swimming_pool]',
	iconName: 'swimming2',
	tabName: 'leisure'
    },

    amusement_arcade: {
	name: 'Amusement Arcade',
	query: '[leisure=amusement_arcade]',
	iconName: 'casino-2',
	tabName: 'leisure'
    },
	
    attraction: {
	name: 'Attraction',
	query: '[tourism=attraction]',
	iconName: 'star-3',
	tabName: 'leisure'
    },

    information: {
	name: 'Information',
	query: '[tourism=information]',
	iconName: 'information',
	tabName: 'leisure'
    },

    viewpoint: {
	name: 'Viewpoint',
	query: '[tourism=viewpoint]',
	iconName: 'panoramicview',
	tabName: 'leisure'
    },

    museum: {
	name: 'Museum',
	query: '[tourism=museum]',
	iconName: 'museum_archeological',
	tabName: 'leisure'
    },

    artwork: {
	name: 'Public Artwork',
	query: '[tourism=artwork]',
	iconName: 'publicart',
	tabName: 'leisure',
	tagParser: artwork_parser
    },

    historic: {
	name: 'Historical',
	query: '[historic~"."]',
	iconName: 'ruins-2',
	tabName: 'leisure',
	tagParser: historic_parser
    },

    listed_status: {
	name: 'Heritage Listed',
	query: '[listed_status~"."]',
	iconName: 'house',
	tabName: 'leisure',
	tagParser: listed_parser
    },

    hotel: {
	name: 'Hotel',
	query: '[tourism=hotel]',
	iconName: 'hotel_0star',
	tabName: 'leisure'
    },

    guest_house: {
	name: 'Guest House',
	query: '[tourism=guest_house]',
	iconName: 'bed_breakfast1-2',
	tabName: 'leisure'
    },

    caravan_site: {
	name: 'Caravan Site',
	query: '[tourism=caravan_site]',
	iconName: 'campingcar',
	tabName: 'leisure'
    },

}
