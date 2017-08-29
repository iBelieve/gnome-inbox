use itertools::join;
use webkit2gtk::{WebView, WebViewExtManual};

pub fn click(webview: &WebView, selector: &str) {
    exec(webview, "click", &[selector]);
}

pub fn trigger_action(webview: &WebView, action: &str) {
    click(webview, &format!("[jsaction=\"{}\"]", action));
}

pub fn set_value(webview: &WebView, selector: &str, value: &str) {
    exec(webview, "setValue", &[selector, value]);
}

// pub fn get_value(webview: &WebView, selector: &str) {
//     exec(webview, "getValue", selector);
// }

fn exec(webview: &WebView, method: &str, params: &[&str]) {
    let params = join(params.iter().map(|param| format!("'{}'", param)), ", ");
    let code = format!("domHelper.{}({})", method, params);

    webview.run_javascript_with_callback(&code, |result| match result {
        Ok(_) => {}
        Err(error) => println!("WARNING: {}", error),
    });
}
