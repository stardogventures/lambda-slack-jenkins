var https = require('https');

exports.handler = (event, context, callback) => {
    const slackToken = event.data.token;
    const username = event.data.user_name;
    const command = event.data.command;
    const params = event.data.text ? event.data.text.split(' ') : [];
    
    let error = undefined;
    if (slackToken !== process.env.SLACK_TOKEN) {
        error = 'Token does not match';
    } else if (command !== process.env.SLACK_COMMAND) {
        error = 'Unrecognized command: ' + command;
    } else if (params.length < 2) {
        error = 'Example usage: `' + process.env.SLACK_COMMAND + ' <module> <target> [<branch>]`';
    }
    
    if (error) {
        callback(null, {
            response_type: 'in_channel',
            text: error,
        });
    } else {
        const job = process.env.JENKINS_JOB_PREFIX + params[0];
        const target = params[1];
        const branch = params[2] ? params[2] : 'master';
        const url = process.env.JENKINS_URL + '/buildByToken/buildWithParameters?token='
            + process.env.JENKINS_TOKEN + '&job=' + job + '&target=' + target + '&branch=' + branch + '&username=' + username;
        https.get(url, function(result) {
            if (result.statusCode === 201) {
                callback(null, {
                    response_type: 'in_channel',
                    text: 'Running `' + job + '`, target `' + target + '`, branch `' + branch + '`.'
                });
            } else {
                callback(null, {
                    response_type: 'in_channel',
                    text: 'Received error code `' + result.statusCode + '` from url: ' + url
                });
            }
        });
    }
};
