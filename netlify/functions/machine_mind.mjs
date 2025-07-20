export default async function (req, context) {
  const OPEN_AI_API_KEY = Netlify.env.get("OPEN_AI_API_KEY");
  const params = await req.json();
  try {
    const response = await fetch (
      `https://api.openai.com/v1/engines/${params.engine}/completions`,
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPEN_AI_API_KEY}`,
        },
        body: JSON.stringify(params.openai_params),
      }
    );
    const json = await response.json();
    return new Response(json.choices[0].text.trim());
  }
  catch (e) {
    return new Response(e.toString());
  }

}