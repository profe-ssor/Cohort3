<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
          table { border: 1px solid #ccc; border-collapse: collapse; width: 100%; }
          th, td { text-align: left; padding: 10px; border: 1px solid #ddd; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <div>Number of URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /></div>
        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
            <th>Change Frequency</th>
            <th>Priority</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a></td>
              <td><xsl:value-of select="sitemap:lastmod" /></td>
              <td><xsl:value-of select="sitemap:changefreq" /></td>
              <td class="center"><xsl:value-of select="sitemap:priority" /></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
