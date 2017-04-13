prefix:=/usr

install:
	mkdir -p ${DESTDIR}/${prefix}/{bin,lib,share/applications,share/icons}

	cp -r src ${DESTDIR}/${prefix}/lib/gnome-inbox
	printf "#!/bin/bash\njsgtk ${prefix}/lib/gnome-inbox/index.js\n" > ${DESTDIR}/${prefix}/bin/gnome-inbox
	chmod 755 ${DESTDIR}/${prefix}/bin/gnome-inbox
	cp data/io.mspencer.Inbox.desktop ${DESTDIR}/${prefix}/share/applications/
	cp -r data/application-icons/* ${DESTDIR}/${prefix}/share/icons/
