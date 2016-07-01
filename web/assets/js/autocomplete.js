var poitags = [];
var category = [];
var i = 0;
var x = 1;

// Get all tags
for (poi in pois) {
	poitags += '"' + pois[poi].tabName + "~" + poi + '": ' + JSON.stringify(pois[poi].tagKeyword) + ', ';
	category[i] = {listLocation: pois[poi].tabName + '~' + poi, header: pois[poi].tabName + ' - ' + pois[poi].name};
	i++;
}

// Clean up and covert to array
poitags = poitags.substring(0, poitags.length - 2);
poitags = JSON.parse('{ ' + poitags + '}');

// Options for autocomplete
var options = {
	data: poitags,
	minCharNumber: 3,
	list: {
		maxNumberOfElements: 10,
		onChooseEvent: function() {
			// Find selected items category, split it to get checkbox, then display
			var z = ($('#autocomplete').getSelectedItemIndex());
			var catsplit = (document.getElementsByClassName('eac-category')[z].innerText);
			var catsplit = catsplit.split(" - ");
			sidebar.open(catsplit[0]);
			$('#pois' + catsplit[0] + ' input[name="' + catsplit[1] + '"]').prop('checked', true);
			// Highlight checkbox or hide sidebar for mobile users
			if ($(window).width() > 768) {
				$('#pois' + catsplit[0] + ' input[name="' + catsplit[1] + '"]').parent().parent().parent().effect("highlight", {}, 3000);
			}
			else sidebar.close();
			setting_changed();
			$('#autocomplete').val('');
	},
	match: {
		enabled: true
		}
	},
	categories: [
		category[0],
	]
};

// Push categories into options array
for (x = 1; x < category.length; x++) {
	options['categories'].push(category[x]);
}

$('#autocomplete').easyAutocomplete(options);
