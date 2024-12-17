
export const getNextScreen = async (decryptedBody) => {
    const { screen, data, version, action, flow_token } = decryptedBody;
    // handle health check request
    if (action === "ping") {
      return {
        data: {
          status: "active",
        },
      };
    }
  
    // handle error notification
    if (data?.error) {
      console.warn("Received client error:", data);
      return {
        data: {
          acknowledged: true,
        },
      };
    }
  
    // handle initial request when opening the flow
    if (action === "INIT") {
      return {
        screen: "QUESTION_ONE",
        data: {
          // custom data for the screen
          //greeting: "Hey there! 👋",
        },
      };
    }
  
    if (action === "data_exchange") {
      // handle the request based on the current screen
      switch (screen) {
        case "QUESTION_ONE":
          // TODO: process flow input data
          console.info("Input name:", data?.name);
  
          // send success response to complete and close the flow
          return {
            screen: "SUCCESS",
            data: {
              extension_message_response: {
                params: {
                  flow_token,
                },
              },
            },
          };
        default:
          break;
      }
    }
  
    console.error("Unhandled request body:", decryptedBody);
    throw new Error(
      "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
    );
  };