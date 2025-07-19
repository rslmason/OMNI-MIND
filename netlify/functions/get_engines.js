export default async function (req, context) {
  const OPEN_AI_API_KEY = Netlify.env.get("OPEN_AI_API_KEY");
  return await fetch (
    'https://api.openai.com/v1/engines',
    {
      headers: {
        Authorization: `Bearer ${OPEN_AI_API_KEY}`,
      }
    }
  )
}