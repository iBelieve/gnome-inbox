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
    this.add(this.getBody())
  }

  getTabBar() {
    let firstButton

    const tabButton = (label) => {
      const button = new Gtk.RadioButton({ label, drawIndicator: false })
      button.on('toggled', () => {
        if (button.active)
          this.webView.selectView(label)
      })

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

  getSearchButton() {
    this.searchButton = new Gtk.ToggleButton({ image: icon('edit-find-symbolic') })

    this.searchButton.on('toggled', () => {
      if (this.searchButton.getActive()) {
        this.searchBar.setSearchMode(true)
      } else {
        this.searchBar.setSearchMode(false)
      }
    })

    return this.searchButton
  }

  getHeader() {
    const header = new Gtk.HeaderBar()
    header.title = 'Inbox'
    header.showCloseButton = true

    const composeButton = new Gtk.Button({ label: 'Compose',
                                           image: icon('document-edit-symbolic') })
    composeButton.on('clicked', () => this.webView.compose())

    this.profileButton = new Gtk.Button({ image: icon('open-menu-symbolic') })

    header.customTitle = this.getTabBar()
    header.packStart(composeButton)
    header.packEnd(this.profileButton)
    header.packEnd(this.getSearchButton())

    // header.getStyleContext().addClass("titlebar")

    return header
  }

  getBody() {
    this.content = new Gtk.Grid()
    this.content.attach(this.getSearchBar(), 0, 0, 1, 1)
    this.content.attach(this.getWebView(), 0, 1, 1, 1)

    return this.content
  }

  getSearchBar() {
    this.searchBar = new Gtk.SearchBar()

    const searchEntry = new Gtk.SearchEntry({ widthRequest: 500 })
    searchEntry.on('search-changed', () => {
      this.webView.search(searchEntry.text)
    })
    searchEntry.on('stop-search', () => {
      this.searchButton.active = false
    })

    this.searchBar.connectEntry(searchEntry)
    this.searchBar.add(searchEntry)

    return this.searchBar
}

  getWebView() {
    this.webView = new WebView({ userContentManager: new WebKit.UserContentManager(),
                                 vexpand: true })
    this.webView.loadInbox()
    this.webView.on('avatar', (webView, data) => {
      console.log('Now setting button...', data)

    })

    return this.webView
  }
}

module.exports = MainWindow
