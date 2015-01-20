// All the POIs shown in the map

var pois = {
    bar: {
	name: 'Bar',
	query: '[amenity=bar]',
	iconName: 'bar_coktail'
    },

    pub: {
	name: 'Pub',
	query: '[amenity=pub]',
	iconName: 'bar'
    },

    restaurant: {
	name: 'Restaurante',
	query: '[amenity=restaurant]',
	iconName: 'restaurant'
    },

    coffee: {
	name: 'Café',
	query: '[shop=coffee]',
	iconName: 'coffee'
    },

    fast_food: {
	name: 'Comida Rápida',
	query: '[amenity=fast_food]',
	iconName: 'fastfood'
    },

    internet_access: {
	name: 'Lugares con WiFi',
	query: '[internet_access][internet_access!=no]',
	iconName: 'wifi'
    },

    bank: {
	name: 'Banco',
	query: '[amenity=bank]',
	iconName: 'bank',
	tagParser: bank_parser
    },

    atm: {
	name: 'Cajero',
	query: '[amenity=atm]',
	iconName: 'atm-2'
    },

    fuel: {
	name: 'Estación de Servicio',
	query: '[amenity=fuel]',
	iconName: 'fillingstation',
	tagParser: fuel_parser
    },

    wheel_repair: {
	name: 'Gomería',
	query: '[shop=car_repair][car_repair=wheel_repair]',
	iconName: 'tires'
    },

    car_repair: {
	name: 'Mecánico',
	query: '[shop=car_repair][car_repair!=wheel_repair]',
	iconName: 'repair'
    },

    bus_stop: {
	name: 'Parada de Colectivos',
	query: '[highway=bus_stop]',
	iconName: 'busstop'
    },

    bus_station: {
	name: 'Terminal de Ómnibus',
	query: '[amenity=bus_station]',
	iconName: 'bus'
    },

    clinic: {
	name: 'Clínica',
	query: '[amenity=clinic]',
	iconName: 'medicine'
    },

    hospital: {
	name: 'Hospital',
	query: '[amenity=hospital]',
	iconName: 'hospital-building',
	tagParser: hospital_parser
    },

    pharmacy: {
	name: 'Farmacia',
	query: '[amenity=pharmacy]',
	iconName: 'drugstore'
    },

    supermarket: {
	name: 'Supermercado',
	query: '[shop=supermarket]',
	iconName: 'supermarket'
    },

    convenience: {
	name: 'Despensa',
	query: '[shop=convenience]',
	iconName: 'conveniencestore'
    },

    kiosk: {
	name: 'Kiosko',
	query: '[shop=kiosk]',
	iconName: 'kiosk'
    },

    butcher: {
	name: 'Carnicería',
	query: '[shop=butcher]',
	iconName: 'butcher-2'
    },

    gallery: {
	name: 'Galería de Arte',
	query: '[tourism=gallery]',
	iconName: 'museum_art'
    },

    museum: {
	name: 'Museo',
	query: '[tourism=museum]',
	iconName: 'museum_crafts'
    },

    theatre: {
	name: 'Teatro',
	query: '[amenity=theatre]',
	iconName: 'theater'
    },

    viewpoint: {
	name: 'Mirador',
	query: '[tourism=viewpoint]',
	iconName: 'sight-2'
    },

    'camp_site': {
	name: 'Camping',
	query: '[tourism=camp_site]',
	iconName: 'camping-2'
    },

    hotel: {
	name: 'Hotel',
	query: '[tourism=hotel]',
	iconName: 'hotel_0star',
	tagParser: hotel_parser
    },

    hostel: {
	name: 'Hostel',
	query: '[tourism=hostel]',
	iconName: 'youthhostel'
    },

    information: {
	name: 'Información Turística',
	query: '[tourism=information]',
	iconName: 'information'
    },

    sports_centre: {
	name: 'Club',
	query: '[leisure=sports_centre]',
	iconName: 'stadium'
    }
}
