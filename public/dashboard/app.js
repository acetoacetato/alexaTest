datosUsr = {}
idUsr = ""
var db;

window.onload = ev => {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
		    // User is signed in.
		    var displayName = user.displayName;
		    var email = user.email;
		    var emailVerified = user.emailVerified;
		    var photoURL = user.photoURL;
		    var isAnonymous = user.isAnonymous;
		    var uid = user.uid;
            var providerData = user.providerData;

		    console.log("Usuario conectado")
            db = firebase.firestore();
            actualizarSiEsUsuarioValido(uid);
            

		} else {
            window.location = "https://imposing-bee-254701.firebaseapp.com";
		}

    });

};


function actualizarSiEsUsuarioValido(uid) {
	var db = firebase.firestore();

	var docRef = db.collection("Usuarios").doc(uid);

	docRef.get().then(function(doc) {

	    if (doc.exists) {
	    	console.log("Usuario conectado")

			IdUsr = uid
            
            datosUsr = doc.data();
			actualizarVista()
	    } else {
            console.log('the game');
	    	// Actualizando cuerpo para que no cualquiera lo pueda ver
	    	actualizarSiDesconecta()
	    }
		}).catch(function(error) {
		    console.log("Error getting document:", error);
	});
}



actualizarVista = () => {
	console.log('me actualiza');
	document.getElementById('nombreUsr').value = datosUsr.nombre;
	document.getElementById('rolUsr').value = datosUsr.rol;

    var suscripciones = datosUsr.suscripciones;
    var tabla = document.getElementById('Courses').getElementsByTagName('tbody')[0];
    suscripciones.forEach(id => {
        db.collection('Cursos').doc(id).get().then(doc => {
            // Se crean los datos
            var nombre = doc.data().nombre;
            var desc = doc.data().descripcion;
            var live = false;

            var fila = tabla.insertRow();

            fila.innerHTML = `<tr><td>${nombre}</td><td>${desc}</td><td>${false}</td>`;
        }).catch(err => {console.log(err)});
    });
    

}