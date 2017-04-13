const Gio = require('Gio')

function populateActionGroup (actionGroup, actionEntries, prefix) {
  for (let actionEntry of actionEntries) {
    const action = new Gio.SimpleAction({ name: actionEntry.name })

    if (actionEntry.callback) {
      action.connect('activate', actionEntry.callback)
    }

    if (actionEntry.accels) {
      App.setAccelsForAction(`${prefix}.${action.name}`, actionEntry.accels)
    }

    actionGroup.addAction(action)
  }
}

module.exports = { populateActionGroup }
