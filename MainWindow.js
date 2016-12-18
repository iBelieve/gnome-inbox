const Gtk = require('Gtk'),
      WebKit = require('WebKit2'),
      fs = require('fs')

const STYLESHEET = `
  /* A container holding the compose FAB + menu */
  .nPQzwd.iP {
    display: none;
  }

  /* Container holding hangout chat windows */
  #OPOhoe {
    display: none;
  }

  /* Navigation bar */
  .Ut6z6b {
    display: none;
  }

  /* Remove padding needed for the navbar */
  .cM.bz {
    padding-top: 0 !important;
  }

  /* Right navbar buttons */
  .rs.k2 {
    display: none;
  }

  /* An IFrame causing a weird dot in the upper left corner */
  #gtn-roster-iframe-id {
    display: none;
  }
`

class MainWindow extends Gtk.ApplicationWindow {
  constructor({ application } = {}) {
    super({ application })

    try {
      this.setIconFromFile(`${__dirname}/inbox.png`)
    } catch (error) {
      this.setIconName('application-x-executable')
    }

    this.setTitlebar(this.getHeader())
    this.add(this.getWebView())
  }

  getHeader() {
    const header = new Gtk.HeaderBar()
    header.title = 'Inbox'
    header.showCloseButton = true

    // const headerStart = new Gtk.Grid({ columnSpacing: headerBar.spacing });
    const composeIcon = new Gtk.Image({ iconName: 'document-edit-symbolic',
                                        iconSize: Gtk.IconSize.SMALL_TOOLBAR })
    const composeButton = new Gtk.Button({ label: 'Compose', image: composeIcon })
    composeButton.on('clicked', () => this.click('.y.hC'))

    // headerStart.attach(this.widgetOpen.button, 0, 0, 1, 1)
    // headerStart.attach(composeButton, 1, 0, 1, 1)
    header.packStart(composeButton)

    // header.getStyleContext().addClass("titlebar")

    return header
  }

  click(selector) {
    const code = `document.querySelectorAll('${selector}').item(0).click()`

    this.webView.runJavaScript(code, null, (webView, result) => {
      this.webView.runJavaScriptFinish(result)
    })
  }

  setUpContentManager() {
    this.contentManager = new WebKit.UserContentManager()

    const stylesheet = new WebKit.UserStyleSheet(STYLESHEET,
                                                 WebKit.UserContentInjectedFrames.ALL_FRAMES,
                                                 WebKit.UserStyleLevel.USER, null, null)

    this.contentManager.addStyleSheet(stylesheet)
  }

  setUpWebContext() {
    this.webContext = this.webView.getContext()
    this.webContext.getCookieManager().setPersistentStorage(`${__dirname}/cookies.txt`,
                                                            WebKit.CookiePersistentStorage.TEXT)
  }

  getWebView() {
    this.setUpContentManager()

    this.webView = new WebKit.WebView({ userContentManager: this.contentManager })
    this.webView.loadUri('https://inbox.google.com')

    this.setUpWebContext()

    return this.webView
  }
}

module.exports = MainWindow
