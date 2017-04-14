prefix:=/usr

APP_ID = io.mspencer.Inbox

do_subst = sed -e 's|@prefix@|${prefix}|g'

all: build

build: data/${APP_ID}.service

install: build
	mkdir -p ${DESTDIR}${prefix}/{bin,lib,share/applications,share/dbus-1/services,share/icons}

	cp -r src/* ${DESTDIR}${prefix}/lib/gnome-inbox/
	printf "#!/bin/bash\njsgtk ${prefix}/lib/gnome-inbox/index.js\n" > ${DESTDIR}${prefix}/bin/gnome-inbox
	chmod 755 ${DESTDIR}${prefix}/bin/gnome-inbox
	cp data/${APP_ID}.desktop ${DESTDIR}${prefix}/share/applications/
	cp data/${APP_ID}.service ${DESTDIR}${prefix}/share/dbus-1/services/
	cp -r data/application-icons/* ${DESTDIR}${prefix}/share/icons/

data/${APP_ID}.service: data/${APP_ID}.service.in
	$(do_subst) $< > $@
