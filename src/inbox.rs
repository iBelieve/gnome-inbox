use dom;
use gtk::Cast;
use webkit2gtk::{LoadEvent, WebView, WebViewExt, PolicyDecisionType, PolicyDecisionExt,
                 NavigationPolicyDecision, NavigationPolicyDecisionExt, URIRequestExt};
use serde_json::{self, Value};

#[derive(Deserialize)]
struct Message {
    action: String,
    data: Value,
}

pub fn get_webview() -> WebView {
    let webview = WebView::new();
    webview.load_uri("https://inbox.google.com");

    webview.connect_decide_policy(|webview, policy, decision_type| {
        if decision_type == PolicyDecisionType::NavigationAction {
            let policy = policy
                .clone()
                .downcast::<NavigationPolicyDecision>()
                .unwrap();
            policy
                .get_request()
                .and_then(|request| request.get_uri())
                .map(|url| on_navigation_to_url(webview, &url))
                .map(|should_ignore| if should_ignore {
                    policy.ignore()
                });
        }

        false
    });

    webview.connect_load_changed(|webview, event| {
        if event == LoadEvent::Finished &&
            webview.get_uri() == Some(String::from("https://inbox.google.com/"))
        {
            // TODO: Load Gmail
        }
    });

    webview
}

pub fn open_composer(webview: &WebView) {
    dom::click(webview, ".y.hC");
}

pub fn select_view(webview: &WebView, title: &str) {
    dom::click(webview, &format!("title=\"{}\"", title));
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

/// Returns true to stop navigation
fn on_navigation_to_url(webview: &WebView, url: &str) -> bool {
    if !url.starts_with("jsgtk:") {
        return false;
    }

    let message = &url[6..];

    match serde_json::from_str::<Message>(message) {
        Ok(message) => on_message(webview, &message.action, &message.data),
        Err(_) => println!("WARNING: Unable to parse JSON message: {}", message),
    }

    true
}

fn on_message(webview: &WebView, action: &str, data: &Value) {
    match action {
        "new-messages" => {
            // TODO: Fetch new messages and show notification
        }
        _ => println!("WARNING: Unrecognized JS action: {}", action),
    }
}
