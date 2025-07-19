export default async function (req, context) {
  const $foobarbaz = Netlify.env.get("FOOBARBAZ");
  return new Response("Hellow Orld: " + $foobarbaz);
}