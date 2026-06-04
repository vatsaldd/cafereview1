export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  // Get prompt from request
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt required"
    });
  }

  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY environment variable not found"
    });
  }

  try {
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 300
          }
        })
      }
    );

    // Parse response
    const data = await response.json();

    // Log for debugging
    console.log("Gemini Status:", response.status);
    console.log("Gemini Response:", JSON.stringify(data));

    // Check for errors
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || JSON.stringify(data)
      });
    }

    // Extract text from response
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No response generated.";

    // Return success response
    return res.status(200).json({
      text
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      error: error.message || "Internal Server Error"
    });
  }
}