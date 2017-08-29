extern crate itertools;
extern crate gio;
extern crate gtk;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate webkit2gtk;

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

mod dom;
mod inbox;
mod window;

use gio::prelude::*;
use gtk::prelude::*;
use gtk::Application;
use window::get_main_window;

fn main() {
    let app = Application::new("io.mspencer.Inbox", gio::APPLICATION_FLAGS_NONE)
        .expect("Failed to create application");

    app.connect_activate(|app| if let Some(win) = app.get_active_window() {
        win.present();
    } else {
        let win = get_main_window(app);
        win.show_all();
    });

    app.run(&[]);
}
