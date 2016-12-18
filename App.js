const GLib = require('GLib')
const Gtk = require('Gtk')
const MainWindow = require('./MainWindow')

class App extends Gtk.Application {
  constructor() {
    super()

    GLib.setPrgname('Inbox')

    this.on('startup', this.onStartup.bind(this))
    this.on('activate', this.onActivate.bind(this))
  }

  /* Application lifecycle events */

  onStartup() {
    this.window = new MainWindow({ application: this })
  }

  onActivate() {
    this.window.showAll()
  }
}

module.exports = App
