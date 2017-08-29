use std::path::PathBuf;
use std::fs::DirBuilder;
use glib;
use gio::prelude::*;
use gtk::prelude::*;
use gio;
use gio::MenuExt;
use gtk;
use ui::create_main_window;
use webkit2gtk as webkit;
use webkit2gtk::{SettingsExt, WebContextExt, UserContentManagerExt, CookieManagerExt};


pub fn create_app() -> gtk::Application {
    let app = gtk::Application::new("io.mspencer.Inbox", gio::APPLICATION_FLAGS_NONE)
        .expect("Failed to create application");
    app.connect_startup(on_startup);

    app
}

fn on_startup(app: &gtk::Application) {
    let data_dir = glib::get_user_data_dir().unwrap().join("gnome-inbox");

    if !data_dir.exists() {
        DirBuilder::new().recursive(true).create(&data_dir).expect(
            "Unable to create data dir",
        );
    }

    app.set_app_menu(&create_app_menu());
    set_up_actions(&app);

    let (web_settings, user_content) = set_up_webkit(&data_dir);

    app.connect_activate(clone!(web_settings, user_content => move |app| {
        if let Some(win) = app.get_active_window() {
            win.present();
        } else {
            let win = create_main_window(app, &web_settings, &user_content);
            win.show_all();
        }
    }));
}

fn set_up_webkit(data_dir: &PathBuf) -> (webkit::Settings, webkit::UserContentManager) {
    let settings = webkit::Settings::new();
    let web_context = webkit::WebContext::get_default().unwrap();
    let cookie_manager = web_context.get_cookie_manager().unwrap();
    let user_content = create_user_content();

    // Enable developer logging and features in debug builds
    #[cfg(debug_assertions)]
    {
        settings.set_enable_developer_extras(true);
        settings.set_enable_write_console_messages_to_stdout(true);
    }

    cookie_manager.set_persistent_storage(
        data_dir.join("cookies.txt").to_str().unwrap(),
        webkit::CookiePersistentStorage::Text,
    );

    (settings, user_content)
}

fn create_user_content() -> webkit::UserContentManager {
    let user_content = webkit::UserContentManager::new();

    {
        let add_script = |script: &str, whitelist: &[&str]| {
            user_content.add_script(&webkit::UserScript::new(
                script,
                webkit::UserContentInjectedFrames::AllFrames,
                webkit::UserScriptInjectionTime::Start,
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
            user_content.add_style_sheet(&webkit::UserStyleSheet::new(
                stylesheet,
                webkit::UserContentInjectedFrames::AllFrames,
                webkit::UserStyleLevel::User,
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

fn create_app_menu() -> gio::Menu {
    let menu = gio::Menu::new();

    let section1 = gio::Menu::new();
    section1.append("Preferences", "win.preferences");
    menu.append_section(None, &section1);

    let section2 = gio::Menu::new();
    section2.append("Help", "win.help");
    section2.append("About", "app.about");
    section2.append("Quit", "app.quit");
    menu.append_section(None, &section2);

    menu
}

fn set_up_actions(app: &gtk::Application) {
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
