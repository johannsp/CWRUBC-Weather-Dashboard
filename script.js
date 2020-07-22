$(document).ready(function() {
  
  var city = "";
  var weatherData = {empty: true};
  var oneCallData = {empty: true};
  var lastCall = "";
  var storedLastCall = null;
  var storedLastCity = null;

  var colorsUVIndex = [
    "green",  // 0 
    "green",  // 1 
    "green",  // 2 
    "yellow", // 3 
    "yellow", // 4 
    "yellow", // 5 
    "orange", // 6 
    "orange", // 7 
    "red",    // 8 
    "red",    // 9 
    "red",    // 10
    "violet"  // 11
  ];

  //Test QueryURL:
  //https://api.openweathermap.org/data/2.5/forecast/daily?q=london&cnt=5&units=imperial&appid=38d1fde83d765552ca766073dba8a36d
  //https: //api.openweathermap.org/data/2.5/weather?q=" + query_param + "&APPID=" + appID;
  //
  function CurrentWeather_WeatherAPI(cityName,isNew) {
    var queryObj = {
      q: "", 
      appid: "38d1fde83d765552ca766073dba8a36d"
    };
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?";
    weatherData = {empty: true};
    if (!cityName) {
      return;
    }
    queryObj.q = cityName;
    queryURL += $.param(queryObj);
    //console.log("queryURL="+queryURL);
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      weatherData = response;
      //console.log("weatherData\n"+JSON.stringify(response));
      var longitude = response.coord.lon;
      var latitude = response.coord.lat;
      OneCall_WeatherAPI(longitude,latitude,isNew);
    })
  }

  //https://api.openweathermap.org/data/2.5/onecall?lat=33.441792&lon=-94.037689&exclude=hourly,minutely&units=imperial&appid=38d1fde83d765552ca766073dba8a36d
  //
  function OneCall_WeatherAPI(longitude,latitude,isNew) {
    var queryObj = {
      lon: "", 
      lat: "", 
      units: "imperial",
      appid: "38d1fde83d765552ca766073dba8a36d"
    };
    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?";
    queryObj.lon = longitude;
    queryObj.lat = latitude;
    queryURL += $.param(queryObj);
    //console.log("queryURL="+queryURL);
    oneCallData = {empty: true};
    $.ajax({
      url: queryURL,
      method: "GET"
    })
    .then(function(response) {
      oneCallData = response;
      lastCall = JSON.stringify(oneCallData);
      //console.log("lastData\n"+lastCall);
      localStorage.setItem("weatherDash_lastCall",lastCall);
      localStorage.setItem("weatherDash_lastCity",city);
      renderRightColumn()
      renderForecastGrid();
      // Only list new searched city if API calls succeed, so do it here.
      if (isNew) {
        $("<div>")
          .addClass("tile box repeatCity")
          .text(city)
          .prependTo($("#cityList"));
      }
    })
  }

  /* {{{ **
  ** // Somehow enter is forcing a submit despite all attempts set {{{
  ** // an event handler, so forcibly override this behavior.
  ** // This advice was found at link:
  ** // https://www.hashbangcode.com/article/prevent-enter-key-submitting-forms-jquery
  ** // }}}
  ** $('form input:not([type="submit"])').on("keydown",function(e) {
  **   if (e.keyCode == 13) {
  **       e.preventDefault();
  **       return false;
  **   }
  ** });
  ** 
  ** $("#citySearch").on("change", function(event) {
  **   event.preventDefault()
  **   event.stopPropagation()
  **   city = $("#citySearch").val();
  **   alert('#citySearch change where city='+city);
  **   if (city) {
  **     CurrentWeather_WeatherAPI(city,true);
  **   }
  ** });
  ** 
  ** $("#citySearch").on("submit", function(event) {
  **   event.preventDefault()
  **   event.stopPropagation()
  **   city = $("#citySearch").val();
  **   alert('#citySearch submit where city='+city);
  **   if (city) {
  **     CurrentWeather_WeatherAPI(city,true);
  **   }
  ** });
  ** }}} */

  // Possibly because Bulma frame work wants inputs marked as type text instead
  // of submit, normal means of attaching an event handler to stop <ENTER> press
  // on an input from submitting the form seem to fail.  As a work around hook
  // the key down event and watch for <ENTER>.
  $("#citySearch").on("keydown", function(event) {
    if (event.keyCode == 13) {
      event.preventDefault()
      event.stopPropagation()
      city = $("#citySearch").val();
      if (city) {
        CurrentWeather_WeatherAPI(city,true);
      }
    }
  });

  $("#search").on("click", function(event) {
    event.preventDefault()
    event.stopPropagation()
    city = $("#citySearch").val();
    if (city) {
      CurrentWeather_WeatherAPI(city,true);
    }
  });

  $("#cityList").on("click", ".repeatCity", function(event) {
    event.preventDefault()
    event.stopPropagation()
    city = $(this).text();
    $("#citySearch").val(city);
    if (city) {
      $("#cityList").prepend($(this)); // Move existing city
      CurrentWeather_WeatherAPI(city,false);
    }
  });

  function renderRightColumn() {
    var currentDate;
    if (oneCallData.hasOwnProperty("empty")) {
      currentDate = moment().format("L");
      $("#cityAndDate").text((city ? city+" " : "")+"("+currentDate+")");
    }
    else {
      currentDate = moment.unix(oneCallData.current.dt).format("L");
      $("#cityAndDate").text((city ? city+" " : "")+"("+currentDate+")");
      $("#temperature").html(oneCallData.current.temp+' &#176;F');
      $("#humidity").html(oneCallData.current.humidity+'%');
      $("#windSpeed").html(oneCallData.current.wind_speed+' MPH');
      $("#indexUV").html(oneCallData.current.uvi);
      $("#indexUV").css("background-color",
        colorsUVIndex[Math.min(11,Math.floor(oneCallData.current.uvi))]);
    }
  }

  function renderForecastGrid() {
    if (oneCallData.hasOwnProperty("empty")) {
      return;
    }
    var grid;
    var image = "";
    var date;
    var d;
    for (var i = 0; i < 5; i++) {
      grid = $("[id='date"+i+"']");
      d = oneCallData.daily[i]; // row of data from daily array
      date = moment.unix(d.dt).format("L");
      grid.find(".forecastDate").html(date);
      image = "https://openweathermap.org/img/wn/"+d.weather[0].icon+".png"
      grid.find(".forecastImage").attr("src",image);
      grid.find(".forecastTemp").html(d.temp.max+' &#176;F');
      grid.find(".forecastHumid").html(d.humidity+'%');
    }
  }

  storedLastCall = localStorage.getItem("weatherDash_lastCall");
  if (storedLastCall !== null) {
    //console.log("storedLastCall\n"+storedLastCall);
    oneCallData = JSON.parse(storedLastCall);
  }
  storedLastCity = localStorage.getItem("weatherDash_lastCity");
  if (storedLastCity !== null) {
    city = storedLastCity;
    // Only list last searched city on reload.
    $("<div>")
      .addClass("tile box repeatCity")
      .text(city)
      .prependTo($("#cityList"));
  }
  renderRightColumn();
  renderForecastGrid();
});
