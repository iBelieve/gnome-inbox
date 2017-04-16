project('gnome-inbox', 'c',
  version: '0.0.1',
  meson_version: '>= 0.36.0',
)

app_command = 'gnome-inbox'
app_id = 'io.mspencer.Inbox'

i18n = import('i18n')
gnome = import('gnome')

jsgtk = find_program('jsgtk')

app_configuration = configuration_data()

app_configuration.set('GJS', find_program('gjs').path())
app_configuration.set('PACKAGE_NAME', app_id)
app_configuration.set('PACKAGE_VERSION', meson.project_version())
app_configuration.set('prefix', get_option('prefix'))

pkgdatadir = join_paths(get_option('datadir'), app_id)
app_configuration.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
app_configuration.set('pkgdatadir', pkgdatadir)

meson.add_install_script('meson/post_install.sh')

subdir('data')
subdir('src')
