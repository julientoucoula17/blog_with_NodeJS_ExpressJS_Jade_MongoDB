var xhr = null;
if (window.XMLHttpRequest) {
	xhr = new XMLHttpRequest();
} else if (window.ActiveXObject) {
	xhr = new ActiveXObject("Microsoft.XMLHTTP");
}
function load(arg){
	//alert(arg);
	 xhr.onreadystatechange = function (event) {
	 if (xhr.readyState == 4) {
		 	console.log("success");
		 }
	 }
	 xhr.open("POST", "/"+arg,true)
	 xhr.send(null)
 }
  document.body.onload = function() {

  		//Action Delecte an article
		 var myDiv = document.querySelector(".delete-article");
			if(myDiv){
				myDiv.addEventListener('click', function(event) {
					var target = event.target;
					const id = target.id;
					var xhttp = new XMLHttpRequest();

					xhr.onreadystatechange = function () {
						if (xhr.readyState == 4) {
						alert('Deleting Article');
						window.location.href='/';
							}
						}
						xhr.open("DELETE", "/articles/"+id,true)
						xhr.send(null)
	      });
			}

			//Action Like / Dislike an article
			var myDiv2 = document.querySelector(".like-article");
			 if(myDiv2){
				 myDiv2.addEventListener('click', function(event) {
					var target = event.target;
					const id = target.id;
					var xhttp = new XMLHttpRequest();
					xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {
						 //console.log("Article liked");
						 location.reload();
						}
					}
					xhr.open("POST", "/articles/"+id,true)
					xhr.send(null)

				 });
			 }
 			 }
