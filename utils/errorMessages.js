import dotenv from "dotenv"

const myPhone = process.env.MY_PHONE

export const errorMessage1 = `Te pido disculpas 🙏, en este momento no puedo procesar tu solicitud porque estamos haciendo mejoras en nuestro servicio. Por favor intentá mas tarde o comunicate al ${myPhone}.\n¡Saludos de MegaBot! 🙂`

export const errorMessage2 = "Hay un problema en el servidor donde tengo la información de Gus-Tech; por lo que voy a comenzar una nueva conversación. ¿Por favor, me repetirías tu pregunta? 🙂"

export const errorMessage3 = `Te pido disculpas 🙏, en este momento no puedo procesar tu solicitud porque me quedé sin crédito para poder responder ☹️. Podes continuar la conversación al ${myPhone}.\n¡Saludos de MegaBot! 🙂`

export const errorMessage4 = `Te pido disculpas 🙏, no puedo procesar tu solicitud porque llegaste al máximo de consultas permitidas. Esto normalmente se hace para evitar abusos. Para continuar podes comunicarte al ${myPhone}.\n¡Saludos de MegaBot! 🙂`

export const errorMessage5 = "Te pido disculpas 🙏, por el momento solo puedo responder sobre texto, audio e imágenes. Ya podré procesar otros formatos.\n¡Saludos de MegaBot! 🙂"