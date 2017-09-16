$(document).ready(function() {
    console.log($('#nav').height(), window.innerHeight);
    $('.screensize').css({height: window.innerHeight - $('#nav').height()});
});