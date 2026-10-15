import { OPEN_LINK_MESSAGE } from "./externalLink";

// Runs inside a sandboxed output frame (a Python HTML output, a JavaScript cell). The frame cannot open a dialog in
// the app, so a click on a web link is stopped there and handed to the page, which asks the reader first
// (components/ExternalLink). Links that stay in the frame (#section) and mailto: links are left alone.
export const LINK_GUARD_SCRIPT = `
    function guardLink(event) {
      var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      // A link to another place on the same page (#section) stays in the frame, whatever address the frame has.
      if (!link || link.getAttribute("href").charAt(0) === "#" || !/^https?:/i.test(link.href)) return;
      event.preventDefault();
      parent.postMessage({ type: ${JSON.stringify(OPEN_LINK_MESSAGE)}, url: link.href }, "*");
    }
    document.addEventListener("click", guardLink, true);
    document.addEventListener("auxclick", guardLink, true);
`;
