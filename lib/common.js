var core = {
  "start": function () {
    core.install();
  },
  "state": function (e) {
    if (e === "active") {
      core.alarm();
    }
  },
  "alarm": function () {
    app.alarms.create(config.alarms.id, {
      "when": (new Date()).getTime() + 1000, 
      "periodInMinutes": config.weather.presets.refresh.interval
    });
  },
  "handle": {
    "error": function () {
      app.button.icon(null);
      app.button.badge(null, '!');
      app.button.title("Could not fetch data!");
    }
  },
  "forecast": {
    "query" : {
      "by": {
        "id": function (id, units, callback) {
          var url = config.weather.api.url + "forecast" + "?id=" + id + "&units=" + units + "&appid=" + config.weather.api.key;
          app.request.make(url, "GET", null, null, callback);
        }
      }
    }
  },
  "install": function () {
    var context = config.interface.context;
    var url = app.interface.path + '?' + context;
    /*  */
    core.alarm();
    app.button.popup(context === "popup" ? url : '');
    /*  */
    app.contextmenu.create({
      "type": "normal", 
      "id": "refresh-weather", 
      "title": "Refresh Weather",  
      "contexts": ["browser_action"],
      "documentUrlPatterns": ["*://*/*"]
    });
    /*  */
    app.contextmenu.create({
      "id": "tab", 
      "type": "radio", 
      "title": "Open in tab",  
      "checked": context === "tab",
      "contexts": ["browser_action"],
    });
    /*  */
    app.contextmenu.create({
      "id": "win", 
      "type": "radio", 
      "title": "Open in win",  
      "checked": context === "win",
      "contexts": ["browser_action"],
    });
    /*  */
    app.contextmenu.create({
      "id": "popup", 
      "type": "radio", 
      "title": "Open in popup",  
      "checked": context === "popup",
      "contexts": ["browser_action"],
    });
  },
  "update": {
    "badge": function (temp, type) {
      var text = type === "no-decimal-points" ? Math.round(temp) : temp.toFixed(1);
      app.button.badge(null, text.toString());
    },
    "icon": function (e) {
      app.button.icon({
        "16": "../data/interface/resources/icons/" + e + "@2x.png",
        "32": "../data/interface/resources/icons/" + e + "@2x.png",
        "48": "../data/interface/resources/icons/" + e + "@2x.png",
        "64": "../data/interface/resources/icons/" + e + "@2x.png",
      });
    },
    "weather": function () {
      var type = config.weather.presets.launch.type;
      if (type === "current") {
        core.weather.refresh.current(config.weather.presets.units, config.weather.presets.decimal.points);
      } else if (type === "default") {
        core.weather.refresh.default(config.weather.presets.units, config.weather.presets.decimal.points);
      } else {
        core.weather.refresh.favorites();
      }
    },
    "tooltip": function (temp, state, type, city) {
      var temp = type === "no-decimal-points" ? Math.round(temp) : temp.toFixed(1);
      /*  */
      var a = "Temperature: " + temp.toString() + "\n";
      var b = "Current status: " + state + "\n";
      var c = "City: " + city + "\n";
      var d = "--------------------------------------" + "\n";
      var e = "Last update: " + (new Date()).toLocaleString();
      /*  */
      app.button.title(a + b + c + d + e);
    },
    "action": {
      "contextmenu": function (e) {
        app.interface.close(config.interface.context);
        config.interface.context = e.menuItemId;
        /*  */
        var context = config.interface.context;
        var url = app.interface.path + '?' + context;
        /*  */
        core.update.weather();
        app.button.popup(context === "popup" ? url : '');
      },
      "browser": function () {
        var context = config.interface.context;
        var url = app.interface.path + '?' + context;
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
    }
  },
  "weather": {
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
        "id": function (id, units, callback) {
          var url = config.weather.api.url + "weather" + "?id=" + id + "&units=" + units + "&appid=" + config.weather.api.key;
          app.request.make(url, "GET", null, null, callback);
        },
        "coordinates": function (lat, lon, units, callback) {
          var url = config.weather.api.url + "weather" + "?lat=" + lat + "&lon=" + lon + "&units=" + units + "&appid=" + config.weather.api.key;
          app.request.make(url, "GET", null, null, callback);
        }
      }
    },
    "refresh": {
      "favorites": function () {
        if (config.weather.favorites && config.weather.favorites.length) {
          config.weather.favorites.forEach(function (p) {
            core.weather.query.by.id(p.id, config.weather.presets.units, function (result) {
              if (result) {
                var index = config.weather.favorites.findIndex(q => q.id === p.id);
                config.weather.favorites[index].obj = result;
                config.weather.favorites = config.weather.favorites;
              } else core.handle.error("weather-fetch-error");
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
                    core.update.tooltip(result.main.temp, result.weather[0].main, decimal, result.name);
                  } else core.handle.error("forecast-fetch-error");
                });
              } else core.handle.error("weather-fetch-error");
            });
          } else core.handle.error("weather-fetch-error");
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
                    core.update.tooltip(result.main.temp, result.weather[0].main, decimal, result.name);
                  } else core.handle.error("forecast-fetch-error");
                });
              } else core.handle.error("weather-fetch-error");
            });
          }
        }
      }
    }
  }
};

app.window.on.removed(function (e) {
  if (e === app.interface.id) {
    app.interface.id = '';
  }
});

app.alarms.on.alarm(function (e) {
  if (e.name = config.alarms.id) {
    core.update.weather();
  }
});

app.on.state(core.state);
app.on.startup(core.start);
app.on.connect(app.connect);
app.on.installed(core.install);
app.storage.on.changed(core.update.weather);
app.button.on.clicked(core.update.action.browser);
app.contextmenu.on.clicked(core.update.action.contextmenu);