import crypto from "crypto";
const { WHATSAPP_APP_SECRET } = process.env;

export const isRequestSignatureValid = (req) => {
  
	if (!WHATSAPP_APP_SECRET) {
		console.warn(
			"App Secret is not set up. Please Add your app secret in /.env file to check for request validation"
		);
		return false; // Cambiado a false si no hay secreto
	}

	const signatureHeader = req.get("x-hub-signature-256");
	if (!signatureHeader) {
		console.error("No signature header found.");
		return false; // Retorna false si no hay cabecera de firma
	}

	const signatureBuffer = Buffer.from(
		signatureHeader.replace("sha256=", ""),
		"hex"
	);

	//console.log("Signature Header:", signatureHeader);
	//console.log("Signature Buffer:", signatureBuffer.toString("hex"));

	const hmac = crypto.createHmac("sha256", WHATSAPP_APP_SECRET);
	//console.log("req.rawBody en isRequetSignature:", req.rawBody)
	hmac.update(req.rawBody); // Asegúrate de que req.rawBody no esté vacío
	const digestString = hmac.digest("hex");
	const digestBuffer = Buffer.from(digestString, "hex");

	//console.log("Digest Buffer:", digestBuffer.toString("hex"));

	if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
		console.error("Error: Request Signature did not match");
		return false;
	}
	return true;
};