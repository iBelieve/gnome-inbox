#!/bin/sh

ln -s

rm -f "${DESTDIR}/${MESON_INSTALL_PREFIX}/bin/gnome-inbox"
ln -s "${DESTDIR}/${MESON_INSTALL_PREFIX}/share/io.mspencer.Inbox/io.mspencer.Inbox" "${DESTDIR}/${MESON_INSTALL_PREFIX}/bin/gnome-inbox"
