GNOME Inbox
===========

The goal is to provide a nice Linux alternative to [Boxy](http://www.boxyapp.co/) on macOS.

### Features

 * GNOME headerbar with a compose button, folder switching.

Expected features:

 * A desktop file, app icon, and installation via Flatpak
 * Searching (need to port this from the old JS implementation)
 * Desktop notifications (also needs to be ported from old implementation)
 * More GNOME integration/desktop app features

### Dependencies

 * [Rust and Cargo](https://www.rust-lang.org) (`rust` and `cargo` on Arch; build-time only)
 * [GTK+ 3](https://www.gtk.org/) (`gtk3` on Arch)
 * [WebKitGTK+ 2](https://webkitgtk.org/) (`webkit2gtk` on Arch)

### Building and running

To build:

    cargo build

I need to add install directions to this.

To run:

    cargo run

### Licensing

GNOME Inbox is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
