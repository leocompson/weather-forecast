config.listeners = {
  "update": function () {
    var loader = document.getElementById("loader");
    /*  */
    if (navigator.geolocation) {
      loader.style.display = "flex";
      navigator.geolocation.getCurrentPosition(function (e) {
        if (e && e.coords) {
          config.location.store(e.coords);
          /*  */
          window.setTimeout(function () {
            loader.style.display = "none";
            if (config.presets.launch.type === "current") {
              config.methods.refresh.current();
            }
          }, 300);
        } else {
          config.handle.error("no-geolocation");
        }
      }, function () {
        config.handle.error("no-geolocation");
      });
    }
  },
  "submit": function (e) {
    e.preventDefault();
    /*  */
    var form = document.getElementById("form-search");
    var txt = document.getElementById("txt-search");
    var index = txt.value.indexOf("Station");
    /*  */
    if (index !== -1) {
      var name = txt.value.substring(index);
      var station = document.querySelector('[data-station="' + name + '"]');
      if (station) {
        config.methods.search.by.id(parseInt(station.dataset.id));
        form.reset();
      } else {
        config.handle.error("no-results-found");
      }
    } else {
      config.weather.methods.query.by.name(txt.value, config.presets.units, function (suggested) {
        if (suggested && suggested.list && suggested.list.length) {
          config.methods.search.by.id(suggested.list[0].id);
          form.reset();
        } else {
          config.handle.error("no-results-found");
        }
      });
    }
  },
  "change": function (e) {
    var parent = e.target.closest("div");
    var loader = document.getElementById("loader");
    var target = parent && parent.id ? parent : e.target;
    /*  */
    if (target.id === "settings-badge") {
      config.presets.decimal.points = e.target.value;
      config.presets.store();
    }
    /*  */
    if (target.id === "settings-launch") {
      config.presets.launch.type = e.target.value;
      config.presets.store();
    }
    /*  */
    if (target.id === "api-key") {
      if (e.target.value) {
        config.api.key = e.target.value;
        config.storage.write("weather.api.key", config.api.key);
      }
    }
    /*  */
    if (target.id === "settings-temp") {
      config.presets.units = e.target.value;
      loader.style.display = "flex";
      config.presets.store();
      /*  */
      if (config.presets.launch.type === "current") {
        config.methods.refresh.current();
        if (config.weather.default && config.weather.default.result) {
          config.methods.refresh.default(0);
        }
      } else if (config.presets.launch.type === "default") {
        if (config.weather.default && config.weather.default.result) {
          config.methods.refresh.default(1);
        }
      }
      /*  */
      config.methods.refresh.favorites();
    }
  },
  "input": function (e) {
    var target = e.target;
    /*  */
    if (target.id === "theme-color") {
      var root = document.querySelector(":root");
      var theme = document.getElementById("theme-color");
      /*  */
      config.presets.theme.color = theme.value;
      root.style.setProperty("--theme", config.presets.theme.color);
      config.storage.write("weather.theme.color", config.presets.theme.color);
      config.presets.store();
    }
    /*  */
    if (target.id === "txt-search") {
      config.weather.methods.query.by.name(target.value, config.presets.units, function (suggested) {
        if (suggested) {
          var counter = 0;
          var cities = null;
          var countries = null;
          var select = document.getElementById("suggested-data-list");
          /*  */
          if (suggested.list.length > 0) {
            cities = suggested.list.map(p => p.name);
            countries = suggested.list.map(p => p.sys.country);
          }
          /*  */
          select.textContent = '';
          for (var i = 0; i < suggested.list.length; i++) {
            var option = document.createElement("option");
            var cond_1 = cities.filter(p => p === suggested.list[i].name).length > 1;
            var cond_2 = countries.filter(p => p === suggested.list[i].sys.country).length > 1;
            /*  */
            if (cond_1 && cond_2) {
              counter++;
              option.dataset.id = suggested.list[i].id;
              option.dataset.station = "Station " + counter;
              option.setAttribute("value", suggested.list[i].name + ", " + suggested.list[i].sys.country + " - Station " + counter);
            } else {
              option.setAttribute("value", suggested.list[i].name + ", " + suggested.list[i].sys.country);
            }
            /*  */
            if (navigator.userAgent.indexOf("Firefox") === -1) {
              if (config.presets.units === "Imperial") {
                option.textContent = Math.round(suggested.list[i].main.temp, 0) + '°F';
              } else {
                option.textContent = Math.round(suggested.list[i].main.temp, 0) + '°C';
              }
            }
            /*  */
            select.appendChild(option);
          }
        }
      });
    }
  },
  "document": function (e) {
    e.stopPropagation();
    /*  */
    var loader = document.getElementById("loader");
    var dialog = document.getElementById("dialog");
    var favorite = document.querySelector(".favorite-button");
    var areaname = document.getElementById("dialog-areaname");
    var homepage = document.getElementsByClassName("homepage")[0];
    var description = document.getElementById("dialog-description");
    /*  */
    var parent = e.target.closest(".favorite-item");
    var target = parent ? parent : e.target;
    /*  */
    if (target.id === "close-dialog-button") {
      dialog.style.display = "none";
    }
    /*  */
    if (target.classList.contains("refresh-button")) {
      config.methods.refresh.weather();
    }
    /*  */
    if (target.classList.contains("settings-refresh-interval")) {
      var min = target.dataset.min;
      config.presets.refresh.interval = parseFloat(min);
      /*  */
      var active = document.querySelector(".settings-refresh-interval-active");
      if (active) active.classList.remove("settings-refresh-interval-active");
      target.classList.add("settings-refresh-interval-active");
      /*  */
      config.alarms.create();
      config.presets.store();
    }
    /*  */
    if (target.classList.contains("forecast-item")) {
      if (config.forecast.active) {
        homepage.classList.remove("expand");
        config.forecast.active.classList.remove("forecast-item-active");
      }
      /*  */
      homepage.classList.add("expand");
      config.forecast.active = target;
      config.forecast.active.classList.add("forecast-item-active");
      config.interface.create.hourly(config.forecast.active.dataset.date, config.forecast.data, homepage);
    }
    /*  */
    if (target.classList.contains("favorite-button")) {
      homepage.classList.remove("expand");
      /*  */
      var infavorites = config.weather.favorites.some(p => p.id === config.last.loaded.city.id);
      if (infavorites) {
        favorite.classList.remove("favorite-button-active");
        /*  */
        config.weather.favorites = config.weather.favorites.filter(p => p.id !== config.last.loaded.city.id);
        config.storage.write("weather.favorites", config.weather.favorites);
      } else {
        dialog.style.display = "flex";
        favorite.classList.add("favorite-button-active");
        description.textContent = "Is added to favorites";
        areaname.textContent = config.last.loaded.city.name;
        /*  */
        config.weather.favorites.push({"obj": config.last.loaded.city, "id": config.last.loaded.city.id});
        config.storage.write("weather.favorites", config.weather.favorites);
      }
    }
    /*  */
    if (target.classList.contains("favorite-item")) {
      var id = target.dataset.cityId;
      var action = document.querySelector(".navigation-item[data-page='homepage']");
      /*  */
      homepage.classList.remove("expand");
      /*  */
      config.weather.methods.query.by.id(parseInt(id), config.presets.units, function (result) {
        if (result) {
          loader.style.display = "flex";
          config.last.loaded.city = result;
          config.forecast.methods.query.by.id(config.last.loaded.city.id, config.presets.units, function (forecast) {
            if (forecast) {
              config.forecast.data = forecast;
              config.interface.create.summary(config.last.loaded.city, config.presets.units, homepage);
              config.interface.create.daily(config.forecast.data, homepage);
              /*  */
              config.is.from.favorite = true;
              if (action) action.click();
              config.is.from.favorite = false;
            } else config.handle.error("forecast-fetch-error");
          });
        } else {
          config.handle.error("weather-fetch-error");
        }
      });
    }
    /*  */
    if (target.classList.contains("default-button")) {
      homepage.classList.remove("expand");
      /*  */
      if (target.classList.contains("default-button-active")) {
        config.weather.default = {};
        config.presets.launch.type = "current";
        /*  */
        target.classList.remove("default-button-active");
        document.querySelector('input[value="current"]').checked = true;
        /*  */
        config.storage.write("weather.default", config.weather.default);
        config.methods.initialize.settings.default();
        config.presets.store();
      } else {
        config.weather.default = {"result": config.last.loaded.city, "forecast": config.forecast.data};
        config.presets.launch.type = "default";
        /*  */
        dialog.style.display = "flex";
        target.classList.add("default-button-active");
        areaname.textContent = config.last.loaded.city.name;
        description.textContent = "Is selected as the default city";
        document.querySelector('input[value="default"]').checked = true;
        /*  */
        config.storage.write("weather.default", config.weather.default);
        config.methods.initialize.settings.default();
        config.presets.store();
      }
    }
    /*  */
    if (target.classList.contains("navigation-item")) {
      var page = target.dataset.page;
      var item = page ? document.getElementById(page) : null;
      var navigation = document.querySelector(".navigation-item-active");
      /*  */
      var pages = [...document.querySelectorAll('[class*="-pageshow"]')];
      if (pages && pages.length) {
        pages.forEach(function (element) {
          if (element.classList) {
            var key = element.id ? element.id + "-pageshow" : '';
            if (key) element.classList.remove(key);
          }
        });
      }
      /*  */
      if (navigation) navigation.classList.remove("navigation-item-active");
      if (page) target.classList.add("navigation-item-active");
      /*  */
      if (item) {
        item.classList.add(page + "-pageshow");
      } else homepage.classList.add("homepage-pageshow");
      /*  */
      if (page === "favorites-page") {
        config.methods.initialize.favorites();
      }
      /*  */
      homepage.classList.remove("expand");
      /*  */
      if (page === "homepage") {
        config.methods.initialize.services(function () { 
          if (config.weather.default) {
            if (config.weather.default.result) {
              var a = config.last.loaded.city;
              var b = config.weather.default.result;
              var button = document.getElementById("set-as-default");
              /*  */
              if (a && b && a.id === b.id) {
                button.classList.add("default-button-active");
              } else {
                button.classList.remove("default-button-active");
              } 
            }
          }
        });
      }
    }
  }
};