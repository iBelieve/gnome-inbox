use gtk::Cast;
use webkit2gtk::*;
use serde_json::{self, Value};
use percent_encoding::percent_decode;

#[derive(Deserialize)]
struct Event {
    action: String,
    data: Option<Value>,
}

pub fn connect_event_received<F>(webview: &WebView, on_event: F)
where
    F: Fn(&WebView, &str, Option<Value>) + 'static,
{
    webview.connect_decide_policy(move |webview, policy, decision_type| {
        if decision_type != PolicyDecisionType::NavigationAction {
            return false;
        }

        let policy = policy
            .clone()
            .downcast::<NavigationPolicyDecision>()
            .expect("Unable to cast policy");
        let url = policy.get_request().unwrap().get_uri().unwrap();

        if !url.starts_with("jsgtk:") {
            return false;
        }

        let event = percent_decode(url[6..].as_bytes()).decode_utf8().unwrap();

        match serde_json::from_str::<Event>(&event) {
            Ok(event) => on_event(webview, &event.action, event.data),
            Err(_) => println!("WARNING: Unable to parse JSON event: {}", event),
        }

        policy.ignore();

        false
    });
}
