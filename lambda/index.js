const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: '{region}'}); // change this

exports.handler = function(event, context, callback) {
    let ISO_Date = new Date().toISOString();
    
    var params = {
        Item: {
            id: "{publish_topic}", // change this
            timestamp:  Date.now(),
            payload:{
               "datetime":    ISO_Date, 
               "temperature": event.temperature,
               "humidity":    event.humidity
            },
        },
        TableName: '{table_name}' // change this
    };
    
    docClient.put(params, function(err, data) {
        if (err) callback(err, err.stack);
        else     callback(null,data);
    });
};