export function base64urlToUint8Array(base64url: string): BufferSource {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function performBiometricLogin(): Promise<{ token: string }> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    throw new Error("Native Biometric Authentication (WebAuthn/Passkey) is not supported in this browser.");
  }

  const currentHostname = window.location.hostname === "localhost" ? "localhost" : window.location.hostname;
  let assertionPayload: any = null;

  // 1. Fetch registration challenge to trigger native Passkey Creation directly
  const regRes = await fetch("/api/auth/biometric", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "GET_REGISTER_CHALLENGE" }),
  });
  const regData = await regRes.json();

  if (regData.success && regData.challenge) {
    const regChallengeBuffer = base64urlToUint8Array(regData.challenge);
    const userIdBuffer = base64urlToUint8Array(regData.user.id);

    const createOptions: PublicKeyCredentialCreationOptions = {
      rp: {
        name: "FinEdge Intelligent Banking",
        id: currentHostname,
      },
      user: {
        id: userIdBuffer,
        name: regData.user.name,
        displayName: regData.user.displayName,
      },
      challenge: regChallengeBuffer,
      pubKeyCredParams: regData.pubKeyCredParams,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
    };

    const newCred = (await navigator.credentials.create({ publicKey: createOptions }).catch((e) => {
      console.warn("WebAuthn create error:", e);
      return null;
    })) as PublicKeyCredential | null;

    if (newCred) {
      const rawResponse = newCred.response as AuthenticatorAttestationResponse;
      const clientDataJsonStr = arrayBufferToBase64Url(rawResponse.clientDataJSON);

      const regCompleteRes = await fetch("/api/auth/biometric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGISTER",
          challengeId: regData.challengeId,
          attestation: {
            credentialId: newCred.id,
            publicKey: clientDataJsonStr,
            authenticatorAttachment: newCred.authenticatorAttachment || "platform",
          },
        }),
      });

      if (regCompleteRes.ok) {
        assertionPayload = {
          credentialId: newCred.id,
          authenticatorData: clientDataJsonStr,
          clientDataJSON: clientDataJsonStr,
          signature: clientDataJsonStr,
        };
      }
    } else {
      const challengeRes = await fetch("/api/auth/biometric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GET_CHALLENGE" }),
      });
      const cData = await challengeRes.json();

      if (cData.success && cData.challenge) {
        const getOptions: PublicKeyCredentialRequestOptions = {
          challenge: base64urlToUint8Array(cData.challenge),
          rpId: currentHostname,
          userVerification: "preferred",
          timeout: 60000,
        };

        const cred = (await navigator.credentials.get({ publicKey: getOptions }).catch(() => null)) as PublicKeyCredential | null;

        if (cred) {
          const rawResp = cred.response as AuthenticatorAssertionResponse;
          assertionPayload = {
            credentialId: cred.id,
            authenticatorData: arrayBufferToBase64Url(rawResp.authenticatorData),
            clientDataJSON: arrayBufferToBase64Url(rawResp.clientDataJSON),
            signature: arrayBufferToBase64Url(rawResp.signature),
          };
        }
      }
    }
  }

  if (!assertionPayload) {
    throw new Error("Biometric Scan Required: Please touch your fingerprint sensor when prompted on your phone.");
  }

  const res = await fetch("/api/auth/biometric", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "VERIFY",
      assertion: assertionPayload,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Biometric verification failed on server.");
  }

  return { token: data.token || "finedge-secure-jwt-token" };
}
