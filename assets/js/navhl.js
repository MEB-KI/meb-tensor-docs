$(window).on("scroll", function() {
    var currentPos = $(window).scrollTop();
    $('nav ul li.tag-h2, nav ul li.tag-h3').each(function() {
        var sectionLink = $(this).children().first();
        var section = $(sectionLink.attr('href'));
        var nextSection = $($(this).next().children().first().attr('href'));
        if (section.position().top - 50 <= currentPos && 
            nextSection.position().top - 50 >= currentPos) {
            // Add 'active' class to the current navigation link
            $(this).addClass('current');
        } else {
            // Remove 'active' class from other navigation links
            sectionLink.parent().removeClass('current');
        }
    });
});