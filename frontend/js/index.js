$(document).ready(function() {
    console.log($('#nav').height(), window.innerHeight);
    $('.screensize').css({height: window.innerHeight - $('#nav').height()});
});

$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 2, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false // Close upon selecting a date,
});