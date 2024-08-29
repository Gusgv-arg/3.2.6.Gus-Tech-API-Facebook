import dotenv from "dotenv"

const myPhone = process.env.MY_PHONE

export const errorMessage1 = `Te pido disculpas 🙏, en este momento no puedo procesar tu solicitud porque estamos haciendo mejoras en nuestro servicio. Por favor intentá mas tarde o comunicate al ${myPhone}. ¡Saludos de MegaBot! 🙂`

export const errorMessage2 = "Hay un problema en el servidor donde tengo la información de Gus-Tech; por lo que voy a comenzar una nueva conversación. ¿Por favor, me repetirías tu pregunta? 🙂"

export const errorMessage3 = `Te pido disculpas 🙏, en este momento no puedo procesar tu solicitud porque me quedé sin crédito para poder responder ☹️. Podes continuar la conversación al ${myPhone}. ¡Saludos de MegaBot! 🙂`

export const errorMessage4 = `Te pido disculpas 🙏, no puedo procesar tu solicitud porque llegaste al máximo de consultas permitidas. Esto normalmente se hace para evitar abusos. Para continuar podes comunicarte al ${myPhone}. ¡Saludos de MegaBot! 🙂`