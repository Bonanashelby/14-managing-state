(function() {
  const adminView = {
    initAdminPage : () => {
      let template = Handlebars.compile($('#author-template').text());
  // Done:
  // COMMENT: What is this function doing? Where is it called? Does it call any other functions, and if so, in what file(s) do those function(s) live?
  // we are calling numWordsByAuthor method on Article with a .forEach loop that returns author-stats and appends them to the template for each element. 
      Article.numWordsByAuthor().forEach(stat => $('.author-stats').append(template(stat)));
      $('#blog-stats .articles').text(Article.all.length);
      $('#blog-stats .words').text(Article.numWordsAll());
    }
  };

  Article.fetchAll(adminView.initAdminPage);
})();
