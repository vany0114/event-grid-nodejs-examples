const express = require('express');
var bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/cancelorder', (req, res) => {
    var header = req.get("Aeg-Event-Type");
    if(header && header === 'SubscriptionValidation'){
         var event = req.body[0];
         console.log(event);

         var isValidationEvent = event && event.data && 
                                 event.data.validationCode &&
                                 event.eventType && event.eventType == 'Microsoft.EventGrid.SubscriptionValidationEvent';

         if(isValidationEvent){
             return res.send({
                "validationResponse": event.data.validationCode
            });
         }
    }

    // call the cancel order handler
    console.log(req.body[0].data);
    res.send(req.body);
});

const url = require('url');
var uuid = require('uuid').v4;
const msRestAzure = require('ms-rest-azure');
const eventGrid = require("azure-eventgrid");

app.get('/startorchestration', (req, res) => {
    let topicKey = 'NJQnZMX5ctg1p4G5Tpu9n7s4S69LKUndZfiM9hjvkjE=';
    let topicEndPoint = 'https://order-topic.westus-1.eventgrid.azure.net/api/events';

    let topicCreds = new msRestAzure.TopicCredentials(topicKey);
    let egClient = new eventGrid(topicCreds);
    let topicUrl = url.parse(topicEndPoint, true);
    let topicHostName = topicUrl.host;
    let currentDate = new Date();

    let lastKnownGeoLocationTime = new Date();
    lastKnownGeoLocationTime.setMinutes(lastKnownGeoLocationTime.getMinutes()-5);

    let lastEstimatedTimeOfEnteringPrepTime = new Date();
    lastEstimatedTimeOfEnteringPrepTime.setMinutes(lastEstimatedTimeOfEnteringPrepTime.getMinutes()+5);

    let events = [
        {
          id: uuid(),
          subject: 'Client_Connection_Loss',
          dataVersion: '2.0',
          eventType: 'MonitorClientConnection',
          data: {
            orderId: "-M5bRAnXbWXHg_dohH8_",
            vendorId: "0000015",
            lastKnownGeoLocationTime: lastKnownGeoLocationTime,
            lastEstimatedTimeOfEnteringPrepTime: lastEstimatedTimeOfEnteringPrepTime,
            vendorName: "Dunkin",
            userPhoneNumber: "+573162656070",
            withUserIntervention: false
          },
          eventTime: currentDate
        }
      ];

      egClient.publishEvents(topicHostName, events).then((result) => {
        return Promise.resolve(console.log('Published events successfully.'));
      }).catch((err) => {
        console.log('An error ocurred ' + err);
      });

      res.send(req.body);
});

app.get('/clientReconnected', (req, res) => {
    let topicKey = 'NJQnZMX5ctg1p4G5Tpu9n7s4S69LKUndZfiM9hjvkjE=';
    let topicEndPoint = 'https://order-topic.westus-1.eventgrid.azure.net/api/events';

    let topicCreds = new msRestAzure.TopicCredentials(topicKey);
    let egClient = new eventGrid(topicCreds);
    let topicUrl = url.parse(topicEndPoint, true);
    let topicHostName = topicUrl.host;
    let currentDate = new Date();

    let lastKnownGeoLocationTime = new Date();
    lastKnownGeoLocationTime.setMinutes(lastKnownGeoLocationTime.getMinutes()-5);

    let lastEstimatedTimeOfEnteringPrepTime = new Date();
    lastEstimatedTimeOfEnteringPrepTime.setMinutes(lastEstimatedTimeOfEnteringPrepTime.getMinutes()+5);

    let events = [
        {
          id: uuid(),
          subject: 'Client_Reconnected',
          dataVersion: '2.0',
          eventType: 'StopMonitorClientConnection',
          data: {
            orderId: "-M5bRAnXbWXHg_dohH8_"
          },
          eventTime: currentDate
        }
      ];

      egClient.publishEvents(topicHostName, events).then((result) => {
        return Promise.resolve(console.log('Published events successfully.'));
      }).catch((err) => {
        console.log('An error ocurred ' + err);
      });

      res.send(req.body);
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));