// 引用cy2.js文件
(function() {
    var script = document.createElement('script');
    script.src = '/js/cy2.js';
    script.async = true;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(script, s);
})(); 