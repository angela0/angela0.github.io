//set all a tag's target to _blank

function alter_a_tag (tagname) {
	var a = document.getElementsByTagName(tagname);
	for (var i = 0; i < a.length; i++) {
		a[i].target = '_blank';
	};
}