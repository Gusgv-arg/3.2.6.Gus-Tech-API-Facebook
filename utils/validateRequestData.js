// Function to validate request data. Returns true or false

export const validateRequestData = (data) => {
    return data && data.message && data.message.contents && data.message.contents[0].text;
};