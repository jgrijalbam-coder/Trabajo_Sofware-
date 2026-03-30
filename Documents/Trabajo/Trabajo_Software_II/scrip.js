alert("JavaScript activo");
window.addEventListener("scroll", function(){

const imagen = document.querySelector(".bg");
const menu = document.querySelector(".menu");

let scroll = window.scrollY;

let opacidad = 1 - scroll / 600;

if(opacidad < 0){
opacidad = 0;
}

if(imagen){
imagen.style.opacity = opacidad;
}

if(scroll > 80){
menu.classList.add("scrolled");
}else{
menu.classList.remove("scrolled");
}

});

document.querySelectorAll(".btn-info").forEach(function(boton){

boton.addEventListener("click", function(){

const info = boton.parentElement.querySelector(".info-habitacion");

if(info.style.display === "block"){
info.style.display = "none";
boton.textContent = "Ver información";
}else{
info.style.display = "block";
boton.textContent = "Ocultar información";
}

});

});
const servicios = document.querySelectorAll(".servicio");

window.addEventListener("scroll", () => {

servicios.forEach(servicio => {

const posicion = servicio.getBoundingClientRect().top;
const alturaPantalla = window.innerHeight;

if(posicion < alturaPantalla - 100){

servicio.classList.add("visible");

}

});

});