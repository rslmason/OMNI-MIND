const myApiKey = process.env;

exports.handler = async (event, context) => {
    console.log(myApiKey);
    return {
        statusCode: 200,
        body: JSON.stringify({
        myKey: 'foo'
        }),
    }
}