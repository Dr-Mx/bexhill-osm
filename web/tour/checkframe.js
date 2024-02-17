// redirects page if not in iframe
if (window.top === window.self) window.location.href = window.location.origin + '/?T=tour&U=' + window.location.href.split('/list')[1].split('/index')[0].toLowerCase();
// on load
else document.addEventListener('DOMContentLoaded', function() { 
	// scroll shadow
	document.body.addEventListener('scroll', function() {
		const scrollPos = Math.abs(this.scrollHeight - this.clientHeight - this.scrollTop);
		const scrollOpacity = scrollPos < 300 ? Math.round(scrollPos / 60) / 10 : 0.5;
		this.style['background-image'] = 'linear-gradient(transparent, rgba(var(--scroll-shadow), ' + scrollOpacity + '))';
	});
});
