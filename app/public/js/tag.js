function save_tag(){
  var el = document.getElementById("tags-select");
  $.ajax({
      url: "/tag/insertTag/" + el.options[el.selectedIndex].text
  }).done(function() {

  });
};
