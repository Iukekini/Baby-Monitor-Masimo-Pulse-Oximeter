function updateRights(id, role, state){
    $.ajax({
        url: "/admin/updateRights/" + id + "/" + role + "/" + state
    }).done(function() {
        
    });  
};