const myKey = process.env.OPENAI_API_KEY;

exports.handler = async (event, context) => {
    
    console.log(myKey);
    return {
        statusCode: 200,
        body: JSON.stringify({
        myKey: 'foo'
        }),
    }
}