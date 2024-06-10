var core = {
  "start": function () {
    core.install();
  },
  "state": function (e) {
    if (e === "active") {
      core.alarm.create();
    }
  },
  "handle": {
    "error": function () {
      app.button.icon(null);
      app.button.badge.text(null, '!');
      app.button.title(null, "Could not fetch data!");
    }
  },
  "alarm": {
    "create": function () {
      app.alarms.create(config.alarms.id, {
        "when": (new Date()).getTime() + 1000, 
        "periodInMinutes": config.weather.presets.refresh.interval
      });
    }
  },
  "forecast": {
    "query" : {
      "by": {
        "id": function (id, units, callback) {
          const url = config.weather.api.url + "forecast" + "?id=" + id + "&units=" + units + "&appid=" + config.weather.api.key;
          fetch(url).then(r => r.ok ? r.json() : null).then(callback);
        }
      }
    }
  },
  "update": {
    "badge": function (temp, type) {
      const text = type === "no-decimal-points" ? Math.round(temp) : temp.toFixed(1);
      app.button.badge.text(null, text.toString());
    },
    "icon": function (e) {
      app.button.icon(null, {
        "16": "../data/interface/resources/icons/" + e + "@2x.png",
        "32": "../data/interface/resources/icons/" + e + "@2x.png",
        "48": "../data/interface/resources/icons/" + e + "@2x.png",
        "64": "../data/interface/resources/icons/" + e + "@2x.png",
      });
    },
    "weather": function () {
      const type = config.weather.presets.launch.type;
      if (type === "current") {
        core.weather.refresh.current(config.weather.presets.units, config.weather.presets.decimal.points);
      } else if (type === "default") {
        core.weather.refresh.default(config.weather.presets.units, config.weather.presets.decimal.points);
      } else {
        core.weather.refresh.favorites();
      }
    },
    "tooltip": function (temp, state, type, city, units) {
      const unit = units === "Metric" ? "Celsius" : "Fahrenheit";
      temp = type === "no-decimal-points" ? Math.round(temp) : temp.toFixed(1);
      /*  */
      const a = "City: " + city + "\n";
      const b = "Temperature: " + temp.toString() + ' ' + unit + "\n";
      const c = "Current condition: " + state + "\n";
      const d = "---------------------------------------" + "\n";
      const e = "Last update: " + (new Date()).toLocaleString();
      /*  */
      app.button.title(null, a + b + c + d + e);
    }
  },
  "install": function () {
    const context = config.interface.context;
    const url = app.interface.path + '?' + context;
    /*  */
    core.alarm.create();
    app.interface.id = '';
    app.button.popup(context === "popup" ? url : '');
    /*  */
    app.contextmenu.create({
      "type": "normal", 
      "id": "refresh-weather", 
      "contexts": ["action"],
      "title": "Refresh Weather",  
      "documentUrlPatterns": ["*://*/*"]
    }, app.error);
    /*  */
    app.contextmenu.create({
      "id": "tab", 
      "type": "radio", 
      "title": "Open in tab",  
      "contexts": ["action"],
      "checked": context === "tab"
    }, app.error);
    /*  */
    app.contextmenu.create({
      "id": "win", 
      "type": "radio", 
      "title": "Open in win",  
      "contexts": ["action"],
      "checked": context === "win"
    }, app.error);
    /*  */
    app.contextmenu.create({
      "id": "popup", 
      "type": "radio", 
      "title": "Open in popup",  
      "contexts": ["action"],
      "checked": context === "popup"
    }, app.error);
  },
  "action": {
    "storage": function (changes, namespace) {
      core.update.weather();
    },
    "removed": function (e) {
      if (e === app.interface.id) {
        app.interface.id = '';
      }
    },
    "alarm": function (e) {
      if (e.name = config.alarms.id) {
        core.update.weather();
      }
    },
    "contextmenu": function (e) {
      app.interface.close(config.interface.context);
      config.interface.context = e.menuItemId;
      /*  */
      const context = config.interface.context;
      const url = app.interface.path + '?' + context;
      /*  */
      core.update.weather();
      app.button.popup(context === "popup" ? url : '');
    },
    "browser": function () {
      const context = config.interface.context;
      const url = app.interface.path + '?' + context;
      /*  */
      if (context === "popup") app.button.popup(url);
      else {
        if (app.interface.id) {
          if (context === "tab") {
            app.tab.get(app.interface.id, function (tab) {
              if (tab) {
                app.tab.update(app.interface.id, {"active": true});
              } else app.tab.open(url);
            });
          }
          /*  */
          if (context === "win") {
            app.window.get(app.interface.id, function (win) {
              if (win) {
                app.window.update(app.interface.id, {"focused": true});
              } else app.interface.create(url);
            });
          }
        } else {
          if (context === "tab") app.tab.open(url);
          if (context === "win") app.interface.create(url);
        }
      }
    }
  },
  "weather": {
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
        "id": function (id, units, callback) {
          const url = config.weather.api.url + "weather" + "?id=" + id + "&units=" + units + "&appid=" + config.weather.api.key;
          fetch(url).then(r => r.ok ? r.json() : null).then(callback);
        },
        "coordinates": function (lat, lon, units, callback) {
          const url = config.weather.api.url + "weather" + "?lat=" + lat + "&lon=" + lon + "&units=" + units + "&appid=" + config.weather.api.key;
          fetch(url).then(r => r.ok ? r.json() : null).then(callback);
        }
      }
    },
    "refresh": {
      "favorites": function () {
        if (config.weather.favorites && config.weather.favorites.length) {
          config.weather.favorites.forEach(function (p) {
            core.weather.query.by.id(p.id, config.weather.presets.units, function (result) {
              if (result) {
                const index = config.weather.favorites.findIndex(q => q.id === p.id);
                config.weather.favorites[index].obj = result;
                config.weather.favorites = config.weather.favorites;
              } else {
                core.handle.error("weather-fetch-error");
              }
            });
          });
        }
      },
      "current": function (units, decimal = "no-decimal-points") {
        core.weather.query.info(function (info) {
          if (info) {
            core.weather.query.by.coordinates(info.lat, info.lon, units, function (result) {
              if (result) {
                core.forecast.query.by.id(result.id, units, function (forecast) {
                  if (forecast) {
                    config.weather.current = {"result": result, "forecast": forecast};
                    /*  */
                    core.update.icon(result.weather[0].icon);
                    core.update.badge(result.main.temp, decimal);
                    core.update.tooltip(result.main.temp, result.weather[0].main, decimal, result.name, units);
                  } else {
                    core.handle.error("forecast-fetch-error");
                  }
                });
              } else {
                core.handle.error("weather-fetch-error");
              }
            });
          } else {
            core.handle.error("weather-fetch-error");
          }
        });
      },
      "default": function (units, decimal = "no-decimal-points") {
        if (config.weather.default) {
          if ("result" in config.weather.default) {
            core.weather.query.by.id(config.weather.default.result.id, units, function (result) {
              if (result) {
                core.forecast.query.by.id(result.id, units, function (forecast) {
                  if (forecast) {
                    config.weather.default = {"result": result, "forecast": forecast};
                    /*  */
                    core.update.icon(result.weather[0].icon);
                    core.update.badge(result.main.temp, decimal);
                    core.update.tooltip(result.main.temp, result.weather[0].main, decimal, result.name, units);
                  } else {
                    core.handle.error("forecast-fetch-error");
                  }
                });
              } else {
                core.handle.error("weather-fetch-error");
              }
            });
          }
        }
      }
    }
  }
};

app.alarms.on.alarm(core.action.alarm);
app.button.on.clicked(core.action.browser);
app.window.on.removed(core.action.removed);
app.contextmenu.on.clicked(core.action.contextmenu);

app.on.state(core.state);
app.on.startup(core.start);
app.on.connect(app.connect);
app.on.installed(core.install);
app.on.storage(core.action.storage);
