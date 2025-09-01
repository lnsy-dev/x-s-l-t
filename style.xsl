<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  
  <xsl:for-each select="catalog/cd">
    <p>
      <b><xsl:value-of select="title" /></b>:
      <xsl:value-of select="artist" />
    </p>
  </xsl:for-each>

</xsl:template>

</xsl:stylesheet>
