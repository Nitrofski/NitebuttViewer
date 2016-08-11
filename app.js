// Just a utility I found to decode query string.
function url(key) {
  key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
  var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

// Redirect the user if the access token has not been provided.
var accessToken = url("access_token");
if (!accessToken) {
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

// We got an access token. We can now request the user queue.
$.ajax({
  url: "https://api.nightbot.tv/1/me",
  type: "GET",
  headers: { Authorization: "Bearer " + accessToken },
  success: function (data) {
    var channelName = data.user.displayName;
    $('#req_url').text("beta.nightbot.tv/t/" + channelName + "/song_requests");
  }
});

var $songRequest = $('#song_request');
function update() {
  $.ajax({
    url: "https://api.nightbot.tv/1/song_requests/queue",
    type: "GET",
    headers: { Authorization: "Bearer " + accessToken },
    success: function(data) { alert(data); },
    complete: function() { setTimeout(update, 3000); } // Schedule next call
  });
}

update();