use webkit2gtk::*;
use webview::connect_event_received;
use serde_json;

#[derive(Deserialize)]
struct NewMessages {
    unread: u32,
    #[serde(rename = "newMessages")]
    new_messages: Vec<Message>,
}

#[derive(Deserialize)]
struct Message {
    id: String,
    subject: String,
    summary: String,
    #[serde(rename = "senderName")]
    sender_name: String,
    #[serde(rename = "senderEmail")]
    sender_email: String,
}

pub fn create_webview(settings: &Settings, user_content: &UserContentManager) -> WebView {
    let webview = WebView::new_with_user_content_manager(user_content);
    webview.set_settings(settings);
    webview.load_uri("https://mail.google.com/mail/u/0/?ibxr=0");

    webview.connect_load_changed(|webview, event| if event == LoadEvent::Finished &&
        webview.get_uri().unwrap().starts_with(
            "https://mail.google.com/mail/u/",
        )
    {
        get_new_messages(&webview);
    });

    connect_event_received(&webview, |_, action, data| {
        match action {
            "new-messages" => {
                match serde_json::from_value::<NewMessages>(data.unwrap()) {
                    Ok(data) => on_new_messages(data.unread, data.new_messages),
                    Err(error) => println!("Unable to parse new messages: {}", error),
                }
            }
            _ => println!("WARNING: Unrecognized JS action: {}", action),
        }
    });

    webview
}

pub fn get_new_messages(webview: &WebView) {
    webview.run_javascript_with_callback("getNewMessages()", |result| match result {
        Ok(_) => {}
        Err(error) => println!("WARNING: {}", error),
    });
}

fn on_new_messages(count: u32, new_messages: Vec<Message>) {
    let summary = match new_messages.len() {
        1 => new_messages[0].subject.clone(),
        n => format!("{} new messages", n)
    };
}
