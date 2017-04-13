prefix:=/usr

install:
	mkdir -p ${prefix}/{bin,lib,share/applications,share/icons}

	cp -r src ${prefix}/lib/gnome-inbox
	ln -s ../lib/gnome-inbox/index.js ${prefix}/bin/gnome-inbox
	chmod 755 ${prefix}/bin/gnome-inbox
	cp data/io.mspencer.Inbox.desktop ${prefix}/share/applications/
	cp -r data/application-icons/* ${prefix}/share/icons/
