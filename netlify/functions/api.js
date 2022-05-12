const { OPENAI_API_KEY } = process.env

if (OPENAI_API_KEY)

exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
        myKey: 'foo'
        }),
    }
}