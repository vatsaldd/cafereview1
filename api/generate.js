export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get prompt from request
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  // Check if API key exists
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY environment variable not found" });
  }

  try {
    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 300,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    // Parse response
    const data = await response.json();

    // Log for debugging
    console.log("Groq Status:", response.status);
    console.log("Groq Response:", JSON.stringify(data));

    // Check for errors
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || JSON.stringify(data)
      });
    }

    // Extract text from response
    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      "No response generated.";

    // Return success response
    return res.status(200).json({ text });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}