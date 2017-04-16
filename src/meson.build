app_resource = custom_target(app_id + '.src',
  output : app_id + '.src.gresource',
  input : 'index.ts',
  depfile : 'jsgtk.d',
  command : ['jsgtk', 'build', app_id, '@INPUT@', '@OUTPUT@', '@DEPFILE@'],
  install: true,
  install_dir : pkgdatadir)

run = run_target('run', command: 'pushd $$MESON_BUILD_ROOT/$$MESON_SUBDIR && io.mspencer.Inbox; popd')

app_launcher = configure_file(
  output : app_id,
  input : app_id + '.in',
  configuration: app_configuration)
install_data(app_launcher,
  install_dir: pkgdatadir,
  install_mode: 'rwxr-xr-x'
)
install_data(app_launcher,
  install_dir: get_option('bindir'),
  install_mode: 'rwxr-xr-x'
)
