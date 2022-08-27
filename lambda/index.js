const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: '{region}'}); // change this

exports.handler = async (event, context, callback) => {
    let ISO_Date = new Date().toISOString();
    
    const params = {
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
    
    try {
      const data = await docClient.put(params).promise();
      callback(null,data);
    } catch (err) {
      callback(err, err.stack);
    }
};