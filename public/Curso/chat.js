var titles = [];
var chatBuffer = [];
function obtieneElementos(){
    titleInput = document.getElementById("chatInput");
    messageBox = document.getElementById("chatDisplay");
}
var titleInput = document.getElementById("chatInput");
var messageBox = document.getElementById("chatDisplay");

var mandaMensaje = firebase.functions().httpsCallable('enviarMensaje'); 

function envia(){
    mensaje = document.getElementById('chatInput').value;
    datos = {
        'nombre' : usuario,
        'mensaje' : mensaje,
        'claseId' : numeroStream,
        'curso' : idCurso
    };
    console.log(mensaje);
    mandaMensaje(datos);
    titleInput.value = "";
}

function insert (data) {
    obtieneElementos()
    titles.push(`<b>${data.nombre}</b>: ${data.mensaje}`);
    clearAndShow();
}

function clearAndShow (){
    obtieneElementos()
    titleInput.value = "";
    messageBox.innerHTML = "";
    messageBox.innerHTML += " " + titles.join("<br/> ") + "<br/>";
}