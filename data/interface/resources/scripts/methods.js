config.methods = {
  "load": {
    "current": function () {
      const loader = document.getElementById("loader");
      const homepage = document.getElementsByClassName("homepage")[0];
      const action = document.querySelector(".navigation-item[data-page='homepage']");
      /*  */
      config.interface.create.summary(config.last.loaded.city, config.presets.units, homepage);
      config.interface.create.daily(config.forecast.data, homepage);
      loader.style.display = "none";
      /*  */
      if (action) action.click();
    },
    "default": function () {
      const loader = document.getElementById("loader");
      const homepage = document.getElementsByClassName("homepage")[0];
      const action = document.querySelector(".navigation-item[data-page='homepage']");
      /*  */
      loader.style.display = "none";
      config.forecast.data = config.weather.default.forecast;
      config.last.loaded.city = config.weather.default.result;
      config.interface.create.summary(config.last.loaded.city, config.presets.units, homepage);
      config.interface.create.daily(config.forecast.data, homepage);
      /*  */
      if (action) action.click();
    }
  },
  "search": {
    "by": {
      "id": function (id) {
        const loader = document.getElementById("loader");
        const homepage = document.getElementsByClassName("homepage")[0];
        /*  */
        homepage.textContent = '';
        loader.style.display = "flex";
        /*  */
        config.weather.methods.query.by.id(id, config.presets.units, function (result) {
          if (result) {
            loader.style.display = "none";
            config.last.loaded.city = result;
            config.forecast.methods.query.by.id(result.id, config.presets.units, function (forecast) {
              if (forecast) {
                config.forecast.data = forecast;
                config.interface.create.summary(config.last.loaded.city, config.presets.units, homepage);
                config.interface.create.daily(config.forecast.data, homepage);
                /*  */
                config.methods.initialize.buttons.default();
                config.methods.initialize.buttons.favorite();
              } else config.handle.error("forecast-fetch-error");
            });
          } else config.handle.error("weather-fetch-error");
        });
      }
    }
  },
  "refresh": {
    "default": function (loc) {      
      const loader = document.getElementById("loader");
      const homepage = document.getElementsByClassName("homepage")[0];
      /*  */
      homepage.classList.remove("expand");
      config.weather.methods.query.by.id(config.weather.default.result.id, config.presets.units, function (result) {
        if (result) {
          config.last.loaded.city = result;
          /*  */
          config.forecast.methods.query.by.id(config.last.loaded.city.id, config.presets.units, function (forecast) {
            if (forecast) {
              loader.style.display = "none";
              config.forecast.data = forecast;
              config.weather.default = {
                "forecast": config.forecast.data,
                "result": config.last.loaded.city
              };
              /*  */
              config.storage.write("weather.default", config.weather.default);
            } else config.handle.error("forecast-fetch-error");
          });
        } else config.handle.error("weather-fetch-error");
      });
    },
    "current": function () {
      const loader = document.getElementById("loader");
      const homepage = document.getElementsByClassName("homepage")[0];
      /*  */
      homepage.classList.remove("expand");
      config.weather.methods.query.info(function (info) {
        if (info) {
          config.weather.methods.query.by.coordinates(info.lat, info.lon, config.presets.units, function (result) {
            if (result) {
              config.last.loaded.city = result;
              config.location.store({"city": config.last.loaded.city.name + ", " + config.last.loaded.city.sys.country});
              config.forecast.methods.query.by.id(config.last.loaded.city.id, config.presets.units, function (forecast) {
                if (forecast) {
                  loader.style.display = "none";
                  config.forecast.data = forecast;
                  config.weather.current = {
                    "forecast": config.forecast.data,
                    "result": config.last.loaded.city
                  };
                  /*  */
                  config.storage.write("weather.current", config.weather.current);
                } else config.handle.error("forecast-fetch-error");
              });
            } else config.handle.error("weather-fetch-error");
          });
        } else config.handle.error("weather-fetch-error");
      });
    },
    "weather": function () {
      const loader = document.getElementById("loader");
      const homepage = document.getElementsByClassName("homepage")[0];
      const action = document.querySelector(".navigation-item[data-page='homepage']");
      /*  */
      homepage.textContent = '';
      loader.style.display = "flex";
      homepage.classList.remove("expand");
      /*  */
      config.weather.methods.query.by.id(config.last.loaded.city.id, config.presets.units, function (result) {
        if (result) {
          loader.style.display = "none";
          config.last.loaded.city = result;
          config.forecast.methods.query.by.id(result.id, config.presets.units, function (forecast) {
            if (forecast) {
              config.forecast.data = forecast;
              config.interface.create.summary(config.last.loaded.city, config.presets.units, homepage);
              config.interface.create.daily(config.forecast.data, homepage);
              /*  */
              if (action) action.click();
            } else config.handle.error("forecast-fetch-error");
          });
        } else config.handle.error("weather-fetch-error");
      });
    },
    "favorites": function (callback) {
      let counter = 0;
      let length = config.weather.favorites.length;
      let homepage = document.getElementsByClassName("homepage")[0];
      /*  */
      if (config.weather.favorites.length === 0) {
        if (callback) callback();
      }
      /*  */
      homepage.classList.remove("expand");
      config.weather.favorites.forEach(function (p) {
        config.weather.methods.query.by.id(p.id, config.presets.units, function (result) {
          if (result) {
            let index = config.weather.favorites.findIndex(q => q.id === p.id);
            /*  */
            config.weather.favorites[index].obj = result;
            config.storage.write("weather.favorites", config.weather.favorites);
            counter++;
            /*  */
            if (counter === length) {
              if (callback) callback();
            }
          } else config.handle.error("weather-fetch-error");
        });
      });
    }
  },
  "initialize": {
    "settings": {
      "current": function () {
        const name = document.getElementById("current-location-name");
        const city = config.location.current && config.location.current.city;
        /*  */
        name.textContent = city ? '(' + city + ')' : "(London, GB)";
      },
      "default": function () {
        const name = document.getElementById("default-location-name");
        const radio = document.getElementById("radio-default-location");
        /*  */
        if (config.weather.default && config.weather.default.result) {
          radio.removeAttribute("disabled");
          name.textContent = '(' + config.weather.default.result.name + ', ' + config.weather.default.result.sys.country + ')';
        } else {
          name.textContent = '';
          radio.setAttribute("disabled", '');
        }
      }
    },
    "buttons": {
      "default": function () {
        if (config.weather.default) {
          if (config.weather.default.result) {
            const button = document.getElementById("set-as-default");
            /*  */
            if (config.last.loaded.city && config.last.loaded.city.id === config.weather.default.result.id) {
              button.classList.add("default-button-active");
            } else {
              button.classList.remove("default-button-active");
            }
          }
        }
      },
      "favorite": function () {
        if (config.weather.favorites) {
          if (config.weather.favorites.length) {
            const list = config.weather.favorites.map(p => p.id);
            const button = document.querySelector(".favorite-button");
            /*  */
            if (config.last.loaded.city && list.indexOf(config.last.loaded.city.id) > -1) {
              button.classList.add("favorite-button-active");
            } else {
              button.classList.remove("favorite-button-active");
            }
          } 
        }
      }
    },
    "favorites": function () {
      const page = document.getElementById("favorites-page");
      page.textContent = '';
      /*  */
      if (config.weather.default) {
        if (config.weather.default.result) {
          const item = document.createElement("div");
          const heading = document.createElement('p');
          /*  */
          heading.textContent = "Default";
          item.className = "favorite-item";
          heading.className = "favorites-heading";
          item.dataset.cityId = config.weather.default.result.id;
          config.interface.create.summary(config.weather.default.result, config.presets.units, item);
          /*  */
          page.appendChild(heading);
          page.appendChild(item);
        }
      }
      /*  */
      if (config.weather.favorites) {
        if (config.weather.favorites.length) {
          const heading = document.createElement('p');
          heading.className = "favorites-heading";
          heading.textContent = "Favorites";
          page.appendChild(heading);
          /*  */
          config.weather.favorites.forEach(function (p) {
            const item = document.createElement("div");
            item.dataset.cityId = p.id;
            item.className = "favorite-item";
            config.interface.create.summary(p.obj, config.presets.units, item);
            page.appendChild(item);
          });
        }
      }
    },
    "services": function (callback) {
      const loader = document.getElementById("loader");
      const homepage = document.getElementsByClassName("homepage")[0];
      const action = document.querySelector(".navigation-item[data-page='homepage']");
      /*  */
      homepage.textContent = '';
      loader.style.display = "flex";
      /*  */
      if (config.presets.launch.type === "current" && config.is.from.favorite === false) {
        if (config.weather.current && config.weather.current.result) {
          loader.style.display = "none";
          config.forecast.data = config.weather.current.forecast;
          config.last.loaded.city = config.weather.current.result;
          config.interface.create.summary(config.last.loaded.city, config.presets.units, homepage);
          config.interface.create.daily(config.forecast.data, homepage);
          /*  */
          if (action) action.click();
          config.methods.initialize.buttons.default();
          config.methods.initialize.buttons.favorite();
          /*  */
        } else {
          config.weather.methods.query.info(function (info) {
            if (info) {
              config.weather.methods.query.by.coordinates(info.lat, info.lon, config.presets.units, function (result) {
                if (result) {
                  loader.style.display = "none";
                  config.last.loaded.city = result;
                  config.location.store({"city": config.last.loaded.city.name + ", " + config.last.loaded.city.sys.country});
                  /*  */
                  config.forecast.methods.query.by.id(result.id, config.presets.units, function (forecast) {
                    if (forecast) {
                      config.forecast.data = forecast;
                      config.interface.create.summary(config.last.loaded.city, config.presets.units, homepage);
                      config.interface.create.daily(config.forecast.data, homepage);
                      /*  */
                      config.weather.current = {"result": result, "forecast": forecast};
                      config.storage.write("weather.current", config.weather.current);
                      /*  */
                      if (action) action.click();
                      config.methods.initialize.buttons.default();
                      config.methods.initialize.buttons.favorite();
                    } else config.handle.error("forecast-fetch-error");
                  });
                } else config.handle.error("weather-fetch-error");
              });
            } else config.handle.error("weather-fetch-error");
          });
        }
      } else if (config.presets.launch.type === "default" && config.is.from.favorite === false) {
        config.methods.load.default();
        config.methods.initialize.buttons.default();
        config.methods.initialize.buttons.favorite();
      } else if (config.is.from.favorite) {
        config.methods.load.current();
        config.methods.initialize.buttons.default();
        config.methods.initialize.buttons.favorite();
      }
      /*  */
      window.setTimeout(function () {
        callback();
      }, 300);
    }
  }
};
