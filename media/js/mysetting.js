//set all a tag's target to _blank

function alter_a_tag(tagname) {
	var a = document.getElementsByTagName(tagname);
	for (var i = 0; i < a.length; i++) {
		if (findstr(a[i].classList, 'noblank')) {
			a[i].target = '_blank';
		}
	}
}

function findstr(list, str) {
	for(var i = 0; i < list.length; ++i){
        if(list[i]===str){
            return true;
        }
    }
	return false;
}