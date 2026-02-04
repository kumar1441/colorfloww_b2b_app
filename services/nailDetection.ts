import * as ImageManipulator from 'expo-image-manipulator';

export interface Nail {
  box: { x: number; y: number; width: number; height: number };
  // Path2D compatible string (SVG path data) or simplified polygon points
  mask: string;
  confidence: number;
}

/**
 * Interface for the nail detection service.
 * Calls the Hugging Face YOLOv8 Nail Segmentation API.
 * Uses a manual two-step FETCH process to avoid Node.js dependencies in React Native.
 */
export const detectNails = async (imageUri: string, signal?: AbortSignal): Promise<Nail[]> => {
  const logPrefix = `[NailDetection ${new Date().toISOString().split('T')[1].split('.')[0]}]`;
  console.log(`${logPrefix} Starting detection for image: ${imageUri.substring(0, 50)}...`);

  try {
    // 1. Prepare and Optimize the image
    console.log(`${logPrefix} Step 1: Optimizing image...`);

    let base64Image: string;

    // Resize image to max 1024px to prevent OOM and speed up upload
    const manipulated = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!manipulated.base64) {
      throw new Error("Image manipulation failed: No base64 output.");
    }

    base64Image = `data:image/jpeg;base64,${manipulated.base64}`;
    console.log(`${logPrefix} Image optimized. New dimensions: ${manipulated.width}x${manipulated.height}`);

    const SPACE_URL = "https://nblvprasad-nailsegmentation.hf.space/gradio_api/call/predict";

    console.log(`${logPrefix} Step 2: POST to Gradio Queue...`);

    // Use the passed signal or create a default timeout signal
    let localController: AbortController | null = null;
    let requestSignal = signal;

    if (!requestSignal) {
      localController = new AbortController();
      requestSignal = localController.signal;
      // Default 15s timeout
      setTimeout(() => localController?.abort(), 15000);
    }

    let event_id: string;

    try {
      const postResponse = await fetch(SPACE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: requestSignal,
        body: JSON.stringify({
          data: [
            {
              url: base64Image,
              orig_name: "nail_capture.jpg",
              meta: { _type: "gradio.FileData" }
            }
          ]
        })
      });

      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.error(`${logPrefix} Step 2 Failed: ${postResponse.status} ${errorText}`);
        throw new Error(`Queue initiation failed: ${postResponse.status}`);
      }

      const postJson = await postResponse.json();
      event_id = postJson.event_id;
      console.log(`${logPrefix} Step 2 Success. Event ID: ${event_id}`);
    } catch (e: any) {
      if (e.name === 'AbortError' || (signal && signal.aborted)) {
        console.warn(`${logPrefix} Step 2 Aborted by user or timeout.`);
        throw new Error("Detection timed out or was cancelled.");
      }
      throw e;
    }

    // Step 3: GET the result.
    console.log(`${logPrefix} Step 3: Fetching result from stream...`);
    const resultUrl = `${SPACE_URL}/${event_id}`;

    const getResponse = await fetch(resultUrl, { signal: requestSignal });

    if (!getResponse.ok) {
      // Check if it's a 500 error immediately
      if (getResponse.status === 500) {
        throw new Error("Server error (500). The model might be overloaded.");
      }
      const errorText = await getResponse.text();
      console.error(`${logPrefix} Step 3 Failed: ${getResponse.status} ${errorText}`);
      throw new Error(`Result fetch failed: ${getResponse.status}`);
    }

    const streamText = await getResponse.text();
    console.log(`${logPrefix} Stream received fully. Length: ${streamText.length}`);

    // Parse the SSE stream text manually for "event: complete"
    const lines = streamText.split('\n');
    let jsonData = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('event: complete')) {
        // The data usually follows immediately
        const dataLine = lines[i + 1];
        if (dataLine && dataLine.trim().startsWith('data: ')) {
          const jsonStr = dataLine.replace('data: ', '').trim();
          try {
            jsonData = JSON.parse(jsonStr);
          } catch (parseError) {
            console.error(`${logPrefix} JSON Parse Error on complete event:`, parseError);
          }
          break;
        }
      }
    }

    // Fallback search
    if (!jsonData || !Array.isArray(jsonData)) {
      console.log(`${logPrefix} No standard 'event: complete' found. Scanning all lines...`);
      const dataLineFallback = lines.find(l => l.trim().startsWith('data: ['));
      if (dataLineFallback) {
        try {
          jsonData = JSON.parse(dataLineFallback.replace('data: ', '').trim());
        } catch (e) {
          console.error(`${logPrefix} Fallback JSON Parse Error:`, e);
        }
      }
    }

    if (!jsonData) {
      // Log a snippet for debugging
      console.warn(`${logPrefix} FAILED to extract JSON from stream. Snippet: ${streamText.substring(0, 200)}`);
      // Return empty array instead of throwing to avoid crashing everything, but log it as severe
      return [];
    }

    // result.data[1] is the JSON list of detected nail coordinates
    const bboxData = jsonData[1];

    if (!bboxData || !Array.isArray(bboxData)) {
      console.log(`${logPrefix} No nail predictions found in JSON data.`);
      return [];
    }

    console.log(`${logPrefix} Found ${bboxData.length} nails.`);

    return bboxData.map((det: any) => {
      const width = det.x2 - det.x1;
      const height = det.y2 - det.y1;

      const cx = det.x1 + width / 2;
      const cy = det.y1 + height / 2;
      const rx = width / 2;
      const ry = height / 2;

      // Use polygon segments if available for a natural shape, fallback to ellipse
      let mask = '';
      if (det.segments && Array.isArray(det.segments) && det.segments.length > 0) {
        const points = det.segments;
        mask = `M ${points[0].x} ${points[0].y}`;
        for (let j = 1; j < points.length; j++) {
          mask += ` L ${points[j].x} ${points[j].y}`;
        }
        mask += ' Z';
      } else if (det.segmentation && Array.isArray(det.segmentation) && det.segmentation.length > 0) {
        const points = det.segmentation;
        mask = `M ${points[0][0]} ${points[0][1]}`;
        for (let j = 1; j < points.length; j++) {
          mask += ` L ${points[j][0]} ${points[j][1]}`;
        }
        mask += ' Z';
      } else {
        // Fallback: Ellipse mask
        mask = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
      }

      return {
        box: { x: det.x1, y: det.y1, width, height },
        mask: mask,
        confidence: det.confidence
      };
    });
  } catch (error: any) {
    if (error.name === 'AbortError' || (signal && signal.aborted)) {
      console.warn(`${logPrefix} Detection process cancelled.`);
      throw new Error("Cancelled");
    }
    console.error(`${logPrefix} Critical Error:`, error);
    throw error;
  }
};
