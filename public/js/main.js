var ClientID = 'de6f95b7322f49c7b8156fbf8e8a5292'
if(location.href.match(":9000")) {
	ClientID = '87ce87f5fd3645cca784116b3ad28860';
}

function getUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.hash); 
	return result && unescape(result[1]) || ""; 
}
var AccessToken = getUrlVar('access_token');
var nextURL = "https://api.instagram.com/v1/users/self/feed/?COUNT=19&access_token="+AccessToken;


var container = $$({}, '<div class="container">');
$$.document.append(container);

if (AccessToken != "") {
	$.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: nextURL,
        success:  function(data) {
        nextURL = data.pagination.next_url;
		for (var i = 0; i < data.data.length; i++) {
			var temp = $$({}, "<img src='" + data.data[i].images.low_resolution.url +"'>");
			container.append(temp);
		}
	}});



} else {

var loginButton = $$({text: "Login"}, '<div id="loginBtn" class="btn btn-primary" data-bind="text">',
{
	'click &': function(){
		window.location.href = "https://instagram.com/oauth/authorize/?display=touch&client_id="+ClientID+"&redirect_uri="+location.href+"&response_type=token";
	}
});
container.append(loginButton);

}

$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
   	alert("TEST");
       $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: nextURL,
        success:  function(data) {
        nextURL = data.pagination.next_url;
		for (var i = 0; i < data.data.length; i++) {
			var temp = $$({}, "<img src='" + data.data[i].images.low_resolution.url +"'>");
			container.append(temp);
		}
	}});
   }
});



