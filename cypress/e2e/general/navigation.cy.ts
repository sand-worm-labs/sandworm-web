describe("Navigation Links", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should ensure all links have valid href attributes", () => {
    cy.get("a").each($link => {
      const href = $link.attr("href");
      expect(href, "Href should not be empty").to.not.be.empty;
    });
  });

  it('should ensure "/" links contain "home" in text, aria-label, or alt attribute', () => {
    cy.get('a[href="/"]').each($link => {
      const text = $link.text().toLowerCase();
      const ariaLabel = $link.attr("aria-label")?.toLowerCase() || "";
      const altText = $link.find("img").attr("alt")?.toLowerCase() || "";

      const includesHome =
        text.includes("home") ||
        ariaLabel.includes("home") ||
        altText.includes("home");

      expect(
        includesHome,
        'Links with href="/" should have "home" in text, aria-label, or alt'
      ).to.be.true;
    });
  });
});
