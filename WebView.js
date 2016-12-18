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

  /* Search suggestions */
  .ne.r9 {
    display: none;
  }

  /* Left navigation menu */
  .fv.tTwEpb {
    display: none;
  }

  /* Copied from inbox. Mark as important to override the styles when the left menu is open */

  .bz {
  	width:1200px !important;
  	margin-left:auto !important;
  	margin-right:auto !important;
  }
  @media (max-width:1800px) {
  	.bz {
  		width:66.66% !important;
  	}
  }
  @media (max-width:1260px) {
  	.bz {
  		width:840px !important;
  	}
  }
  @media (max-width:920px) {
  	.bz {
  		width:auto !important;
  		margin-left:40px !important;
  		margin-right:40px !important;
  	}
  }
`

const SCRIPTS = `
  function injectClick(selector) {
    document.querySelector(selector).click()
  }

  function setText(selector, text) {
    var elem = document.querySelector(selector)
    var evt = document.createEvent("HTMLEvents")

    elem.value = text

    evt.initEvent("input", false, true)
    elem.dispatchEvent(evt)
  }

  function getUserAvatar() {
    try {
      var elem = document.querySelector('.gb_8a.gbii')
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

  /* Set up */

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

  /* Inbox actions */

  selectView(title) {
    this.click(`[title="${title}"]`)
  }

  showPreferences() {
    this.trigger('global.app_settings_open')
  }

  showHelp() {
    this.trigger('global.help')
  }

  compose() {
    this.click('.y.hC')
  }

  getUserAvatar() {
    this.exec('getUserAvatar()')
  }

  search(text) {
    if (text)
      this.setText('.gc.sp', text)
    else
      this.click('[title="Back"]')
  }

  /* Helper methods */

  exec(code) {
    console.log(`>>> ${code}`)
    this.runJavaScript(code, null, (webView, result) => {
      this.runJavaScriptFinish(result)
    })
  }

  click(selector) {
    this.exec(`injectClick('${selector}')`)
  }

  trigger(action) {
    this.click(`[jsaction="${action}"]`)
  }

  setText(selector, text) {
    this.exec(`setText(${JSON.stringify(selector)}, ${JSON.stringify(text)})`)
  }

  onReply(method, data) {
    console.log(`<<< ${method}: ${JSON.stringify(data)}`)

    switch (method) {
    case 'getUserAvatar':
      this.emit('avatar', this, data)
      break
    }
  }

  /* Event listeners */

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
    console.log(event, this.uri)
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
