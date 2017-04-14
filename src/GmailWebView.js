const WebKit = require('WebKit2')

const CHANNEL = 'jsgtk'

class GmailWebView extends WebKit.WebView {
  constructor (options) {
    super(options)

    this.on('decide-policy', this.onDecidePolicy.bind(this))
    this.on('load-changed', this.onLoadChanged.bind(this))
    this.on('new-messages', App.onNewMessages.bind(App))
  }

  loadMail () {
    this.loadUri('https://mail.google.com/mail/u/0/?ibxr=0')
  }

  getNewMessages () {
    this.runJavaScript(`getNewMessages()`, null, (webView, result) => {
      console.log(this.runJavaScriptFinish(result))
    })
  }

  /* Event listeners */

  onDecidePolicy (webView, policy, type) {
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

  onLoadChanged (webView, event, data) {
    switch (event) {
      case WebKit.LoadEvent.FINISHED:
        if (this.uri.startsWith('https://mail.google.com/mail/u/')) {
          this.getNewMessages()
        }
        break
    }
  }
}

module.exports = GmailWebView
