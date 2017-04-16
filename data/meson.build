datadir = get_option('datadir')

data_resource = gnome.compile_resources(app_id + '.data',
  app_id + '.data.gresource.xml',
  source_dir: '.',
  gresource_bundle: true,
  install: true,
  install_dir : pkgdatadir)

appsdir = join_paths(get_option('datadir'), 'applications')
desktop = i18n.merge_file(
  input : app_id + '.desktop.in',
  output : app_id + '.desktop',
  po_dir : '../po',
  type : 'desktop',
  install: true,
  install_dir: appsdir
)

dbusservicedir = join_paths(get_option('datadir'), 'dbus-1', 'services')
dbus_service = configure_file(
  configuration : app_configuration,
  input : app_id + '.service.in',
  output : app_id + '.service',
  install : true,
  install_dir : dbusservicedir
)

icondir = join_paths(datadir, 'icons', 'hicolor')
icon_sizes = ['16x16', '32x32', '48x48', '64x64', '128x128', '256x256']

foreach size : icon_sizes
  install_data('icons/hicolor/@0@/apps/io.mspencer.Inbox.png'.format(size),
    install_dir : join_paths(icondir, size, 'apps'))
endforeach

install_data('icons/hicolor/scalable/apps/io.mspencer.Inbox-symbolic.svg',
  install_dir : 'share/icons/hicolor/symbolic/apps')
