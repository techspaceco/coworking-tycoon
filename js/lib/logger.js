var Logger;

(function() {
  var entries = [];

  Logger = {
    log: function (e) {
      if (entries.length > 3) {
        entries.shift();
      }

      entries.push(e);

      var console = document.getElementById('console');
      console.innerHTML = '';

      entries.forEach(function (entry) {
        var el = document.createElement('p');
        el.innerHTML = entry;
        console.appendChild(el);
      });
    }
  };
})();
