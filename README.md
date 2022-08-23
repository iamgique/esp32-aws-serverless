# esp32-aws-serverless
Connecting ESP32 to AWS IoT via MQTT protocol, Visualize Temperature and Humidity into Web Application.

## Table of contents
- [esp32-aws-serverless](#esp32-aws-serverless)
  - [Table of contents](#table-of-contents)
  - [General info](#general-info)
    - [Basic Knowledge](#basic-knowledge)
  - [Prerequisite](#prerequisite)
  - [Technologies](#technologies)
  - [Handbook](#handbook)
        - [STEP 0: Sign-Up or Sign-In to AWS console management.](#step-0-sign-up-or-sign-in-to-aws-console-management)
        - [STEP 1: Create DynamoDB](#step-1-create-dynamodb)
        - [STEP 2: Create Lambda](#step-2-create-lambda)
        - [STEP 3: Create Message Routing and Things (IoT Core)](#step-3-create-message-routing-and-things-iot-core)
        - [STEP 4: Cognito Identity Pools](#step-4-cognito-identity-pools)
        - [STEP 5: Create S3 Bucket](#step-5-create-s3-bucket)
        - [STEP 6: Install Arduino IDE - ESP32 & DHT22](#step-6-install-arduino-ide---esp32--dht22)
        - [STEP 8: Visualize](#step-8-visualize)
    - [Change file](#change-file)

## General info
This project is using to keep the necessary source code and handbook to demo Internet of Things with AWS Serverless

![Visualize](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/screenshot02.png?raw=true)

![Structure](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/screenshot01.png?raw=true)

### Basic Knowledge
Basic Knowledge of AWS cloud services, Serverless, NoSQL, Arduino ESP32, JavaScript and HTML

## Prerequisite
```
ESP32 (with WiFi)
DHT22 (Temperature Humidity Sensor)
AWS Account free-tier
Arduino IDE
```

## Technologies
Project is created with:
* AWS IoT Core
* AWS DynamoDB
* AWS Lambda
* AWS Cognito
* AWS S3
* Nodejs version: 16.x
* C++ version: 2.33
* Arduino WiFi library version: 1.2.7
* Arduino ArduinoJSON library version: 6.19.4
* Arduino PubSubClient library version: 2.8.0
* Arduino DHT Sensor library version: 1.4.4

## Handbook
To create this project, you can implement follwing these step below:
##### STEP 0: Sign-Up or Sign-In to AWS console management.

##### STEP 1: Create DynamoDB
* Go to DynamoDB
* Create Table
  * Fill Table name: `{table_name}`
  * Partition key
    * id: String
  * Sort key
    * timestamp: Number

![DynamoDB](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/dynamoDB/dynamoDB.png?raw=true)

##### STEP 2: Create Lambda
* Go to AWS Lambda
* Create Function
  * Author from scrach
  * Basic Information
    * Function name: `{function_name}`
    * Runtime: `{Node.js 16.x}`
    * Architecture: `{x86_64}`

![Create Lambda function](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/lambda/lambda01.png?raw=true)

* Code Source
  * `lambda/index.js`
    * Fill in `{region}` (The region that you create on DynamoDB)
    * Fill in `{publish_topic}` (This is using for prepare to put data into DynamoDB e.g. `esp32/pubTopic` or `demoPubTopic`)
    * Fill in `{table_name}` (Fill the table name that you created)
        ```
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
        ```
* To add IAM Role > Go to Configuration > Execution Role
  * Click Role name: `{role name}`
  * IAM > Role > Add permissions > Attach policies > Find `AmazonDynamoDB`
    * Select `AmazonDynamoDBFullAccess` > Attach pilices
    * Close page

    ![Execution Role](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/lambda/lambda02.png?raw=true)

    ![Permission](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/lambda/lambda03.png?raw=true)

* Test > Go to Test in AWS Lambda page
  * Test event action > Select `Create new event`
  * Fill in Event name: `{event name}`
  * Event sharing settings: `Private`
  * Event JSON > Format `JSON`
    ```
    {
        "temperature": 23,
        "humidity": 72
    }
    ```
  * Test

    ![Test](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/lambda/lambda04.png?raw=true)

* View the items in DynamoDB
  * Go to DynamoDB console > Tables > Explore items > Select `table_name` > `Run`

    ![Test](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/dynamoDB/dynamoDB02.png?raw=true)

##### STEP 3: Create Message Routing and Things (IoT Core)

##### STEP 4: Cognito Identity Pools

##### STEP 5: Create S3 Bucket

##### STEP 6: Install Arduino IDE - ESP32 & DHT22

##### STEP 8: Visualize

### Change file
```
arduino/arduino.cpp
lambda/index.js
visualize/generate.js
```