

$(document).ready(function() {
  var titleList = [];
  var artistList = [];
  var imgList = [];
  var linkList = [];
  var queueList = [];
  var idList = [];
  var durationList = [];
  var maxLength = 25
  var hyphenRemove = /^[^-]*-/;
  var currentIndex = 0;
  var username = "";
  var subSection = "";
  var clientID = "819c776ce6c1d80e0b0f7c04f19ffdb5";
  var limit = "&limit=200";
  var apiurl = "";
  var pages = [];
  var pageNumber = 0;
  var playing = false;



var addToQueue = function(){
        $(".track").off("click").on("click", function() {
        var thisDiv = $(this);
        socket.emit('song send', {
          "artistName": thisDiv.find(".artistName").text(),
          "titleName": thisDiv.find(".titleName").text(),
          "songId": parseInt(thisDiv.attr('id'), 10),
          "songImg": thisDiv.children('img').attr('src'),
          "duration": thisDiv.find('.duration').text()
        });

        //API Post Function
        $.post('/api/songsqueued', {
          "artistName": thisDiv.find(".artistName").text(),
          "titleName": thisDiv.find(".titleName").text(),
          "songId": this.id,
          "songImg": thisDiv.children('img').attr('src'),
          "duration": thisDiv.find('.duration').text(),
        });
        if (queueList.length == 0) {
          queueList.push(this.id);
          playTrack(0);

        } else {
          queueList.push(this.id);
        }
        $(this).addClass("animated pulse");
        var songId = this.id;
        // console.log(songId)
        var cloned = $(this).clone();
        // cloned.attr("data-songid", songId)
        cloned.attr("id", queueList.length - 1);
        $("<span class = 'soundHover'><div class='soundMove'><i class='moveUp fa fa-arrow-up'></i><i class='moveDown fa fa-arrow-down'></div></i><span class='deleteQueue'><i class='fa fa-times'></i></span><span data-songid='" + songId + "' class='likeSound'><i class='fa fa-heart-o'></i></span></span>").prependTo(cloned);
        $(cloned).appendTo(".queueListDiv").addClass("animated flipInX, queueTrack").removeClass('track');
        $(cloned).find('.top10Rating').html('')

        deleteFromQueue();
        moveItUp();
        moveItDown();
        hideOrShowArrows(currentIndex)
        allowLike();

      });

};

setInterval(addToQueue, 1000);





  //FUNCTION TO GET DURATION
  function duration(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  //START SC

  SC.initialize({
    client_id: '819c776ce6c1d80e0b0f7c04f19ffdb5'

  });


  function getAPIURL(username, subSection) {
    apiurl = "https://api.soundcloud.com/users/" + username + "/" + subSection + "/?client_id=" + clientID + limit + "&linked_partitioning=1"
    getAPI(apiurl);
  };

//Socket Emit for ArtistFeed
function sendArtistFeed(username){
  socket.emit('artist send', username);
  return false;

}

function clearTracksDiv(){
    titleList.length = 0;
    artistList.length = 0;
    imgList.length = 0;
    idList.length = 0;
    durationList.length = 0;
    $(".trackList").html("");

}

  function getFavorites() {
    clearTracksDiv();
    username = $("input[name=userSearch]:visible").val();
    subSection = "favorites";
    getAPIURL(username, subSection);

  }

  function getTracks() {
    clearTracksDiv();
    username = $("input[name=userSearch]:visible").val();
    subSection = "tracks";
    getAPIURL(username, subSection);
  }

  //SEARCH EVENTS
  $("input").on("keydown", function search(e) {
    if (e.keyCode == 13) {
      // console.log("pressed")
      getFavorites();
    }
  });

  function clearQueue() {
    playing = false;
    currentIndex = 0;
    queueList.length = 0;
    randomTitleList.length = 0;
    randomArtistList.length = 0;
    randomImgList.length = 0;
    randomLinkList.length = 0;
    randomQueueList.length = 0;
    randomIdList.length = 0;
    randomDurationList.length = 0;
    randomPermalinkList.length = 0;
    $(".queueListDiv").html("");
  }
  $(".getFavorites:visible").off("click").on("click", getFavorites);
  $(".getTracks:visible").off("click").on("click", getTracks);
  $(".clearQueue:visible").off("click").on("click", clearQueue);

  function getAPI(apiurl) {
    $("input").addClass("infinite animated pulse")
    $("input").removeClass("form-control-red, form-control-green, intro, introTitle");
    // console.log(apiurl)
    $.getJSON(apiurl, function(data) {

      for (var prop in data.collection) {
        titleList.push(data.collection[prop].title);
        idList.push(data.collection[prop].id);
        imgList.push(data.collection[prop].artwork_url);
        artistList.push(data.collection[prop].user.username);
        linkList.push(data.collection[prop].permalink_url);
        durationList.push(data.collection[prop].duration);

      }
      for (var i = 0; i < imgList.length; i++){
          var replaceIndex = imgList.indexOf(null);
          if (replaceIndex !== -1){
          imgList[replaceIndex] = "https://dl.dropboxusercontent.com/s/umii60ppte3smn4/gigipicsquare.jpg?dl=0"
          }
      }
      for (var i = 0; i < titleList.length; i++) {
        titleList[i] = titleList[i].replace(hyphenRemove, "").substr(0, maxLength);
        if (titleList[i].length == maxLength) {
          titleList[i] += "...";
        }

        $("<div class='track' id='" + idList[i] + "'><img class='imgclass' src='" + imgList[i] + "'/>" + "<p class='artistName'>" + artistList[i] + "</p>" + "<br><h1 class='titleName'>" + titleList[i] + "</h1><br><p class='duration'>" + duration(durationList[i]) + "</p></div>").appendTo(".trackList");
      };


      //PAGINATION
      if (pages.indexOf(data.next_href) == -1) {
        if (data.next_href) {
          pages.push(data.next_href);
          // console.log(pages);
        }
      }
      if (pageNumber < pages.length) {
        $(".nextPage").off("click").on("click", function() {
          titleList.length = 0;
          artistList.length = 0;
          imgList.length = 0;
          idList.length = 0;
          durationList.length = 0;
          $(".trackList").empty();
          getAPI(pages[pageNumber]);
          pageNumber += 1;
          // console.log(pageNumber)


        })
      }

      $(".prevPage").off("click").on("click", function() {
        if (pageNumber > 0) {

          // console.log(pageNumber)
          titleList.length = 0;
          artistList.length = 0;
          imgList.length = 0;
          idList.length = 0;
          durationList.length = 0;
          $(".trackList").empty();
          pageNumber -= 1;
          getAPI(pages[pageNumber - 1]);
        }
        if (pageNumber == 0) {
          pageNumber = 0;
          getFavorites();
        }
      })

      //end JSON
    }).error(function(){
      $("input").removeClass("form-control-green").addClass("form-control-red").removeClass("infinite animated pulse")
    })
      .success(function(){
        $("input").addClass("form-control-green").removeClass("infinite animated pulse form-control-red")
        var username = $("input[name=userSearch]:visible").val();
        sendArtistFeed(username);
      });

  };



//START WIDGET
  var iframe = document.querySelector('iframe.player');
  var sc = SC.Widget(iframe);

  function playTrack(index) {
    sc.load("https://api.soundcloud.com/tracks/" + queueList[index], {
      auto_play: true,
    });
    playing = true;
    setTimeout(function(){
      $(".playerText").html($("#" + index + " .artistName").text() + " - "  + $("#" + index + " .titleName").text())
    }, 0);
    currentIndex = index;
    hideOrShowArrows(currentIndex)
  }

  function play() {
    sc.play();
  }

  function pause() {
    sc.pause();
  }

  function togglePlay() {
    sc.toggle();
  }

  function playPrevious() {
    var previousIndex = currentIndex - 1;
    playTrack(previousIndex);
  }

  function playNext() {
    removeFromQueue(currentIndex);

    var nextIndex = currentIndex + 1;
    playTrack(nextIndex);

  }

  function removeFromQueue(index) {
    $("#" + (index)).remove()


  }

  function deleteFromQueue() {
    $(".deleteQueue").off("click").on("click", function() {
      var deletedId = parseInt($(this).closest("div").attr("id"), 10);
      //SUBRACT 1 FROM ALL ID'S > THAN DELETED TO KEEP ORDER
      $(".queueListDiv .queueTrack").each(function(){
        var otherId = parseInt($(this).attr("id"))
        if(otherId > deletedId){
          $(this).attr("id", otherId - 1)
        }
      })
      queueList.splice(deletedId, 1);
      // console.log(queueList);
      removeFromQueue(deletedId)

    })
  }

  function onTrackFinished() {
    playNext();
  }

//MOVE TRACK IN QUEUE
  function arrayMoveDown(arr, fromIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(fromIndex + 1, 0, element)
  }

  function arrayMoveUp(arr, fromIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(fromIndex - 1, 0, element)
  }
  function moveItUp() {

    $(".moveUp").off("click").on("click", function() {
      var moveUpId = parseInt($(this).parents("div").eq(1).attr("id"), 10);
      if(moveUpId <= currentIndex + 1){
        $(this).toggleClass("animated shake");
      }
      else{
      $("#" + moveUpId).insertBefore("#" + (moveUpId - 1))
      //Little hack to swap ID's of tracks on move
      $("#" + (moveUpId - 1)).attr("id", "changingfam");

      $("#" + moveUpId).attr("id", moveUpId - 1);
      $("#changingfam").attr("id", moveUpId);

      // console.log("moveupClicked")
      // console.log(moveUpId)
      // console.log(queueList)
      arrayMoveUp(queueList, moveUpId)
      // console.log(queueList)
      hideOrShowArrows(currentIndex)

      }
    })
  }
  function moveItDown() {
    $(".moveDown").off("click").on("click", function() {
      var moveDownId = parseInt($(this).parents("div").eq(1).attr("id"), 10);
      if(moveDownId == currentIndex || moveDownId == queueList.length -1){
        $(this).toggleClass("animated shake");
      }
      else{
        $("#" + moveDownId).insertAfter("#" + (moveDownId + 1));
        $("#" + (moveDownId + 1)).attr("id", "changingfam")
        $("#" + moveDownId).attr("id", moveDownId + 1);
        $("#changingfam").attr("id", moveDownId);

        // console.log("moveDownClicked")
        // console.log(queueList);
        arrayMoveDown(queueList, moveDownId)
        // console.log(queueList);
        hideOrShowArrows(currentIndex)

      }
    })
  }


//Condition to remove arrows from song playing
function hideOrShowArrows(index){
  var hiddenId = parseInt($(".queueListDiv .queueTrack").first().attr("id"), 10);
  var lastId = parseInt($(".queueListDiv .queueTrack").last().attr("id"), 10);
  $("#" + lastId + " .fa-arrow-down").hide()
  // console.log("hiddenId = " + hiddenId + currentIndex)
    if(index == hiddenId){
      // console.log("true son")
      $("#" + hiddenId + " .soundMove").hide();
      $("#" + (hiddenId + 1) + " .fa-arrow-up").hide();
      $("#" + (hiddenId + 1) + " .fa-arrow-down").show();
    }
    if((hiddenId + 1) == lastId){
     $("#" + (hiddenId + 1) + " .fa-arrow-down").hide();
    }
  $(".queueListDiv .queueTrack").each(function(){
    var otherId = parseInt($(this).attr("id"))
    if (otherId > (hiddenId + 1) && otherId !== lastId){
      $("#" + otherId + " .soundMove").show()
      $("#" + otherId + " .fa-arrow-up").show()
      $("#" + otherId + " .fa-arrow-down").show()
    }
  })
}
  hideOrShowArrows(currentIndex)

//SC Connect
$('.connectSoundcloud').off('click').on('click', function(){
  var win = window.open("/auth/soundcloud", "SC_Window", strWindowFeatures);
  var pollTimer = setInterval(function(){
    if(win.closed !== false){
      clearInterval(pollTimer);
      // console.log('running check for user')
      $.getJSON('/user', function(data){
        var subSection = 'favorites';
        var username = data.permalink;
        $("input[name=userSearch]:visible").val(username)
        clearTracksDiv();
        getAPIURL(username, subSection);
      }).success($('.connectSoundcloud').addClass('chosenButtonSoundcloud').text('We Connected, Fam'))
    }
  }, 200)
})

function checkForSession(){
  // console.log('checking for user')
  $.ajax({
    url: '/user',
    dataType: 'json',
    success: function(data){
        var subSection = 'favorites';
        var username = data.permalink;
        $("input[name=userSearch]:visible").val(username)
        clearTracksDiv();
        getAPIURL(username, subSection);
        $('.connectSoundcloud').addClass('chosenButtonSoundcloud').text('We Connected, Fam')
      },
    error: function(data){
      // console.log('error')
    }
  })
}
checkForSession();

//SC Liking

var windowObjectReference;
var strWindowFeatures = "width=420,height=230,resizable,scrollbars=yes,status=1";

function allowLike(){
  $('.likeSound').off('click').on('click', function(){

    // console.log('clicked like');
    thisDiv = $(this);
    $.getJSON('/user', function(data){

      var token = data.token;
      songId = thisDiv.data("songid");

      $.ajax({
            url: 'https://api.soundcloud.com/me/favorites/' + songId + '?oauth_token=' + token,
            type: 'PUT',
            success: function(result) {
              thisDiv.closest('.likeSound').addClass('soundLiked');
                // console.log('u liked' + songId)
            },
            error: function(){
              windowObjectReference = window.open("/auth/soundcloud", "SC_Window", strWindowFeatures);
            }
        });
    }).error(function(){
      // console.log('getJSON error');
      windowObjectReference = window.open("/auth/soundcloud", "SC_Window", strWindowFeatures);
    });
  })
}

  sc.bind(SC.Widget.Events.READY, function() {

    $(".play").off("click").on("click", play);
    $(".pause").off("click").on("click", pause);
    $(".forward").off("click").on("click", playNext);
    $(".backward").off("click").on("click", playPrevious);
    $(document).on("keydown", function(spc) {
      if (spc.keyCode == 32) {
        // console.log("pressed space")
        togglePlay();
      }
    })
    sc.bind(SC.Widget.Events.FINISH, onTrackFinished)

//Condition to Clear All if last song finishes
  sc.bind(SC.Widget.Events.FINISH, function(){
    if(currentIndex == queueList.length){
    removeFromQueue(currentIndex)
    queueList.length = 0;
    currentIndex = 0;
  }
  })

  });
  //RANDOM 20 CODEZ
  var randomTitleList = [];
  var randomArtistList = [];
  var randomImgList = [];
  var randomLinkList = [];
  var randomQueueList = [];
  var randomIdList = [];
  var randomDurationList = [];
  var randomPermalinkList = [];
  var genre = "trap";
  var playCount = 0;
  var likeCount = 0;
  var repostCount = 0;
  var randomAPIURL = "";
  var offset = 0;
  var durationLimit = 480000
  var durationMin = 200000

  //Random for Offset
  //Do shit here time to party


  function getRandom(randomAPIURL) {
    $.getJSON(randomAPIURL, function(data) {
      var mixesOkay = $("#mixesOkay").is(":checked");
      // console.log(mixesOkay)
      if(mixesOkay){durationLimit = 100000000}
      else if(!mixesOkay){durationLimit = 480000}
      for (var prop in data.collection) {


        if (randomTitleList.length == 20) {
          break;
        }
        if (prop == 150 && randomTitleList.length < 20) {

          getRandom(data.next_href)
          // console.log(data.next_href)
          // console.log(randomTitleList)
          // console.log(randomTitleList.length)
        }

        if (data.collection[prop].likes_count > 100 && data.collection[prop].duration > durationMin && data.collection[prop].duration < durationLimit) {
          randomTitleList.push(data.collection[prop].title);
          randomIdList.push(data.collection[prop].id);
          randomImgList.push(data.collection[prop].artwork_url);
          randomArtistList.push(data.collection[prop].user.username);
          randomLinkList.push(data.collection[prop].permalink_url);
          randomDurationList.push(data.collection[prop].duration)
          randomPermalinkList.push(data.collection[prop].permalink_url);
        }
      }

      for (var i = 0; i < randomTitleList.length; i++) {
        randomTitleList[i] = randomTitleList[i].replace(hyphenRemove, "").substr(0, maxLength);
        if (randomTitleList[i].length == maxLength) {
          randomTitleList[i] += "...";
        }

        queueList.push(randomIdList[i]);

        $("<div class='track' id='" + (queueList.length - 1) + "'><span class = 'soundHover'><div class='soundMove'><i class='moveUp fa fa-arrow-up'></i><i class='moveDown fa fa-arrow-down'></div></i><span class='deleteQueue'><i class='fa fa-times'></i></span><span data-songid='" + randomIdList[i] + "' class='likeSound'><i class='fa fa-heart-o'></i></span></span><img src='" + randomImgList[i] + "'/>" + "<p class='artistName'>" + randomArtistList[i] + "</p>" + "<br><a href='" + randomPermalinkList[i] + "' target = '_blank'><h1 class='titleName'>" + randomTitleList[i] + "</h1></a><br><p class='duration'>" + duration(randomDurationList[i]) + "</p></div>").appendTo(".queueListDiv").removeClass('track').addClass('queueTrack')


        console.log(queueList)
      }
        if (!playing){
        playTrack(currentIndex);
        }
        deleteFromQueue();
        moveItUp();
        moveItDown();
        hideOrShowArrows(currentIndex)
        allowLike();

    })
  }

  //Clear Arrays for new button push
  function clearRandomArrays(){
    randomTitleList.length = 0;
    randomArtistList.length = 0;
    randomImgList.length = 0;
    randomLinkList.length = 0;
    randomQueueList.length = 0;
    randomIdList.length = 0;
    randomDurationList.length = 0;
    randomPermalinkList.length = 0;
  }

  $(".randomTrack").off("click").on("click", function() {
    clearRandomArrays();
    offset = Math.floor(Math.random() * 1000);
    genre = $(this).attr("id");
    randomAPIURL = "http://api.soundcloud.com/tracks?genres=" + genre + "&created_at=last_year&limit=200&offset=" + offset + "&client_id=" + clientID + "&linked_partitioning=1";
    getRandom(randomAPIURL);

    // console.log(randomTitleList.length);
    // console.log(randomTitleList)
    // console.log(randomAPIURL)
  });


//CODE FOR FEED AND STUFFS

var top10TitleList = [];
var top10ArtistList = [];
var top10ImgList = [];
var top10IdList = [];
var top10RatingList = [];
var top10DurationList = [];

function clearTop10(){
  top10TitleList.length = 0;
  top10ArtistList.length = 0;
  top10ImgList.length = 0;
  top10IdList.length = 0;
  top10RatingList.length = 0;
  top10DurationList.length = 0;
  $('#top10Tracks').html('');
}





  $.getJSON('/api/songsqueued/top10', function(data, listTop10) {
    clearTop10();
    console.log(data);

    for (var prop in data){
      top10TitleList.push(data[prop].titleName);
      top10ArtistList.push(data[prop].artistName);
      top10IdList.push(data[prop].songId);
      top10ImgList.push(data[prop].songImg);
      top10RatingList.push(data[prop].queueTimes);
      top10DurationList.push(data[prop].duration);
    }
    console.log(top10ArtistList);

  }).success(function(){
      console.log("getJSON Success")
      for(var i = 0; i < top10ArtistList.length; i++){
        $("<div class='track' id='" + top10IdList[i] + "'><img class='imgclass' src='" + top10ImgList[i] + "'/>" + "<p class='artistName'>" + top10ArtistList[i] + "</p>" + "<br><h1 class='titleName'>" + top10TitleList[i] + "</h1><p class='top10Rating'>Queued: " + top10RatingList[i] + " times</p><br><p class='duration'>" + top10DurationList[i] + "</p></div>").appendTo("#top10Tracks");
      };
      $('#top10Button').addClass("chosenButton")

    }).error(function(){
      console.log("getJSON error")
    });

//FEED
var socket = io('http://localhost:8000');
socket.on('song send', function(song){
  $("<div class='track' id='" + song.songId + "'><img class='imgclass' src='" + song.songImg + "'/>" + "<p class='artistName'>" + song.artistName + "</p>" + "<br><h1 class='titleName'>" + song.titleName + "</h1><br><p class='duration'>" + song.duration + "</p></div>").prependTo("#queueFeedTracks");
});

socket.on('artist send', function(artist){
  if($('#artistFeedName').html() == artist){
    // console.log("artist in there")
    return;
  }
  else{
    $('.artistFeed h3').addClass('animated fadeOut');
    $('.artistFeed h3').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      $('.artistFeed h3').remove();
    });
    $('.artistFeed h1').addClass('animated fadeOut');
    $('.artistFeed h1').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      $('.artistFeed h1').remove();
      $('.artistFeed').append($('<h1 id="artistFeedName" class = "animated fadeIn">').text(artist))
      getAristFromFeed();
    });
  }

});


