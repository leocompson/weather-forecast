var load = function () {
  var reload = document.getElementById("reload");
  var apikey = document.getElementById("api-key");
  var txt = document.getElementById("txt-search");
  var support = document.getElementById("support");
  var form = document.getElementById("form-search");
  var theme = document.getElementById("theme-color");
  var donation = document.getElementById("donation");
  var temp = document.getElementById("settings-temp");
  var badge = document.getElementById("settings-badge");
  var launch = document.getElementById("settings-launch");
  var update = document.getElementById("update-current-location");
  /*  */
  reload.addEventListener("click", function () {
    document.location.reload();
  }, false);
  /*  */
  support.addEventListener("click", function () {
    var url = config.addon.homepage();
    chrome.tabs.create({"url": url, "active": true});
  }, false);
  /*  */
  donation.addEventListener("click", function () {
    var url = config.addon.homepage() + "?reason=support";
    chrome.tabs.create({"url": url, "active": true});
  }, false);
  /*  */
  txt.addEventListener("input", config.listeners.input);
  theme.addEventListener("input", config.listeners.input);
  form.addEventListener("submit", config.listeners.submit);
  temp.addEventListener("change", config.listeners.change);
  update.addEventListener("click", config.listeners.update);
  badge.addEventListener("change", config.listeners.change);
  apikey.addEventListener("change", config.listeners.change);
  launch.addEventListener("change", config.listeners.change);
  /*  */
  config.storage.load(config.app.start);
  window.removeEventListener("load", load, false);
  config.storage.on.changed(function () {config.storage.load()});
};

config.port.connect();

window.addEventListener("load", load, false);
document.addEventListener("click", config.listeners.document);
window.addEventListener("resize", config.resize.method, false);





