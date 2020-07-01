$(document).ready(function() {
  
  var City = "";

  //Test QueryURL:
  //https://api.openweathermap.org/data/2.5/forecast/daily?q=london&cnt=5&units=imperial&appid=38d1fde83d765552ca766073dba8a36d
  //http: //api.openweathermap.org/data/2.5/weather?q=" + query_param + "&APPID=" + appID;
  //https://api.openweathermap.org/data/2.5/onecall?lat=33.441792&lon=-94.037689&exclude=hourly,minutely&units=imperial&appid=38d1fde83d765552ca766073dba8a36d
  $("#search").on("click", function(event) {
    var queryObj = {
      q: "", 
      units: "imperial", 
      cnt: "5",
      appid: "38d1fde83d765552ca766073dba8a36d"
    };
    var queryURL = "";

    event.preventDefaults()

    queryObj.q = $("#citySearch").val();
    queryURL = $.param(queryObj);
    $.ajax({
      url: queryURL,
      method: "GET"
    })
    .then(function(response) {
      console.log(response);
    })
  });

  function renderRightColumn() {
    var currentDate = moment().format("L");
    $("#cityAndDate").text((City ? City+" " : "")+"("+currentDate+")");
  }

  renderRightColumn()
});
