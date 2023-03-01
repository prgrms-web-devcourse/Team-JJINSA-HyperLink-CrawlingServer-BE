var exports = module.exports = {};

publishToChannel = async function(channel, {routingKey, exchangeName, data }) {
    await channel.publish(exchangeName, routingKey, new Buffer(JSON.stringify(data), 'utf-8'), {persistent : true});
}

exports.connectToChannelAndPublish = async function(connect, responses) {
    for(let i = 0; i < responses.length; i++) {
        const channel = await connect.createConfirmChannel();
        console.log(responses[i]);
        publishToChannel(channel, {
            routingKey : 'hello',
            exchangeName : 'crawling-test',
            data: responses[i]
        });
        await channel.close();
        console.log('Done!');
    }
}