// Just a utility I found to decode query string.
function url(key) {
  key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
  var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
  match = match || location.hash.match(new RegExp("[#&]"+key+"=([^&]+)(&|$)"));  
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

ACCESS_TOKEN_COOKIE_NAME = "access_token";

// Redirect the user if the access token has not been provided.
var accessToken = url("access_token") || Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
if (!accessToken) {
  authorize();
} else {
  // We got an access token. We can now request the user queue.
  Cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, { expires: 30 });  // 30 days period
  
  $.ajax({
    url: "https://api.nightbot.tv/1/me",
    type: "GET",
    headers: { Authorization: "Bearer " + accessToken },
    success: function (data) {
      var channelName = data.user.displayName;
      $('#req_url').text("beta.nightbot.tv/t/" + channelName + "/song_requests");
      update(); // Kick off the update loop.
    },
    error: function() {
      Cookies.remove(ACCESS_TOKEN_COOKIE_NAME);
      authorize();
    }
  });
  
  var $songRequest = $('#song_request');
  function update() {
    $.ajax({
      url: "https://api.nightbot.tv/1/song_requests/queue",
      type: "GET",
      headers: { Authorization: "Bearer " + accessToken },
      success: function(data) {
        if (data._currentSong) {
          $songRequest.text(data._currentSong.track.title + " &mdash; Requested by " + data._currentSong.user.displayName);
        } else if (data.queue && data.queue[0]) {
          $songRequest.text(data.queue[0].track.title + " &mdash; Requested by " + data.queue[0].user.displayName);
        } else {
          $songRequest.text("Could not retrieve Current Song.");
        }
      },
      error: function() { $songRequest.text("Could not retrieve Current Song."); },
      complete: function() { setTimeout(update, 3000); } // Schedule next update
    });
  }
}

function authorize() {
  var clientId ="336d223b29d038e6dca4c03d24b4ab93";
  var redirectUri = location.protocol + '//' + location.host + location.pathname;
  var responseType = "token";
  var scope = "song_requests_queue";
  window.location.replace("https://api.nightbot.tv/oauth2/authorize"
    + "?client_id=" + clientId
    + "&redirect_uri=" + redirectUri
    + "&response_type=" + responseType
    + "&scope=" + scope);
}
