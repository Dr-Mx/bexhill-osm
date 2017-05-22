<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
<html> 
<body>
	<h2>Bexhill Street Names</h2>
	<xsl:for-each select="streetNames/street">
		<table style="width:100%;margin-top:20px;">
			<tr><b><xsl:value-of select="name"/> (<xsl:value-of select="date"/>)</b></tr>
			<tr><xsl:value-of select="desc"/></tr>
		</table>
	</xsl:for-each>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
