GNOME Inbox
===========

The goal is to provide a nice Linux alternative to [Boxy](http://www.boxyapp.co/) on macOS.

![Screenshot](screenshot.jpg)

### Features

 * GNOME headerbar with a compose button, folder switching, and search.

### Dependencies

 * [JSGtk+](https://github.com/iBelieve/jsgtk) (my fork)
   * JSGtk+ depends on [GJS](https://wiki.gnome.org/Projects/Gjs) (`gjs` on Arch)
 * [GTK+ 3](https://www.gtk.org/) (`gtk3` on Arch)
 * [WebKitGTK+ 2](https://webkitgtk.org/) (`webkit2gtk` on Arch)

### Building and installing

    mkdir build; cd build
    meson ..
    ninja
    ninja install # Use sudo if necessary

### Licensing

GNOME Inbox is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
