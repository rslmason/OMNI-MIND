exports.handler = async (event, context) => {
    const { OPENAI_API_KEY } = process.env
    console.log('fii')
    return {
        statusCode: 200,
        body: JSON.stringify({
        myKey: 'foo'
        }),
    }
}