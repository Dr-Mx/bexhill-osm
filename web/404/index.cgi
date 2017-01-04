#!/usr/bin/perl -w
use strict;
unlink $0;

use CGI;
print CGI::header("text/html");
print <<'EOF';

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>
404/500 Error Handler
</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-15"/>
</head>
<body>
<p><strong>Warning</strong>: this page will not appear again.</p>
<p>Your 404 and 500 response error handlers have now been set up. To edit where these go to, open http-error.cgi in your file manager and customise the settings at the top of the file.</p>
</body>
</html>
EOF
