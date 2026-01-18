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
export const detectNails = async (imageUri: string): Promise<Nail[]> => {
  try {
    // 1. Prepare the image as a Base64 data URI
    let base64Image: string;
    if (imageUri.startsWith('data:')) {
      base64Image = imageUri;
    } else {
      console.log("Preparing image for API: fetching URI...");
      const resp = await fetch(imageUri);
      const blob = await resp.blob();
      base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    const SPACE_URL = "https://nblvprasad-nailsegmentation.hf.space/gradio_api/call/predict";

    console.log("Starting Step 1: POST to Gradio Queue...");
    // Step 1: POST to initiate the task and get an event_id
    const postResponse = await fetch(SPACE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw new Error(`Queue initiation failed: ${postResponse.status} ${errorText}`);
    }

    const { event_id } = await postResponse.json();
    console.log(`Step 1 Success. Event ID: ${event_id}`);

    // Step 2: GET the result. We use await response.text() which will wait 
    // for the stream to complete. Since prediction is fast, the server 
    // will send the result and close the connection.
    console.log("Starting Step 2: Fetching result from stream...");
    const resultUrl = `${SPACE_URL}/${event_id}`;
    const getResponse = await fetch(resultUrl);

    if (!getResponse.ok) {
      throw new Error(`Result fetch failed: ${getResponse.status}`);
    }

    const streamText = await getResponse.text();
    console.log("Stream received fully.");

    // Parse the SSE stream text manually for "event: complete" and its associated data
    const lines = streamText.split('\n');
    let jsonData = null;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('event: complete')) {
        const dataLine = lines[i + 1];
        if (dataLine && dataLine.trim().startsWith('data: ')) {
          const jsonStr = dataLine.replace('data: ', '').trim();
          jsonData = JSON.parse(jsonStr);
          break;
        }
      }
    }

    if (!jsonData || !Array.isArray(jsonData)) {
      console.log("No result data found in stream. Check Space status.");
      // Improved fallback search for data: in any line
      const dataLineFallback = lines.find(l => l.trim().startsWith('data: ['));
      if (dataLineFallback) {
        jsonData = JSON.parse(dataLineFallback.replace('data: ', '').trim());
      } else {
        console.log("Full Stream Text Snippet:", streamText.substring(0, 300));
        return [];
      }
    }

    // result.data[1] is the JSON list of detected nail coordinates
    const bboxData = jsonData[1];

    if (!bboxData || !Array.isArray(bboxData)) {
      console.log("No nail predictions found in JSON data:", JSON.stringify(jsonData));
      return [];
    }

    return bboxData.map((det: any) => {
      const width = det.x2 - det.x1;
      const height = det.y2 - det.y1;

      const cx = det.x1 + width / 2;
      const cy = det.y1 + height / 2;
      const rx = width / 2;
      const ry = height / 2;

      const mask = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

      return {
        box: { x: det.x1, y: det.y1, width, height },
        mask: mask,
        confidence: det.confidence
      };
    });
  } catch (error) {
    console.error("Nail Detection Error:", error);
    return [];
  }
};
