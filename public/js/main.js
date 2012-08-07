

var ClientID = 'de6f95b7322f49c7b8156fbf8e8a5292'

if(location.href.match(":9000")) {
	ClientID = '87ce87f5fd3645cca784116b3ad28860';
}



var container = $$({}, '<div class="container">');
var loginButton = $$({text: "Login"}, '<div id="loginBtn" class="btn btn-primary" data-bind="text">',
{
	'click &': function(){
		window.location.href = "https://instagram.com/oauth/authorize/?display=touch&client_id="+ClientID+"&redirect_uri="+location.href+"oauth&response_type=token";
	}
});
container.append(loginButton);

$$.document.append(container);