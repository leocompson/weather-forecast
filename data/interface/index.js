var config  = {
  "format": function (e) {
    return e.split('').reverse().join('');
  },
  "api": {
    "key": '',
    "url": "https://api.openweathermap.org/data/2.5/"
  },
  "last": {
    "loaded": {
      "city": null
    }
  },
  "is": {
    "from": {
      "favorite": false
    }
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "alarms": {
    "id": "weather-forecast-alarm",
    "create": function () {
      if (chrome.alarms) {
        chrome.alarms.create(config.alarms.id, {
          "when": new Date().getTime(), 
          "periodInMinutes": config.presets.refresh.interval
        });
      }
    }
  },
  "presets": {
    "units": '',
    "launch": {"type": ''},
    "theme": {"color": ''},
    "decimal": {"points": ''},
    "refresh": {"interval": 0},
    "store": function () {
      config.storage.write("weather.units", config.presets.units);
      config.storage.write("weather.theme.color", config.presets.theme.color);
      config.storage.write("weather.launch.type", config.presets.launch.type);
      config.storage.write("weather.decimal.points", config.presets.decimal.points);
      config.storage.write("weather.refresh.interval", config.presets.refresh.interval);
    }
  },
  "forecast": {
    "data": null,
    "active": null,
    "methods": {
      "query": {
        "by": {
          "id": function (id, degree, callback) {
            const url = config.api.url + "forecast?id=" + id + "&units=" + degree + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          }
        } 
      }
    }
  },
  "location": {
    "current": null,
    "store": function (e) {
      if (e) {
        const tmp = config.location.current ? config.location.current : {};
        /*  */
        if (e.city) tmp.city = e.city;
        if (e.latitude) tmp.lat = e.latitude;
        if (e.longitude) tmp.lon = e.longitude;
        /*  */
        config.storage.write("location.current", tmp);
        config.methods.initialize.settings.current();
      }
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            if (document.location.search === "?popup") config.port.name = "popup";
            /*  */
            if (config.port.name === "popup") {
              document.body.style.width = "790px";
              document.body.style.height = "580px";
            }
            /*  */
            chrome.runtime.connect({"name": config.port.name});
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "on": {
      "changed": function (callback) {
        if (chrome.storage.onChanged) {
          chrome.storage.onChanged.addListener(callback); 
        }
      }
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        if (callback) callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "weather": {
    "current": null,
    "default": null,
    "favorites": null,
    "methods": {
      "query": {
        "info": function (callback) {
          const cond_1 = config.location.current && config.location.current.lat;
          const cond_2 = config.location.current && config.location.current.lon;
          /*  */
          if (cond_1 && cond_2) {
            callback(config.location.current);
          } else {
            callback({"lat": 51.50853, "lon": -0.12574});
          }
        },
        "by": {
          "id": function (id, degree, callback) {
            const url = config.api.url + "weather?id=" + id + "&units=" + degree + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          },
          "key": function (query, degree, callback) {
            const url = config.api.url + "weather?q=" + query + "&units=" + degree + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          },
          "name": function (name, degree, callback) {
            const url = config.api.url + "find?q=" + name + "&units=" + degree + "&type=like" + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          },
          "coordinates": function (lat, lon, degree, callback) {
            const url = config.api.url + "weather?lat=" + lat + "&lon=" + lon + "&units=" + degree + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          }
        }
      }
    }
  },
  "load": function () {
    const reload = document.getElementById("reload");
    const apikey = document.getElementById("api-key");
    const txt = document.getElementById("txt-search");
    const support = document.getElementById("support");
    const form = document.getElementById("form-search");
    const theme = document.getElementById("theme-color");
    const donation = document.getElementById("donation");
    const temp = document.getElementById("settings-temp");
    const badge = document.getElementById("settings-badge");
    const launch = document.getElementById("settings-launch");
    const update = document.getElementById("update-current-location");
    /*  */
    reload.addEventListener("click", function () {
      document.location.reload();
    }, false);
    /*  */
    support.addEventListener("click", function () {
      const url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      const url = config.addon.homepage() + "?reason=support";
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
    document.addEventListener("click", config.listeners.document);
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
    config.storage.on.changed(function () {config.storage.load()});
  },
  "app": {
    "start": function () {
      const root = document.querySelector(":root");
      const apikey = config.storage.read("weather.api.key");
      config.api.url = "https://api.openweathermap.org/data/2.5/";
      /*  */
      config.api.key = apikey !== undefined ? apikey : config.format("63df2792a1e35a13415625bac825a318");
      config.weather.current = config.storage.read("weather.current") !== undefined ? config.storage.read("weather.current") : {};
      config.weather.default = config.storage.read("weather.default") !== undefined ? config.storage.read("weather.default") : {};
      config.presets.units = config.storage.read("weather.units") !== undefined ? config.storage.read("weather.units") : "Imperial";
      config.location.current = config.storage.read("location.current") !== undefined ? config.storage.read("location.current") : {};
      config.weather.favorites = config.storage.read("weather.favorites") !== undefined ? config.storage.read("weather.favorites") : [];
      config.presets.launch.type = config.storage.read("weather.launch.type") !== undefined ? config.storage.read("weather.launch.type") : "current";
      config.presets.theme.color = config.storage.read("weather.theme.color") !== undefined ? config.storage.read("weather.theme.color") : "#3b3b3b";
      config.presets.refresh.interval = config.storage.read("weather.refresh.interval") !== undefined ? config.storage.read("weather.refresh.interval") : 15;
      config.presets.decimal.points = config.storage.read("weather.decimal.points") !== undefined ? config.storage.read("weather.decimal.points") : "no-decimal-points";
      /*  */
      const action = document.querySelector(".navigation-item[data-page='homepage']");
      const active = document.querySelector(".settings-refresh-interval-active");
      if (active) active.classList.remove("settings-refresh-interval-active");
      /*  */
      document.getElementById("search-button").value = "GO";
      root.style.setProperty("--theme", config.presets.theme.color);
      document.getElementById("theme-color").value = config.presets.theme.color;
      document.querySelector('input[value ="' + config.presets.units + '"]').checked = true;
      document.querySelector('input[value ="' + config.presets.launch.type + '"]').checked = true;
      document.getElementById("api-key").value = apikey !== undefined ? apikey : "default api key";
      document.querySelector('input[value ="' + config.presets.decimal.points + '"]').checked = true;
      document.querySelector('[data-min="' + config.presets.refresh.interval + '"]').classList.add("settings-refresh-interval-active");
      /*  */
      config.methods.initialize.settings.default();
      config.methods.initialize.settings.current();
      if (action) {
        window.setTimeout(function () {
          action.click();
          /*  */
          if (apikey === undefined) {
            config.handle.error("new-api-key", "API Key");
          }
        }, 300);
      }
    }
  },
  "handle": {
    "data": {
      "days": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      "format": {
        "date": function (e) {
          const date = new Date(e);
          const month = date.getDate();
          const day = config.handle.data.days[date.getDay()];
          /*  */
          return day + ' ' + month;
        }
      } 
    },
    "error": function (id, title) {
      const loader = document.getElementById("loader");
      const dialog = document.getElementById("dialog");
      const areaname = document.getElementById("dialog-areaname");
      const description = document.getElementById("dialog-description");
      /*  */
      if (id === "new-api-key") {
        description.textContent = "Before using the app, please obtain a new free API key from the openweathermap.org website. Then, add it to the settings tab, bottom section. To get help, please read the third FAQ here: https://openweathermap.org/faq";
      }
      /*  */
      if (id === "no-geolocation") {
        description.textContent = "The Geolocation API failed!";
      }
      /*  */
      if (id === "no-results-found") {
        description.textContent = "No results found!";
      }
      /*  */
      if (id === "weather-fetch-error") {
        description.textContent = "Could not fetch the weather data! Please try again later and if the error persists, consider changing the API key via the settings page.";
      }
      /*  */
      if (id === "forecast-fetch-error") {
        description.textContent = "Could not fetch the forecast data! Please try again later and if the error persists, consider changing the API key via the settings page.";
      }
      /*  */
      areaname.textContent = title ? title : "Error";
      window.setTimeout(function () {
        dialog.style.display = "flex";
        loader.style.display = "none";
      }, 300);
    }
  },
  "request": {
    "make": function (url, method, type, timeout, callback) {
      if (url) {
        try {
          const request = new XMLHttpRequest();
          /*  */
          request.onerror = function () {
            callback(null);
          };
          /*  */
          request.onload = function (e) {
            if (e && e.target) {
              if (e.target.status) {
                if (e.target.status >= 200 && e.target.status < 300 || e.target.status === 304) {
                  if (e.target.responseType) {
                    if (e.target.response) {
                      callback(e.target.response);
                    } else {
                      callback(null);
                    }
                  } else {
                    if (e.target.responseText) {
                      const response = JSON.parse(e.target.responseText);
                      callback(response);
                    } else {
                      callback(null);
                    }
                  }
                } else {
                  callback(null);
                }
              } else {
                callback(null);
              }
            } else {
              callback(null);
            }
          };
          /*  */
          request.open(method, url);
          /*  */
          if (type) request.responseType = type;
          if (timeout) request.timeout = timeout;
          /*  */
          request.send();
        } catch (e) {
          callback(null);
        }
      } else {
        callback(null);
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
