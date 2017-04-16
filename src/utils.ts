import { ResourceLookupFlags, SimpleAction, resources_lookup_data } from 'Gio'

export function getResource(filename) {
  return resources_lookup_data(filename, ResourceLookupFlags.NONE).toArray().toString()
}

export function populateActionGroup(actionGroup, actionEntries, prefix) {
  for (let actionEntry of actionEntries) {
    const action = new SimpleAction({ name: actionEntry.name })

    if (actionEntry.callback) {
      action.connect('activate', actionEntry.callback)
    }

    if (actionEntry.accels) {
      App.setAccelsForAction(`${prefix}.${action.name}`, actionEntry.accels)
    }

    actionGroup.addAction(action)
  }
}
