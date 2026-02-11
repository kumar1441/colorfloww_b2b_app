import * as ImageManipulator from 'expo-image-manipulator';

export interface Nail {
  box: { x: number; y: number; width: number; height: number };
  mask: string;
  confidence: number;
}

export interface NailDetectionResult {
  nails: Nail[];
  processedImageUri: string;
  imageWidth: number;
  imageHeight: number;
}

/**
 * Detects nails in an image using Hugging Face Gradio API.
 * Improved implementation with safer SSE parsing and comprehensive logging.
 * Returns the processed image URI and dimensions to ensure coordinate alignment.
 */
export const detectNails = async (
  imageUri: string,
  signal?: AbortSignal
): Promise<NailDetectionResult> => {

  const logPrefix = `[NailDetection]`;

  try {
    // ---------- STEP 1: Image optimization ----------

    const manipulated = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }],
      {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!manipulated.base64) {
      throw new Error("Image manipulation failed (no base64)");
    }

    const base64Image = `data:image/jpeg;base64,${manipulated.base64}`;

    const SPACE_URL =
      "https://nblvprasad-nailrecogniton-v2.hf.space/gradio_api/call/process_image";

    // ---------- STEP 2: POST ----------

    const controller = new AbortController();
    const requestSignal = signal ?? controller.signal;
    if (!signal) setTimeout(() => controller.abort(), 60000);

    const postRes = await fetch(SPACE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: requestSignal,
      body: JSON.stringify({
        data: [
          {
            url: base64Image,
            orig_name: "nail.jpg",
            meta: { _type: "gradio.FileData" },
          },
        ],
      }),
    });

    if (!postRes.ok) {
      const txt = await postRes.text();
      console.error(`${logPrefix} POST failed ${postRes.status}: ${txt}`);
      throw new Error(`POST failed ${postRes.status}: ${txt}`);
    }

    const { event_id } = await postRes.json();
    if (!event_id) throw new Error("No event_id returned");

    // ---------- STEP 3: GET STREAM ----------

    const streamRes = await fetch(`${SPACE_URL}/${event_id}`, {
      signal: requestSignal,
    });

    if (!streamRes.ok) {
      const txt = await streamRes.text();
      console.error(`${logPrefix} GET failed ${streamRes.status}: ${txt}`);
      throw new Error(`GET failed ${streamRes.status}: ${txt}`);
    }

    const streamText = await streamRes.text();

    // ---------- STEP 4: SAFE SSE PARSING ----------
    const dataLines = streamText
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.startsWith("data:"));

    if (!dataLines.length) {
      console.warn(`${logPrefix} No data lines found`);
      return {
        nails: [],
        processedImageUri: manipulated.uri,
        imageWidth: manipulated.width,
        imageHeight: manipulated.height,
      };
    }

    // ✅ Gradio result is ALWAYS the LAST data payload
    const lastDataLine = dataLines[dataLines.length - 1];
    const jsonStr = lastDataLine.replace("data:", "").trim();

    let resultJson: any;
    try {
      resultJson = JSON.parse(jsonStr);
    } catch (e) {
      console.error(`${logPrefix} JSON parse failed`, jsonStr.substring(0, 200));
      return {
        nails: [],
        processedImageUri: manipulated.uri,
        imageWidth: manipulated.width,
        imageHeight: manipulated.height,
      };
    }

    // ---------- STEP 5: VALIDATE SHAPE ----------
    // V2 API returns [annotated_image, json_metadata] tuple
    // Extract detection data from the second element
    let detections = null;

    if (Array.isArray(resultJson)) {
      // V2 format: resultJson[1] contains the detection metadata
      const metadataElement = resultJson[1];

      // The metadata could be a JSON string or already parsed object
      if (typeof metadataElement === 'string') {
        try {
          const parsed = JSON.parse(metadataElement);
          detections = Array.isArray(parsed) ? parsed : parsed.detections || null;
        } catch (e) {
          console.warn(`${logPrefix} Failed to parse metadata string`, e);
        }
      } else if (Array.isArray(metadataElement)) {
        detections = metadataElement;
      } else if (metadataElement && typeof metadataElement === 'object') {
        // Check if it has a detections property
        detections = metadataElement.detections || null;
      }
    }

    if (!Array.isArray(detections)) {
      console.warn(`${logPrefix} No detections found in response`);
      return {
        nails: [],
        processedImageUri: manipulated.uri,
        imageWidth: manipulated.width,
        imageHeight: manipulated.height,
      };
    }

    // ---------- STEP 6: MAP TO Nail ----------
    const nails = detections.map((det: any) => {
      const width = det.x2 - det.x1;
      const height = det.y2 - det.y1;

      const cx = det.x1 + width / 2;
      const cy = det.y1 + height / 2;
      const rx = width / 2;
      const ry = height / 2;

      let mask = "";

      if (Array.isArray(det.segments) && det.segments.length) {
        mask = `M ${det.segments[0].x} ${det.segments[0].y}`;
        for (let i = 1; i < det.segments.length; i++) {
          mask += ` L ${det.segments[i].x} ${det.segments[i].y}`;
        }
        mask += " Z";
      } else if (Array.isArray(det.segmentation) && det.segmentation.length) {
        mask = `M ${det.segmentation[0][0]} ${det.segmentation[0][1]}`;
        for (let i = 1; i < det.segmentation.length; i++) {
          mask += ` L ${det.segmentation[i][0]} ${det.segmentation[i][1]}`;
        }
        mask += " Z";
      } else {
        mask = `M ${cx - rx} ${cy}
                A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy}
                A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
      }

      return {
        box: { x: det.x1, y: det.y1, width, height },
        mask,
        confidence: det.confidence ?? 0,
      };
    });

    return {
      nails,
      processedImageUri: manipulated.uri,
      imageWidth: manipulated.width,
      imageHeight: manipulated.height,
    };

  } catch (err: any) {
    if (err.name === "AbortError") {
      console.warn(`${logPrefix} Request aborted`);
      throw new Error("Cancelled");
    }
    console.error(`${logPrefix} Detection error`, err);
    throw err;
  }
};
