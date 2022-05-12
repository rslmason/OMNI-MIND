// const { OPENAI_API_KEY } = process.env;

exports.handler = async (event, context) => {
    console.log(process.env.OPENAI_API_KEY);
    return {
        statusCode: 200,
        body: JSON.stringify({
        myKey: 'foo'
        }),
    }
}