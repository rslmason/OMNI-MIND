export default async function (req, context) {
  const $foobarbaz = Netlify.env("FOOBARBAZ");
  return new Response("Hellow Orld: " + $foobarbaz);
}