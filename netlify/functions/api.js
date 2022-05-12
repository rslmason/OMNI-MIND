exports.handler = async (event, context) => {
    const { OPENAI_API_KEY } = process.env

    if (OPENAI_API_KEY) {
        myString = 'fii'
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
        myKey: myString
        }),
    }
}