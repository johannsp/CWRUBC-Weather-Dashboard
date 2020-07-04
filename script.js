$(document).ready(function() {
  
  var city = "";
  var weatherData = {empty: true};
  var oneCallData = {empty: true};

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
  //http: //api.openweathermap.org/data/2.5/weather?q=" + query_param + "&APPID=" + appID;
  //
  function CurrentWeather_WeatherAPI(cityName) {
    if (!cityName) {
      return;
    }
    var queryObj = {
      q: "", 
      appid: "38d1fde83d765552ca766073dba8a36d"
    };
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?";
    queryObj.q = cityName;
    queryURL += $.param(queryObj);
    console.log("queryURL="+queryURL);
    weatherData = {empty: true};
    $.ajax({
      url: queryURL,
      method: "GET"
    })
    .then(function(response) {
      weatherData = response;
      //console.log("weatherData\n"+JSON.stringify(response));
      var longitude = response.coord.lon;
      var latitude = response.coord.lat;
      OneCall_WeatherAPI(longitude,latitude);
    })
  }

  //https://api.openweathermap.org/data/2.5/onecall?lat=33.441792&lon=-94.037689&exclude=hourly,minutely&units=imperial&appid=38d1fde83d765552ca766073dba8a36d
  //
  function OneCall_WeatherAPI(longitude,latitude) {
    var queryObj = {
      lon: "", 
      lat: "", 
      units: "imperial",
      appid: "38d1fde83d765552ca766073dba8a36d"
    };
    var queryURL = "http://api.openweathermap.org/data/2.5/onecall?";
    queryObj.lon = longitude;
    queryObj.lat = latitude;
    queryURL += $.param(queryObj);
    console.log("queryURL="+queryURL);
    oneCallData = {empty: true};
    $.ajax({
      url: queryURL,
      method: "GET"
    })
    .then(function(response) {
      oneCallData = response;
      //console.log("oneCallData\n"+response);
      renderRightColumn()
      renderForecastGrid();
    })
  }

  $("#citySearch").on("submit", function(event) {
    event.preventDefault()
    city = $("#citySearch").val();
    if (city) {
      $("<div>")
        .addClass("tile box repeatCity")
        .text(city)
        .prependTo($("#cityList"));
      CurrentWeather_WeatherAPI(city);
    }
  });

  $("#search").on("click", function(event) {
    //event.preventDefault()
    city = $("#citySearch").val();
    if (city) {
      $("<div>")
        .addClass("tile box repeatCity")
        .text(city)
        .prependTo($("#cityList"));
      CurrentWeather_WeatherAPI(city);
    }
  });

  $("#cityList").on("click", ".repeatCity", function(event) {
    //event.preventDefault()
    city = $(this).text();
    $("#citySearch").val(city);
    if (city) {
      $("#cityList").prepend($(this));
      CurrentWeather_WeatherAPI(city);
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
      image = "http://openweathermap.org/img/wn/"+d.weather[0].icon+".png"
      grid.find(".forecastImage").attr("src",image);
      grid.find(".forecastTemp").html(d.temp.max+' &#176;F');
      grid.find(".forecastHumid").html(d.humidity+'%');
    }
  }

  renderRightColumn();
});
