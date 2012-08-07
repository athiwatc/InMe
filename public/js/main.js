function getUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.hash); 
	return result && unescape(result[1]) || ""; 
}
var AccessToken = getUrlVar('access_token');
var nextURL = "https://api.instagram.com/v1/users/self/feed/?COUNT=15&access_token="+ServerToken;
var isLoading = false;

var container = $$({}, '<div class="container">');
$$.document.append(container);

if (ServerToken != "") {

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
	
	
	$.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url:  "https://api.instagram.com/v1/users/self/?&access_token="+ServerToken	,
        success:  function(data) {
		$("#username").text(data.data.full_name);
        if (data.data.full_name == "") $("#username").text(data.data.username);
		$("#logoutBox").attr("hidden", false);
	}});

} else if (AccessToken != "") {
	
	window.location = "/settoken/" + AccessToken;

} else {

	$("#loginBox").attr("hidden", false);
	$("#loginBtn").attr("href", "https://instagram.com/oauth/authorize/?display=touch&client_id="+ClientID+"&redirect_uri="+location.href+"&response_type=token");

}

$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
   if (isLoading == false) {
  		 isLoading = true;
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
		isLoading = false;
	}});
	}
   }
});



