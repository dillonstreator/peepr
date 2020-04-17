let publicKey = null,
	privateKey = null;

export default {
	encryptWith: (msg, otherPublicKey) => otherPublicKey.encrypt(msg),
	decrypt: (msg) => privateKey.decrypt(msg),
	generateKeys: () => new Promise((resolve, reject) => {
		window.forge.rsa.generateKeyPair({ workers: 2 }, (err, keys) => {
			publicKey = keys.publicKey;
			privateKey = keys.privateKey;
			resolve();
			window.document.querySelector("#loader").remove();
		});
	}),
	keyToPem: () => window.forge.pki.publicKeyToPem(publicKey),
	pemToKey: (pem) => window.forge.pki.publicKeyFromPem(pem),
};
