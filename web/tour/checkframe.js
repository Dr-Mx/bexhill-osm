// redirects page if not in iframe

if (top === self) location.href = window.location.origin + '/?T=tour&U=' + window.location.href.match(/tour(\d+)/)[1];
