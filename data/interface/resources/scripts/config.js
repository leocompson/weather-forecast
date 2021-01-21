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
            var url = config.api.url + "forecast?id=" + id + "&units=" + degree + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          }
        } 
      }
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (document.location.search !== "?tab" && document.location.search !== "?popup") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(function () {
          config.storage.write("size", {
            "width": window.innerWidth || window.outerWidth,
            "height": window.innerHeight || window.outerHeight
          });
        }, 1000); 
      }
    }
  },
  "location": {
    "current": null,
    "store": function (e) {
      if (e) {
        var tmp = config.location.current ? config.location.current : {};
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
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      var context = document.documentElement.getAttribute("context");
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
  "app": {
    "start": function () {
      var root = document.querySelector(":root");
      var apikey = config.storage.read("weather.api.key");
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
      var active = document.querySelector(".settings-refresh-interval-active");
      if (active) active.classList.remove("settings-refresh-interval-active");
      var action = document.querySelector(".navigation-item[data-page='homepage']");
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
  "weather": {
    "current": null,
    "default": null,
    "favorites": null,
    "methods": {
      "query": {
        "info": function (callback) {
          var cond_1 = config.location.current && config.location.current.lat;
          var cond_2 = config.location.current && config.location.current.lon;
          /*  */
          if (cond_1 && cond_2) {
            callback(config.location.current);
          } else {
            callback({"lat": 51.50853, "lon": -0.12574});
          }
        },
        "by": {
          "id": function (id, degree, callback) {
            var url = config.api.url + "weather?id=" + id + "&units=" + degree + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          },
          "key": function (query, degree, callback) {
            var url = config.api.url + "weather?q=" + query + "&units=" + degree + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          },
          "name": function (name, degree, callback) {
            var url = config.api.url + "find?q=" + name + "&units=" + degree + "&type=like" + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          },
          "coordinates": function (lat, lon, degree, callback) {
            var url = config.api.url + "weather?lat=" + lat + "&lon=" + lon + "&units=" + degree + "&appid=" + config.api.key;
            config.request.make(url, "GET", null, null, callback);
          }
        }
      }
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
          var tmp = {};
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
  "handle": {
    "data": {
      "days": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      "format": {
        "date": function (e) {
          var date = new Date(e);
          var month = date.getDate();
          var day = config.handle.data.days[date.getDay()];
          /*  */
          return day + ' ' + month;
        }
      } 
    },
    "error": function (id, title) {
      var loader = document.getElementById("loader");
      var dialog = document.getElementById("dialog");
      var areaname = document.getElementById("dialog-areaname");
      var description = document.getElementById("dialog-description");
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
          var request = new XMLHttpRequest();
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
                      var response = JSON.parse(e.target.responseText);
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