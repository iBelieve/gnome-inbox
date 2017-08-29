use gio;
use gio::prelude::*;
use gtk::prelude::*;
use gtk::{Application, ApplicationWindow, Button, ButtonBox, HeaderBar, Grid, Orientation,
          RadioButton, SearchBar, ToggleButton, Image, SearchEntry};
use webkit2gtk::{WebView, Settings, UserContentManager};
use inbox;

pub fn get_main_window(
    app: &Application,
    web_settings: &Settings,
    user_content: &UserContentManager,
) -> ApplicationWindow {
    let win = ApplicationWindow::new(app);
    win.set_default_size(800, 600);

    macro_rules! add_action {
        ($name:expr,$accelerators:expr,$callback:expr) => {
            let action = gio::SimpleAction::new($name, None);
            action.connect_activate($callback);
            win.add_action(&action);

            app.set_accels_for_action(concat!("win.", $name), $accelerators);
        }
    }

    let container = Grid::new();
    let webview = inbox::get_webview(web_settings, user_content);
    let (searchbar, search_button) = create_search(&webview);

    webview.set_vexpand(true);

    container.attach(&searchbar, 0, 0, 1, 1);
    container.attach(&webview, 0, 1, 1, 1);
    win.add(&container);

    let headerbar = get_headerbar(&webview, &search_button);
    win.set_titlebar(Some(&headerbar));

    add_action!(
        "preferences",
        &[],
        clone!(webview => move |_, _| {
        inbox::show_prefs(&webview);
    })
    );

    add_action!(
        "help",
        &["F1"],
        clone!(webview => move |_, _| {
        inbox::show_help(&webview);
    })
    );

    win
}

fn get_headerbar(webview: &WebView, search_button: &ToggleButton) -> HeaderBar {
    let headerbar = HeaderBar::new();
    headerbar.set_title(Some("Inbox"));
    headerbar.set_show_close_button(true);

    let compose_button = Button::new_with_label("Compose");
    compose_button.connect_clicked(clone!(webview => move |_| inbox::open_composer(&webview)));

    let tabbar: ButtonBox = get_tabbar(webview);

    headerbar.pack_start(&compose_button);
    headerbar.pack_end(search_button);
    headerbar.set_custom_title(Some(&tabbar));

    headerbar
}

fn get_tabbar(webview: &WebView) -> ButtonBox {
    let tabbar = ButtonBox::new(Orientation::Horizontal);
    tabbar.get_style_context().unwrap().add_class("linked");

    {
        let mut button_group: Option<RadioButton> = None;

        let mut tab_button = |label| {
            let button = if let Some(ref button_group) = button_group {
                RadioButton::new_with_label_from_widget(button_group, label)
            } else {
                RadioButton::new_with_label(label)
            };

            button.set_property_draw_indicator(false);
            button.connect_toggled(clone!(webview => move |button| {
                if button.get_active() {
                    inbox::select_view(&webview, button.get_label().unwrap().as_str());
                }
            }));

            tabbar.add(&button);
            button_group = Some(button);
        };

        tab_button("Inbox");
        tab_button("Snoozed");
        tab_button("Drafts");
    }

    tabbar
}

fn create_search(webview: &WebView) -> (SearchBar, ToggleButton) {
    let searchbar = SearchBar::new();
    let search_entry = SearchEntry::new();
    let search_button = ToggleButton::new();

    search_entry.set_property_width_request(500);
    search_entry.connect_search_changed(clone!(webview => move |entry| {
        inbox::search(&webview, &entry.get_text().unwrap_or(String::new()));
    }));
    search_entry.connect_stop_search(clone!(search_button => move |_| {
        search_button.set_active(false);
    }));

    searchbar.connect_entry(&search_entry);
    searchbar.add(&search_entry);

    search_button.set_image(&Image::new_from_icon_name(
        "edit-find-symbolic",
        2, /* IconSize::SmallToolbar */
    ));
    search_button.connect_toggled(clone!(searchbar => move |button| {
        searchbar.set_search_mode(button.get_active());
    }));

    (searchbar, search_button)
}
