export default async function (req, context) {
  const OPEN_AI_API_KEY = Netlify.env.get("OPEN_AI_API_KEY");
  try {
    const response = await fetch (
      'https://api.openai.com/v1/engines',
      {
        headers: {
          Authorization: `Bearer ${OPEN_AI_API_KEY}`,
        }
      }
    )
    return new Response(response.text()); // Seems like it should not be necessary to do this.
  }
  catch {
    return new Response("failed to get engines")
  }
}