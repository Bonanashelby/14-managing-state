'use strict';

(function(module) {
  const repos = {};
  repos.all = [];
  // DONE:
  // COMMENT: What is this function doing? Where is it called? Does it call any other functions, and if so, in what file(s) do those function(s) live?
  // This function is wrapped in an IFFE function and it has an empty object as well as a repos.all as an empty array. We are declaring a function on the repos object that accepts callback as an argument. Then we make our AJAX request for git that gets you sorted repos from the user. Then we declare a arrow function that assigns the data to repos.all array, if this does not work we get an error in the console, if it does our callback get called. The repos.all.filter is saving the data from repos.all with repos.with's filtered content .
  repos.requestRepos = function(callback) {
    $.get('/github/user/repos?per_page=5&sort=updated')
    .then(data => repos.all = data, err => console.error(err))
    .then(callback);
  };

  repos.with = attr => repos.all.filter(repo => repo[attr]);

  module.repos = repos;
})(window);
