import * as WebKit from 'WebKit2'
import DOM from './DOM'

const CHANNEL = 'jsgtk'

export default class InboxWebView extends WebKit.WebView {
  constructor(options) {
    super(options)

    this.dom = new DOM(this)

    this.on('decide-policy', this.onDecidePolicy.bind(this))
    this.on('load-changed', this.onLoadChanged.bind(this))
    this.on('needs-refresh', App.onNeedsRefresh.bind(App))
  }

  loadInbox() {
    this.loadUri('https://inbox.google.com')
  }

  /* Inbox actions */

  selectView(title) {
    this.dom.click(`[title="${title}"]`)
  }

  showPreferences() {
    this.dom.triggerAction('global.app_settings_open')
  }

  showHelp() {
    this.dom.triggerAction('global.help')
  }

  compose() {
    this.dom.click('.y.hC')
  }

  search(text) {
    if (text) {
      this.dom.setValue('.gc.sp', text)
    } else {
      this.dom.click('[title="Back"]')
    }
  }

  /* Event listeners */

  onDecidePolicy(webView, policy, type) {
    switch (type) {
      case WebKit.PolicyDecisionType.NAVIGATION_ACTION:
        const uri = policy.getRequest().getUri()

        if (uri.indexOf(`${CHANNEL}:`) === 0) {
          const message = JSON.parse(decodeURIComponent(uri.slice(CHANNEL.length + 1)))
          policy.ignore()
          this.emit(message.action, message.data)
        }
        break
    }

    return false
  }

  onLoadChanged(webView, event, data) {
    switch (event) {
      case WebKit.LoadEvent.FINISHED:
        if (this.uri === 'https://inbox.google.com/') {
          App.loadGmail()
        }
        break
    }
  }
}
