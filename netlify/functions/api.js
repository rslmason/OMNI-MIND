exports.handler = async (event, context) => {
    const { OPENAI_API_KEY } = process.env;
    console.log(OPENAI_API_KEY);
    return {
        statusCode: 200,
        body: JSON.stringify({
        myKey: 'foo'
        }),
    }
}