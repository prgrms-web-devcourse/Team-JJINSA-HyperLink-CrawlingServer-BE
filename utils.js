var exports = module.exports = {};

publishToChannel = async function(channel, {routingKey, exchangeName, data }) {
    await channel.publish(exchangeName, routingKey, new Buffer(JSON.stringify(data), 'utf-8'), {persistent : true});
}

exports.connectToChannelAndPublish = async function(connect, responses) {
    for(let i = 0; i < responses.length; i++) {
        if(!responses[i].title || !responses[i].link && !responses[i].contentImgLink) continue;

        const channel = await connect.createConfirmChannel();
        console.log(responses[i]);
        publishToChannel(channel, {
            routingKey : 'hyperlink-dev',
            exchangeName : 'crawling-dev',
            data: responses[i]
        });
        await channel.close();
        console.log('Done!');
    }
}