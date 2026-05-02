import { createHmac } from "node:crypto";

type TransloaditUploadResult = {
  url: string;
  sslUrl?: string;
  name?: string;
  mime?: string;
};

type TransloaditAssemblyResponse = {
  ok?: string;
  error?: string;
  message?: string;
  results?: Record<string, TransloaditUploadResult[]>;
  uploads?: TransloaditUploadResult[];
};

function getTransloaditEnv() {
  const authKey = process.env.TRANSLOADIT_AUTH_KEY;
  const authSecret = process.env.TRANSLOADIT_AUTH_SECRET;
  const templateId = process.env.TRANSLOADIT_TEMPLATE_ID;

  if (!authKey || !authSecret || !templateId) {
    throw new Error("Transloadit credentials are not configured.");
  }

  return {
    authKey,
    authSecret,
    templateId,
  };
}

function createTransloaditParams() {
  const { authKey, templateId } = getTransloaditEnv();

  return JSON.stringify({
    auth: {
      key: authKey,
      expires: new Date(Date.now() + 10 * 60_000).toISOString(),
    },
    template_id: templateId,
  });
}

function signTransloaditParams(params: string) {
  const { authSecret } = getTransloaditEnv();

  return createHmac("sha384", authSecret).update(params).digest("hex");
}

function findUploadedUrl(response: TransloaditAssemblyResponse) {
  const resultEntries = Object.values(response.results ?? {}).flat();
  const candidates = [...resultEntries, ...(response.uploads ?? [])];
  const uploaded = candidates.find((item) => item.sslUrl || item.url);

  if (!uploaded) {
    throw new Error("Transloadit did not return an uploaded media URL.");
  }

  return uploaded.sslUrl ?? uploaded.url;
}

export async function uploadFileToTransloadit(file: File) {
  const params = createTransloaditParams();
  const signature = signTransloaditParams(params);
  const formData = new FormData();

  formData.set("params", params);
  formData.set("signature", signature);
  formData.set("file", file, file.name);

  const response = await fetch("https://api2.transloadit.com/assemblies", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as TransloaditAssemblyResponse;

  if (!response.ok || payload.error) {
    throw new Error(
      payload.message ?? payload.error ?? "Transloadit upload failed.",
    );
  }

  return {
    url: findUploadedUrl(payload),
  };
}

