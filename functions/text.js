// Plantilla de ejemplo
const templateText = "Hola {{1}}, tu modelo es {{2}}.";

// Variables a reemplazar
const nombre = "Juan";
const modelo = "Honda";

// Reemplazo de las variables en la plantilla
const personalizedMessage = templateText.replace(/{{(\d+)}}/g, (match, number) => {
    switch (number) {
        case "1":
            return nombre;
        case "2":
            return modelo;
        default:
            return match; // Devuelve la variable sin reemplazo si no hay coincidencia
    }
});

// Verificar el resultado
console.log("Mensaje personalizado:", personalizedMessage);

