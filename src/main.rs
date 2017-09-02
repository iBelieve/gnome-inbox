extern crate itertools;
extern crate glib;
extern crate gio;
extern crate gtk;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate webkit2gtk;
extern crate percent_encoding;

macro_rules! clone {
    (@param _) => ( _ );
    (@param $x:ident) => ( $x );
    ($($n:ident),+ => move || $body:expr) => (
        {
            $( let $n = $n.clone(); )+
            move || $body
        }
    );
    ($($n:ident),+ => move |$($p:tt),+| $body:expr) => (
        {
            $( let $n = $n.clone(); )+
            move |$(clone!(@param $p),)+| $body
        }
    );
}

mod app;
mod dom;
mod gmail;
mod inbox;
mod ui;
mod webview;

use app::create_app;
use gio::prelude::*;

fn main() {
    glib::set_prgname(Some("Inbox"));

    let app = create_app();
    app.run(&[]);
}
