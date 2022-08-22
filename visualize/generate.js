AWS.config.region = '{region}'; // change this
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: '{region:identityPoolId}', // change this
});

var dDB = new AWS.DynamoDB();
var datumVal = new Date() - 86400000;
var params = { 
              TableName: '{table_name}', // change this
              KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
              ExpressionAttributeNames: {
                "#id": "id",
                "#ts": "timestamp"
              },
              ExpressionAttributeValues: {
                ":iottopic": { "S" : "{publish_topic}"},  // change this
                ":datum": { "N" : datumVal.toString()}
              }
            };
var tempGraph = $("#temperaturegraph").get(0).getContext("2d");
var humiGraph = $("#humiditygraph").get(0).getContext("2d");
var options = { 
                responsive: true,
                showLines: true,
                scales: {
                  xAxes: [{ display: false }],
                  yAxes: [{ ticks: { beginAtZero:true } }]
                }
              };
var tempInit = {
  labels: [],
  datasets: [
    {
      label: "Temperature \u2103",
      backgroundColor: 'rgba(255, 238, 99, 0.5)',
      borderColor: 'rgba(255, 238, 99, 0.75)',
      data: []
    }
  ]
};
var humiInit = {
  labels: [],
  datasets: [
    {
      label: "Humidity %",
      backgroundColor: 'rgba(33, 85, 205, 0.25)',
      borderColor: 'rgba(33, 85, 205, 0.75)',
      data: []
    }
  ]
};

Chart.defaults.global.defaultFontColor = "#CFD2CF";
Chart.defaults.scale.gridLines.color = "#413F42";
var temperaturegraph = new Chart.Line(tempGraph, {data: tempInit, options: options});
var humiditygraph = new Chart.Line(humiGraph, {data: humiInit, options: options});

$(function() {
  getData();
  $.ajaxSetup({ cache: false });
  setInterval(getData, 120000);
});

function getData() {
  dDB.query(params, function(err, data) {
    if (err) {
      console.log(err);
      return null;
    } else {
      var temperatureValues = [];
      var humidityValues = [];
      var labelValues = [];
      var temperatureFetch = 0.0;
      var humidityFetch = 0.0;
      var dateTimeFetch = "";
      var dateTimeShow = "";
      var temperatureHigh = -999.0;
      var humidityHigh = -999.0;
      var temperatureLow = 999.0;
      var humidityLow = 999.0;
      var temperatureHighTime = "";
      var temperatureLowTime = "";
      var humidityHighTime = "";
      var humidityLowTime = "";
      
      for (var i in data['Items']) {
        temperatureFetch = parseFloat(data['Items'][i]['payload']['M']['temperature']['N']);
        humidityFetch = parseFloat(data['Items'][i]['payload']['M']['humidity']['N']);
        dateTimeFetch = new Date(data['Items'][i]['payload']['M']['datetime']['S']);
        dateTimeShow = moment(dateTimeFetch).format('llll');
        
        if (temperatureFetch < temperatureLow) {
          temperatureLow = temperatureFetch;
          temperatureLowTime = dateTimeShow;
        }
        if (temperatureFetch > temperatureHigh) {
          temperatureHigh = temperatureFetch;
          temperatureHighTime = dateTimeShow;
        }
        if (humidityFetch < humidityLow) {
          humidityLow = humidityFetch;
          humidityLowTime = dateTimeShow;
        }
        if (humidityFetch > humidityHigh) {
          humidityHigh = humidityFetch;
          humidityHighTime = dateTimeShow;
        }
        temperatureValues.push(temperatureFetch);
        humidityValues.push(humidityFetch);
        labelValues.push(dateTimeShow);
      }
      temperaturegraph.data.labels = labelValues;
      temperaturegraph.data.datasets[0].data = temperatureValues;
      humiditygraph.data.labels = labelValues;
      humiditygraph.data.datasets[0].data = humidityValues;
      temperaturegraph.update();
      humiditygraph.update();

      $('#temp-high').text(Number(temperatureHigh).toFixed(2).toString() + ' \u2103 at ' + temperatureHighTime);
      $('#temp-low').text(Number(temperatureLow).toFixed(2).toString() + ' \u2103 at ' + temperatureLowTime);
      $('#humi-high').text(Number(humidityHigh).toFixed(2).toString() + '% at ' + humidityHighTime);
      $('#humi-low').text(Number(humidityLow).toFixed(2).toString() + '% at ' + humidityLowTime);}
  });
}
