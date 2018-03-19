'use strict';

var meeting;
var host = HOST_ADDRESS; // HOST_ADDRESS gets injected into room.ejs from the server side when it is rendered

$( document ).ready(function() {
	var username = $("#username")[0].innerText;
	var roomid = $("#roomid")[0].innerText;
	/////////////////////////////////
	// CREATE MEETING
	/////////////////////////////////
	meeting = new Meeting(host);
	
	meeting.onLocalVideo(function(stream) {

	    document.querySelector('#localVideo').srcObject = stream;

	    $("#micMenu").on("click", function callback(e) {
	        toggleMic();
	    });

	    $("#videoMenu").on("click", function callback(e) {
	        toggleVideo();
	    });

	    var source = document.getElementById("join-room-tpl").innerHTML;
	    var template = Handlebars.compile(source);
	    var data = { username: username };
	    var html = template(data);
	    $("#chat-box").append(html);

	    $("#send").on("click", function() {
	        var data = {
	            from: username,
	            message: $("#message").val()
	        };
	        var sendthing = JSON.stringify(data);
	        meeting.sendChatMessage(sendthing);

		    var source = document.getElementById("send-msg-tpl").innerHTML;
		    var template = Handlebars.compile(source);
		    var html = template(data);
		    $("#chat-box").append(html);
		    var div = $(".card")[0];
		    div.scrollTop = div.scrollHeight;
		    $("#message").val("");
	    });
	    // $("#localVideo").prop('muted', true);

	});
	
	meeting.onRemoteVideo(function(stream, participantID) {
	        addRemoteVideo(stream, participantID);  
	        var memarr = new Array();
	        $("[id^='memroom_']").each(function(){
	        	memarr.push($(this).innerText);
	        });
	        if (memarr.indexOf(participantID)==-1) {
	        	$("#memberslist").append('<li class="collection-item" id="memroom_'+participantID+'">'+participantID+'</li>');
		        var source = document.getElementById("join-room-tpl").innerHTML;
			    var template = Handlebars.compile(source);
			    var data = { username: participantID };
			    var html = template(data);
			    $("#chat-box").append(html);
			}
	    }
	);
	
	meeting.onParticipantHangup(function(participantID) {
			// Someone just left the meeting. Remove the participants video
			removeRemoteVideo(participantID);
			$("#memroom_"+participantID).remove();
			var source = document.getElementById("leave-room-tpl").innerHTML;
		    var template = Handlebars.compile(source);
		    var data = { username: participantID };
		    var html = template(data);
		    $("#chat-box").append(html);
		}
	);
    
    meeting.onChatReady(function() {

        
        console.log("Chat is ready");
    });

	meeting.onChatMessage(function(data) {
		
		var datatpl = JSON.parse(data);
		datatpl = JSON.parse(datatpl);
		var source   = document.getElementById("receive-msg-tpl").innerHTML;
		var template = Handlebars.compile(source);
		var html    = template(datatpl);
		$("#chat-box").append(html);
	});
	
    // var room = window.location.pathname.match(/([^\/]*)\/*$/)[1];
	meeting.joinRoom(roomid,username);

}); // end of document.ready

function addRemoteVideo(stream, participantID) {
    var $videoBox = $("<div class='videoWrap' id='"+participantID+"'></div>");
    var $video = $("<video class='videoBox' autoplay playsinline></video>");

    $video[0].srcObject=stream;
    $videoBox.append($video);
	$("#videosWrapper").append($videoBox);

	adjustVideoSize();
	
}

function removeRemoteVideo(participantID) {
	$("#"+participantID).remove();
	adjustVideoSize();
}

function adjustVideoSize() {
	var numOfVideos = $(".videoWrap").length; 
	if (numOfVideos>2) {
		var $container = $("#videosWrapper");
		var newWidth;
		for (var i=1; i<=numOfVideos; i++) {
			newWidth = $container.width()/i;
			
			// check if we can start a new row
			var scale = newWidth/$(".videoWrap").width();
			var newHeight = $(".videoWrap").height()*scale;
			var columns = Math.ceil($container.width()/newWidth);
			var rows = numOfVideos/columns;
			
			if ((newHeight*rows) <= $container.height()) {
				break;
			}
		}
		
		var percent = (newWidth/$container.width())*100;
		$(".videoWrap").css("width", percent-5+"%");
		$(".videoWrap").css("height", "auto"); 

		
		//var numOfColumns = Math.ceil(Math.sqrt(numOfVideos));
		var numOfColumns;
		for (var i=2; i<=numOfVideos; i++) {
			if (numOfVideos % i === 0) {
				numOfColumns = i;
				break;
			}
		}
	    $('#videosWrapper').find("br").remove();
		$('.videoWrap:nth-child('+numOfColumns+'n)').after("<br>");
	} else if (numOfVideos == 2) {
		$(".videoWrap").width('auto');
		$("#localVideoWrap").css("width", 20+"%");
		$('#videosWrapper').find("br").remove();
	} else {
		$("#localVideoWrap").width('auto');
		$('#videosWrapper').find("br").remove();
	}
}