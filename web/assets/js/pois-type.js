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

    fast_food: {
	name: 'Comida Rápida',
	query: '[amenity=fast_food]',
	iconName: 'fastfood'
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
	iconName: 'fillingstation'
    },

    wheel_repair: {
	name: 'Gomería',
	query: '[shop=car_repair][car_repair=wheel_repair]',
	iconName: 'tires',
	tagParser: car_repair_parser
    },

    clinic: {
	name: 'Clínica',
	query: '[amenity=clinic]',
	iconName: 'medicine'
    },

    hospital: {
	name: 'Hospital',
	query: '[amenity=hospital]',
	iconName: 'hospital-building'
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
	iconName: 'hotel_0star'
    },

    hostel: {
	name: 'Hostel',
	query: '[tourism=hostel]',
	iconName: 'youthhostel'
    },

    info_tourism: {
	name: 'Información Turística',
	query: '[tourism=information]',
	iconName: 'information'
    },

    zoo: {
	name: 'Zoológico',
	query: '[tourism=zoo]',
	iconName: 'zoo'
    }
}
