/*
 * Code based on Inbox Notifications (https://github.com/eeejay/inbox-notifications)
 * Originally written by Eitan Isaacson under the MPL-2.0
 */

'use strict'

function parseMessage (entry) {
  const get = selector => entry.querySelector(selector).textContent

  return {
    id: get('id'),
    subject: get('title'),
    summary: get('summary'),
    senderName: get('author > name'),
    senderEmail: get('author > email')
  }
}

class MessagesFeed {
  constructor (accountId = 0) {
    this.accountId = accountId
    this.seenMessages = new Set()
  }

  getFeed () {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()
      xhr.onload = function () {
        resolve(xhr.responseXML)
      }

      xhr.onerror = function () {
        reject('Error while getting XML.')
      }

      let url = `https://mail.google.com/mail/u/${this.accountId}/feed/atom`

      xhr.responseType = 'document'
      xhr.open('GET', url, true)
      xhr.send()
    })
  }

  getNewMessages () {
    console.debug('refreshing')

    return this.getFeed().then(feed => {
      console.debug('got feed')
      let unread = parseInt(feed.querySelector('fullcount').textContent, 10)
      let newMessages = []
      for (let entry of feed.querySelectorAll('entry')) {
        let message = parseMessage(entry)
        if (!this.seenMessages.has(message.id)) {
          newMessages.push(message)
        }
        this.seenMessages.add(message.id)
      }

      this.firstRun = false

      console.debug(
        'Unread:', unread,
        'New:', newMessages.length,
        'Cached:', this.seenMessages.size)

      return { unread: unread, newMessages: newMessages }
    })
  }
}

const feed = new MessagesFeed()

function getNewMessages () {
  feed.getNewMessages()
    .then(data => {
      jsgtk.send('new-messages', data)
    })
    .catch(error => console.error(error))
}
