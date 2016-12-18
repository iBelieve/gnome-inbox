const WebKit = require('WebKit2')

const CHANNEL = 'jsgtk'

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

const SCRIPTS = `
  function injectClick(selector) {
    document.querySelectorAll(selector).item(0).click()
  }

  function getUserAvatar() {
    try {
      var elem = document.querySelectorAll('.gb_8a.gbii').item(0)
      var css = window.getComputedStyle(elem)
      var url = css.backgroundImage.match(${/url\((.*)\)/})[1]

      reply('getUserAvatar', url)
    } catch (error) {
      reply('getUserAvatar', 'Error: ' + error.message)
    }
  }

  function reply(method, data) {
    // Webkit will be notified about a request change
    location.href = '${CHANNEL}:' + encodeURIComponent(JSON.stringify({ method: method, data: data }))
  }
`

class WebView extends WebKit.WebView {
  constructor({ userContentManager }) {
    super({ userContentManager })

    this.on('load-changed', this.onLoadChanged.bind(this))
    this.on('decide-policy', this.onDecidePolicy.bind(this))

    this.setUpContentManager()
    this.setUpWebContext()
  }

  setUpContentManager() {
    const contentManager = this.getUserContentManager()

    const stylesheet = new WebKit.UserStyleSheet(STYLESHEET,
                                                 WebKit.UserContentInjectedFrames.ALL_FRAMES,
                                                 WebKit.UserStyleLevel.USER, null, null)

    const userScript = new WebKit.UserScript(SCRIPTS, WebKit.UserContentInjectedFrames.ALL_FRAMES,
                                             WebKit.UserStyleLevel.USER, null, null)

    contentManager.addStyleSheet(stylesheet)
    contentManager.addScript(userScript)
  }

  setUpWebContext() {
    const context = this.getContext()

    context.getCookieManager().setPersistentStorage(`${__dirname}/cookies.txt`,
                                                    WebKit.CookiePersistentStorage.TEXT)
  }

  loadInbox() {
    this.loadUri('https://inbox.google.com')
  }

  exec(code) {
    console.log(`>>> ${code}`)
    this.runJavaScript(code, null, (webView, result) => {
      this.runJavaScriptFinish(result)
    })
  }

  click(selector) {
    this.exec(`injectClick('${selector}')`)
  }

  getUserAvatar() {
    this.exec('getUserAvatar()')
  }

  onReply(method, data) {
    console.log(`<<< ${method}`)

    switch (method) {
    case 'getUserAvatar':
      this.emit('avatar', this, data)
      break
    }
  }

  onDecidePolicy(webView, policy, type) {
    switch(type) {
    case WebKit.PolicyDecisionType.NAVIGATION_ACTION:
      const uri = policy.getRequest().getUri()

      if (uri.indexOf(CHANNEL + ':') === 0) {
        const response = JSON.parse(decodeURIComponent(uri.slice(CHANNEL.length + 1)))
        policy.ignore()
        this.onReply(response.method, response.data)
      }
      break
    }
  }

  onLoadChanged(webView, event, data) {
    switch (event) {
    case WebKit.LoadEvent.FINISHED:
      if (this.uri === 'https://inbox.google.com/') {
        console.log('Fully loaded!')
        this.getUserAvatar()
      }
      break
    }
  }
}

module.exports = WebView
