const functions = require('firebase-functions');
const admin = require("firebase-admin");
const serviceAccount = require("./imposing-bee-254701-firebase-adminsdk-9ij0o-b470419c27.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://imposing-bee-254701.firebaseio.com"
});


const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


exports.enviarMensaje = functions.https.onCall(async (data, context) => {
    nombreUsr = data.nombre;
    mensaje = data.mensaje;
    curso = data.curso;
    clase = data.claseId;
    tiempoActual = new Date();
    console.log('Es llamado');
    console.log(curso);
    console.log(mensaje);
    console.log(clase);
    console.log(mensaje);
    console.log(nombreUsr);

    claseRef = await db.collection('Cursos').doc(curso).get();

    if(claseRef.empty){
        return {'result' : 'error', 'message' : 'Clase no válida'};

    }

    tiempo = claseRef.data().inicioStream.seconds;
    tiempoActual = admin.firestore.Timestamp.fromDate(new Date()).seconds;
    
    tiempoRelativo = tiempoActual - tiempo;
    datosMensaje = {
        'clase' : curso + '_' + clase,
        'mensaje' : mensaje,
        'nombre' : nombreUsr,
        'tiempo' : tiempoRelativo
    }
    console.log(datosMensaje);
    db.collection('Chat').add(datosMensaje);
    return {'result' : 'success', 'message' : 'Enviado correctamente'};
});
