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

mod dom;
mod inbox;
mod window;

use glib::get_user_data_dir;
use gio::prelude::*;
use gtk::prelude::*;
use gtk::Application;
use webkit2gtk::*;
use webkit2gtk::SettingsExt;
use window::get_main_window;
use std::fs::DirBuilder;

fn main() {
    let app = Application::new("io.mspencer.Inbox", gio::APPLICATION_FLAGS_NONE)
        .expect("Failed to create application");

    let data_dir = get_user_data_dir().unwrap().join("gnome-inbox");

    if !data_dir.exists() {
        DirBuilder::new().recursive(true).create(&data_dir).expect(
            "Unable to create data dir",
        );
    }

    let web_context = WebContext::get_default().unwrap();
    let cookie_manager = web_context.get_cookie_manager().unwrap();
    let user_content = create_user_content();
    let web_settings = Settings::new();

    // Enable developer logging and features in debug builds
    #[cfg(debug_assertions)]
    {
        web_settings.set_enable_developer_extras(true);
        web_settings.set_enable_write_console_messages_to_stdout(true);
    }

    cookie_manager.set_persistent_storage(
        data_dir.join("cookies.txt").to_str().unwrap(),
        CookiePersistentStorage::Text,
    );

    app.connect_activate(clone!(web_settings, user_content => move |app| {
        if let Some(win) = app.get_active_window() {
            win.present();
        } else {
            let win = get_main_window(app, &web_settings, &user_content);
            win.show_all();
        }
    }));

    app.run(&[]);
}

fn create_user_content() -> UserContentManager {
    let user_content = UserContentManager::new();

    {
        let add_script = |script: &str, whitelist: &[&str]| {
            user_content.add_script(&UserScript::new(
                script,
                UserContentInjectedFrames::AllFrames,
                UserScriptInjectionTime::Start,
                whitelist,
                &[],
            ));
        };

        add_script(
            include_str!("../data/webview/shared.js"),
            &["https://inbox.google.com/*", "https://mail.google.com/*"],
        );
        add_script(
            include_str!("../data/webview/inbox.js"),
            &["https://inbox.google.com/*"],
        );
        add_script(
            include_str!("../data/webview/gmail.js"),
            &["https://mail.google.com/*"],
        );
    }

    {
        let add_style_sheet = |stylesheet: &str, whitelist: &[&str]| {
            user_content.add_style_sheet(&UserStyleSheet::new(
                stylesheet,
                UserContentInjectedFrames::AllFrames,
                UserStyleLevel::User,
                whitelist,
                &[],
            ));
        };

        add_style_sheet(
            include_str!("../data/webview/inbox.css"),
            &["https://inbox.google.com/*"],
        );
    }

    user_content
}
