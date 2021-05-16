// redirects page if not in iframe
if (window.top === window.self) window.location.href = window.location.origin + '/?T=tour&U=' + window.location.href.split('/list')[1].split('/index')[0].toLowerCase();
// set theme
else document.addEventListener("DOMContentLoaded", function() { window.parent.$('#inputDark').trigger('change'); });
