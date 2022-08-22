#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <pgmspace.h>
#include "WiFi.h"
#include "DHT.h"

#define DHTPIN 23
#define DHTTYPE DHT22

#define SECRET
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

#define AWS_IOT_PUBLISH_TOPIC   "{pubTopic}" // change this
#define AWS_IOT_SUBSCRIBE_TOPIC "{subTopic}" // change this
 
float h ;
float t;
 
DHT dht(DHTPIN, DHTTYPE);
 
WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

void setup(){
  Serial.begin(115200);
  connectAWS();
  dht.begin();
}
 
void connectAWS(){
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Connecting to WiFi...");
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
 
  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);
  client.setServer(AWS_IOT_ENDPOINT, 8883);
 
  client.setCallback(messageHandler);
  Serial.println("Connecting to AWS IoT...");
 
  while (!client.connect(THINGNAME)){
    Serial.print(".");
    delay(100);
  }
 
  if (!client.connected()){
    Serial.println("AWS IoT Timeout!");
    return;
  }
 
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
  Serial.println("AWS IoT Connected");
}
 
void publishMessage(){
  StaticJsonDocument<200> doc;
  doc["humidity"] = h;
  doc["temperature"] = t;
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);
  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}
 
void messageHandler(char* topic, byte* payload, unsigned int length){
  Serial.print("incoming: ");
  Serial.println(topic);
 
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload);
  const char* message = doc["message"];
  Serial.println(message);
}
 
void loop(){
  h = dht.readHumidity();
  t = dht.readTemperature();
 
  if (isnan(h) || isnan(t) ){
    Serial.println(F("Failed to read from DHT sensor"));
    return;
  }
 
  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F("°C "));
 
  publishMessage();
  client.loop();
  delay(10000);
}