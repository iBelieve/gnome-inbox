use dom;
use webkit2gtk::*;
use webview::connect_event_received;
use gmail;

pub fn create_webview(web_settings: &Settings, user_content: &UserContentManager) -> WebView {
    let webview = WebView::new_with_user_content_manager(user_content);
    webview.set_settings(web_settings);
    webview.load_uri("https://inbox.google.com");

    webview.connect_load_changed(clone!(web_settings, user_content => move |webview, event| {
        println!("Event: {:?}, {}", event, webview.get_uri().unwrap());
        if event == LoadEvent::Finished && webview.get_uri() == Some(String::from("https://inbox.google.com/")) {
            println!("Inbox loaded, watching gmail");
            let gmail_webview = gmail::create_webview(&web_settings, &user_content);

            connect_event_received(&webview, move |_, action, _| match action {
                "refresh-needed" => gmail::get_new_messages(&gmail_webview),
                _ => println!("WARNING: Unrecognized JS action: {}", action),
            });
        }
    }));

    webview
}

pub fn open_composer(webview: &WebView) {
    dom::click(webview, ".y.hC");
}

pub fn select_view(webview: &WebView, title: &str) {
    dom::click(webview, &format!("[title=\"{}\"]", title));
}

pub fn search(webview: &WebView, text: &str) {
    if text.len() > 0 {
        dom::set_value(webview, ".gc.sp", text);
    } else {
        dom::click(webview, "[title=\"Back\"]");
    }
}

pub fn show_prefs(webview: &WebView) {
    dom::trigger_action(webview, "global.app_settings_open");
}

pub fn show_help(webview: &WebView) {
    dom::trigger_action(webview, "global.help");
}
