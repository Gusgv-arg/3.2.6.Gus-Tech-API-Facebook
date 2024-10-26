
export const responseCharactersQuantity = (response, limit = 1000) => {
    if (typeof response !== "string") {
      console.warn(
        "Response is not a string. Converting to string for character count."
      );
      response = String(response);
    }
    
    if (response.length <= limit) {
      return response;
    } else {
      const truncatedResponse = response.slice(0, 900);
      return truncatedResponse + " ...\n¡Mensaje cortado por restricciones de longitud de Instagram!";
    }
  };