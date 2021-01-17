config.interface = {
  "change": {
    "background": {
      "image": function (code) {        
        var left = document.querySelector(".summary-left");
        if (left) {
          var icon = config.interface.find.icon(code);
          left.style.background = "url('resources/icons/" + code + "@2x.svg') no-repeat center center";
          left.setAttribute("title", icon.replace(/wi/g, '').replace(/\-/g, '').trim().toLocaleUpperCase());
        }
      }
    }
  },
  "find": {
    "icon": function (code) {
      switch (code) {
        case "01d": return "wi wi-day-sunny";
        case "01n": return "wi wi-night-clear";
        case "02d": return "wi wi-day-cloudy";
        case "02n": return "wi wi-night-alt-cloudy";
        case "03d": return "wi wi-cloud";
        case "03n": return "wi wi-cloud";
        case "04d": return "wi wi-cloudy";
        case "04n": return "wi wi-cloudy";
        case "09d": return "wi wi-rain";
        case "09n": return "wi wi-rain";
        case "10d": return "wi wi-day-rain";
        case "10n": return "wi wi-night-alt-rain";
        case "11n": return "wi wi-thunderstorm";
        case "11d": return "wi wi-thunderstorm";
        case "13d": return "wi wi-snow";
        case "13n": return "wi wi-snow";
        case "50d": return "wi wi-windy";
        case "50n": return "wi wi-windy";
      }
    }
  },
  "create": {
    "hourly": function (date, data, target) {
      var element = {};
      var items = document.createElement("div");
      var hourly = document.createElement("div");
      var dailytitle = document.createElement('p');
      var wrapper = document.querySelector(".hourly-wrapper");
      var hourlydata = data.list.filter(p => p.dt_txt.substring(0, p.dt_txt.indexOf(' ')) === date);
      /*  */
      items.className = "hourly-items";
      dailytitle.textContent = "Hourly";
      hourly.className = "hourly-wrapper";
      dailytitle.className = "page-title";
      if (wrapper !== null) wrapper.remove();
      /*  */
      hourly.appendChild(dailytitle);
      /*  */
      hourlydata.forEach(function (p) {
        element.icon = document.createElement("span");
        element.hour = document.createElement("span");
        element.temp = document.createElement("span");
        element.hourly = document.createElement("div");
        element.status = document.createElement("span");
        element.humidity = document.createElement("span");
        /*  */
        element.temp.className = "hourly-temp";
        element.hour.className = "hourly-hour";
        element.hourly.className = "hourly-item";
        element.status.className = "hourly-status";
        element.humidity.className = "hourly-humidity";
        element.status.textContent = p.weather[0].main;
        element.humidity.textContent = p.main.humidity + '%';
        element.temp.textContent = Math.round(parseFloat(p.main.temp), 0) + '°';
        element.hour.textContent = p.dt_txt.substring(p.dt_txt.indexOf(' '), p.dt_txt.length);
        element.icon.className = "hourly-icon " + config.interface.find.icon(p.weather[0].icon);
        /*  */
        element.hourly.appendChild(element.icon);
        element.hourly.appendChild(element.temp);
        element.hourly.appendChild(element.status);
        element.hourly.appendChild(element.humidity);
        element.hourly.appendChild(element.hour);
        items.appendChild(element.hourly);
      });
      /*  */
      hourly.appendChild(items);
      target.appendChild(hourly);
    },
    "summary": function (current, units, target) {
      var tr = document.createElement("tr");
      var city = document.createElement('p');
      var left = document.createElement("td");
      var right = document.createElement("td");
      var center = document.createElement("td");
      var state = document.createElement("div");
      var temp = document.createElement("span");
      var icon = document.createElement("div");
      var wind = document.createElement("span");
      var degree = document.createElement("span");
      var summary = document.createElement("div");
      var status = document.createElement("span");
      var details = document.createElement("div");
      var humidity = document.createElement("span");
      var pressure = document.createElement("span");
      var visibility = document.createElement("span");
      var table = document.createElement("table");
      /*  */
      summary.className = "summary";
      city.className = "summary-city";
      temp.className = "summary-temp";
      left.className = "summary-left";
      state.className = "summary-state";
      right.className = "summary-right";
      center.className = "summary-center";
      status.className = "summary-status";
      details.className = "summary-details";
      status.textContent = current.weather[0].description;
      temp.textContent = Math.round(current.main.temp * 10) / 10;
      city.textContent = current.name + ", " + current.sys.country;
      wind.textContent = "Wind" + ' ' + current.wind.speed + " m/h";
      humidity.textContent = "Humidity" + ' ' + current.main.humidity + '%';
      pressure.textContent = "Pressure" + ' ' + current.main.pressure + " hpa";
      icon.className = "summary-icon " + config.interface.find.icon(current.weather[0].icon);
      degree.className = units === "Imperial" ? "summary-deg wi wi-fahrenheit" : "summary-deg wi wi-celsius";
      visibility.textContent = current.visibility ? "Visibility" + ' ' + Math.round(current.visibility / 1000) + "km" : "N/A";
      /*  */
      state.appendChild(temp);
      state.appendChild(degree);
      details.appendChild(wind);
      details.appendChild(visibility);
      details.appendChild(humidity);
      details.appendChild(pressure);
      center.appendChild(summary);
      right.appendChild(city);
      summary.appendChild(icon);
      summary.appendChild(state);
      summary.appendChild(status);
      summary.appendChild(details);
      tr.appendChild(left);
      tr.appendChild(center);
      tr.appendChild(right);
      table.appendChild(tr);
      target.appendChild(table);
      /*  */
      config.interface.change.background.image(current.weather[0].icon);
    },
    "daily": function (collection, target) {
      var element = {};
      var dayfilter = [];
      var forecast = document.createElement("div");
      var dailytitle = document.createElement('p');
      /*  */
      collection.list.forEach(function (p) {
        if (dayfilter.length > 0) {
          var found = dayfilter.some(q => q.dt_txt.substring(0, q.dt_txt.indexOf(' ')) === p.dt_txt.substring(0, p.dt_txt.indexOf(' ')));
          if (found === false) {
            dayfilter.push(p);
          }
        } else {
          dayfilter.push(p);
        }
      });
      /*  */
      forecast.className = "forecast";
      dailytitle.textContent = "Daily";
      dailytitle.className = "page-title";
      /*  */
      target.appendChild(dailytitle);
      /*  */
      for (var i = 1; i < 6; i++) {
        element.min = document.createElement("span");
        element.max = document.createElement("span");
        element.date = document.createElement("span");
        element.icon = document.createElement("span");
        element.degree = document.createElement("div");
        element.status = document.createElement("span");
        element.forecast = document.createElement("div");
        /*  */
        var currentdate = dayfilter[i].dt_txt.split(' ')[0];
        var currentcollection = collection.list.filter(p => p.dt_txt.split(' ')[0] === currentdate);
        var minimumtemp = currentcollection.map(p => p.main.temp_min);
        var maximumtemp = currentcollection.map(p => p.main.temp_max);
        /*  */
        element.min.className = "forecast-min";
        element.max.className = "forecast-max";
        element.date.className = "forecast-date";
        element.icon.classList.add("forecast-icon");
        element.degree.className = "forecast-degree";
        element.forecast.className = "forecast-item";
        element.status.className = "forecast-status";
        element.status.textContent = dayfilter[i].weather[0].description;
        element.date.textContent = config.handle.data.format.date(dayfilter[i].dt_txt);
        element.icon.className = config.interface.find.icon(dayfilter[i].weather[0].icon);
        element.min.textContent = Math.round(parseFloat(Math.min(...minimumtemp)), 0) + '°';
        element.max.textContent = Math.round(parseFloat(Math.max(...maximumtemp)), 0) + '°';
        element.forecast.dataset.date = dayfilter[i].dt_txt.substring(0, dayfilter[i].dt_txt.indexOf(' '));
        /*  */
        element.degree.appendChild(element.max);
        element.degree.appendChild(element.min);
        element.forecast.appendChild(element.date);
        element.forecast.appendChild(element.icon);
        element.forecast.appendChild(element.degree);
        element.forecast.appendChild(element.status);
        forecast.appendChild(element.forecast);
      }
      /*  */
      target.appendChild(forecast);
    }
  }
};
