export interface Nail {
  box: { x: number; y: number; width: number; height: number };
  // Path2D compatible string (SVG path data) or simplified polygon points
  mask: string; 
  confidence: number;
}

/**
 * Interface for the nail detection service.
 * In the future, this will call the actual model provided by the user.
 */
export const detectNails = async (imageSrc: string): Promise<Nail[]> => {
  // Simulate network/processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // MOCK DATA: Return a single nail near the center for testing UI
  // Real implementation will parse 'imageSrc' (base64) and run inference
  return [
    {
      box: { x: 100, y: 100, width: 50, height: 60 },
      // Simple oval path for testing
      mask: "M 125 100 C 138 100 150 110 150 130 C 150 155 138 160 125 160 C 112 160 100 155 100 130 C 100 110 112 100 125 100 Z",
      confidence: 0.95
    }
  ];
};
