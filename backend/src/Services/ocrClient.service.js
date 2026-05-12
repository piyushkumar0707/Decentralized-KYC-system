import fs from "fs";
import axios from "axios";
import FormData from "form-data";

/**
 * Sends a local file to the FastAPI OCR service and returns structured fields.
 * @param {string} filePath Absolute or relative path to the uploaded file
 * @param {string} [mimeType] MIME type for the part
 */
export async function extractIdDocumentOcr(filePath, mimeType = "application/octet-stream") {
  const base = (process.env.OCR_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), {
    filename: "id-document",
    contentType: mimeType,
  });

  try {
    const { data, status } = await axios.post(`${base}/extract`, form, {
      headers: form.getHeaders(),
      timeout: 120_000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (status >= 400) {
      const detail = data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d).join("; ")
            : JSON.stringify(data);
      throw new Error(msg || `OCR service returned HTTP ${status}`);
    }

    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid OCR response");
    }

    return {
      raw_text: data.raw_text || "",
      name: data.name || "",
      document_number: data.document_number || data.document || "",
      document: data.document || data.document_number || "",
      date_of_birth: data.date_of_birth || "",
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const d = err.response?.data?.detail;
      const msg =
        typeof d === "string" ? d : err.response?.data ? JSON.stringify(err.response.data) : err.message;
      throw new Error(msg || "OCR request failed");
    }
    throw err;
  }
}
