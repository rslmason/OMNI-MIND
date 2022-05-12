const { OPENAI_API_KEY } = process.env

exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
        myKey: OPENAI_API_KEY
        }),
    }
}