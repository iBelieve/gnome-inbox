import * as EventEmitter from 'events'
import * as WebKit from 'WebKit2'

export default class DOM extends EventEmitter {
  webView: WebKit.WebView

  constructor(webView) {
    super()
    this.webView = webView
  }

  /* High-level methods */

  click(selector) {
    this.exec('click', selector)
  }

  triggerAction(action) {
    this.click(`[jsaction="${action}"]`)
  }

  setValue(selector, value) {
    this.exec('setValue', selector, value)
  }

  getValue(selector) {
    // TODO: Implement returning values directly, using async, or a callback
    this.exec('getValue', selector)
  }

  /* Helper methods */

  exec(method, ...params) {
    const paramsString = params
      .map(param => JSON.stringify(param))
      .join(', ')
    const code = `domHelper.${method}(${paramsString})`

    this.webView.runJavaScript(code, null, (webView, result) => {
      console.log(this.webView.runJavaScriptFinish(result))
    })
  }
}
