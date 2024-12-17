import crypto from "crypto";
const { WHATSAPP_APP_SECRET } = process.env;

export const isRequestSignatureValid = (req) => {
	if (!WHATSAPP_APP_SECRET) {
		console.warn(
			"App Secret is not set up. Please Add your app secret in /.env file to check for request validation"
		);
		return true;
	}

	const signatureHeader = req.get("x-hub-signature-256");
	const signatureBuffer = Buffer.from(
		signatureHeader.replace("sha256=", ""),
		"utf-8"
	);

	const hmac = crypto.createHmac("sha256", WHATSAPP_APP_SECRET);
	const digestString = hmac.update(req.rawBody).digest("hex");
	const digestBuffer = Buffer.from(digestString, "utf-8");

	if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
		console.error("Error: Request Signature did not match");
		return false;
	}
	return true;
};
