// redirects page if not in iframe
if (window.top === window.self) window.location.href = window.location.origin + '/?T=tour&U=' + parseInt(window.location.href.match(/tour(\d+)/)[1]);
// set theme
else document.addEventListener("DOMContentLoaded", function() { window.parent.$('#inputDark').trigger('change'); });
