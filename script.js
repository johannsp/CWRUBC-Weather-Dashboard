$(document).ready(function() {
  
  var city = "";
  var forecast5Day_data = {};
  var oneCallWeath_data = {};

  //Test QueryURL:
  //https://api.openweathermap.org/data/2.5/forecast/daily?q=london&cnt=5&units=imperial&appid=38d1fde83d765552ca766073dba8a36d
  //http: //api.openweathermap.org/data/2.5/weather?q=" + query_param + "&APPID=" + appID;
  //
  function FiveDayForecast_WeatherAPI(cityName) {
    var queryObj = {
      q: "", 
      appid: "38d1fde83d765552ca766073dba8a36d"
    };
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?";
    queryObj.q = cityName;
    queryURL += $.param(queryObj);
    $.ajax({
      url: queryURL,
      method: "GET"
    })
    .then(function(response) {
      forecast5Day_data = response;
      console.log(response);
    })
  }

  //https://api.openweathermap.org/data/2.5/onecall?lat=33.441792&lon=-94.037689&exclude=hourly,minutely&units=imperial&appid=38d1fde83d765552ca766073dba8a36d
  //
  function OneCall_WeatherAPI(latitude,longitude) {
    var queryObj = {
      q: "", 
      units: "imperial", 
      cnt: "5",
      appid: "38d1fde83d765552ca766073dba8a36d"
    };
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?";
    queryObj.q = city;
    queryURL += $.param(queryObj);
    $.ajax({
      url: queryURL,
      method: "GET"
    })
    .then(function(response) {
      oneCallWeath_data = response;
      console.log(response);
    })
  }

  $("#search").on("click", function(event) {
    event.preventDefaults()
    FiveDayForecast_WeatherAPI($("#citySearch").val());
  });

  function renderRightColumn() {
    var currentDate = moment().format("L");
    $("#cityAndDate").text((City ? City+" " : "")+"("+currentDate+")");
  }

  renderRightColumn()
});
