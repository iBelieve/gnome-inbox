const domHelper = {
  click (selector) {
    document.querySelector(selector).click()
  },

  setValue (selector, value) {
    var elem = document.querySelector(selector)
    var evt = document.createEvent('HTMLEvents')

    elem.value = value

    evt.initEvent('input', false, true)
    elem.dispatchEvent(evt)
  },

  getUserAvatar () {
    try {
      var elem = document.querySelector('.gb_8a.gbii')
      var css = window.getComputedStyle(elem)
      var url = css.backgroundImage.match(/url\((.*)\)/)[1]

      jsgtk.send('user-avatar', url)
    } catch (error) {
      jsgtk.send('user-avatar', 'Error: ' + error.message)
    }
  }
}

/*
 * Code based on Inbox Notifications (https://github.com/eeejay/inbox-notifications)
 * Originally written by Eitan Isaacson under the MPL-2.0
 */

const observer = new MutationObserver(mutations => {
  let listitemAdded = () => {
    for (let mutation of mutations) {
      if (mutation.type === 'characterData') {
        if (!mutation.target.parentNode.closest('[contenteditable]')) {
          return true
        }
      }

      for (let node of mutation.addedNodes) {
        if (node.getAttribute('role') === 'listitem' ||
            node.getAttribute('role') === 'list') {
          return true
        }
      }
    }

    return false
  }

  if (listitemAdded()) {
    console.log('list item added')
    jsgtk.send('needs-refresh')
  }
})

function startWatching (count = 0) {
  let mainContainer = document.querySelector('[role="main"]')

  if (mainContainer) {
    console.log('Observing', mainContainer)
    observer.observe(mainContainer, {
      characterData: true, subtree: true, childList: true
    })
  } else if (count < 10) {
    setTimeout(() => startWatching(count + 1), 1000)
  }
}

startWatching()
