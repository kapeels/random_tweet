// Dependencies
var https = require( 'https' );
var qs = require( 'querystring' );
var OAuth2 = require( 'oauth' ).OAuth2;
var config = require( './config.json' );

// Bootstrapping
var oauth2 = new OAuth2(
  config.consumer_key,
  config.consumer_secret,
  'https://api.twitter.com/',
  null,
  'oauth2/token'
);

// Helper function to get a random number in inclusive min to max range
function getRandomInt( min, max ) {
  return Math.floor( Math.random( ) * ( max - min ) ) + min;
}

// Helper function to find URLs in the media object
function getUrls( media ) {
  // Handle the case where there are multiple media objects
  if( media.length > 1 ) {
    var urls = '';
    for( var i = 0; i < media.length; i++ ) {
      urls += media[ i ].media_url_https + ' ';
    }
    return urls;
  }
  else {
    return media[ 0 ].media_url_https;
  }
}

// The main function that prints to the console, a random tweet for a keyword
function printARandomTweet( keyword ) {
  var query = qs.stringify( { q: keyword, count: 10 } );
  // Generate the bearer token with the app credentials
  oauth2.getOAuthAccessToken( '', {
      'grant_type': 'client_credentials'
    }, function ( error, access_token ) {
    if( !error ) {
      // Enable bearer token authorization for GET requests
      oauth2.useAuthorizationHeaderforGET( true );
      // Call Twitter Search API
      oauth2.get( 'https://api.twitter.com/1.1/search/tweets.json?' + query, access_token, function( error, response ){
        if( !error ) {
          var json_response = JSON.parse( response );
          var statuses = json_response.statuses;
          if( statuses.length > 0 ) {
            var random_number = getRandomInt( 0, statuses.length - 1 );
            var random_tweet = statuses[ random_number ];
            console.log( '@' + random_tweet.user.screen_name + ': ' + random_tweet.text );
            if( !!random_tweet.entities.media ) {
              var all_urls = getUrls( random_tweet.entities.media );
              console.log( 'media:', all_urls );
            }
          }
          else {
            console.error( 'Error occurred. No tweets found for the keyword: ' + keyword );
          }
        }
        else {
          console.error( 'Error occurred while searching for a random tweet. Details: ', error );
        }
      } );
    }
    else {
      console.error( 'Error occured while obtaining the bearer token. Details: ', error );
    }
  });

}

if( process.argv.length === 3 ) {
  printARandomTweet( process.argv[ 2 ] );
}
else if( process.argv.length < 3 ) {
  console.error( 'Error: Missing keyword. Run with `node random_tweet.js <keyword>`.' );
}
else {
  console.error( 'Invalid CLI options.' );
}
