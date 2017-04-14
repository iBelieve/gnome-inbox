const fs = require('fs')
const GLib = require('GLib')
const Gio = require('Gio')
const Gtk = require('Gtk')
const WebKit = require('WebKit2')
const MainWindow = require('./MainWindow')
const GmailWebView = require('./GmailWebView')
const utils = require('./utils')

class Application extends Gtk.Application {
  constructor () {
    super()

    GLib.setPrgname('Inbox')

    this.applicationId = 'io.mspencer.Inbox'

    this.on('startup', this.onStartup.bind(this))
    this.on('activate', this.onActivate.bind(this))
  }

  /* Application lifecycle events */

  onStartup () {
    global.App = this

    this.dataDir = GLib.buildFilenamev([GLib.getUserDataDir(), 'gnome-inbox'])

    if (!GLib.fileTest(this.dataDir, GLib.FileTest.IS_DIR)) {
      GLib.mkdirWithParents(this.dataDir, 0o775)
    }

    this.setUpWebKit()

    this.mainWindow = new MainWindow({ application: this })
    this.appMenu = this.getAppMenu()

    this.setUpActions()
  }

  onActivate () {
    this.mainWindow.showAll()
  }

  /* Application actions */

  onActionQuit () {
    this.mainWindow.destroy()
  }

  onActionAbout () {
    // TODO: Show an about dialog
  }

  onActionHelp () {
    this.mainWindow.webView.showHelp()
  }

  onActionPreferences () {
    this.mainWindow.webView.showPreferences()
  }

  /* Set up methods */

  setUpActions () {
    const actionEntries = [
      { name: 'preferences',
        callback: this.onActionPreferences.bind(this) },
      { name: 'quit',
        callback: this.onActionQuit.bind(this),
        accels: ['<Primary>q'] },
      { name: 'about',
        callback: this.onActionAbout.bind(this) },
      { name: 'help',
        callback: this.onActionHelp.bind(this),
        accels: ['F1'] }
    ]

    utils.populateActionGroup(this, actionEntries, 'app')
  }

  getAppMenu () {
    const menu = new Gio.Menu()

    const section1 = new Gio.Menu()
    section1.append('Preferences', 'app.preferences')
    menu.appendSection(null, section1)

    const section2 = new Gio.Menu()
    section2.append('Help', 'app.help')
    section2.append('About', 'app.about')
    section2.append('Quit', 'app.quit')
    menu.appendSection(null, section2)

    return menu
  }

  /* WebKit setup */

  addWebKitStyleSheet (name, whitelist) {
    const stylesheet = new WebKit.UserStyleSheet(fs.readFileSync(`${__dirname}/injected/${name}.css`, 'utf8'),
                                                 WebKit.UserContentInjectedFrames.ALL_FRAMES,
                                                 WebKit.UserStyleLevel.USER, whitelist, null)
    this.webkitUserContent.addStyleSheet(stylesheet)
  }

  addWebKitScript (name, whitelist) {
    const userScript = new WebKit.UserScript(fs.readFileSync(`${__dirname}/injected/${name}.js`, 'utf8'),
                                             WebKit.UserContentInjectedFrames.ALL_FRAMES,
                                             WebKit.UserScriptInjectionTime.START, whitelist, null)
    this.webkitUserContent.addScript(userScript)
  }

  setUpWebKit () {
    this.webkitContext = new WebKit.WebContext()
    this.webkitUserContent = new WebKit.UserContentManager()
    this.webkitCookies = this.webkitContext.getCookieManager()
    this.webkitSettings = new WebKit.Settings()

    this.webkitCookies.setPersistentStorage(`${App.dataDir}/cookies.txt`,
                                            WebKit.CookiePersistentStorage.TEXT)

    this.addWebKitStyleSheet('inbox', ['https://inbox.google.com/*'])
    this.addWebKitScript('inbox', ['https://inbox.google.com/*'])
    this.addWebKitScript('gmail', ['https://mail.google.com/*'])
    this.addWebKitScript('shared', ['https://inbox.google.com/*', 'https://mail.google.com/*'])

    this.webkitSettings.setEnableDeveloperExtras(true)
    this.webkitSettings.setEnableWriteConsoleMessagesToStdout(true)
  }

  loadGmail() {
    console.log('Loading gmail...')
    this.gmail = new GmailWebView({
      userContentManager: App.webkitUserContent,
      webContext: App.webkitContext,
      settings: App.webkitSettings
    })
    this.gmail.loadMail()
  }

  onNeedsRefresh() {
    console.log('Refreshing!')
    this.gmail.getNewMessages()
  }

  onNewMessages(data) {
    console.log('New messages!')
    console.log(data)

    for (let message of data.newMessages) {
      const notification = new Gio.Notification()
      notification.setTitle(message.senderName)
      notification.setBody(message.subject)

      this.sendNotification(null, notification)
    }
  }
}

module.exports = Application
