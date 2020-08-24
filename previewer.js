const { remote } = require('electron');

var $dialogueBoxPrefab = $('<hgroup class="speech-bubble"><h1>Bubbles!</h1></hgroup>');
var data;
var nextNode;
var playerColor;

var globals = {};

function Init() {
    var win = remote.getCurrentWindow();

    $(window).on('keydown', function(event)
	{
		if (String.fromCharCode(event.which).toLowerCase() === 'f12' || event.which === 123) {
			win.webContents.openDevTools();
			return false;
		}
		else if (String.fromCharCode(event.which).toLowerCase() === 'f5' || event.which === 116) {
			win.reload()
			return false;
        }
		return true;
	});

    data = remote.getGlobal("current_dialogue").data;

    for (var i = 0; i < data.globals.length; i++) {
        globals[data.globals[i]] = null;
    }

    for (var i = 0; i < data.actors.length; i++) {
        if (data.actors[i].isPlayer) {
            playerColor = data.actors[i].color;
        }
    }

    if (data.nodes.length > 0) {
       LoadNode(data.nodes[0].id);
    }
}


function Update() {
    if (nextNode != null) {
        LoadNode(nextNode);
    }
    else {
        console.log("No Next Node!");
    }
}

function LoadActor(actorName) {
    var actors = data.actors;

    for (var i = 0; i < actors.length; i++) {
        if (actors[i].name == actorName) {
            return actors[i];
        }
    }
    return null;
}

function LoadNode(nodeID) {
    if (nodeID == null)
        return;

    var node = GetNodeById(nodeID);
    
    switch (node.type) {
        case "Text":
            LoadTextNode(node);
            break;
        case "Choice":
            LoadChoiceNode(node);
            break;
        case "Set":
            LoadSetNode(node);
            break;
        case "Branch":
            LoadBranchNode(node);
            break;
        default:
            break;
    }
}

function LoadSetNode(node) {
    globals[node.variable] = node.value;

    nextNode = node.next;
    setTimeout(Update, 800);
}

function LoadChoiceNode(node) {
    var choices = node.choices;

    var $button = $('<button type="button" class="choice-button"></button>');

    var count = Object.keys(choices).length;

    for (var i = 0; i < count; i++) {
        var $b = $button.clone();
        var t = Object.keys(choices)[i];

        $b.append('<h1>' + t +'</h1>');
        $('#choice-box').append($b);

        $b.bind('click', { nextNode: choices[t], text: t}, function(evt) {
            var data = evt.data;
            nextNode = data.nextNode;
            CreateBubble(data.text, true, playerColor);

            $('#choice-box').empty();

            setTimeout(Update, 800);
        });
    }
}

function LoadBranchNode(node) {
    var branches = node.branches;

    nextNode = branches[globals[node.variable]];
    setTimeout(Update, 800);
}

function CreateBubble(text, isPlayer, color) {
    var $speechBox = $dialogueBoxPrefab.clone();

    if (isPlayer) {
        $speechBox.attr("class", "speech-bubble left");
        $speechBox.css("float", "left");
    }
    else {
        $speechBox.attr("class", "speech-bubble right");
        $speechBox.css("float", "right");
    }

    $speechBox.text("");
    $speechBox.append('<h1>' + text + '</h1>');
    $speechBox.css("background", color);
    $speechBox.css("border-top-color", color);

    $('#paper').append($speechBox);
} 

function LoadTextNode(node) {
    var actor = LoadActor(node.actor);
    nextNode = node.next;

    CreateBubble(node.name, actor.isPlayer, actor.color);

    setTimeout(Update, 800);
}

function GetNodeById(nodeID) {
    for (var i = 0; i < data.nodes.length; i++) {
        if (data.nodes[i].id == nodeID) {
            return data.nodes[i];
        }
    }
    return null;
}

window.onload = Init;