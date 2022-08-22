# esp32-aws-serverless
Demo project to Visualize Internet of Things with AWS Serverless

## Table of contents
* [General info](#general-info)
* [Prerequisite](#prerequisite)
* [Technologies](#technologies)

## General info
This project is using to keep the necessary source code to demo Internet of Things with AWS Serverless

![alt text](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/screenshot01.png?raw=true)


![alt text](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/screenshot02.png?raw=true)

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

### Change file
```
arduino/arduino.cpp
lambda/index.js
visualize/generate.js
```