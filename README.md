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
    - [STEP 2: Create AWS Lambda](#step-2-create-aws-lambda)
    - [STEP 3: AWS IoT Core (Create Message Routing and Things)](#step-3-aws-iot-core-create-message-routing-and-things)
      - [Create Rule](#create-rule)
      - [Create Things](#create-things)
    - [STEP 4: Connect ESP32 to AWS IoT via MQTT protocol](#step-4-connect-esp32-to-aws-iot-via-mqtt-protocol)
    - [STEP 5: Cognito Identity Pools](#step-5-cognito-identity-pools)
    - [STEP 6: Create S3 Bucket](#step-6-create-s3-bucket)
    - [STEP 7: Visualize](#step-7-visualize)
  - [Change file](#change-file)

## General info
This project is the handbook and using to keep the necessary source code to demo Internet of Things with AWS Serverless

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
### STEP 0: Sign-Up or Sign-In to AWS console management.

### STEP 1: Create DynamoDB
* Go to DynamoDB
* Create Table
  * Fill Table name: `{table_name}`
  * Partition key
    * id: String
  * Sort key
    * timestamp: Number

![DynamoDB](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/dynamoDB/dynamoDB01.png?raw=true)

### STEP 2: Create AWS Lambda
* Go to AWS Lambda
* Create Function
  * Author from scrach
  * Basic Information
    * Function name: `{function_name}`
    * Runtime: `{Node.js 16.x}`
    * Architecture: `{x86_64}`

![Create Lambda function](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/lambda/lambda01.png?raw=true)

* Source: `lambda/index.js`
  * Fill in `{region}` (The region that you create on DynamoDB)
  * Fill in `{publish_topic}` (This is using for prepare to put data into DynamoDB e.g. `esp32/pubTopic` or `demoPubTopic`)
  * Fill in `{table_name}` (Fill the table name that you created)
    ```js
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

    * (Optional) You can use source below to allow only `PutItem` into DynamoDB.
        ```json
        {
            "Version": "2012-10-17",
            "Statement": {
                "Effect": "Allow",
                "Action": "dynamodb:PutItem",
                "Resource": "arn:aws:dynamodb:{region}:{account}:table/{table_name}"
            }
        }
        ```

* Test > Go to Test in AWS Lambda page
  * Test event action > Select `Create new event`
  * Fill in Event name: `{event_name}`
  * Event sharing settings: `Private`
  * Event JSON > Format `JSON`
    ```json
    {
        "temperature": 23,
        "humidity": 72
    }
    ```
  * Test

    ![Test Lambda put to DynamoDB](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/lambda/lambda04.png?raw=true)

* View the items in DynamoDB
  * Go to DynamoDB console > Tables > Explore items > Select `table_name` > `Run`

    ![Explore items on DynamoDB](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/dynamoDB/dynamoDB02.png?raw=true)

### STEP 3: AWS IoT Core (Create Message Routing and Things)
* Go to AWS IoT > Message Routing
#### Create Rule
  * Fill in `{publish_topic}` (The rule name that you want to manage routing e.g. `esp32/pubTopic` or `demoPubTopic`)
  * SQL statement 
    * `SELECT * FROM '{publish_topic}'` e.g. `SELECT * FROM 'esp32/pubTopic'`
  * Rule Action
    * Select: `Lambda`
    * Lambda function select: `{function_name}` (Lambda function name that you created)

    ![IoT](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/iot/iot01.png?raw=true)

    ![IoT](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/iot/iot02.png?raw=true)

    ![IoT](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/iot/iot03.png?raw=true)

* Test
  * Go to Test > MQTT test client > Select `Publish to a topic`
  * Topic name: `{publish_topic}`
  * Message payload:
    ```json
    {
        "temperature": 34,
        "humidity": 65
    }
    ```
  ![IoT](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/iot/iot04.png?raw=true)

#### Create Things
  * Manage > All devices > Things > `Create Things`
  * Click `Create Single Thing` 
  * Thing properties > Thing name
    * Fill in: `{thing_name}`
    * Select `Auto-generate a new certificate`
    * Attach policies to certificate > Click `Create policy`
      * Policy properties > Policy name
        * Fill in: `{thing_policy_name}`
      * Policy statements > Policy document (Add new statements `loop` 4 times)
        * Policy effect: `Allow`
        * Policy action: `iot:Connect`, `iot:Publish`, `iot:Receive`, `iot:Subscribe`
        * Policy resource: `*`
    * Attach policies to certificate > `refresh`
      * Select: `{thing_policy_name}`
      * Create thing
  * Download Certificate
    * Device certificate: `*.pem.crt` (Use this)
    * Key file
      * Public key file: `*-public.pem.key` (Use this)
      * Private key file: `*-private.pem.key`
    * Root CA certificates
      * RSA 2048 bit key: Amazon Root CA 1: `AmazonRootCA1.pem` (Use this)
      * ECC 256 bit key: Amazon Root CA 3: `AmazonRootCA3.pem` (Optional)

![Create Thing](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/iot/iot05.png?raw=true)

![Create Policy](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/iot/iot06.png?raw=true)

![Download Certificates](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/iot/iot07.png?raw=true)

### STEP 4: Connect ESP32 to AWS IoT via MQTT protocol
* Install Arduino IDE: [Download](https://www.arduino.cc/en/software "download arduino") (Select follow by your OS)
    * Setup Arduino IDE for ESP32 and DHT22
        * Preferences > Additional Board Manager URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
        * Tool > Board Manager > Select `Type Contribute`
            * Fill in: `esp32` > Install
        * Tool > Manage Libraries...
            * Fill in: `WiFi` > Install
            * Fill in: `ArduinoJSON` > Install
            * Fill in: `PubSubClient` > Install
            * Fill in: `DHT Sensor` > Install
        * Tool > Board > `ESP32 Dev Module`
        * Tool > Port > `Up to your port`

![Arduino Lib](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/arduino/arduino01.png?raw=true)

* Source: `arduino/arduino.ino`
  * You can change the value in parameters like this:
    ```cpp
    #define THINGNAME "{thing_name}" // change this
    
    const char WIFI_SSID[] = "{WiFi_SSID}"; // change this
    const char WIFI_PASSWORD[] = "{WiFi_PASSWORD}"; // change this
    const char AWS_IOT_ENDPOINT[] = "{AWS_IOT_ENDPOINT}"; // change this

    // Amazon Root CA 1 // change this
    static const char AWS_CERT_CA[] PROGMEM = R"EOF(
    -----BEGIN CERTIFICATE-----
    {AmazonRootCA1.pem}
    -----END CERTIFICATE-----
    )EOF";
    
    // Device Certificate // change this
    static const char AWS_CERT_CRT[] PROGMEM = R"KEY(
    -----BEGIN CERTIFICATE-----
    {certificate.pem.crt}
    -----END CERTIFICATE-----
    )KEY";
    
    // Device Private Key // change this
    static const char AWS_CERT_PRIVATE[] PROGMEM = R"KEY(
    -----BEGIN RSA PRIVATE KEY-----
    {private.pem.key}
    -----END RSA PRIVATE KEY-----
    )KEY";

    #define AWS_IOT_PUBLISH_TOPIC   "{publish_topic}" // change this
    ```

### STEP 5: Cognito Identity Pools
* Create Identity Pools
* Go to AWS Cognito
  * Click: `Manage Identity Pools`
  * Click: `Create new Identity Pool`
  * Fill in Identity pool name: `{cognito_identity_pool_name}`
  * Unauthenticated identities
    * Check: `Enable access to unauthenticated identities`
  * Authentication flow settings 
    * Check: `Allow Basic (Classic) Flow`
  * Click: Create Pool > Allow
  * Getting started with Amazon Cognito
    * Platform: `JavaScript`
    * `Copy`

![Cognito](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/cognito/cognito01.png?raw=true)

* Source: `visualize/generate.js`
  * Paste your AWS Credentials into `visualize/generate.js`
    ```js
    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = '{region}'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: '{region}:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    });
    ```

* Go to IAM Role
* To attach policies into `Cognito_*Unauth_Role`
* Access Management > Role
  * Roles
    * Fill in: `cognito`
    * If found `Cognito_*Auth_Role` and `Cognito_*Unauth_Role`, is correct
    ![IAM Role](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/cognito/cognito02.png?raw=true)
  * Click: `Cognito_*_Unauth_Role`
    * Permissions > Add permissions > `Attach policies`
    * Other permissions policies
      * Fill in: `Dynamo`
      * Check: `AmazonDynamoDBReadOnlyAccess`
      * Attach policies

    ![Attach policies](https://github.com/iamgique/esp32-aws-serverless/blob/main/screenshot/cognito/cognito02.png?raw=true)

### STEP 6: Create S3 Bucket
* 6

### STEP 7: Visualize
* 7

## Change file
```
arduino/arduino.cpp
lambda/index.js
visualize/generate.js
```