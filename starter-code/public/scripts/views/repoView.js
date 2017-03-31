'use strict';

(function(module) {
  const repoView = {};

  const ui = function() {
    let $about = $('#about');

    $about.find('ul').empty();
    $about.show().siblings().hide();
  };

  const render = Handlebars.compile($('#repo-template').text());
  // Done:
  // COMMENT: What is this function doing? Where is it called? Does it call any other functions, and if so, in what file(s) do those function(s) live?
  // This function is calling the const ui function from above and we are using jQuery to select all the ul elements of about and appending the repos.with attributes into our handlebars template and calling .map which transforms the data with the render argument from above with our Handlebars.compile.
  repoView.index = function() {
    ui();

    $('#about ul').append(
      repos.with('name').map(render)
    );
  };

  module.repoView = repoView;
})(window);
