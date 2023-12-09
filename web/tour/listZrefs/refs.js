// sources and references for history tour

var tourRefs = {
	
	reading: {
		1: {
			name: 'Bexhill Museum',
			url: 'https://www.bexhillmuseum.org.uk/',
			media: 'Website'
		},
		2: {
			name: 'The British Newspaper Archive',
			url: 'https://www.britishnewspaperarchive.co.uk/',
			media: 'Website'
		},
		3: {
			name: 'The Keep',
			url: 'https://www.thekeep.info/',
			media: 'Website'
		},
		4: {
			name: 'National Library of Scotland Maps',
			url: 'https://maps.nls.uk/',
			media: 'Website'
		}
	},
	
	bexhill: {
		title: 'Bexhill-on-Sea',
		1: {
			name: 'The Book of English Place Names: How Our Towns and Villages Got Their Names - Caroline Taggart',
			url: 'https://www.amazon.co.uk/s?k=9780091940430',
			media: 'Book'
		},
		2: {
			name: 'An Historical Atlas of Sussex',
			url: 'https://www.amazon.co.uk/s?k=9781860771125',
			media: 'Book'
		},
		3: {
			name: 'Flag of Bexhill (Sussex) - UK Flag Registry - Flag Institute',
			url: 'https://www.flaginstitute.org/wp/flags/bexhill-sussex/',
			media: 'Website'
		},
		4: {
			name: 'The Charter Trustees of Bexhill - Civic Handbook',
			url: 'https://bexhillheritage.com/wp-content/uploads/docs/CIVIC_HANDBOOK_rev_2017_website.pdf#page=5',
			media: 'PDF'
		}
	},
	
	prehistory: {
		title: 'Prehistory',
		1: {
			name: 'UK Fossils Network',
			url: 'https://ukfossils.co.uk/2012/01/24/bexhill/',
			media: 'Website'
		},
		2: {
			name: 'Ward Lock & Co\'s Bexhill Illustrated Handbook, 6th Edition, p.23',
			media: 'Book'
		}
	},
	
	manor: {
		title: 'Old Town Manor',
		1: {
			name: 'The Old Town Preservation Society',
			url: 'https://www.bexhilloldtown.org/origins-of-the-manor/',
			media: 'Website'
		}
	},
	
	amsterdam: {
		title: 'The Amsterdam Shipwreck',
		1: {
			name: 'De VOCsite (Dutch)',
			url: 'https://www.vocsite.nl/schepen/detail.html?id=10038',
			media: 'Website'
		},
		2: {
			name: 'Anchors on Waymarking.com',
			url: 'https://www.waymarking.com/waymarks/WMGY57_Amsterdam_Anchor_St_Katherine_Docks_London_England',
			media: 'Website'
		}
	},
	
	smuggling: {
		title: 'Smuggling',
		1: {
			name: 'Bexhill Historic Character Assessment Report October 2008',
			url: 'https://www.westsussex.gov.uk/media/1717/bexhill_eus_report_maps.pdf#page=15',
			media: 'PDF'
		},
		2: {
			name: 'Smuggling.co.uk',
			url: 'http://www.smuggling.co.uk/history_expansion.html',
			media: 'Website'
		},
		3: {
			name: 'Wheatsheaf Inn Public House (archived)',
			url: 'https://web.archive.org/web/20180831184206/http://www.wheatsheaf-inn.co.uk/about-us/',
			media: 'Website'
		}
	},
	
	martello: {
		title: 'Martello Towers',
		1: {
			name: 'The Louisiana Purchase - Thomas Fleming',
			url: 'https://www.amazon.co.uk/s?k=9780471267386',
			media: 'Book'
		},
		2: {
			name: 'Bexhill-on-Sea Observer, 6 May 1933, p.7',
			media: 'Newspaper'
		},
		3: {
			name: 'Friends of Hastings Cemetery',
			url: 'https://friendsofhastingscemetery.org.uk/yorkysmith.html',
			media: 'Website'
		},
		4: {
			name: 'Martello Towers: A Brief History - Geoff Hutchinson',
			url: 'https://www.amazon.co.uk/s?k=9780951993620',
			media: 'Book'
		},
		5: {
			name: 'Martello Towers - Michael Foley',
			url: 'https://www.amazon.co.uk/s?k=9781445615226',
			media: 'Book'
		}
	},
	
	racing: {
		title: 'Motor Racing',
		1: {
			name: 'Bexhill Museum - Heritage Trail Launch (archived)',
			url: 'https://web.archive.org/web/20161113215813/http://www.bexhillmuseum.co.uk/museum-news/heritage-trail-launch-130.html',
			media: 'Website'
		}
	},
	
	railways: {
		title: 'Railways',
		1: {
			name: 'Sussex Steam - Michael Hymans',
			url: 'https://www.amazon.co.uk/s?k=9781445663067',
			media: 'Book'
		}
	},
	
	trams: {
		title: 'Tramway & Trolleybuses',
		1: {
			name: '1066 Online',
			url: 'https://www.1066online.co.uk/hastings-history/trams/',
			media: 'Website'
		}
	},
	
	dlwp: {
		title: 'De La Warr Pavilion',
		1: {
			name: 'DLWP.com History',
			url: 'https://www.dlwp.com/about-us/our-heritage/',
			media: 'Website'
		},
		2: {
			name: 'Open University - History & The Arts',
			url: 'https://www.open.edu/openlearn/history-the-arts/history/heritage/the-de-la-warr-pavilion',
			media: 'Website'
		}
	},
	
	ww2: {
		title: 'World War II',
		1: {
			name: 'Bexhill in World War II - David Burton (3rd edition)',
			url: 'https://www.bexhillmuseum.org.uk/visit-us/museum-shop/',
			media: 'Book'
		},
		2: {
			name: 'Bexhill-on-Sea Observer, 21 October 1944',
			url: 'https://twitter.com/bexhillmuseum/status/709482254767165440',
			media: 'Newspaper'
		}
	},
	
	northeye: {
		title: 'Northeye Prison Site',
		1: {
			name: 'Heritage Gateway - HMP Northeye',
			url: 'https://www.heritagegateway.org.uk/Gateway/Results_Single.aspx?uid=1142754&resourceID=19191',
			media: 'Website'
		},
		2: {
			name: 'Northeye - Eyewitness Account of a Jail Riot',
			url: 'http://www.newsmedianews.com/riot.htm',
			media: 'Website'
		},
		3: {
			name: 'Bexhill News, 29 March 2023',
			url: 'https://bexhill.news/holding-centre-for-asylum-seekers-will-be-sited-in-bexhill/',
			media: 'Newspaper'
		}
	},
	
	heritage: {
		title: 'Lost Heritage',
		1: {
			name: 'BexhillHistoryTrail: Cooch Behar’s Memorial Fountain',
			url: 'https://thebexhillhistorytrail.wordpress.com/2015/01/15/appendix-i-maharajah-of-cooch-behars-memorial-fountain-ex-colonnade-and-egerton-park/',
			media: 'Website'
		},
		2: {
			name: 'Cinema Treasures',
			url: 'http://cinematreasures.org/theaters/38377',
			media: 'Website'
		},
		3: {
			name: 'National Archives: Bexhill Convalescent Homes',
			url: 'https://discovery.nationalarchives.gov.uk/details/r/a0506c29-26e1-4a59-97a9-e1eb98afea82',
			media: 'Website'
		},
		4: {
			name: 'The Old Town Preservation Society',
			url: 'https://www.bexhilloldtown.org/origins-of-the-manor/',
			media: 'Website'
		},
		5: {
			name: 'Disused Stations: Sidley Station',
			url: 'http://www.disused-stations.org.uk/s/sidley/',
			media: 'Website'
		}
	},
	
	boundary: {
		title: 'Boundary Stones',
		1: {
			name: 'Archaeology of the Combe Valley',
			url: 'http://combevalleycountrysidepark.com/park/archaeology.php',
			media: 'Website'
		},
		2: {
			name: 'Bexhill-on-Sea Observer, 25 December 1909, p.4',
			media: 'Newspaper'
		}
	},
	
	people: {
		title: 'Notable People',
		1: {
			name: 'IXION Cavalcade - Bexhill 100 Motoring Club (archived)',
			url: 'https://web.archive.org/web/20210506175147/http://www.bexhill100mc.co.uk/ixion-cavalcade/4575680934',
			media: 'Website'
		},
		2: {
			name: 'Adolf Hitler: My Part in his Downfall - Spike Milligan',
			url: 'https://www.amazon.co.uk/s?k=9780241958094',
			media: 'Book'
		},
		3: {
			name: 'BexhillHistoryTrail: Cooch Behar’s Memorial Fountain',
			url: 'https://thebexhillhistorytrail.wordpress.com/2015/01/15/appendix-i-maharajah-of-cooch-behars-memorial-fountain-ex-colonnade-and-egerton-park/',
			media: 'Website'
		}
	},
	
	film: {
		title: 'Filming Locations',
		1: {
			name: 'Bexhill-on-Sea Observer, 15 June 1912',
			url: 'https://twitter.com/bexhillmuseum/status/601708758083960832',
			media: 'Newspaper'
		}
	},
	
	clocks: {
		title: 'Street Clocks',
		1: {
			name: 'Public Sculptures of Sussex: Clock Tower',
			url: 'http://www.publicsculpturesofsussex.co.uk/object?id=115',
			media: 'Website'
		},
		2: {
			name: 'Historical Walk around the Clocks in Bexhill, July 2004 - Bexhill in Bloom',
			url: 'https://archive.org/embed/bexhillclocktower_2004',
			media: 'Book'
		}
	},
	
	surveying: {
		title: 'OS Surveying Points',
		1: {
			name: 'Ordnance Survey: Benchmark locator',
			url: 'https://www.ordnancesurvey.co.uk/benchmarks/',
			media: 'Website'
		}
	}

};

// create reference list
if (document.body.id === 'reference') {
	let list = '';
	Object.entries(tourRefs).forEach(tour => {
		const [tourKey, tourVal] = tour;
		if (tourVal.title) list += '<a onclick="window.parent.switchTab(\'tour\', \'' + tourKey + '\');"><i class="fa-solid fa-chevron-left fa-fw"></i><b>' + tourVal.title + '</b></a>';
		list += '<ol id="' + tourKey + '">';
		Object.entries(tourVal).forEach(refs => {
			const [refKey, refVal] = refs;
			if (refVal.url) list += '<li><a href="' + refVal.url + '" title="' + refVal.media + '" target="_blank" rel="noopener">' + refVal.name + '</a></li>';
			else if (refVal.name) list += '<li><span title="' + refVal.media + '">' + refVal.name + '</span></li>';
		});
		list += '</ol>';
	});
	document.getElementById('refList').innerHTML = list;
}