function getAristFromFeed(){
  $("#artistFeedName").on("click", function(){
    // console.log("artistFeed clicked")
    var username = $(this).text();
    $("input[name=userSearch]:visible").val(username)
    clearTracksDiv();
    getAPIURL(username, "favorites");
  })
};
//TOP10 BUTTON
//HIDE ALL CONTENTS ON LOAD
  $('#random20Tracks').hide();
  $('#queueFeedTracks').hide();
  $('#top10Tracks').show();
$('#top10Button').off("click").on("click", function(){

  $('#top10Tracks').show();
  $('#random20Tracks').hide();
  $('#random20Button').removeClass("chosenButton");
  $('#queueFeedTracks').hide();
  $('#feedButton').removeClass("chosenButton");
});
//FEED BUTTON
$("#feedButton").off("click").on("click", function(){
  $('#top10Tracks').hide();
  $('#top10Button').removeClass("chosenButton");
  $('#random20Tracks').hide();
  $('#random20Button').removeClass("chosenButton");
  $('#queueFeedTracks').show();
  $('#feedButton').addClass("chosenButton");

})

//RANDOM 20 FEED BUTTON
$('#random20Button').off("click").on("click", function(){
  console.log('CLICKEEEEDDDDD');
  $('#feedButton').removeClass("chosenButton");
  $('#top10Button').removeClass("chosenButton");
  $('#top10Tracks').hide();
  $('#random20Tracks').show();
  $('#queueFeedTracks').hide();
  $('#random20Button').addClass("chosenButton");

});



//END DOC READY

});
