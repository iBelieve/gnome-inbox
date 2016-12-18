const Gtk = require('Gtk'),
      WebKit = require('WebKit2'),
      WebView = require('./WebView')

function icon(name) {
  return new Gtk.Image({ iconName: name, iconSize: Gtk.IconSize.SMALL_TOOLBAR })
}

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

  getTabBar() {
    let firstButton

    const tabButton = (label) => {
      console.log('Creating button')
      const button = new Gtk.RadioButton({ label, drawIndicator: false })
      button.on('toggled', () => {
        if (button.active)
          this.webView.click(`[title="${label}"]`)
      })

      console.log('Creating tab group')

      if (firstButton == null)
        firstButton = button
      else
        button.joinGroup(firstButton)

      return button
    }

    const buttonBox = new Gtk.ButtonBox()
    buttonBox.getStyleContext().addClass("linked")
    buttonBox.add(tabButton('Inbox'))
    buttonBox.add(tabButton('Snoozed'))
    buttonBox.add(tabButton('Drafts'))

    return buttonBox
  }

  getHeader() {
    const header = new Gtk.HeaderBar()
    header.title = 'Inbox'
    header.showCloseButton = true

    const searchButton = new Gtk.Button({ image: icon('edit-find-symbolic') })

    const composeButton = new Gtk.Button({ label: 'Compose',
                                           image: icon('document-edit-symbolic') })
    composeButton.on('clicked', () => this.webView.click('.y.hC'))

    this.profileButton = new Gtk.Button({ image: icon('open-menu-symbolic') })

    header.customTitle = this.getTabBar()
    header.packStart(composeButton)
    header.packEnd(this.profileButton)
    header.packEnd(searchButton)

    // header.getStyleContext().addClass("titlebar")

    return header
  }

  getWebView() {
    this.webView = new WebView({ userContentManager: new WebKit.UserContentManager() })
    this.webView.loadInbox()
    this.webView.on('avatar', (webView, data) => {
      console.log('Now setting button...', data)
      this.profileButton.image
    })

    return this.webView
  }
}

module.exports = MainWindow
