/**
 *    X-S-L-T:    XML and XSLT Processor Custom Element
 *
 * This custom HTML element, <x-l-s-t>, allows for client-side transformation
 * of XML data using XSLT stylesheets. Upon attachment and whenever the attributes
 * 'xml-src' or 'xsl-src' change, it fetches and processes the specified XML and XSL
 * documents.
 *
 * It then uses the XSLTProcessor API to transform the XML according to the specified
 * XSL, displaying the result in the element's inner HTML.
 * 
 * Attributes:
 *  - xml-src: URL to the XML document.
 *  - xsl-src: URL to the XSL stylesheet.
 *
 * Methods:
 *  - connectedCallback(): Invoked when the element is connected to the DOM.
 *  - processXmlAndXsl(): Processes the XML and XSL specified by the attributes.
 *  - hasParsingError(doc): Checks if a parsed document has errors.
 *  - transformXml(xmlDoc, xslDoc): Transforms the XML using the XSL document.
 *  - fetchResource(url): Fetches the text content from a given URL.
 * 
 */


class X_S_L_T extends HTMLElement {
  connectedCallback() {
    this.processXmlAndXsl();
  }

  async processXmlAndXsl() {
    const xmlSrc = this.getAttribute('xml-src');
    const xslSrc = this.getAttribute('xsl-src');

    if (!xmlSrc || !xslSrc) {
      this.innerHTML = '<p>Both xml-src and xsl-src attributes are required</p>';
      return;
    }

    try {
      // Show loading state
      this.innerHTML = '<p>Loading...</p>';

      // Fetch both XML and XSL concurrently
      const [xmlText, xslText] = await Promise.all([
        this.fetchResource(xmlSrc),
        this.fetchResource(xslSrc)
      ]);

      // Parse the XML and XSL
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
      const xslDoc = parser.parseFromString(xslText, 'application/xml');

      // Check for parsing errors
      if (this.hasParsingError(xmlDoc)) {
        throw new Error('Error parsing XML document');
      }
      if (this.hasParsingError(xslDoc)) {
        throw new Error('Error parsing XSL document');
      }

      // Transform the XML using XSL
      const transformedHTML = await this.transformXml(xmlDoc, xslDoc);

      // Render the result directly to the element
      this.innerHTML = transformedHTML;

    } catch (error) {
      console.error('Error processing XML/XSL:', error);
      this.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
  }

  hasParsingError(doc) {
    return doc.querySelector('parsererror') !== null;
  }

  async transformXml(xmlDoc, xslDoc) {
    return new Promise((resolve, reject) => {
      try {
        // Create XSLT processor
        const processor = new XSLTProcessor();
        processor.importStylesheet(xslDoc);

        // Transform the XML
        const resultFragment = processor.transformToFragment(xmlDoc, document);

        // Convert document fragment to HTML string
        const div = document.createElement('div');
        div.appendChild(resultFragment.cloneNode(true));

        resolve(div.innerHTML);
      } catch (error) {
        reject(new Error(`XSLT transformation failed: ${error.message}`));
      }
    });
  }

  async fetchResource(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  static get observedAttributes() {
    return ['xml-src', 'xsl-src'];
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      await this.processXmlAndXsl();
    }
  }
}

customElements.define('x-l-s-t', X_S_L_T)