const GLib = require('GLib'),
      WebKit = require('WebKit2'),
      DOM = require('./DOM')

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
  var domHelper = {
    click: function(selector) {
      document.querySelector(selector).click()
    },

    setValue: function(selector, value) {
      var elem = document.querySelector(selector)
      var evt = document.createEvent("HTMLEvents")

      elem.value = value

      evt.initEvent("input", false, true)
      elem.dispatchEvent(evt)
    },

    getUserAvatar: function() {
      try {
        var elem = document.querySelector('.gb_8a.gbii')
        var css = window.getComputedStyle(elem)
        var url = css.backgroundImage.match(${/url\((.*)\)/})[1]

        dom.reply('getUserAvatar', url)
      } catch (error) {
        dom.reply('getUserAvatar', 'Error: ' + error.message)
      }
    },

    reply: function(method, data) {
      // Webkit will be notified about a request change
      location.href = '${CHANNEL}:' + encodeURIComponent(JSON.stringify({ method: method, data: data }))
    }
  }
`

class WebView extends WebKit.WebView {
  constructor({ userContentManager }) {
    super({ userContentManager })

    this.dom = new DOM(this)

    // this.on('load-changed', this.onLoadChanged.bind(this))
    // this.on('decide-policy', this.onDecidePolicy.bind(this))

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

    context.getCookieManager().setPersistentStorage(`${App.dataDir}/cookies.txt`,
                                                    WebKit.CookiePersistentStorage.TEXT)
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
    if (text)
      this.dom.setValue('.gc.sp', text)
    else
      this.dom.click('[title="Back"]')
  }

  /* Helper methods */

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

      console.log(uri)

      if (uri.indexOf(CHANNEL + ':') === 0) {
        const response = JSON.parse(decodeURIComponent(uri.slice(CHANNEL.length + 1)))
        policy.ignore()
        this.onReply(response.method, response.data)
      }
      break
    }

    return false
  }

  onLoadChanged(webView, event, data) {
    console.log(event, this.uri)
    switch (event) {
    case WebKit.LoadEvent.FINISHED:
      if (this.uri === 'https://inbox.google.com/') {
        console.log('Fully loaded!')
      }
      break
    }
  }
}

module.exports = WebView
