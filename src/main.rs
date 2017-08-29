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
use gio::{Menu, MenuExt};
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

    app.connect_startup(|app| {
        app.set_app_menu(&create_app_menu());
        set_up_actions(&app);
    });

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

fn create_app_menu() -> Menu {
    let menu = Menu::new();

    let section1 = Menu::new();
    section1.append("Preferences", "win.preferences");
    menu.append_section(None, &section1);

    let section2 = Menu::new();
    section2.append("Help", "win.help");
    section2.append("About", "app.about");
    section2.append("Quit", "app.quit");
    menu.append_section(None, &section2);

    menu
}

fn set_up_actions(app: &Application) {
    macro_rules! add_action {
        ($name:expr,$accelerators:expr,$callback:expr) => {
            let action = gio::SimpleAction::new($name, None);
            action.connect_activate($callback);
            app.add_action(&action);
            app.set_accels_for_action(concat!("app.", $name), $accelerators);
        }
    }

    add_action!(
        "quit",
        &["<Primary>Q"],
        clone!(app => move |_, _| {
        app.quit();
    })
    );

    add_action!("about", &[], |_, _| {
        // TODO: Show about dialog
    });
}
