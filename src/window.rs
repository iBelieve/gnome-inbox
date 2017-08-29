use gtk::prelude::*;
use gtk::{Application, ApplicationWindow, Button, ButtonBox, HeaderBar, Grid, Orientation,
          RadioButton, SearchBar};
use webkit2gtk::WebView;
use inbox;

pub fn get_main_window(app: &Application) -> ApplicationWindow {
    let win = ApplicationWindow::new(app);
    win.set_default_size(800, 600);

    let container = Grid::new();
    let searchbar = SearchBar::new();
    let webview = inbox::get_webview();

    webview.set_vexpand(true);

    container.attach(&searchbar, 0, 0, 1, 1);
    container.attach(&webview, 0, 1, 1, 1);
    win.add(&container);

    let headerbar = get_headerbar(&webview);
    win.set_titlebar(Some(&headerbar));

    win
}

fn get_headerbar(webview: &WebView) -> HeaderBar {
    let headerbar = HeaderBar::new();
    headerbar.set_title(Some("Inbox"));
    headerbar.set_show_close_button(true);

    let compose_button = Button::new_with_label("Compose");
    compose_button.connect_clicked(clone!(webview => move |_| inbox::open_composer(&webview)));

    let tabbar: ButtonBox = get_tabbar(webview);

    headerbar.pack_start(&compose_button);
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
