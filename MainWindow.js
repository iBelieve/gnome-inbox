const Gtk = require('Gtk'),
      WebKit = require('WebKit2'),
      WebView = require('./WebView')

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
    composeButton.on('clicked', () => this.webView.click('.y.hC'))

    // headerStart.attach(this.widgetOpen.button, 0, 0, 1, 1)
    // headerStart.attach(composeButton, 1, 0, 1, 1)
    header.packStart(composeButton)

    // header.getStyleContext().addClass("titlebar")

    return header
  }

  getWebView() {
    this.webView = new WebView({ userContentManager: new WebKit.UserContentManager() })
    this.webView.loadInbox()

    return this.webView
  }
}

module.exports = MainWindow
