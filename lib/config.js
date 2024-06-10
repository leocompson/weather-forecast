var config = {};

config.alarms = {
  "id": "weather-forecast-alarm"
};

config.format = function (e) {
  return e.split('').reverse().join('');
};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.location = {
  set current (val) {app.storage.write("location.current", val)},
  get current () {return app.storage.read("location.current") !== undefined ? app.storage.read("location.current") : {}}
};

config.interface = {
  set size (val) {app.storage.write("interface.size", val)},
  set context (val) {app.storage.write("interface.context", val)},
  get size () {return app.storage.read("interface.size") !== undefined ? app.storage.read("interface.size") : config.interface.default.size},
  get context () {return app.storage.read("interface.context") !== undefined ? app.storage.read("interface.context") : config.interface.default.context},
  "default": {
    "context": "popup",
    "size": {
      "width": 1080, 
      "height": 700
    }
  }
};

config.weather = {
  set current (val) {app.storage.write("weather.current", val)},
  set default (val) {app.storage.write("weather.default", val)},
  set favorites (val) {app.storage.write("weather.favorites", val)},
  get current () {return app.storage.read("weather.current") !== undefined ? app.storage.read("weather.current") : {}},
  get default () {return app.storage.read("weather.default") !== undefined ? app.storage.read("weather.default") : {}},
  get favorites () {return app.storage.read("weather.favorites") !== undefined ? app.storage.read("weather.favorites") : []},
  "api": {
    "url": "https://api.openweathermap.org/data/2.5/",
    set key (val) {app.storage.write("weather.api.key", val)},
    get key () {return app.storage.read("weather.api.key") !== undefined ? app.storage.read("weather.api.key") : config.format("63df2792a1e35a13415625bac825a318")},
  },
  "presets": {
    set units (val) {app.storage.write("weather.units", val)},
    get units () {return app.storage.read("weather.units") !== undefined ? app.storage.read("weather.units") : "Imperial"},
    "refresh": {
      set interval (val) {app.storage.write("weather.refresh.interval", val)},
      get interval () {return app.storage.read("weather.refresh.interval") !== undefined ? app.storage.read("weather.refresh.interval") : 15}
    },
    "launch": {
      set type (val) {app.storage.write("weather.launch.type", val)},
      get type () {return app.storage.read("weather.launch.type") !== undefined ? app.storage.read("weather.launch.type") : "current"}
    },
    "decimal": {
      set points (val) {app.storage.write("weather.decimal.points", val)},
      get points () {return app.storage.read("weather.decimal.points") !== undefined ? app.storage.read("weather.decimal.points") : "no-decimal-points"}
    }
  }
};
