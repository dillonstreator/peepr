import Toastr from 'toastr';

let publicKey = null,
	privateKey = null;

export default {
	encryptWith: (msg, otherPublicKey) => otherPublicKey.encrypt(msg),
	decrypt: (msg) => privateKey.decrypt(msg),
	generateKeys: () => new Promise((resolve, reject) => {
		Toastr.info("Generating a public & private key pair...", "Keys");
		window.forge.rsa.generateKeyPair({ workers: 1 }, (err, keys) => {
			if (err) {
				Toastr.error("There was an error generating your keys...", "Keys - ERROR");
				return;
			}

			Toastr.success("Successfully generated public & private key pair", "Keys");
			publicKey = keys.publicKey;
			privateKey = keys.privateKey;
			resolve();
		});
	}),
	keyToPem: () => window.forge.pki.publicKeyToPem(publicKey),
	pemToKey: (pem) => window.forge.pki.publicKeyFromPem(pem),
};
