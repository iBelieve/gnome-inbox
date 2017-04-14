const jsgtk = {
  send (action, data) {
    location.href = 'jsgtk:' + encodeURIComponent(JSON.stringify({ action: action, data: data }))
  }
}
