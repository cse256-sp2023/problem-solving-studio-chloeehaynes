// ---- Define your dialogs  and panels here ----



// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 


// STUDIO: CALLING THE define_new_effective_permissions FUNCTION FROM view_helper.js
var new_permissions = define_new_effective_permissions("effective-permissions", true);

$('#sidepanel').append(new_permissions);
$('#effective-permissions').attr('filepath', '/C')
$('#effective-permissions').attr('username', 'administrator')
$('#effective-permissions').attr('filepath', '/C/presentation_documents/important_file.txt')

var new_user = define_new_user_select_field("new-user-select", "new user", function(selected_user) {
    $('#effective-permissions').attr('username', selected_user)

 })

$('#sidepanel').append(new_user);


var new_dialog = define_new_dialog("new-dialog");

$('.fa-info-circle').click(function(){
    console.log('clicked!');
    new_dialog.dialog('open');

    var filepath = $('#effective-permissions').attr('filepath')
    var username = $('#effective-permissions').attr('username')
    console.log(filepath, username);
    var icon = $(this)
    var info = $(icon).attr('permission_name')


    var allowed = allow_user_action(path_to_file[filepath], all_users[username], info, true)
    var dialog_content = get_explanation_text(allowed)
    $('#new-dialog').empty();
    $('#new-dialog').append(dialog_content);


})