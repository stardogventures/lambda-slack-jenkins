# lambda-slack-jenkins
Simple AWS lambda function to run jenkins jobs from a Slack slash command

# Setup instructions

- Set up API Gateway with a POST resource that uses this body mapping template for Content-Type `application/x-www-form-urlencoded`:
```
{
    "data": {
        #foreach( $token in $input.path('$').split('&') )
            #set( $keyVal = $token.split('=') )
            #set( $keyValSize = $keyVal.size() )
            #if( $keyValSize >= 1 )
                #set( $key = $util.urlDecode($keyVal[0]) )
                #if( $keyValSize >= 2 )
                    #set( $val = $util.urlDecode($keyVal[1]) )
                #else
                    #set( $val = '' )
                #end
                "$key": "$val"#if($foreach.hasNext),#end
            #end
        #end
    }
}
```

- Create a lambda function named `slack-jenkins` with the code from this repo
- Use the following env variables for the lambda function:
  - `JENKINS_TOKEN`: Jenkins token for the remote build
  - `JENKINS_JOB_PREFIX`: Prefix to be prepended before any job name, e.g. `deploy-`
  - `JENKINS_URL`: Base URL for your jenkins install (`https://jenkins.example.org`)
  - `SLACK_COMMAND`: Name of the Slack slash-command, e.g. `/deploy`
  - `SLACK_TOKEN`: Slack token from the slash command
- Create a Slack slash-command that posts to your API gateway POST resource
- Run your slash-command with parameters `/deploy <job> <target> <branch>`, the parameters `target` and `branch` will be passed in to the parameterized build on Jenkins side
