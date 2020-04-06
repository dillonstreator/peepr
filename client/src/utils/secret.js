let publicKey = null,
	privateKey = null;

export default {
	encrypt: (msg) => publicKey.encrypt(msg),
	decrypt: (msg) => privateKey.decrypt(msg),
	generateKeys: () => {
		window.forge.rsa.generateKeyPair({ workers: 2 }, (err, keys) => {
            console.log(keys)
			publicKey = keys.publicKey;
			privateKey = keys.privateKey;
		});
	},
	pem: () => window.forge.pki.publicKeyToPem(publicKey),
};
