'use strict';

(function(module) {
  const aboutController = {};
  // DONE:
  // COMMENT: What is this function doing? Where is it called? Does it call any other functions, and if so, in what file(s) do those function(s) live?
  // (It's declaring the empty object of aboutController then it assigns the method of .index with an undeclared arrow function that accesses the #about id in the html and it shows the parent element and hides the siblings. And it calls the requestRepos function wtih repoView.index as argument.)
  aboutController.index = () => {
    $('#about').show().siblings().hide();
    repos.requestRepos(repoView.index);
  };

  module.aboutController = aboutController;
})(window);
