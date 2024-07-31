$(document).ready(function () {
  $(".about-btn").click(function (e) {
    $(".about").css("display", "block");
  });
  $(".about-close").click(function () {
    $(".about").css("display", "none");
  });

  $(".credits-btn").click(function (e) {
    $(".credits").css("display", "block");
  });
  $(".credits-close").click(function () {
    $(".credits").css("display", "none");
  });
});
