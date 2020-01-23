const functions = require('firebase-functions');
const admin = require("firebase-admin");
const axios = require("axios");
const qs = require('querystring');
const https = require('https');
const serviceAccount = require("./imposing-bee-254701-firebase-adminsdk-9ij0o-b470419c27.json");
const credentials = require("./credentials.js")


axios.defaults.withCredentials = true;
const instance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://imposing-bee-254701.firebaseio.com"
});


const db = admin.firestore();



/**********************************************************************************/
/********************************Google Assistant**********************************/
/************************************************+++++++++++++++++++++++++++++++++*/
const {WebhookClient} = require('dialogflow-fulfillment');

exports.dialogflow = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function getCurrentTimeAnswer(agent) {
    agent.add(currentTime());
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('GetCurrentTimeIntent', getCurrentTimeAnswer);
  agent.handleRequest(intentMap);
});

/**********************************************************************************/
/********************************Alexa Skill***************************************/
/************************************************+++++++++++++++++++++++++++++++++*/
exports.alexaSkill = functions.https.onRequest(async (request, response) => {
  const type = JSON.stringify(request.body.request.type);
  var name = '';
  if(request.body.request.intent === undefined){
      name = '"GetCurrentTimeIntent"';
  }else{
    name = JSON.stringify(request.body.request.intent.name);
  }
   
  var result;
  try {
    result =await  getAlexaResponse(type, name);
  }catch(err){
    var AlexaDefaultAnswer = {
        "version": "1.0",
        "response": {
          "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak>Bienvenido a este bot extraño, pregunta cual es mi avance para que te diga mi avance curricular</speak>"
          },
          "shouldEndSession": false,
          "card": {
            "type": "Simple",
            "title": "LaunchRequest",
            "content": "Bienvenido a este bot extraño, pregunta cual es mi avance para que te diga mi avance curricular"
          }
        },
        "userAgent": "ask-node/2.3.0 Node/v8.10.0",
        "sessionAttributes": {}
      }
      response.send(AlexaDefaultAnswer);
    
  }
  

  response.send(result);
});

const getAlexaResponse = async (type, name) => {  
  var AlexaDefaultAnswer = {
    "version": "1.0",
    "response": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak>Bienvenido a este bot extraño, pregunta cual es mi avance para que te diga mi avance curricular</speak>"
      },
      "shouldEndSession": false,
      "card": {
        "type": "Simple",
        "title": "LaunchRequest",
        "content": "Bienvenido a este bot extraño, pregunta cual es mi avance para que te diga mi avance curricular"
      }
    },
    "userAgent": "ask-node/2.3.0 Node/v8.10.0",
    "sessionAttributes": {}
  }

  
  if(type === '"LaunchRequest"') {
      return AlexaDefaultAnswer;
  } else if(type === '"IntentRequest"' && name ==='"GetCurrentTimeIntent"'){
      var resp = await avanceRespuesta();
      var url = '<speak>' + resp + '</speak>'
      AlexaDefaultAnswer.response.outputSpeech.ssml = url;
      AlexaDefaultAnswer.response.card.content = 'mensajito';
      return AlexaDefaultAnswer;
  } else {
    return AlexaDefaultAnswer;
  }

}

/**********************************************************************************/
/***********************************ANSWERS****************************************/
/************************************************+++++++++++++++++++++++++++++++++*/

function currentTime(){
    const date = new Date();
    //Return time in UTC !!!
    return date.getHours() + ":" + date.getMinutes();
}





async function avanceRespuesta() {
    
    cuerpo = credentials.credentials;
    config = {
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    respuesta = await instance.post('https://nave13.ucv.cl', qs.stringify(cuerpo), config);
    cookies = respuesta.headers['set-cookie'];
    
    console.log(respuesta.request.res.responseUrl);
    console.log(cookies);
    respuesta = await instance.request({
        url: 'https://nave13.ucv.cl/alumno/informacion_curricular/alumno_avance.php',
        method: 'post',
        headers: {
            Cookie: cookies[0]
        },
        withCredentials: true
    });

    index = respuesta.data.indexOf('APROBA');
    str = respuesta.data.slice(index, index+300).split('=');
    porcentaje = str[3].slice(0,10);
    division = str[2];
    total = str[2].split('/')[1];
    propios = str[2].split('/')[0];

    respuestaTotal = `En la carrera, llevas aprobados ${propios} creditos de ${total}, lo que equivale a un ${porcentaje}`;
    console.log(respuesta.request.res.responseUrl);
    console.log(typeof(respuesta.data));
    console.log(index);


    return respuestaTotal;
}