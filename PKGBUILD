# Maintainer: Michael Spencer <sonrisesoftware@gmail.com>
_pkgname=gnome-inbox
pkgname=$_pkgname-git
pkgver=r14.b824365
pkgrel=1
pkgdesc="GNOME wrapper for Inbox by Google"
arch=('any')
url="https://github.com/iBelieve/gnome-inbox"
license=('GPL')
depends=('jsgtk' 'webkit2gtk')
source=("gnome-inbox::git://github.com/iBelieve/gnome-inbox.git")
md5sums=('SKIP')

pkgver() {
	cd "$_gitname"
	( set -o pipefail
    	git describe --long 2>/dev/null | sed 's/\([^-]*-g\)/r\1/;s/-/./g' ||
		printf "r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short HEAD)"
  	)
}

package() {
	cd "$_pkgname"
	make DESTDIR="$pkgdir" install
}
