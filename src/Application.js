const GLib = require('GLib')
const Gio = require('Gio')
const Gtk = require('Gtk')
const MainWindow = require('./MainWindow')
const utils = require('./utils')

class Application extends Gtk.Application {
  constructor () {
    super({ applicationId: 'io.mspencer.Inbox' })

    GLib.setPrgname('Inbox')

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
}

module.exports = Application
