export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({
error: "Method not allowed"
});
}

const { prompt } = req.body;

if (!prompt) {
return res.status(400).json({
error: "Prompt required"
});
}

// Check if API key exists
if (!process.env.CLAUDE_API_KEY) {
return res.status(500).json({
error: "CLAUDE_API_KEY environment variable not found"
});
}

try {
const response = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"x-api-key": process.env.CLAUDE_API_KEY,
"anthropic-version": "2023-06-01",
"content-type": "application/json"
},
body: JSON.stringify({
model: "claude-3-5-sonnet-20241022",
max_tokens: 120,
messages: [
{
role: "user",
content: prompt
}
]
})
});

```
const data = await response.json();

console.log("Claude Status:", response.status);
console.log("Claude Response:", JSON.stringify(data));

if (!response.ok) {
  return res.status(response.status).json({
    error: data.error?.message || JSON.stringify(data)
  });
}

const text =
  data.content?.[0]?.text?.trim() ||
  "No response generated.";

return res.status(200).json({
  text
});
```

} catch (error) {
console.error("Server Error:", error);

```
return res.status(500).json({
  error: error.message || "Internal Server Error"
});
```

}
}
